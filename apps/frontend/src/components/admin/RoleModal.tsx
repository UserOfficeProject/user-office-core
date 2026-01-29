import {
  Dialog,
  DialogContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import React, { useState, useEffect } from 'react';

import { Role } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

interface RoleModalProps {
  open: boolean;
  onClose: () => void;
  role: {
    id: number;
    shortCode: string;
    title: string;
    description: string;
    permissions?: string[];
  } | null;
  onSubmit: () => void;
}

const RoleModal: React.FC<RoleModalProps> = ({
  open,
  onClose,
  role,
  onSubmit,
}) => {
  const isEditMode = !!role;
  const [shortCode, setShortCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [availableRoles, setAvailableRoles] = useState<
    {
      shortCode: string;
      title?: string;
    }[]
  >([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const { api } = useDataApiWithFeedback();

  useEffect(() => {
    if (isEditMode && role) {
      setShortCode(role.shortCode || '');
      setTitle(role.title || '');
      setDescription(role.description || '');
      setPermissions(role.permissions || []);
    } else {
      setShortCode('');
      setTitle('');
      setDescription('');
      setPermissions([]);
    }
  }, [isEditMode, role]);

  // Fetch root roles when modal opens so user can pick an existing shortCode
  useEffect(() => {
    const fetchRootRoles = async () => {
      setLoadingRoles(true);
      try {
        // Adjust the API call name/args if your backend uses a different query
        const res = await api().getRoles({});
        const roles = Array.isArray(res) ? res : res?.roles ?? [];
        setAvailableRoles(
          roles
            .filter((role) => role.isRootRole)
            .map((r: Role) => ({ shortCode: r.shortCode, title: r.title }))
        );

        // Ensure current edit role shortCode is present in availableRoles
        if (isEditMode && role && role.shortCode) {
          const exists = roles.some(
            (r: Role) => r.shortCode === role.shortCode
          );
          if (!exists) {
            setAvailableRoles((prev) => [
              ...prev,
              { shortCode: role.shortCode, title: role.title },
            ]);
          }
        }
      } catch (e) {
        console.error('Failed to fetch root roles', e);
      } finally {
        setLoadingRoles(false);
      }
    };

    if (open) {
      fetchRootRoles();
    }
  }, [open, api, isEditMode, role]);

  const handleSubmit = async () => {
    const apiCall = isEditMode
      ? api({
          toastSuccessMessage: 'Role updated successfully',
        }).updateRole({
          args: {
            roleID: role!.id,
            shortCode,
            title,
            description,
            permissions,
          },
        })
      : api({
          toastSuccessMessage: 'Role created successfully',
        }).createRole({
          args: {
            shortCode,
            title,
            description,
            permissions,
          },
        });

    try {
      await apiCall;
      onSubmit();
      onClose();
    } catch (error) {
      console.error(error);
      alert(
        `An error occurred while ${
          isEditMode ? 'updating' : 'creating'
        } the role.`
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="role-dialog"
      maxWidth="lg" // Set the maximum width to medium
      fullWidth // Ensure the dialog takes the full width
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
          <InputLabel id="role-shortcode-label">Short Code</InputLabel>
          <Select
            labelId="role-shortcode-label"
            value={shortCode}
            label="Short Code"
            onChange={(e) => setShortCode(e.target.value as string)}
            renderValue={(val) =>
              val || (loadingRoles ? 'Loading...' : 'Select a role')
            }
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
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          style={{ marginTop: '20px' }}
        >
          {isEditMode ? 'Update Role' : 'Create Role'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default RoleModal;
