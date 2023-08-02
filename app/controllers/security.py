from datetime import datetime

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from fastapi.requests import Request
from pydantic import ValidationError

SECURITY_ALGORITHM = 'HS256'
SECRET_KEY = 'BN3298'

reusable_oauth2 = HTTPBearer(
    scheme_name='Authorization'
)


def validate_token(http_authorization_credentials=Depends(reusable_oauth2)) -> str:
    """
    Decode JWT token to get username => return username
    """
    try:
        payload = jwt.decode(http_authorization_credentials.credentials, SECRET_KEY, algorithms=[SECURITY_ALGORITHM])
        # if payload.get('username') < datetime.now():
        #     raise HTTPException(status_code=403, detail="Token expired")
        username: str = payload.get('username')
        return username
    except(jwt.PyJWTError, ValidationError):
        raise HTTPException(
            status_code=403,
            detail=f"Could not validate credentials",
        )
    
def get_user_from_token(request):
    token = request.headers.get('Authorization').split('Bearer ')[1]
    user: str = jwt.decode(token, SECRET_KEY, algorithms=SECURITY_ALGORITHM)['username']
    return user