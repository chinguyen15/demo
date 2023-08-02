from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Union, Any
from datetime import datetime
from bson.objectid import ObjectId

from .security import validate_token
from ..config.db import *

group_router = APIRouter()
# Model thông tin sinh viên
class NHOMTHUCTAP(BaseModel):
    instructor: Union[str, Any]
    internship: Union[str, Any]
    project: Union[str, Any]
    createdAt: Union[datetime, None]
    isDeleted: bool

class CAPNHATNHOM(BaseModel):
    id: str
    instructor: Union[str, Any]
    internship: Union[str, Any]
    project: Union[str, Any]
    createdAt: Union[datetime, None]
    isDeleted: bool

# Model đăng ký nhóm
class DANGKYNHOM(BaseModel):
    session_id: str
    group_id: Union[str, Any]

class XOANHOM(BaseModel):
    id: str
    isDeleted: bool

# Trang nhập thông tin của sinh viên
@group_router.post('/themnhom', dependencies=[Depends(validate_token)])
async def themnhom(nhom: NHOMTHUCTAP):
    thongtin: dict = {
        "instructor": ObjectId(nhom.instructor),
        "internship": ObjectId(nhom.internship),
        "project": ObjectId(nhom.project),
        "createdAt": round(datetime.now().timestamp()),
        "isDeleted": nhom.isDeleted
    }
    nhomhd_insert = nhomhuongdan.insert_one(document=thongtin)
    if nhomhd_insert.acknowledged:
        return JSONResponse(status_code=200, content={'status': 'OK'})
    else:
        return JSONResponse(status_code=400, content={'status': 'Bad request'})   

@group_router.post('/xoanhomthuctap', dependencies=[Depends(validate_token)])
async def xoanhomthuctap(xoa: XOANHOM):
    reuslt = nhomhuongdan.update_one({'_id': ObjectId(xoa.id)}, {'$set': {'isDeleted': True}})
    if int(reuslt.raw_result['ok']) == 1:
        return JSONResponse(status_code=200, content={"status": "OK"})
    else:
        return JSONResponse(status_code=500, content={"status": "ERR"})

@group_router.post('/dangkynhom')
async def dangkynhom(dkn: DANGKYNHOM):
    group_update = sinhvien.update_one({'_id': ObjectId(dkn.session_id)}, {'$set': {'intern_group': ObjectId(dkn.group_id)}})
    if int(group_update.raw_result['ok']) == 1:
        return JSONResponse(status_code=200, content={"result": "OK", "group_id": dkn.group_id})
    else:
        return JSONResponse(status_code=404, content={"result": "ERR"})
    
@group_router.post('/huydangkynhom')
async def huydangkynhom(dkn: DANGKYNHOM):
    group_update = sinhvien.update_one({'_id': ObjectId(dkn.session_id)}, {'$set': {'intern_group': ""}})
    if int(group_update.raw_result['ok']) == 1:
        return JSONResponse(status_code=200, content={"result": "OK", "group_id": ""})
    else:
        return JSONResponse(status_code=404, content={"result": "ERR"})
    
@group_router.get('/dsnhom')
async def dsnhom():
    groups_obj = nhomhuongdan.aggregate([
        {
            '$lookup': {
                'from': 'DeTai',
                'localField': 'project',
                'foreignField': '_id',
                'as': 'project'
            }
        },
        {
            '$unwind': '$project'
        },
        {
            '$lookup': {
                'from': 'NguoiHuongDan',
                'localField': 'instructor',
                'foreignField': '_id',
                'as': 'instructor'
            }
        },
        {
            '$unwind': '$instructor'
        },
        {
            '$lookup': {
                'from': 'KyThucTap',
                'localField': 'internship',
                'foreignField': '_id',
                'as': 'internship'
            }
        },
        {
            '$unwind': '$internship'
        },
        {
            '$project': {
                'project': '$project.name',
                'project_id': '$project._id',
                'instructor_name': '$instructor.fullname',
                'instructor_id': '$instructor._id',
                'internship_start': '$internship.start',
                'internship_end': '$internship.end',
                'internship_id': '$internship._id',
                'internship_createdAt': '$internship.createdAt',
                '_id': 1,
                'isDeleted': 1
            }
        },
        {
            '$match': {
                'isDeleted': False
            }
        }
    ])
    groups: list = []
    groups = [{'group_id': str(i['_id']), 'project_id': str(i['project_id']), 'project_name': i['project'], 'instructor_id': str(i['instructor_id']), 'instructor_name': i['instructor_name'], 'internship_id': str(i['internship_id']), 'internship': '{} - {}'.format(i['internship_start'], i['internship_end'])} for i in groups_obj]
    return JSONResponse(status_code=200, content=groups)

@group_router.get('/thongtintaonhom')
async def thongtintaonhom():
    ds_nguoihuongdan: list = [{'id': str(i['_id']), 'fullname': i['fullname']} for i in nguoihuongdan.find({})]
    ds_kythuctap: list = [{'id': str(i['_id']), 'internship': '{} - {}'.format(i['start'], i['end'])} for i in kythuctap.find({'isDeleted': False}).sort('_id', pymongo.DESCENDING)]
    ds_detai: list = [{'id': str(i['_id']), 'name': i['name']} for i in  detai.find({'isDeleted': False})]
    return JSONResponse(status_code=200, content={'projects': ds_detai, 'internships': ds_kythuctap, 'instructors': ds_nguoihuongdan})

@group_router.post('/capnhatnhomthuctap', dependencies=[Depends(validate_token)])
async def capnhatnhomthuctap(ntt: CAPNHATNHOM):
    pipeline: dict = {
        'instructor': ObjectId(ntt.instructor),
        'internship': ObjectId(ntt.internship),
        'project': ObjectId(ntt.project),
        'createdAt': ntt.createdAt,
        'isDeleted': False
    }
    result = nhomhuongdan.update_one({'_id': ObjectId(ntt.id)}, {'$set': pipeline})
    if int(result.raw_result['ok']) == 1:
        return JSONResponse(status_code=200, content={'status': 'OK'})
    else:
        return JSONResponse(status_code=500, content={'status': 'ERR'})