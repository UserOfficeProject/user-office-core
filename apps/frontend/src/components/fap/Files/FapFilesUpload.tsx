import Typography from '@mui/material/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  FileIdWithCaptionAndFigure,
  FileUploadComponent,
} from 'components/common/FileUploadComponent';
import UOLoader from 'components/common/UOLoader';
import { Fap } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

type FapFilesProps = {
  /** Fap data to be shown */
  data: Fap;
  /** Method executed when Fap is updated successfully */
  onFapUpdate: (fap: Fap) => void;
};

const FapFiles = ({ data, onFapUpdate }: FapFilesProps) => {
  const fap = { ...data };
  const { api } = useDataApiWithFeedback();
  const { t } = useTranslation();

  const sendFapUpdate = async (values: Fap): Promise<void> => {
    await api({
      toastSuccessMessage: `${t('Fap')} updated successfully!`,
    }).updateFap(values);
    onFapUpdate(values);
  };

  if (!fap) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  return (
    <>
      <Typography variant="h6" component="h2" gutterBottom>
        {`${fap.code} ${t('Facility access panel')} - File Store`}
      </Typography>
      <FileUploadComponent
        fileType={'pdf'}
        pdfPageLimit={0}
        omitFromPdf={false}
        deleteAllOption={true}
        onChange={(fileMetaDataList: FileIdWithCaptionAndFigure[]) => {
          const newStateValue = fileMetaDataList.map((file) => ({
            ...file,
          }));
          sendFapUpdate({
            ...fap,
            files: newStateValue ? JSON.stringify(newStateValue) : null,
          });
        }}
        value={fap.files ? JSON.parse(fap.files) : []}
      />
    </>
  );
};

export default FapFiles;
