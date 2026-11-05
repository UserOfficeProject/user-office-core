import { TextField } from '@mui/material';
import React from 'react';

export type UserRoleConfig = {
  note: string;
};

interface UserRoleConfigFormProps {
  value: UserRoleConfig;
  onChange: (value: UserRoleConfig) => void;
}

const UserRoleConfigForm = ({ value, onChange }: UserRoleConfigFormProps) => (
  <TextField
    label="Note"
    value={value.note}
    onChange={(e) => onChange({ note: e.target.value })}
    fullWidth
    margin="normal"
    data-cy="role-config-note-input"
  />
);

export default UserRoleConfigForm;
