FROM node:22.14.0-alpine AS build-stage

USER node

RUN mkdir -p /home/node/app/backend
RUN mkdir -p /home/node/app/pdf-renderer
RUN mkdir -p /home/node/validation

COPY --chown=node:node validation/. ./home/node/validation

# The PDF renderer is a file: dependency of the backend, so it has to be built
# before the backend installs. It sits next to the backend to match the path in
# apps/backend/package.json.
WORKDIR /home/node/app/pdf-renderer

COPY --chown=node:node apps/pdf-renderer/package*.json ./

RUN npm ci --loglevel error --no-fund

COPY --chown=node:node apps/pdf-renderer/ .

RUN npm run build

WORKDIR /home/node/app/backend

COPY --chown=node:node apps/backend/package*.json ./
COPY apps/backend/openapi.yaml openapi.yaml

RUN npm ci --loglevel error --no-fund
RUN npm run generate:uows

COPY --chown=node:node apps/backend/ .

RUN npm run build

FROM node:22.14.0-alpine

USER node

RUN mkdir -p /home/node/app/backend
RUN mkdir -p /home/node/app/pdf-renderer
RUN mkdir -p /home/node/validation

WORKDIR /home/node/app/backend

# The renderer keeps its own node_modules because the Typst compiler and the
# HTML converter are native addons.
COPY --from=build-stage --chown=node:node /home/node/app/pdf-renderer/build /home/node/app/pdf-renderer/build
COPY --from=build-stage --chown=node:node /home/node/app/pdf-renderer/node_modules /home/node/app/pdf-renderer/node_modules
COPY --from=build-stage --chown=node:node /home/node/app/pdf-renderer/package*.json /home/node/app/pdf-renderer/

COPY --from=build-stage --chown=node:node /home/node/validation/lib /home/node/validation/lib
COPY --from=build-stage --chown=node:node /home/node/validation/node_modules /home/node/validation/node_modules
COPY --from=build-stage --chown=node:node /home/node/validation/package*.json /home/node/validation
COPY --from=build-stage --chown=node:node /home/node/app/backend/db_patches ./db_patches
COPY --from=build-stage --chown=node:node /home/node/app/backend/build ./build
COPY --from=build-stage --chown=node:node /home/node/app/backend/package*.json ./

# Stop npm from reinstalling validation as the tsc build that validation uses in available in production dependencies
RUN npm pkg delete scripts.postinstall && npm ci --only=production --loglevel error --no-fund

ARG BUILD_VERSION=<unknown>
RUN echo $BUILD_VERSION > build-version.txt

EXPOSE 4000

CMD [ "node", "./build/index.js" ]
