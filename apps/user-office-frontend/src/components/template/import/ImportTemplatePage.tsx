import { Typography } from '@mui/material';
import Container from '@mui/material/Container';
import React from 'react';

import { TemplateValidation } from 'generated/sdk';
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
    React.useState<TemplateValidation | null>(null);

  return (
    <Container>
      <StyledPaper>
        <Typography variant="h5" component="h5">
          Import template
        </Typography>
        {validationResult ? (
          <MergeReview
            templateImport={validationResult}
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
                    setValidationResult(result as TemplateValidation);
                  }
                });
            }}
          />
        )}
      </StyledPaper>
    </Container>
  );
}
