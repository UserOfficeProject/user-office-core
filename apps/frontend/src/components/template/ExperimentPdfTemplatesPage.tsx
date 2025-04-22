import React from 'react';

import SimpleTabs from 'components/common/SimpleTabs';
import { TemplateGroupId } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import PdfTemplatesTable from './pdf/proposal/PdfTemplatesTable';

export default function ExperimentPdfTemplatesPage() {
  const api = useDataApi();

  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <SimpleTabs tabNames={['Current', 'Archived']}>
          <PdfTemplatesTable
            dataProvider={() =>
              api()
                .getExperimentPdfTemplates({
                  filter: {
                    isArchived: false,
                    group: TemplateGroupId.EXPERIMENT_SAFETY_PDF_TEMPLATE,
                  },
                })
                .then((data) => data.templates || [])
            }
          />
          <PdfTemplatesTable
            dataProvider={() =>
              api()
                .getExperimentPdfTemplates({
                  filter: {
                    isArchived: true,
                    group: TemplateGroupId.EXPERIMENT_SAFETY_PDF_TEMPLATE,
                  },
                })
                .then((data) => data.templates || [])
            }
          />
        </SimpleTabs>
      </StyledPaper>
    </StyledContainer>
  );
}
