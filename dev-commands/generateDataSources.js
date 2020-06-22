const fs = require('fs');

const {
  datasourceTemplate,
  postgresDatasourceTemplate,
  testingDatasourceTemplate,
} = require('./templates/dataSourcesTemplates');

const generateDataSources = name => {
  console.info('Generating datasources...');
  fs.writeFile(
    `./src/datasources/postgres/${name.capitalize()}DataSource.ts`,
    postgresDatasourceTemplate(name),
    err => {
      if (err) throw err;
      console.log('Postgres datasource generated!');
    }
  );

  fs.writeFile(
    `./src/datasources/${name.capitalize()}DataSource.ts`,
    datasourceTemplate(name),
    err => {
      if (err) throw err;
      console.log('Datasource interface generated!');
    }
  );

  fs.writeFile(
    `./src/datasources/mockups/${name.capitalize()}DataSource.ts`,
    testingDatasourceTemplate(name),
    err => {
      if (err) throw err;
      console.log('Testing Datasource generated!');
    }
  );
};

module.exports = generateDataSources;
