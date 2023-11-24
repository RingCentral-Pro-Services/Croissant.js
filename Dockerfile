FROM node:lts-alpine

WORKDIR /app

COPY . .

EXPOSE 3000

CMD cd backend ; npm install; npm run build ; npm start