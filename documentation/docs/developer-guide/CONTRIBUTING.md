Thank you for considering contributing to User Office Project!

You can find the repo [here](https://github.com/UserOfficeProject/user-office-core) and a detailed step-by-step guide with an example on how to create new functionality [here](step-by-step.md).

If you're planning to contribute to this project by adding new functionality, we encourage you to discuss it first in the Discussions tab. This helps ensure that your proposed changes align with the project's goals and prevents duplicate efforts. Here's how you can initiate a discussion:

1. Go to the [Discussions](https://github.com/UserOfficeProject/user-office-core/discussions) tab.
2. Start a new discussion thread outlining your proposed changes.
3. Wait for feedback and consensus before proceeding with creating a pull request.

## Guidelines

- Commits follow the [Angular commit convention](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines)
- JavaScript is written using ES2015 features
- 2 spaces indentation
- Features and bug fixes should be covered by test cases

## Creating releases

UserOfficeProject/user-office-core uses [semantic-release](https://github.com/semantic-release/semantic-release)
to release new versions automatically.

- Commits of type `fix` will trigger bugfix releases, think `0.0.1`
- Commits of type `feat` will trigger feature releases, think `0.1.0`
- Commits with `BREAKING CHANGE` in body or footer will trigger breaking releases, think `1.0.0`

All other commit types will trigger no new release.

> **_NOTE:_** When merging the pull requests with `Squash and merge` option on github, the title of the pull request should follow the commit guidelines mentioned above because all the commits are squashed into one commit with title od the PR as a message of the commit. Otherwise when using normal `Merge pull request` the title of the pull request doesn't need to follow the commit guidelines but only the commit messages.
