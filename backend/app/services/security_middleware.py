import ipaddress
import urllib.parse
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import logging

logger = logging.getLogger("security")

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            response: Response = await call_next(request)
            
            # Defensive Security Headers
            response.headers["X-Content-Type-Options"] = "nosniff"
            response.headers["X-Frame-Options"] = "DENY"
            response.headers["X-XSS-Protection"] = "1; mode=block"
            response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
            response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
            response.headers["X-Permitted-Cross-Domain-Policies"] = "none"
            
            return response
        except Exception as e:
            logger.error(f"Unhandled Exception: {str(e)}", exc_info=True)
            return JSONResponse(
                status_code=500,
                content={
                    "detail": "An internal server error occurred. Request was safely halted.",
                    "status": "error"
                }
            )

def is_safe_url(url: str) -> bool:
    """
    Validates URL to protect against SSRF (Server-Side Request Forgery).
    Blocks private IP ranges, loopbacks, metadata services, and non-http schemes.
    """
    if not url or not isinstance(url, str):
        return False
        
    parsed = urllib.parse.urlparse(url.strip())
    if parsed.scheme not in ("http", "https"):
        return False
        
    hostname = parsed.hostname
    if not hostname:
        return False
        
    hostname_lower = hostname.lower()
    
    # Block loopback & internal hostnames
    if hostname_lower in ("localhost", "127.0.0.1", "0.0.0.0", "::1", "metadata.google.internal", "instance-data"):
        return False
        
    # Check for IP literals and private subnets
    try:
        ip = ipaddress.ip_address(hostname_lower)
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast:
            return False
    except ValueError:
        # It is a domain name, verify standard characters
        if any(c in hostname_lower for c in [";", "&", "|", "`", "$", "<", ">", "\n", "\r"]):
            return False
            
    return True
