from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Union, Any
from datetime import datetime
from bson.objectid import ObjectId

from ..config.db import *

student_router = APIRouter()
# Model thông tin sinh viên
class SINHVIEN(BaseModel):
    student_id: str
    fullname: str
    phone_number: str
    email: Union[str, None]
    address: str
    major: str
    course: Union[int, None]
    college: str
    intern_group: Union[str, Any]
    createdAt: Union[datetime, None]

# Trang nhập thông tin của sinh viên
@student_router.post('/nhapthongtin')
async def nhapthongtin(sv: SINHVIEN):
    thongtin: dict = {
        "student_id": sv.student_id,
        "fullname": sv.fullname,
        "phone_number": sv.phone_number,
        "email": sv.email,
        "address": sv.address,
        "major": ObjectId(sv.major),
        "course": sv.course,
        "college": ObjectId(sv.college),
        "intern_group": "",
        "createdAt": round(datetime.now().timestamp())
    }
    sinhvien_insert = sinhvien.insert_one(document=thongtin)
    if sinhvien_insert.acknowledged:
        return JSONResponse(status_code=200, content={'status': 'OK', 'session_id': str(sinhvien_insert.inserted_id)})
    else:
        return JSONResponse(status_code=400, content={'status': 'Bad request'})
    
@student_router.get('/goiyxaphuong')
async def goiyxaphuong(q: str):
    diachi_obj = xaphuong.find({'province': {'$regex': q, '$options': 'i'}}, {'_id': 0})
    return JSONResponse(status_code=200, content={'ds_diachi': [i['province'] for i in diachi_obj]})
