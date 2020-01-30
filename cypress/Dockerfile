FROM cypress/included:3.8.3
copy cypress.json .
copy package.json .
RUN npm install --only=production --silent
copy . ./cypress
copy wait-for-frontend.sh .
RUN chmod +x wait-for-frontend.sh
ENTRYPOINT ["/usr/bin/env"]