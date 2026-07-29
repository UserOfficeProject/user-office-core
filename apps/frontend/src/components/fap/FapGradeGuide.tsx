import Grid from '@mui/material/Grid';
import React from 'react';

import Editor from 'components/common/TinyEditor';
import { Fap, UserRole } from 'generated/sdk';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

type FapGradeGuideProps = {
  fap: Fap;
  onFapUpdate: (updatedFap: Fap) => void;
};

const FapGradeGuide: React.FC<FapGradeGuideProps> = ({ fap, onFapUpdate }) => {
  const { isExecutingCall } = useDataApiWithFeedback();

  const hasAccessRights = useCheckAccess([UserRole.USER_OFFICER]);

  // NOTE: this was `sm={25}` before the Grid v2 migration. The legacy Grid
  // silently ignored out-of-range values (it emitted a `MuiGrid-grid-sm-25`
  // class that does not exist), but Grid v2 computes
  // `width: calc(100% * 25 / 12)`, which overflows the container. The editor is
  // meant to span the full row at every breakpoint.
  return (
    <Grid size={12}>
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
