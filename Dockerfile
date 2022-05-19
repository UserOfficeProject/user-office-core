# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node:16.14.2-alpine as build-stage

ARG ORCID_REDIRECT=

WORKDIR /app

RUN echo "REACT_APP_ORCID_REDIRECT=$ORCID_REDIRECT" > .env
RUN echo "GENERATE_SOURCEMAP=false" >> .env

COPY package*.json /app/

RUN CYPRESS_INSTALL_BINARY=0 npm ci --loglevel error --no-fund

COPY ./ ./

RUN npm run build

# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1.20-alpine

COPY --from=build-stage /app/build/ /usr/share/nginx/html

ARG BUILD_VERSION=<unknown>
RUN echo $BUILD_VERSION > /usr/share/nginx/html/build-version.txt

# Copy the default nginx.conf provided by tiangolo/node-frontend
COPY --from=build-stage /app/nginx.conf /etc/nginx/conf.d/default.conf
