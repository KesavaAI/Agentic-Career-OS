import time
import json
import random
import threading
import urllib.request
import urllib.error
from typing import Dict, Any, Optional

class ATSRateLimiter:
    """
    Enterprise Rate Limiter, Token Bucket, Circuit Breaker, and ETag Cache for ATS Connectors.
    Eliminates rate limits by:
    1. Caching board responses (TTL: 10 minutes, negative cache for 404s/empty boards).
    2. Token-bucket throttling per ATS host (Greenhouse, Lever, Ashby).
    3. Respecting HTTP 429 'Retry-After' & exponential backoff with jitter.
    4. HTTP 304 Not Modified ETag support.
    5. Circuit breaker pattern per board/host.
    """
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(ATSRateLimiter, cls).__new__(cls)
                cls._instance._init_state()
            return cls._instance

    def _init_state(self):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._tokens: Dict[str, float] = {}
        self._last_token_update: Dict[str, float] = {}
        self._circuit_cooldown: Dict[str, float] = {}
        self._host_rates = {
            "greenhouse": {"capacity": 50.0, "refill_rate": 2.0},
            "lever": {"capacity": 50.0, "refill_rate": 2.0},
            "ashby": {"capacity": 50.0, "refill_rate": 2.0},
            "default": {"capacity": 30.0, "refill_rate": 1.0}
        }
        self._state_lock = threading.RLock()

    def _get_host_key(self, url: str) -> str:
        u = url.lower()
        if "greenhouse" in u:
            return "greenhouse"
        if "lever" in u:
            return "lever"
        if "ashby" in u:
            return "ashby"
        return "default"

    def _acquire_token(self, host_key: str) -> bool:
        with self._state_lock:
            now = time.time()
            config = self._host_rates.get(host_key, self._host_rates["default"])
            capacity = config["capacity"]
            refill_rate = config["refill_rate"]

            last_update = self._last_token_update.get(host_key, now)
            current_tokens = self._tokens.get(host_key, capacity)

            # Refill tokens based on elapsed time
            elapsed = now - last_update
            current_tokens = min(capacity, current_tokens + (elapsed * refill_rate))
            self._last_token_update[host_key] = now

            if current_tokens >= 1.0:
                self._tokens[host_key] = current_tokens - 1.0
                return True
            else:
                self._tokens[host_key] = current_tokens
                return False

    def fetch_with_rate_limit(
        self,
        url: str,
        timeout: float = 1.5,
        ttl_seconds: int = 600,
        max_retries: int = 2
    ) -> Optional[Any]:
        """
        Fetches an ATS URL with intelligent caching, token bucket throttling,
        ETag revalidation, negative caching, and 429 graceful degradation.
        """
        now = time.time()
        host_key = self._get_host_key(url)

        with self._state_lock:
            # 1. Check Circuit Breaker
            if self._circuit_cooldown.get(host_key, 0) > now:
                cached = self._cache.get(url)
                if cached:
                    return cached.get("data")
                return None

            # 2. Check Fresh Cache (including negative cache)
            cached = self._cache.get(url)
            if cached and (now - cached["timestamp"]) < ttl_seconds:
                return cached["data"]

        # 3. Apply Token Bucket Throttling
        if not self._acquire_token(host_key):
            if cached:
                return cached["data"]
            time.sleep(random.uniform(0.02, 0.08))

        # 4. Prepare HTTP Request with ETag / If-Modified-Since
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*"
        }
        if cached:
            if cached.get("etag"):
                headers["If-None-Match"] = cached["etag"]
            if cached.get("last_modified"):
                headers["If-Modified-Since"] = cached["last_modified"]

        req = urllib.request.Request(url, headers=headers)

        for attempt in range(max_retries + 1):
            try:
                with urllib.request.urlopen(req, timeout=timeout) as response:
                    # 304 Not Modified
                    if response.status == 304 and cached:
                        with self._state_lock:
                            cached["timestamp"] = now
                        return cached["data"]

                    if response.status == 200:
                        body = response.read().decode("utf-8")
                        data = json.loads(body)
                        etag = response.headers.get("ETag")
                        last_mod = response.headers.get("Last-Modified")

                        with self._state_lock:
                            self._cache[url] = {
                                "data": data,
                                "etag": etag,
                                "last_modified": last_mod,
                                "timestamp": now
                            }
                        return data

            except urllib.error.HTTPError as e:
                if e.code == 304 and cached:
                    with self._state_lock:
                        cached["timestamp"] = now
                    return cached["data"]

                if e.code == 429:  # Rate limited
                    retry_after = e.headers.get("Retry-After")
                    sleep_time = float(retry_after) if retry_after and retry_after.isdigit() else (0.2 * (2 ** attempt) + random.uniform(0.05, 0.15))
                    
                    with self._state_lock:
                        self._circuit_cooldown[host_key] = now + min(sleep_time, 15.0)

                    if cached:
                        return cached["data"]

                    if attempt < max_retries:
                        time.sleep(sleep_time)
                        continue
                else:
                    # Negative cache for 404, 400, 410, etc. (cached for 10 mins to avoid repeated network timeouts)
                    with self._state_lock:
                        self._cache[url] = {
                            "data": None,
                            "etag": None,
                            "last_modified": None,
                            "timestamp": now
                        }
                    return None

            except Exception:
                # Network timeout / unreachable
                if cached:
                    return cached["data"]
                with self._state_lock:
                    self._cache[url] = {
                        "data": None,
                        "etag": None,
                        "last_modified": None,
                        "timestamp": now
                    }
                return None

        return cached["data"] if cached else None

    def get_cache_stats(self) -> Dict[str, Any]:
        with self._state_lock:
            return {
                "cached_urls_count": len(self._cache),
                "hosts_tracked": list(self._tokens.keys()),
                "cooldowns_active": {k: max(0, v - time.time()) for k, v in self._circuit_cooldown.items()}
            }

ats_rate_limiter = ATSRateLimiter()
