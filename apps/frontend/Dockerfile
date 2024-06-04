# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node:18.18.0-alpine as build-stage

ARG ORCID_REDIRECT=
ARG BUILD_VERSION=<unknown>

WORKDIR /app

RUN echo $BUILD_VERSION > build-version.txt

RUN echo "REACT_APP_ORCID_REDIRECT=$ORCID_REDIRECT" > .env

COPY package*.json /app/

RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*

RUN CYPRESS_INSTALL_BINARY=0 npm ci --loglevel error --no-fund

COPY ./ ./

RUN npm run build

# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginxinc/nginx-unprivileged:1.25-alpine

COPY --from=build-stage /app/build/ /usr/share/nginx/html
COPY --from=build-stage /app/build-version.txt /usr/share/nginx/html

# Copy the default nginx.conf provided by tiangolo/node-frontend
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080