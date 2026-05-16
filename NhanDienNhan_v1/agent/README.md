# chạy server
cd agent
uvicorn server:app --port 8000 --reload

# deploy

uvicorn server:app --host 0.0.0.0 --port $PORT


temp

