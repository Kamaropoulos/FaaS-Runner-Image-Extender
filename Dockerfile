FROM node:lts-alpine

ENV NODE_ENV production

WORKDIR /usr/app

COPY package*.json ./
RUN rm -rf /usr/app/FaaS-Base-Runner-Images

RUN npm ci --only=production

COPY . /usr/app

RUN mkdir -p /tmp/uploads/

COPY ./FaaS-Base-Runner-Images /usr/images

EXPOSE 3000

CMD [ "npm", "start" ]
