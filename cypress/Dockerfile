FROM cypress/included:5.2.0
copy cypress.json .
copy package.json .
copy tsconfig.json .
RUN npm install --only=production --silent
copy . ./cypress
copy wait-for-frontend.sh .
RUN chmod +x wait-for-frontend.sh
ENTRYPOINT ["npm", "run", "cy:run"]