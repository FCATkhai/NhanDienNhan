# build with docker
cd to backend
docker build -t nhanden-backend:latest .

docker tag nhanden-backend:latest fcatkhai/nhanden-backend:latest
docker push fcatkhai/nhanden-backend:latest