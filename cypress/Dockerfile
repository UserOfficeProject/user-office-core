FROM cypress/included:3.8.3
copy cypress.json .
copy package.json .
RUN npm install --only=production --silent
copy . ./cypress
RUN wget https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh
RUN chmod +x wait-for-it.sh
ENTRYPOINT ["/usr/bin/env"]