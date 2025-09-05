import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import { SxProps, Theme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import React, { useState } from 'react';

import { BasicUserDetails } from 'generated/sdk';
import { BasicUserData } from 'hooks/user/useUserData';
import { getFullUserNameWithInstitution } from 'utils/user';

import ParticipantSelector from './ParticipantSelector';

export default function ProposalParticipant(props: {
  principalInvestigator: BasicUserData | null | undefined;
  setPrincipalInvestigator: (user: BasicUserDetails) => void;
  sx?: SxProps<Theme>;
  loadingPrincipalInvestigator?: boolean;
}) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <Box sx={props.sx}>
      <ParticipantSelector
        modalOpen={isPickerOpen}
        title={'Set Principal Investigator'}
        onClose={() => setIsPickerOpen(false)}
        onAddParticipants={(participants) => {
          props.setPrincipalInvestigator(participants.users[0]);
          setIsPickerOpen(false);
        }}
        // TODO exclude co-proposers
      />

      <FormControl
        sx={{
          flexDirection: 'row',
          alignItems: 'flex-end',
        }}
        margin="dense"
        fullWidth
      >
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
              sx={(theme) => ({
                padding: '5px',
                marginLeft: theme.spacing(1),
              })}
              disabled={props.loadingPrincipalInvestigator}
            >
              <EditIcon data-cy="edit-proposer-button" fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </FormControl>
    </Box>
  );
}
