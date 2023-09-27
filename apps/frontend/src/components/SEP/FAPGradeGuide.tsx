import Grid from '@mui/material/Grid';
import { Editor } from '@tinymce/tinymce-react';
import React from 'react';

import { useCheckAccess } from 'components/common/Can';
import { Sep, UserRole } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

type FAPGradeGuideProps = {
  sep: Sep;
  onSEPUpdate: (updatedSep: Sep) => void;
};

const FAPGradeGuide: React.FC<FAPGradeGuideProps> = ({ sep, onSEPUpdate }) => {
  const { isExecutingCall } = useDataApiWithFeedback();

  const hasAccessRights = useCheckAccess([
    UserRole.USER_OFFICER,
    UserRole.SEP_CHAIR,
    UserRole.SEP_SECRETARY,
    UserRole.SEP_REVIEWER,
  ]);

  return (
    <Grid item sm={25} xs={12}>
      <Editor
        initialValue={sep.gradeGuide || ''}
        init={{
          skin: false,
          content_css: false,
          plugins: ['link', 'preview', 'image', 'code'],
          toolbar: 'bold italic',
          branding: false,
        }}
        onEditorChange={(content) => {
          const updatedSep = { ...sep, gradeGuide: content };
          onSEPUpdate(updatedSep);
        }}
        disabled={!hasAccessRights || isExecutingCall}
        data-cy="gradeGuide"
      />
    </Grid>
  );
};

export default FAPGradeGuide;
