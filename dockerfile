# Sử dụng Python 3.9 làm base image
FROM python:3.9

# Đặt thư mục làm thư mục làm việc cho ứng dụng
WORKDIR /app

# Sao chép tất cả các file trong thư mục hiện tại vào thư mục /app trên Docker
COPY . /app
# Cài đặt poppler cho thư viện pdf2image
RUN apt-get update && apt-get -y install cron

# Cài đặt các gói phụ thuộc để chạy ứng dụng
RUN pip install --no-cache-dir --upgrade pip && \
    pip install -r requirements.txt 
# Expose cổng 80 để ứng dụng có thể truy cập từ bên ngoài Docker
EXPOSE 6789

# Khởi động ứng dụng FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "6789", "--workers", "2", "&&", "cron", "&&", "tail", "-f", "/var/log/cron.log"]