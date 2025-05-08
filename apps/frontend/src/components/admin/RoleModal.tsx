import {
  Dialog,
  DialogContent,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
} from '@mui/material';
import React, { useState, useEffect } from 'react';

import { useQueriesMutationsAndServicesData } from 'hooks/admin/useQueriesMutationsAndServicesData';
import { useInstrumentsData } from 'hooks/instrument/useInstrumentsData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

interface RoleModalProps {
  open: boolean;
  onClose: () => void;
  role: {
    id: number;
    shortCode: string;
    title: string;
    description: string;
    dataAccess?: string[];
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
  const [dataAccess, setDataAccess] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const { api } = useDataApiWithFeedback();
  const { queriesMutationsAndServices, loadingQueriesMutationsAndServices } =
    useQueriesMutationsAndServicesData();
  const { instruments, loadingInstruments } = useInstrumentsData();

  useEffect(() => {
    if (isEditMode && role) {
      setShortCode(role.shortCode || '');
      setTitle(role.title || '');
      setDescription(role.description || '');
      setDataAccess(role.dataAccess || []);
      setPermissions(role.permissions || []);
    } else {
      setShortCode('');
      setTitle('');
      setDescription('');
      setDataAccess([]);
      setPermissions([]);
    }
  }, [isEditMode, role]);

  const handleSubmit = async () => {
    const apiCall = isEditMode
      ? api({
          toastSuccessMessage: 'Role updated successfully',
        }).updateRole({
          args: {
            roleID: role.id,
            shortCode,
            title,
            description,
            dataAccess,
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
            dataAccess,
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

  const renderPermissions = () => {
    if (loadingQueriesMutationsAndServices) {
      return <Typography>Loading permissions...</Typography>;
    }

    return (
      <FormControl component="fieldset" variant="standard" fullWidth>
        <FormLabel component="legend">Permissions</FormLabel>
        <FormGroup>
          <Typography variant="subtitle1" gutterBottom>
            Queries
          </Typography>
          <Grid container spacing={1}>
            {queriesMutationsAndServices.queries.map((group, groupIndex) =>
              group.items.map((query, index) => (
                <Grid item md={6} xs={12} key={`${groupIndex}-${index}`}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={permissions.includes(query)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPermissions([...permissions, query]);
                          } else {
                            setPermissions(
                              permissions.filter((perm) => perm !== query)
                            );
                          }
                        }}
                      />
                    }
                    label={query}
                  />
                </Grid>
              ))
            )}
          </Grid>
          <Typography
            variant="subtitle1"
            gutterBottom
            style={{ marginTop: '20px' }}
          >
            Mutations
          </Typography>
          <Grid container spacing={1}>
            {queriesMutationsAndServices.mutations.map((group, groupIndex) =>
              group.items.map((mutation, index) => (
                <Grid item md={6} xs={12} key={`${groupIndex}-${index}`}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={permissions.includes(mutation)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPermissions([...permissions, mutation]);
                          } else {
                            setPermissions(
                              permissions.filter((perm) => perm !== mutation)
                            );
                          }
                        }}
                      />
                    }
                    label={mutation}
                  />
                </Grid>
              ))
            )}
          </Grid>
        </FormGroup>
      </FormControl>
    );
  };

  const renderDataAccess = () => {
    if (loadingInstruments) {
      return <Typography>Loading data access options...</Typography>;
    }

    return (
      <FormControl component="fieldset" variant="standard" fullWidth>
        <FormLabel component="legend">Data Access</FormLabel>
        <FormGroup>
          <Grid container spacing={1}>
            {instruments.map((instrument, index) => (
              <Grid item md={6} xs={12} key={index}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dataAccess.includes(instrument.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setDataAccess([...dataAccess, instrument.name]);
                        } else {
                          setDataAccess(
                            dataAccess.filter(
                              (access) => access !== instrument.name
                            )
                          );
                        }
                      }}
                    />
                  }
                  label={instrument.name}
                />
              </Grid>
            ))}
          </Grid>
        </FormGroup>
      </FormControl>
    );
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
        <TextField
          label="Short Code"
          value={shortCode}
          onChange={(e) => setShortCode(e.target.value)}
          fullWidth
          margin="normal"
          disabled={isEditMode}
        />
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
        {/* Permissions Section */}
        <div>
          <Typography variant="h6">Permissions</Typography>
          {renderPermissions()}
        </div>
        {/* Data Access Section */}
        <div>
          <Typography variant="h6">Data Access</Typography>
          {renderDataAccess()}
        </div>
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
