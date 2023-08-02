from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Union, Any
from datetime import datetime
from bson.objectid import ObjectId

from .security import *
from ..config.db import *
import json

dashboard_router = APIRouter()

# User model
class FILTER(BaseModel):
    student_id: Union[str, Any]
    student_fullname: Union[str, Any]
    student_phone_number: Union[str, Any]
    student_address: Union[str, Any]
    student_major: Union[str, Any]
    student_college: Union[str, Any]
    student_internship: Union[str, Any]

# for chart drawing
@dashboard_router.get('/chart_drawing', dependencies=[Depends(validate_token)])
async def chart_drawing(request: Request):
    # Chart by college
    count_by_college: dict = {}
    colleges = truong.find({})
    for college in colleges:
        count_by_college[college['name']] = int(sinhvien.count_documents({'college': ObjectId(college['_id'])}))
    # Chart by major
    count_by_major: dict = {}
    majors = nganhhoc.find({})
    for major in majors:
        count_by_major[major['name']] = int(sinhvien.count_documents({'major': ObjectId(major['_id'])}))

    log.insert_one({'user': get_user_from_token(request), 'action': 'Get data to drawing chart', 'result': 'success', 'createdAt': round(datetime.now().timestamp())})
    return JSONResponse(content={'college': count_by_college, 'major': count_by_major}, status_code=200)

# Avg. points by internship
@dashboard_router.get('/avg_points', dependencies=[Depends(validate_token)])
async def avg_points():
    return_value: list = []
    internships = kythuctap.find({})
    for intern in internships:
        total_student: int = sinhvien.count_documents({'internship': intern['_id']})
        total_point: float = 0
        max_point: float = 0
        students = sinhvien.find({'internship': intern['_id']}, {'student_id': 1})
        for student in students:
            point = danhgia.find_one({'student_id': student['student_id']})['points']
            if point >= max_point:
                max_point = point
            total_point += int(danhgia.find_one({'student_id': student['student_id']})['points'])
        return_value.append({'intern': '{}-{}'.format(intern['start'], intern['end']), 'total_student': total_student, 'total_point': total_point, 'max_point': max_point})
    return JSONResponse(status_code=200, content={'data': return_value})

# Search student with filter
@dashboard_router.post('/search_with_filter', dependencies=[Depends(validate_token)])
async def search_with_filter(filter: FILTER):
    students: list = []
    pipeline: dict = {}

    if(filter.student_id != ' '):
        pipeline['student_id'] = {'$regex': filter.student_id, '$options': 'i'}
    if(filter.student_fullname != ' '):
        pipeline['fullname'] = {'$regex': filter.student_fullname, '$options': 'i'}
    if(filter.student_phone_number != ' '):
        pipeline['phone_number'] = {'$regex': filter.student_phone_number, '$options': 'i'}
    if(filter.student_address != ' '):
        pipeline['address'] = {'$regex': filter.student_address, '$options': 'i'}
    if(filter.student_major != ' '):
        pipeline['major_id'] = ObjectId(filter.student_major)
    if(filter.student_college != ' '):
        pipeline['college_id'] = ObjectId(filter.student_college)
    if(filter.student_internship != ' '):
        pipeline['internship_id'] = ObjectId(filter.student_internship)

    students_info = sinhvien.aggregate([
        {
            '$lookup': {
                'from': 'Truong',
                'localField': 'college',
                'foreignField': '_id',
                'as': 'college'
            }
        },
        {
            '$unwind': '$college'
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
            '$lookup': {
                'from': 'NganhHoc',
                'localField': 'major',
                'foreignField': '_id',
                'as': 'major'
            }
        },
        {
            '$unwind': '$major'
        },
        {
            '$project': {
                '_id': 1,
                'student_id': 1,
                'fullname': 1,
                'phone_number': 1,
                'address': 1,
                'major': '$major.name',
                'major_id': '$major._id',
                'college_id': '$college._id',
                'college': '$college.name',
                'internship_id': '$internship._id'
            }
        },
        {
            '$match': pipeline
        }
    ])

    for i in students_info:
        students.append({'id': str(i['_id']), 'student_id': i['student_id'], 'fullname': i['fullname'], 'major': i['major'], 'college': i['college']})
    return JSONResponse(status_code=200, content=json.dumps({'data': students}))
