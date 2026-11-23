import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState, useEffect } from 'react';

import { Role, UserRole } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import ProposalReaderRoleConfigForm, {
  ProposalReaderRoleConfig,
} from './ProposalReaderRoleConfigForm';
import UserRoleConfigForm, { UserRoleConfig } from './UserRoleConfigForm';

interface RoleModalProps {
  open: boolean;
  onClose: () => void;
  role: {
    id: number;
    shortCode: string;
    title: string;
    description: string;
    config?: UserRoleConfig | ProposalReaderRoleConfig | null;
  } | null;
  onSubmit: () => void;
}

const RoleModal = ({ open, onClose, role, onSubmit }: RoleModalProps) => {
  const isEditMode = !!role;
  const [shortCode, setShortCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [config, setConfig] = useState<
    UserRoleConfig | ProposalReaderRoleConfig | null
  >(null);
  const [availableRoles, setAvailableRoles] = useState<
    Pick<Role, 'shortCode' | 'title' | 'config'>[]
  >([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const { api } = useDataApiWithFeedback();

  const handleShortCodeChange = (newShortCode: string) => {
    setShortCode(newShortCode);
    const rootRole = availableRoles.find((r) => r.shortCode === newShortCode);
    setConfig(rootRole?.config ?? null);
  };

  useEffect(() => {
    if (isEditMode && role) {
      setShortCode(role.shortCode);
      setTitle(role.title);
      setDescription(role.description);
      setConfig(role.config ?? null);
    } else {
      setShortCode('');
      setTitle('');
      setDescription('');
      setConfig(null);
    }
  }, [isEditMode, role]);

  useEffect(() => {
    if (!open) return;

    const fetchRootRoles = async () => {
      setLoadingRoles(true);
      try {
        const res = await api().getRoles({});
        const roles = Array.isArray(res) ? res : res?.roles ?? [];
        const rootRoles = roles
          .filter((r) => r.isRootRole)
          .map((r: Role) => ({
            shortCode: r.shortCode,
            title: r.title,
            config: r.config,
          }));

        if (isEditMode && role?.shortCode) {
          const alreadyPresent = roles.some(
            (r: Role) => r.shortCode === role.shortCode
          );
          setAvailableRoles(
            alreadyPresent
              ? rootRoles
              : [
                  ...rootRoles,
                  {
                    shortCode: role.shortCode,
                    title: role.title,
                    config: role.config ?? null,
                  },
                ]
          );
        } else {
          setAvailableRoles(rootRoles);
        }
      } catch (e) {
        console.error('Failed to fetch root roles', e);
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRootRoles();
  }, [open, api, isEditMode, role]);

  const getConfigArgs = () => {
    switch (shortCode.toUpperCase()) {
      case UserRole.USER:
        return { config: { user: config as UserRoleConfig } };
      case UserRole.PROPOSAL_READER:
        return {
          config: { proposalReader: config as ProposalReaderRoleConfig },
        };
      default:
        return { config: { user: { note: '' } } };
    }
  };

  const handleSubmit = async () => {
    const configArgs = getConfigArgs();
    const apiCall = isEditMode
      ? api({ toastSuccessMessage: 'Role updated successfully' }).updateRole({
          args: {
            roleID: role!.id,
            shortCode,
            title,
            description,
            ...configArgs,
          },
        })
      : api({ toastSuccessMessage: 'Role created successfully' }).createRole({
          args: { shortCode, title, description, ...configArgs },
        });

    await apiCall;
    onSubmit();
    onClose();
  };

  const shortCodeUpper = shortCode.toUpperCase();
  const hasConfig =
    shortCodeUpper === UserRole.USER ||
    shortCodeUpper === UserRole.PROPOSAL_READER;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="role-dialog"
      maxWidth="lg"
      fullWidth
    >
      <DialogContent>
        <Typography variant="h6">
          {isEditMode ? 'Update Role' : 'Create New Role'}
        </Typography>
        <FormControl
          fullWidth
          margin="normal"
          disabled={isEditMode || loadingRoles}
        >
          <InputLabel id="role-shortcode-label">Root role</InputLabel>
          <Select
            labelId="role-shortcode-label"
            value={shortCode}
            label="Short Code"
            onChange={(e) => handleShortCodeChange(e.target.value)}
            renderValue={(val) =>
              val || (loadingRoles ? 'Loading...' : 'Select a role')
            }
            data-cy="role-shortcode-select"
          >
            {loadingRoles && (
              <MenuItem value="" disabled>
                <CircularProgress size={20} />
              </MenuItem>
            )}
            {!loadingRoles && availableRoles.length === 0 && (
              <MenuItem value="" disabled>
                No root roles available
              </MenuItem>
            )}
            {!loadingRoles &&
              availableRoles.map((r) => (
                <MenuItem key={r.shortCode} value={r.shortCode}>
                  {r.shortCode} {r.title ? `— ${r.title}` : ''}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          margin="normal"
          data-cy="role-title-input"
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          margin="normal"
          data-cy="role-description-input"
        />
        {hasConfig && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Config</Typography>
            {shortCodeUpper === UserRole.USER && (
              <UserRoleConfigForm
                value={config as UserRoleConfig}
                onChange={setConfig}
              />
            )}
            {shortCodeUpper === UserRole.PROPOSAL_READER && (
              <ProposalReaderRoleConfigForm
                value={config as ProposalReaderRoleConfig}
                onChange={setConfig}
              />
            )}
          </Box>
        )}
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          style={{ marginTop: '20px' }}
          data-cy="submit-role-button"
        >
          {isEditMode ? 'Update Role' : 'Create Role'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default RoleModal;
