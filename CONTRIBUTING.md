# Contribution guide

## Developing UserOfficeProject/user-office-core

You consider contributing changes to UserOfficeProject/user-office-core – thank you!
Please consider these guidelines when filing a pull request:

- Commits follow the [Angular commit convention](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines)
- JavaScript is written using ES2015 features
- 2 spaces indentation
- Features and bug fixes should be covered by test cases

## Creating releases

To create a release you must create a pull request from the develop branch into 'master' using the 'Rebase and merge' option. Once this is approved it will automatically run the pipeline to generate a new release. [example](https://github.com/UserOfficeProject/user-office-core/pull/1621)

After this, create a new pull request merging 'master' into 'develop' using the 'Rebase and merge' option. There should be no files changed, but the commits listed. This is to ensure the branches remain in sync. [example](https://github.com/UserOfficeProject/user-office-core/pull/1623)

UserOfficeProject/user-office-core uses [semantic-release](https://github.com/semantic-release/semantic-release)
to release new versions automatically.

- Commits of type `fix` will trigger bugfix releases, think `0.0.1`
- Commits of type `feat` will trigger feature releases, think `0.1.0`
- Commits with `BREAKING CHANGE` in body or footer will trigger breaking releases, think `1.0.0`

All other commit types will trigger no new release.

> **_NOTE:_** When merging the pull requests with `Squash and merge` option on github, the title of the pull request should follow the commit guidelines mentioned above because all the commits are squashed into one commit with title od the PR as a message of the commit. Otherwise when using normal `Merge pull request` the title of the pull request doesn't need to follow the commit guidelines but only the commit messages.
