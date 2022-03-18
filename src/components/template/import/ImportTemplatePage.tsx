import { Typography } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import React from 'react';

import { TemplateImportWithValidation } from 'generated/sdk';
import { StyledPaper } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import { SelectImportFile } from '../../common/SelectImportFile';
import { MergeReview } from './MergeReview';

export const getFileContents = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      resolve(reader.result as string);
    };
  });
};

export default function ImportTemplatePage() {
  const { api } = useDataApiWithFeedback();
  const [validationResult, setValidationResult] =
    React.useState<TemplateImportWithValidation | null>(null);

  return (
    <Container>
      <StyledPaper>
        <Typography variant="h5" component="h5">
          Import template
        </Typography>
        {validationResult ? (
          <MergeReview
            data={validationResult}
            onBack={() => setValidationResult(null)}
          />
        ) : (
          <SelectImportFile
            onFileSelected={(json) => {
              api()
                .validateTemplateImport({ templateAsJson: json })
                .then(({ validateTemplateImport }) => {
                  const result = validateTemplateImport.validationResult;
                  if (result) {
                    setValidationResult(result);
                  }
                });
            }}
          />
        )}
      </StyledPaper>
    </Container>
  );
}
