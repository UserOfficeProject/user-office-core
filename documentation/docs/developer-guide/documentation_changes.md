This documentation helps our users understand how to use User Office and troubleshoot common issues on their own. 

## Engine

The documentation is built using **MkDocs**, a static site generator specifically designed for technical documentation. MkDocs converts Markdown files into HTML pages and supports a variety of extensions, themes, and other features. 

**Learn More:**

- [MkDocs Official Documentation](https://www.mkdocs.org/)
- [MkDocs Material Theme](https://squidfunk.github.io/mkdocs-material/)

## General Guidelines

When contributing to the documentation, keep the following guidelines in mind:

- Explain when and why a user would want to use a specific feature.
- Include working examples. 
- Ensure that all code snippets are correctly formatted and easy to read. 
- Provide comments in code examples where necessary.
- Check for spelling and grammatical errors; tools like [Grammarly](https://www.grammarly.com/) can be helpful. 

## Running the Documentation Locally

To preview your changes locally, follow these steps:

1. Navigate to the `/documentation` directory in your terminal.
2. Run the following command:

        mkdocs serve

This will start a local server where you can view the documentation in your browser.

## Adding New Pages

If you add a new page, make sure to update the mkdocs.yml file:

1. Open `mkdocs.yml`.
2. Locate the `nav` section.
3. Add your new page under the appropriate section to ensure it appears in the site navigation.