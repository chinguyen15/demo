import pymongo
from typing import Union, Any
from pydantic import BaseModel
from datetime import datetime

client = pymongo.MongoClient('mongodb://localhost:27017/')
database = client['SVTT']

danhgia = database['DanhGia']
detai = database['DeTai']
kythuctap = database['KyThucTap']
nganhhoc = database['NganhHoc']
nguoihuongdan = database['NguoiHuongDan']
nhomhuongdan = database['NhomHuongDan']
sinhvien = database['SinhVien']
truong = database['Truong']
xaphuong = database['XaPhuong']
nguoidung = database['NguoiDung']
log = database['LogHoatDong']
conf = database['CauHinh']
