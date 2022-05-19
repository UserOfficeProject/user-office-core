const grapqlExportUrl = process.env.GRAPHQL_EXPORT_URL;
const grapqlImportUrl = process.env.GRAPHQL_IMPORT_URL;

const exportToken = process.env.EXPORT_TOKEN;
const importToken = process.env.IMPORT_TOKEN;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const axiosProd = require('axios').create({
  headers: {
    common: {
      Authorization: exportToken,
    },
  },
});
// eslint-disable-next-line @typescript-eslint/no-var-requires
const axiosDev = require('axios').create({
  headers: {
    common: {
      Authorization: importToken,
    },
  },
});

const getTemplates = `
query getTemplates($filter: TemplatesFilter) {
  templates(filter: $filter) {
        templateId
        name
        groupId
    }
}
`;

const getProposals = `
query getProposals($filter: ProposalsFilter) {
  proposals(filter: $filter) {
    proposals {
      primaryKey
    }
  }
}

`;

const getCalls = `
query getCalls($filter: CallsFilter) {
  calls(filter: $filter) {
    id
  }
}


`;

const deleteTemplate = (n) =>
  `
mutation  {
  deleteTemplate(templateId: ${n}) {
    rejection {
      reason
      context
      exception
    }
  }
}
`;

const deleteProposal = (n) =>
  `
  mutation {
    deleteProposal(proposalPk: ${n}) {
      rejection {
        reason
        context
        exception
      }
    }
  }
`;

const deleteCall = (n) => `
mutation {
  deleteCall(id: ${n}) {
    rejection {
      reason
      context
      exception
    }
  }
}
`;

async function main() {
  const templatesProd = await axiosProd.post(grapqlExportUrl, {
    query: getTemplates,
  });

  const templatesDev = await axiosDev.post(grapqlImportUrl, {
    query: getTemplates,
  });

  console.log('Templates to delete:');
  console.log(templatesProd.data.data);

  const prodTemplatesProposal = templatesProd.data.data.templates.filter(
    (template) => template.groupId == 'PROPOSAL'
  );
  const prodTemplatesGeneric = templatesProd.data.data.templates.filter(
    (template) =>
      template.groupId == 'GENERIC_TEMPLATE' || template.groupId == 'SAMPLE'
  );

  const devTemplatesPropsal = templatesDev.data.data.templates.filter(
    (template) => template.groupId == 'PROPOSAL'
  );
  const devTemplatesGeneric = templatesDev.data.data.templates.filter(
    (template) =>
      template.groupId == 'GENERIC_TEMPLATE' || template.groupId == 'SAMPLE'
  );

  await Promise.all(
    devTemplatesPropsal.map(async (devTemplate) => {
      // Is template on prod
      if (
        prodTemplatesProposal.find(
          (prodTemplate) => prodTemplate.name == devTemplate.name
        )
      ) {
        // Get calls for template
        const callsResults = await axiosDev.post(grapqlImportUrl, {
          query: getCalls,
          variables: { filter: { templateIds: devTemplate.templateId } },
        });

        const calls = callsResults.data.data.calls;

        console.log('Calls to delete:');
        console.log(calls);

        // Loop through calls
        await Promise.all(
          calls.map(async (call) => {
            // Get proposal on call
            const proposalResults = await axiosDev.post(grapqlImportUrl, {
              query: getProposals,
              varibales: { filter: { callId: call.id } },
            });
            console.log('Proposals to delete:');
            console.log(proposalResults.data.data.proposals);

            const proposals = proposalResults.data.data.proposals.proposals;

            // Loop through proposals
            await Promise.all(
              proposals.map(async (proposal) => {
                // Delete proposals
                const proposalDeleteResult = await axiosDev.post(
                  grapqlImportUrl,
                  {
                    query: deleteProposal(proposal.primaryKey),
                  }
                );
                console.log('Proposal deletion rejection:');
                console.log(proposalDeleteResult.data.data);
              })
            );

            // Delete call
            const callDeleteResults = await axiosDev.post(grapqlImportUrl, {
              query: deleteCall(call.id),
            });
            console.log('Call deletion rejection:');
            console.log(callDeleteResults.data.data);
          })
        );

        // Delete Template
        const templateDeleteResults = await axiosDev.post(grapqlImportUrl, {
          query: deleteTemplate(devTemplate.templateId),
        });

        console.log('Template deleted rejection:');
        console.log(templateDeleteResults.data.data.deleteTemplate);
      }
    })
  );

  // Delete Sub Templates
  await devTemplatesGeneric.forEach(async (devTemplate) => {
    // If generic template on prod
    if (
      prodTemplatesGeneric.find(
        (prodTemplate) => prodTemplate.name == devTemplate.name
      )
    ) {
      // Delete template mutation
      const templateDeleteResults = await axiosDev.post(grapqlImportUrl, {
        query: deleteTemplate(devTemplate.templateId),
      });
      console.log('Sub template deleted result');
      console.log(templateDeleteResults.data.data.deleteTemplate);
    }
  });
}

main();
