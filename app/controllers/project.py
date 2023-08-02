from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Union, Any
from datetime import datetime
from bson.objectid import ObjectId

from .security import validate_token
from ..config.db import *

project_router = APIRouter()

class DETAITHUCTAP(BaseModel):
    project: Union[str, None]
    descriptions: Union[str, None]

class DTTT(BaseModel):
    name: Union[str, None]
    descriptions: Union[str, None]
    id: str
    isDeleted: bool

@project_router.post('/themdetaithuctap', dependencies=[Depends(validate_token)])
async def themdetaithuctap(detaitt: DETAITHUCTAP):
    add_project = detai.insert_one({'name': detaitt.project, 'descriptions': detaitt.descriptions, 'isDeleted': False, 'createdAt': round(datetime.now().timestamp())})
    if add_project.acknowledged:
        return JSONResponse(status_code=200, content={"status": "OK"})
    else:
        return JSONResponse(status_code=500, content={"status": "ERR"})
    
@project_router.post('/capnhatdetaithuctap', dependencies=[Depends(validate_token)])
async def capnhatdetaithuctap(detaitt: DTTT):
    value: dict = {}
    if detaitt.name == ' ' or detaitt.descriptions == ' ':
        value = {'isDeleted': detaitt.isDeleted}
    else:
        value = {'name': detaitt.name, 'descriptions': detaitt.descriptions, 'isDeleted': detaitt.isDeleted}

    add_project = detai.update_one({'_id': ObjectId(detaitt.id)}, {'$set': value})
    if int(add_project.raw_result['ok']) == 1:
        return JSONResponse(status_code=200, content={"status": "OK"})
    else:
        return JSONResponse(status_code=500, content={"status": "ERR"})
    
@project_router.get('/dsdetai', dependencies=[Depends(validate_token)])
async def dsdetai():
    projects_obj = detai.find({'isDeleted': False})
    if projects_obj:
        return JSONResponse(status_code=200, content=[{'id': str(i['_id']), 'name': i['name'], 'descriptions': i['descriptions']} for i in projects_obj])
    else:
        return JSONResponse(status_code=500, content={'status': 'ERR'})
    
@project_router.get('/get_detai', dependencies=[Depends(validate_token)])
async def dsdetai(id: str):
    projects_obj = detai.find_one({'_id': ObjectId(id), 'isDeleted': False})
    if projects_obj:
        return JSONResponse(status_code=200, content={'id': str(projects_obj['_id']), 'name': projects_obj['name'], 'descriptions': projects_obj['descriptions']} )
    else:
        return JSONResponse(status_code=500, content={'status': 'ERR'})