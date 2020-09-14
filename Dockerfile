FROM node:12-slim

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

RUN mkdir downloads

RUN npm run tsc

EXPOSE 4000
CMD [ "node", "./build/index.js" ]

