FROM cypress/included:6.1.0

WORKDIR /e2e

COPY cypress.json .
COPY package* ./
COPY tsconfig.json .

# force re-build 2
RUN npm ci --silent

COPY . ./cypress
COPY wait-for-frontend.sh /

RUN chmod +x /wait-for-frontend.sh

ENTRYPOINT ["npm", "run", "cy:run"]