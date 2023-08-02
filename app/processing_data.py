import pandas as pd
from bson import ObjectId
from datetime import datetime
from hashlib import sha3_256
from config.db import *

result = nhomhuongdan.update_many({}, {'$set': {'isDeleted': False}})
print(result.raw_result)