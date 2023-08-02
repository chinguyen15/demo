from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, OAuth2PasswordBearer
from pydantic import ValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime, timedelta
from bson.objectid import ObjectId
from typing import Union, Any
from hashlib import sha3_256

from ..config.db import *
from .security import validate_token
import jwt

login_router = APIRouter()

SECURITY_ALGORITHM = 'HS256'
SECRET_KEY = 'BN3298'

class LoginRequest(BaseModel):
    username: str
    password: str


def verify_password(username, password):
    user = nguoidung.find_one({'username': username, 'password': sha3_256(bytes(password, 'utf-8')).hexdigest()})
    if user:
        return True
    return False


def generate_token(username: Union[str, Any]) -> str:
    expire = datetime.utcnow() + timedelta(
        seconds=60 * 60 * 24 * 1  # Expired after 3 days
    )
    to_encode = {
        "exp": expire, "username": username
    }
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=SECURITY_ALGORITHM)
    return encoded_jwt


@login_router.post('/login')
def login(request_data: LoginRequest):
    if verify_password(username=request_data.username, password=request_data.password):
        token = generate_token(request_data.username)
        return {
            'token': token
        }
    else:
        raise HTTPException(status_code=404, detail="User not found")
