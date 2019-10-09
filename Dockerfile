FROM node:10

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

RUN npm run tsc

EXPOSE 4000
CMD [ "node", "./build/index.js" ]

