import { Box, Checkbox, FormControlLabel } from '@mui/material';
import React from 'react';

export type ProposalReaderRoleConfig = {
  hasLogAccess: boolean;
  hasTechnicalReviewAccess: boolean;
  hasFapAccess: boolean;
  hasAdminAccess: boolean;
};

interface ProposalReaderRoleConfigFormProps {
  value: ProposalReaderRoleConfig;
  onChange: (value: ProposalReaderRoleConfig) => void;
}

const ProposalReaderRoleConfigForm = ({
  value,
  onChange,
}: ProposalReaderRoleConfigFormProps) => (
  <Box sx={{ mt: 1 }}>
    <FormControlLabel
      data-cy="role-config-has-technical-review-access"
      control={
        <Checkbox
          checked={value.hasTechnicalReviewAccess}
          onChange={(e) =>
            onChange({ ...value, hasTechnicalReviewAccess: e.target.checked })
          }
        />
      }
      label="Technical Review Access"
    />
    <FormControlLabel
      data-cy="role-config-has-fap-access"
      control={
        <Checkbox
          checked={value.hasFapAccess}
          onChange={(e) =>
            onChange({ ...value, hasFapAccess: e.target.checked })
          }
        />
      }
      label="FAP Access"
    />
    <FormControlLabel
      data-cy="role-config-has-admin-access"
      control={
        <Checkbox
          checked={value.hasAdminAccess}
          onChange={(e) =>
            onChange({ ...value, hasAdminAccess: e.target.checked })
          }
        />
      }
      label="Admin Access"
    />
    <FormControlLabel
      data-cy="role-config-has-log-access"
      control={
        <Checkbox
          checked={value.hasLogAccess}
          onChange={(e) =>
            onChange({ ...value, hasLogAccess: e.target.checked })
          }
        />
      }
      label="Log Access"
    />
  </Box>
);

export default ProposalReaderRoleConfigForm;
