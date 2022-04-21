const grapqlExportUrl = process.env.GRAPHQL_EXPORT_URL;
const grapqlImportUrl = process.env.GRAPHQL_IMPORT_URL;

const exportToken = process.env.EXPORT_TOKEN;
const importToken = process.env.IMPORT_TOKEN;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const axiosDev = require('axios').create({
  headers: {
    common: {
      Authorization: importToken,
    },
  },
});
// eslint-disable-next-line @typescript-eslint/no-var-requires
const axiosProd = require('axios').create({
  headers: {
    common: {
      Authorization: exportToken,
    },
  },
});

const getTemplates = `
query {
    templates(filter: {
      group: PROPOSAL,
      isArchived: false,
    }) {
        templateId
    }
}
`;

const exportTemplate = (n) =>
  `
  query {
    template(templateId: ${n}) {
        json
    }
  }
  
`;

const validateTemplate = (json) =>
  `
  mutation {
    validateTemplateImport(templateAsJson: ${json}) {
      validationResult {
        json
        version
        exportDate
        isValid
        errors
        questionComparisons {
          newQuestion {
            id
          }
          status
          conflictResolutionStrategy
        }
        subTemplatesWithValidation {
          json
          version
          exportDate
          isValid
          errors
          questionComparisons {
            newQuestion {
              id
            }
            status
            conflictResolutionStrategy
          }
        }
      }
    }
  }
  
`;

const importTemplate = `
  mutation importTemplate(
    $templateAsJson: String!
    $conflictResolutions: [ConflictResolution!]!
    $subTemplatesConflictResolutions: [[ConflictResolution!]!]!
  ) {
    importTemplate(
      templateAsJson: $templateAsJson
      conflictResolutions: $conflictResolutions
      subTemplatesConflictResolutions: $subTemplatesConflictResolutions
    ) {
      template {
        templateId
      }
      rejection {
        reason
        context
        exception
      }
    }
  }
  


`;

async function main() {
  console.log(axiosDev.headers);

  const result = await axiosProd.post(grapqlExportUrl, {
    query: getTemplates,
  });

  console.log('Templates to import: ');
  console.log(result.data.data.templates);

  const templates = result.data.data.templates;

  templates.forEach(async (template) => {
    const result = await axiosProd.post(grapqlExportUrl, {
      query: exportTemplate(template.templateId),
    });
    const json = result.data.data.template.json;
    const jsonstringfy = JSON.stringify(json);

    const validateTemplateResult = await axiosDev.post(grapqlImportUrl, {
      query: validateTemplate(jsonstringfy),
    });

    const validationResult =
      validateTemplateResult.data.data.validateTemplateImport.validationResult;

    const templateConflictResolution = validationResult.questionComparisons.map(
      (comparison) => {
        const question = comparison.newQuestion;

        return {
          itemId: question.id,
          strategy: 'USE_NEW',
        };
      }
    );

    const subTemplatesConflictResolutions =
      validationResult.subTemplatesWithValidation.map((template) => {
        return template.questionComparisons.map((comparison) => {
          const question = comparison.newQuestion;

          return {
            itemId: question.id,
            strategy: 'USE_NEW',
          };
        });
      });

    const importTemplateResult = await axiosDev.post(grapqlImportUrl, {
      query: importTemplate,
      variables: {
        conflictResolutions: templateConflictResolution,
        subTemplatesConflictResolutions: subTemplatesConflictResolutions,
        templateAsJson: json,
      },
    });

    console.log('Template import result:');
    console.log(importTemplateResult.data.data);
  });
}

main();
