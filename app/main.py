from fastapi import FastAPI, Depends
from fastapi.requests import Request
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from bson.objectid import ObjectId
from pydantic import BaseModel

from .config.db import *
from .controllers.security import validate_token, get_user_from_token
from .controllers.login import login_router
from .controllers.student import student_router
from .controllers.group import group_router
from .controllers.project import project_router
from .controllers.dashboard import dashboard_router
from .controllers.internships import internship_router

import jwt

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

templates = Jinja2Templates(directory='templates/')
app.mount("/statics", StaticFiles(directory="statics/"), name="statics")
app.include_router(student_router)
app.include_router(group_router)
app.include_router(project_router)
app.include_router(dashboard_router)
app.include_router(login_router)
app.include_router(internship_router)

@app.post('/get_user', dependencies=[Depends(validate_token)])
async def get_user(request: Request):
    return JSONResponse(status_code=200, content=get_user_from_token(request))

@app.get('/')
async def home_page(request: Request):
    total_student = sinhvien.count_documents({})
    colleges = [{'id': str(i['_id']), 'name': i['name']} for i in truong.find({})]
    internships = [{'id': str(i['_id']), 'name': '{} - {}'.format(i['start'], i['end'])} for i in kythuctap.find({})]
    majors = [{'id': str(i['_id']), 'name': i['name']} for i in nganhhoc.find({})]
    return templates.TemplateResponse('dashboard.html', context={'request': request, 'sv': {'total': total_student}, 'colleges': colleges, 'majors': majors, 'internships': internships})

@app.get('/login')
async def login_page(request: Request):
    return templates.TemplateResponse('login.html', context={'request': request})

@app.get('/dskythuctap')
async def dskythuctap(request: Request):
    return templates.TemplateResponse('internships.html', context={'request': request})

@app.get('/sinhvien')
async def nhapthongtinsinhvien(request: Request):
    ds_truong: list = [{'id': str(i['_id']), 'name': i['name'], 'code': i['code']} for i in truong.find({})]
    ds_nganh: list = [{'id': str(i['_id']), 'name': i['name']} for i in nganhhoc.find({})]
    return templates.TemplateResponse('index.html', context={'request': request, 'ds_truong': ds_truong, 'ds_nganh': ds_nganh})

@app.get('/thongtinsinhvien')
async def thongtinsinhvien(request: Request, id: str):
    sv = sinhvien.aggregate([
        {
            '$lookup': {
                'from': 'Truong',
                'localField': 'college',
                'foreignField': '_id',
                'as': 'truong'
            }
        },
        {
            '$unwind': '$truong'
        },
        {
            '$lookup': {
                'from': 'NganhHoc',
                'localField': 'major',
                'foreignField': '_id',
                'as': 'nganh'
            }
        },
        {
            '$unwind': '$nganh'
        },
        {
            '$lookup': {
                'from': 'DanhGia',
                'localField': 'student_id',
                'foreignField': 'student_id',
                'as': 'review'
            }
        },
        {
            '$unwind': '$review'
        },
        {
            '$project':{
                '_id': 1,
                'student_id': 1,
                'fullname': 1,
                'phone_number': 1,
                'email': 1,
                'address': 1,
                'major': '$nganh.name',
                'course': 1,
                'college': '$truong.name',
                'intern_group': 1,
                'review_points': '$review.points',
                'review_hard_skills': '$review.hard_skills',
                'review_soft_skills': '$review.soft_skills',
                'review_notes': '$review.notes',
            }
        },
        {
            '$match': {
                '_id': ObjectId(id)
            }
        }
    ])
    for i in sv:
        if(i['intern_group'] != ""):
            nhom = nhomhuongdan.aggregate([
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
                        'instructor_id': '$instructor._id',
                        'instructor_name': '$instructor.name',
                        'internship_start': '$internship.start',
                        'internship_end': '$internship.end',
                        'project_id': '$project._id',
                        'project_name': '$project.name',
                        'project_descriptions': '$project.descriptions'
                    }
                },
                {
                    '$match': {
                        '_id': ObjectId(i['intern_group']),
                    }
                }
            ])
            tttt: dict = {}
            for j in nhom:
                tttt = {'internship_start': j['internship_start'], 'internship_end': j['internship_end'], 'project_name': j['project_name'], '_id': j['_id']}
            return templates.TemplateResponse('student.html', context={'request': request, 'student_info': [{'id': str(i['_id']), 'student_id': i['student_id'], 'fullname': i['fullname'], 'phone_number': i['phone_number'], 'email': i['email'], 'address': i['address'], 'major': i['major'], 'course': i['course'], 'college': i['college'], 'review_points': i['review_points'], 'review_soft_skills': i['review_soft_skills'], 'review_hard_skills': i['review_hard_skills'], 'review_notes': i['review_notes'], 'internship_start': tttt['internship_start'], 'internship_end': tttt['internship_end'], 'project': tttt['project_name'], 'interngroup_id': str(tttt['_id'])}]})
        else:
            return templates.TemplateResponse('student.html', context={'request': request, 'student_info': [{'id': str(i['_id']), 'student_id': i['student_id'], 'fullname': i['fullname'], 'phone_number': i['phone_number'], 'email': i['email'], 'address': i['address'], 'major': i['major'], 'course': i['course'], 'college': i['college'], 'review_points': i['review_points'], 'review_soft_skills': i['review_soft_skills'], 'review_hard_skills': i['review_hard_skills'], 'review_notes': i['review_notes'], 'internship_start': '', 'internship_end': '', 'project': '', 'interngroup_id': ''}]})
    return templates.TemplateResponse('404.html', context={'request': request})

@app.get('/nhomthuctap')
async def nhomthuctap(request: Request):
    return templates.TemplateResponse('groups.html', context={'request': request})

@app.get('/chitietnhom')
async def chitietnhom(request: Request, id: str):
    huongdan = nhomhuongdan.aggregate([
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
            '$project': {
                'project': '$project.name',
                'descriptions': '$project.descriptions',
                'instructor': '$instructor.fullname',
                'instructor_id': '$instructor._id',
                'internship_start': '$internship.start',
                'internship_end': '$internship.end'
            }
        }
    ])
    group_info: dict = {}
    for group in huongdan:
        if str(id) == str(group['_id']):
            group_info = {'_id': str(group['_id']), 'project': group['project'], 'descriptions': group['descriptions'], 'instructor': group['instructor'], 'instructor_id': group['instructor_id'], 'internship_start': group['internship_start'], 'internship_end': group['internship_end']}
    return templates.TemplateResponse('group.html', context={'request': request, 'group_detail': [group_info]})

@app.get('/detaithuctap')
async def detaithuctap(request: Request):
    return templates.TemplateResponse('project.html', context={'request': request})