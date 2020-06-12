const fs = require('fs');

const {
  queriesTemplate,
  mutationsTemplate,
} = require('./queriesAndMutationsTemplates');

const generateQueriesAndMutations = name => {
  console.info('Generating queries and mutations...');
  fs.writeFile(
    `./src/queries/${name.capitalize()}Queries.ts`,
    queriesTemplate(name),
    err => {
      if (err) throw err;
      console.log(`${name.capitalize()} queries generated!`);
    }
  );

  fs.writeFile(
    `./src/mutations/${name.capitalize()}Mutations.ts`,
    mutationsTemplate(name),
    err => {
      if (err) throw err;
      console.log(`${name.capitalize()} mutations generated!`);
    }
  );
};

module.exports = generateQueriesAndMutations;
