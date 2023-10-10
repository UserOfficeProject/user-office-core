import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import PeopleTable from 'components/user/PeopleTable';
import { BasicUserDetails, UserRole } from 'generated/sdk';

import ParticipantModal from './ParticipantModal';

const useStyles = makeStyles((theme) => ({
  label: {
    fontSize: '12px',
    color: 'grey',
  },
  StyledButtonContainer: {
    marginTop: theme.spacing(1),
  },
}));
type ParticipantsProps = {
  /** Basic user details array to be shown in the modal. */
  users: BasicUserDetails[];
  /** Function for setting up the users. */
  setUsers: (users: BasicUserDetails[]) => void;
  principalInvestigator?: BasicUserDetails | null;
  setPrincipalInvestigator?: (user: BasicUserDetails) => void;
  className?: string;
  title: string;
  preserveSelf?: boolean;
  loadingPrincipalInvestigator?: boolean;
};

const Participants = ({
  users,
  setUsers,
  principalInvestigator,
  setPrincipalInvestigator,
  className,
  title,
  preserveSelf,
  loadingPrincipalInvestigator,
}: ParticipantsProps) => {
  const [modalOpen, setOpen] = useState(false);

  const classes = useStyles();

  const addUsers = (addedUsers: BasicUserDetails[]) => {
    setUsers([...users, ...addedUsers]);
    setOpen(false);
  };

  const removeUser = (user: BasicUserDetails) => {
    const newUsers = users.filter((u) => u.id !== user.id);
    setUsers(newUsers);
  };

  const openModal = () => {
    setOpen(true);
  };

  return (
    <div className={className}>
      <ParticipantModal
        show={modalOpen}
        close={() => setOpen(false)}
        addParticipants={addUsers}
        selectedUsers={
          !!principalInvestigator // add principal investigator if one exists
            ? users.map((user) => user.id).concat([principalInvestigator.id])
            : users.map((user) => user.id)
        }
        title={title}
        selection={true}
        userRole={UserRole.USER}
        participant={true}
        setPrincipalInvestigator={setPrincipalInvestigator}
      />

      <FormControl margin="dense" fullWidth>
        <Typography className={classes.label}>{title}</Typography>
        <PeopleTable
          selection={false}
          mtOptions={{
            showTitle: false,
            toolbar: false,
            paging: false,
            headerStyle: {
              padding: '4px 10px',
            },
          }}
          isFreeAction={true}
          data={users}
          search={false}
          userRole={UserRole.USER}
          invitationUserRole={UserRole.USER}
          onRemove={removeUser}
          preserveSelf={preserveSelf}
          setPrincipalInvestigator={setPrincipalInvestigator}
        />
        <ActionButtonContainer className={classes.StyledButtonContainer}>
          <Button
            variant="outlined"
            onClick={openModal}
            data-cy="add-participant-button"
            size="small"
            startIcon={<PersonAddIcon />}
            disabled={loadingPrincipalInvestigator}
          >
            Add
          </Button>
        </ActionButtonContainer>
      </FormControl>
    </div>
  );
};

Participants.propTypes = {
  users: PropTypes.array.isRequired,
  setUsers: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default Participants;
