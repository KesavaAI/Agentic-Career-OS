from pydantic import BaseModel
from typing import Optional

class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = "Kesava"

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_email: str
    full_name: str

class TokenData(BaseModel):
    email: Optional[str] = None
