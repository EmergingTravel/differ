FROM node:20-alpine3.18

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm i

COPY . /app

CMD ["node", "/app/bin/www"]
