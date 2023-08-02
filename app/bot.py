import telebot
from config.db import *
from datetime import datetime
from dateutil import parser

bot_token = conf.find_one({'type': 'bot_token'})['value']
receiver = conf.find_one({'type': 'bot_chat_id'})['value']
diff_days = 7

def is_date_greater_than_current(input_date_string, difference_in_days):
    # Chuyển đổi chuỗi thành đối tượng datetime
    input_date = parser.parse(input_date_string, dayfirst=True).date()

    # Lấy ngày hiện tại
    current_date = datetime.now().date()

    # Tính toán sự chênh lệch giữa ngày hiện tại và ngày đầu vào
    date_difference = input_date - current_date

    # So sánh sự chênh lệch với số ngày cho trước
    return date_difference.days <= difference_in_days

bot = telebot.TeleBot(token=bot_token)

if __name__=="__main__":
    dates_ = kythuctap.find({})
    for i in dates_:
        if is_date_greater_than_current(i['end'], diff_days) and not is_date_greater_than_current(i['end'], 0):
            bot.send_message(chat_id=receiver, text=f"<pre>THÔNG BÁO</pre>\nKỳ thực tập {i['start']} - {i['end']} sắp hết hạn. Vui lòng đánh giá, scan phiếu và trình kí trước khi quá muộn!", parse_mode="HTML")