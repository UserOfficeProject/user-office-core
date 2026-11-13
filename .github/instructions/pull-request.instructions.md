---
description: 'Pull request description structure and writing rules'
applyTo: '**'
---

# Pull Request Description Instructions

Instructions for writing pull request descriptions. Every pull request description must follow the structure below, which is based on the one produced by the `Craft PR description` workflow (`.github/workflows/craft-pr-description.yml`).

## Structure
- Use exactly these sections, with these headings, in this order
- Do not add, rename, merge or reorder sections
- `Fixes Issue` is the only optional section, see the rules below

```markdown
## Description
<one short sentence: what this PR does>

## Motivation and Context
<one short sentence: why the change is needed and what problem it solves>

## Changes
- <most important change>
- <second most important change>
- <third most important change>

## How Has This Been Tested?

<how the change was tested>

## Fixes Issue

<link or reference to the issue this PR resolves>

## Depends On

<PRs that must be merged first or at the same time>

## Tests included/Docs Updated?

- [ ] I have added tests to cover my changes.
- [ ] All relevant doc has been updated
```

## Writing rules
- Go straight to the point and avoid verbosity
- Focus on the motivation behind the change so that the reviewer understands why it is needed
- Do not start the description with "This pull request" or "This PR"
- Use backticks for code identifiers, file names, image tags and configuration keys
- Describe only what the diff contains, never invent changes, tests or motivation
- Keep the description facility-agnostic unless the change itself is specific to one deployment
- Write for readers whose first language may not be English: short sentences (max 20 words), active voice, one idea per sentence
- Use the same term for the same thing throughout, and avoid idioms, slang and unexplained abbreviations

## Section rules

### Description
- One short sentence giving the high level summary of the PR (what)

### Motivation and Context
- One short sentence explaining why the change is required and what problem it solves (why)
- Describe the problem by its effect on users or the system, so that a non-developer can understand it; keep code identifiers for the `Changes` section
- Use the description of the linked issue as context when it is available

### Changes
- Bullet list of the changes the code introduces (how)
- Maximum 3 bullets, covering only the most important changes
- Start each bullet with a verb in the present tense, for example "Replace", "Add", "Remove"
- Ignore lock file changes such as `package-lock.json`

### How Has This Been Tested?
- Describe the tests that were actually run and the environment they were run in
- If the testing is not known, leave this placeholder for the author to fill in instead of guessing:

```markdown
<!--- Please describe in detail how you tested your changes. -->
<!--- Include details of your testing environment, and the tests you ran to -->
<!--- see how your change affects other areas of the code, etc. -->
```

### Fixes Issue
- Include this section only when the issue the PR resolves is known, for example from the branch name, the commits or the author
- Issues can be tracked in GitHub Issues or in an external tracker such as Jira, so use the format that matches the tracker:
  - GitHub issue: use a closing keyword so the issue is closed on merge, for example `Fixes #123`, or `Fixes <owner>/<repo>#123` for an issue in another repository
  - External tracker: write the issue as a link with the URL as link text, for example `[<tracker base url>/browse/<KEY>-123](<tracker base url>/browse/<KEY>-123)`
- List one issue per line if the PR resolves several
- Never guess an issue number or key; omit the whole section, including the heading, when no issue is known

### Depends On
- List the PRs that must be merged before or together with this one
- If there are none or it is not known, leave this placeholder:

```markdown
<!--- Does this PR depend on another PR that should be merged first or at the same time -->
```

### Tests included/Docs Updated?
- Always keep both checkboxes
- Tick `I have added tests to cover my changes.` only when the diff adds or updates tests
- Tick `All relevant doc has been updated` only when the diff updates the relevant documentation

## Example

```markdown
## Description
Register the development `SMTPMailService` lazily through the dependency container.

## Motivation and Context
The backend crashes on startup in development because the mail service is created before the services it needs.

## Changes
- Replace the development mail service value registration with class registration.

## How Has This Been Tested?

<!--- Please describe in detail how you tested your changes. -->
<!--- Include details of your testing environment, and the tests you ran to -->
<!--- see how your change affects other areas of the code, etc. -->

## Fixes Issue

Fixes #123

## Depends On

<!--- Does this PR depend on another PR that should be merged first or at the same time -->

## Tests included/Docs Updated?

- [ ] I have added tests to cover my changes.
- [ ] All relevant doc has been updated
```
