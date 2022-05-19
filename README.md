## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in the development mode.<br>
Open [http://localhost:4000](http://localhost:4000) to view the GraphQL playground in the browser.

You will need to manually reload if you make edits.<br>

### `npm run test`

Launches the Jest test runner and prints the coverage report when done with tests.<br>

### `npm run tsc`

Compiles typescript to javascript for production to the `build` folder.<br>

Your app is ready to be deployed!

### `npm run lint`

Lints typescript code and log if there are any errors.<br>
`npm run lint:fix` should be used if you want to fix all autofixable errors and warnings.

## Development helper scripts

In the project directory, you can also run:

### `node .\dev-commands\crudHelper.js c <name>`

This command will create all files and CRUD operations needed for starting new endpoint.<br>
For example: `node .\dev-commands\crudHelper.js c instrument` will initialize all GraphQL mutations and queries for creating, reading, updating and deleting an instrument.<br>
💡 Keep in mind that you need to go through all the generated files and add the missing parts for specific case.<br>

## Contribution and release versioning

Please reffer to the [Contribution guide](CONTRIBUTING.md) to get information about contributing and versioning.

Happy coding! 👨‍💻