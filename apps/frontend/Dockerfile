# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node:18.17.1-alpine as build-stage

ARG ORCID_REDIRECT=

WORKDIR /app

RUN echo "REACT_APP_ORCID_REDIRECT=$ORCID_REDIRECT" > .env
RUN echo "GENERATE_SOURCEMAP=false" >> .env

COPY package*.json /app/

RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*

RUN CYPRESS_INSTALL_BINARY=0 npm ci --loglevel error --no-fund

COPY ./ ./

RUN npm run build

# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1.22.0-alpine

COPY --from=build-stage /app/build/ /usr/share/nginx/html

ARG BUILD_VERSION=<unknown>
RUN echo $BUILD_VERSION > /usr/share/nginx/html/build-version.txt

# Copy the default nginx.conf provided by tiangolo/node-frontend
COPY default.conf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080