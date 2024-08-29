# Documentation for User Office

## Update the documentation

The documentation is written in markdown and is located in the `documentation/docs` directory. To update the documentation, edit the markdown files in this directory.

## Test the documentation locally

To test the documentation locally, use the following Docker command:

```sh
docker run --rm -it -p 8000:8000 -v ${PWD}:/docs squidfunk/mkdocs-material
```

Without Docker, you can install MkDocs and the Material theme and serve the documentation:

```sh
pip install mkdocs-material
mkdocs serve
```

## Deploy the documentation

The documentation is automatically deployed to [https://userofficeproject.github.io ](https://userofficeproject.github.io) when changes are pushed to the `develop` branch or when a new release is created.

It handles the versioning of the documentation automatically:
- On the `master` branch, it uses the latest release version.
- On the `develop` branch, it generates the _develop_ version of the documentation if there are changes in the `documentation` directory.

## Used tools

- The documentation is generated using [MkDocs](https://www.mkdocs.org/) with the [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) theme.
- The versioning is handled by [mike](https://github.com/jimporter/mike)