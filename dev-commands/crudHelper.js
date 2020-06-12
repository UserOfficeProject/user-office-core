const { program } = require('commander');

const generateDataSources = require('./generateDatasources');
const generateModelsAndResolvers = require('./generateModelsAndResolvers');
const generateQueriesAndMutations = require('./generateQueriesAndMutations');

program.version('0.0.1');

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

program
  .command('createCRUD <name>')
  .alias('c')
  .description('Create crud operations')
  .action(name => {
    generateDataSources(name);
    generateModelsAndResolvers(name);
    generateQueriesAndMutations(name);
  });

program.parse(process.argv);
