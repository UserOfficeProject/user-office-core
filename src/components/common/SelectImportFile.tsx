import PublishIcon from '@mui/icons-material/Publish';
import { Button, Typography } from '@mui/material';
import React, { ChangeEvent } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';

import { getFileContents } from '../template/import/ImportTemplatePage';

export function SelectImportFile(props: {
  onFileSelected: (json: string) => void;
}) {
  const onFileSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e?.target?.files?.[0];
    if (file) {
      const json = await getFileContents(file);
      props.onFileSelected(json);
    }
  };

  return (
    <>
      <Typography variant="body2" component="div">
        Please select the file you wish to import.
      </Typography>
      <label>
        <input
          accept="application/json"
          style={{ display: 'none' }}
          type="file"
          multiple={false}
          onChange={onFileSelected}
        />
        <ActionButtonContainer>
          <Button component="span">
            <PublishIcon /> Select file
          </Button>
        </ActionButtonContainer>
      </label>
    </>
  );
}
