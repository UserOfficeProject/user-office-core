import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

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
  className?: string;
  title: string;
  principalInvestigator?: number;
  preserveSelf?: boolean;
};

const Participants: React.FC<ParticipantsProps> = ({
  users,
  setUsers,
  className,
  title,
  principalInvestigator,
  preserveSelf,
}) => {
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

  useEffect(() => {
    if (
      !!principalInvestigator &&
      users.map((user) => user.id).includes(principalInvestigator)
    ) {
      const user = users.find((u) => u.id === principalInvestigator);
      removeUser(user as BasicUserDetails);
    }
  });

  return (
    <div className={className}>
      <ParticipantModal
        show={modalOpen}
        close={() => setOpen(false)}
        addParticipants={addUsers}
        selectedUsers={
          !!principalInvestigator // add principal investigator if one exists
            ? users.map((user) => user.id).concat([principalInvestigator])
            : users.map((user) => user.id)
        }
        title={title}
        selection={true}
        userRole={UserRole.USER}
        participant={true}
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
        />
        <ActionButtonContainer className={classes.StyledButtonContainer}>
          <Button
            variant="outlined"
            onClick={openModal}
            data-cy="add-participant-button"
            size="small"
            startIcon={<PersonAddIcon />}
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
