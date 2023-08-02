from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Union, Any
from datetime import datetime
from bson.objectid import ObjectId

from .security import validate_token
from ..config.db import *

internship_router = APIRouter()

class MODELKYTHUCTAP(BaseModel):
    start: str
    end: str
    isDeleted: bool
    createdAt: int

class CAPNHATKYTT(BaseModel):
    id: str
    start: str
    end: str
    isDeleted: bool

@internship_router.post('/themkythuctap', dependencies=[Depends(validate_token)])
async def themkythuctap(kytt: MODELKYTHUCTAP):
    result = kythuctap.insert_one({'start': kytt.start, 'end': kytt.end, 'isDeleted': kytt.isDeleted, 'createdAt': round(datetime.now().timestamp())})
    if result.acknowledged:
        return JSONResponse(status_code=200, content={'status': 'OK'})
    else:
        return JSONResponse(status_code=500, content={'status': 'ERR'})

@internship_router.post('/capnhatkythuctap', dependencies=[Depends(validate_token)])
async def capnhatkythuctap(kytt: CAPNHATKYTT):
    pipeline: dict = {}
    if kytt.start != ' ':
        pipeline['start'] = kytt.start
    if kytt.end != ' ':
        pipeline['end'] = kytt.end
    if kytt.isDeleted:
        pipeline['isDeleted'] = True
    else:
        pipeline['isDeleted'] = False
    
    result = kythuctap.update_one({'_id': ObjectId(kytt.id)}, {'$set': pipeline})
    if int(result.raw_result['ok'])==1:
        return JSONResponse(status_code=200, content={'status': 'OK'})
    else:
        return JSONResponse(status_code=500, content={'status': 'ERR'})
    
@internship_router.get('/get_dskythuctap', dependencies=[Depends(validate_token)])
async def get_dskythuctap():
    result = kythuctap.find({'isDeleted': False})
    internships = [{'id': str(i['_id']), 'start': i['start'], 'end': i['end']} for i in result]
    return JSONResponse(status_code=200, content=internships)

@internship_router.get('/get_kythuctap', dependencies=[Depends(validate_token)])
async def get_kythuctap(id: str):
    # result = kythuctap.find_one({'_id': ObjectId(id)})
    result = nhomhuongdan.aggregate([
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
                '_id': 1,
                'project_id': '$project._id',
                'project_name': '$project.name',
                'instructor_id': '$instructor._id',
                'instructor_name': '$instructor.fullname',
                'internship_id': '$internship._id',
                'internship_start': '$internship.start',
                'internship_end': '$internship.end'
            }
        }
    ])
    if result:
        res: dict = {}
        projects: list = []
        instructors: list = []
        for i in result:
            if(id == str(i['internship_id'])):
                projects.append(i['project_name'])
                instructors.append(i['instructor_name'])
                res = {'id': id, 'start': i['internship_start'], 'end': i['internship_end']}
        res['projects'] = projects
        res['instructors'] = list(set(instructors))
        return JSONResponse(status_code=200, content=res)
    else:
        return JSONResponse(status_code=500, content='ERR')