import Grid from '@mui/material/Grid';
import { Editor } from '@tinymce/tinymce-react';
import React from 'react';

import { useCheckAccess } from 'components/common/Can';
import { Fap, UserRole } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

type FapGradeGuideProps = {
  fap: Fap;
  onFapUpdate: (updatedFap: Fap) => void;
};

const FapGradeGuide: React.FC<FapGradeGuideProps> = ({ fap, onFapUpdate }) => {
  const { isExecutingCall } = useDataApiWithFeedback();

  const hasAccessRights = useCheckAccess([
    UserRole.USER_OFFICER,
    UserRole.FAP_CHAIR,
    UserRole.FAP_SECRETARY,
    UserRole.FAP_REVIEWER,
  ]);

  return (
    <Grid item sm={25} xs={12}>
      <Editor
        initialValue={fap.gradeGuide || ''}
        init={{
          skin: false,
          content_css: false,
          plugins: ['link', 'preview', 'image', 'code'],
          toolbar: 'bold italic',
          branding: false,
        }}
        onEditorChange={(content) => {
          const updatedFap = { ...fap, gradeGuide: content };
          onFapUpdate(updatedFap);
        }}
        disabled={!hasAccessRights || isExecutingCall}
        data-cy="gradeGuide"
      />
    </Grid>
  );
};

export default FapGradeGuide;
