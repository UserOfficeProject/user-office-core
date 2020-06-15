const fs = require('fs');

const {
  typeTemplate,
  modelTemplate,
  createMutationTemplate,
  updateMutationTemplate,
  deleteMutationTemplate,
  queriesTemplate,
} = require('./templates/modelAndResolversTemplates');

const generateModelsAndResolvers = name => {
  console.info('Generating models and resolvers...');
  fs.writeFile(
    `./src/resolvers/types/${name.capitalize()}.ts`,
    typeTemplate(name),
    err => {
      if (err) throw err;
      console.log(`${name.capitalize()} type generated!`);
    }
  );

  fs.writeFile(
    `./src/models/${name.capitalize()}.ts`,
    modelTemplate(name),
    err => {
      if (err) throw err;
      console.log(`${name.capitalize()} model generated!`);
    }
  );

  fs.writeFile(
    `./src/resolvers/mutations/Create${name.capitalize()}Mutation.ts`,
    createMutationTemplate(name),
    err => {
      if (err) throw err;
      console.log(`Create ${name} mutation generated!`);
    }
  );

  fs.writeFile(
    `./src/resolvers/mutations/Update${name.capitalize()}Mutation.ts`,
    updateMutationTemplate(name),
    err => {
      if (err) throw err;
      console.log(`Update ${name} mutation generated!`);
    }
  );

  fs.writeFile(
    `./src/resolvers/mutations/Delete${name.capitalize()}Mutation.ts`,
    deleteMutationTemplate(name),
    err => {
      if (err) throw err;
      console.log(`Delete ${name} mutation generated!`);
    }
  );

  fs.writeFile(
    `./src/resolvers/queries/${name.capitalize()}Query.ts`,
    queriesTemplate(name),
    err => {
      if (err) throw err;
      console.log(`Queries for ${name} generated!`);
    }
  );
};

module.exports = generateModelsAndResolvers;
