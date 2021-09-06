# Contribution guide

## Developing UserOfficeProject/user-office-backend

You consider contributing changes to UserOfficeProject/user-office-backend – thank you!
Please consider these guidelines when filing a pull request:

- Commits follow the [Angular commit convention](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines)
- JavaScript is written using ES2015 features
- 2 spaces indentation
- Features and bug fixes should be covered by test cases

## Creating releases

UserOfficeProject/user-office-backend uses [semantic-release](https://github.com/semantic-release/semantic-release) to release new versions automatically.

- Commits of type `fix` will trigger bugfix releases, think `0.0.1`
- Commits of type `feat` will trigger feature releases, think `0.1.0`
- Commits with `BREAKING CHANGE` in body or footer will trigger breaking releases, think `1.0.0`

All other commit types will trigger no new release.

> **_NOTE:_** When merging the pull requests with `Squash and merge` option on github, the title of the pull request should follow the commit guidelines mentioned above because all the commits are squashed into one commit with title of the PR as a message of the commit. Otherwise when using normal `Merge pull request` the title of the pull request doesn't need to follow the commit guidelines but only the commit messages.
