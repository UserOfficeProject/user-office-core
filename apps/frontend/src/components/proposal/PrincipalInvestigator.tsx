import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import React, { useContext, useState } from 'react';

import {
  QuestionaryContext,
  createMissingContextErrorMessage,
} from 'components/questionary/QuestionaryContext';
import { BasicUserDetails } from 'generated/sdk';
import { getFullUserNameWithInstitution } from 'utils/user';

import ParticipantSelector from './ParticipantSelector';
import { ProposalContextType } from './ProposalContainer';

interface PrincipalInvestigatorProps {
  setPrincipalInvestigator: (user: BasicUserDetails) => void;
  disabled?: boolean;
}

export default function PrincipalInvestigator(
  props: PrincipalInvestigatorProps
) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const { state } = useContext(QuestionaryContext) as ProposalContextType;
  if (!state) {
    throw new Error(createMissingContextErrorMessage());
  }
  const { proposer, users } = state.proposal;

  return (
    <Box sx={{ margin: '2px' }}>
      {isPickerOpen && (
        <ParticipantSelector
          modalOpen={isPickerOpen}
          title={'Set Principal Investigator'}
          onClose={() => setIsPickerOpen(false)}
          onAddParticipants={(participants) => {
            props.setPrincipalInvestigator(participants.users[0]);
            setIsPickerOpen(false);
          }}
          excludeUserIds={[users.map((u) => u.id)].flat()}
          preset={proposer ? [proposer] : []}
          multiple={false}
          allowEmailInvites={false}
        />
      )}

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
          value={getFullUserNameWithInstitution(proposer)}
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
              disabled={props.disabled}
            >
              <EditIcon data-cy="edit-proposer-button" fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </FormControl>
    </Box>
  );
}
