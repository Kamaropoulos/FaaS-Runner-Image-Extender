FROM node:lts-alpine

USER node
ENV NODE_ENV production

WORKDIR /usr/app

COPY --chown=node:node package*.json ./

RUN npm ci --only=production

COPY --chown=node:node . /usr/app

RUN mkdir -p /tmp/uploads/

EXPOSE 3000

CMD [ "npm", "start" ]
