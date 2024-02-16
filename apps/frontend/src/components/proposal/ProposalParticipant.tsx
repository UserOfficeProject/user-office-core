import EditIcon from '@mui/icons-material/Edit';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import makeStyles from '@mui/styles/makeStyles';
import React, { useState } from 'react';

import { BasicUserDetails, UserRole } from 'generated/sdk';
import { BasicUserData } from 'hooks/user/useUserData';
import { getFullUserNameWithInstitution } from 'utils/user';

import ParticipantModal from './ParticipantModal';

const useStyles = makeStyles((theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  addButton: {
    padding: '5px',
    marginLeft: theme.spacing(1),
  },
}));

export default function ProposalParticipant(props: {
  principalInvestigator: BasicUserData | null | undefined;
  setPrincipalInvestigator: (user: BasicUserDetails) => void;
  className?: string;
  loadingPrincipalInvestigator?: boolean;
}) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const classes = useStyles();

  return (
    <div className={props.className}>
      <ParticipantModal
        show={isPickerOpen}
        userRole={UserRole.USER}
        title={'Set Principal Investigator'}
        close={() => {
          setIsPickerOpen(false);
        }}
        selectedUsers={
          !!props.principalInvestigator ? [props.principalInvestigator?.id] : []
        }
        addParticipants={(users: BasicUserDetails[]) => {
          props.setPrincipalInvestigator(users[0]);
          setIsPickerOpen(false);
        }}
        participant={true}
      />
      <FormControl className={classes.container} margin="dense" fullWidth>
        <TextField
          label="Principal Investigator"
          value={getFullUserNameWithInstitution(props.principalInvestigator)}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            readOnly: true,
          }}
          data-cy="principal-investigator"
          required
          fullWidth
        />

        <Tooltip title="Edit Principal Investigator">
          <span>
            <IconButton
              onClick={() => setIsPickerOpen(true)}
              className={classes.addButton}
              disabled={props.loadingPrincipalInvestigator}
            >
              <EditIcon data-cy="edit-proposer-button" fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </FormControl>
    </div>
  );
}
