FROM node:lts-alpine

USER node
ENV NODE_ENV production

WORKDIR /usr/app

COPY --chown=node:node package*.json ./
RUN rm -rf /usr/app/FaaS-Base-Runner-Images

RUN npm ci --only=production

COPY --chown=node:node . /usr/app

RUN mkdir -p /tmp/uploads/

COPY --chown=node:node ./FaaS-Base-Runner-Images /usr/images

EXPOSE 3000

CMD [ "npm", "start" ]
