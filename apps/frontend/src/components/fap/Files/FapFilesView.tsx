import Typography from '@mui/material/Typography';
import React from 'react';

import { DownloadableFileList } from 'components/common/DownloadableFileList';
import UOLoader from 'components/common/UOLoader';
import { Fap } from 'generated/sdk';

type FapFilesProps = {
  /** Fap data to be shown */
  data: Fap;
};

const FapFilesView = ({ data }: FapFilesProps) => {
  const fap = { ...data };
  const fileId: { id: string }[] = fap.files ? JSON.parse(fap.files) : [];

  if (!fap) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  return (
    <>
      <Typography variant="h6" component="h2" gutterBottom>
        {`${fap.code} Facility access panel - File Store`}
      </Typography>
      <DownloadableFileList fileIds={fileId.map((file) => file.id)} />
    </>
  );
};

export default FapFilesView;
