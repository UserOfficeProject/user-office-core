FROM cypress/base:10
RUN npm install --save-dev cypress
RUN npm install --save-dev faker
RUN npm install --save-dev graphql-request
copy cypress.json .
copy package.json .
copy . ./cypress
RUN wget https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh
RUN chmod +x wait-for-it.sh
RUN $(npm bin)/cypress verify
