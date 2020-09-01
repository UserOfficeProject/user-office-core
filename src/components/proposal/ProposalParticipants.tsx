import makeStyles from '@material-ui/core/styles/makeStyles';
import People from '@material-ui/icons/People';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import PeopleTable from 'components/user/PeopleTable';
import { UserRole, BasicUserDetails } from 'generated/sdk';

import ParticipantModal from './ParticipantModal';

const useStyles = makeStyles(theme => ({
  errorText: {
    color: theme.palette.error.main,
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginTop: '25px',
    marginLeft: '10px',
  },
}));

type ProposalParticipantsProps = {
  /** Error flag */
  error: boolean;
  /** Basic user details array to be shown in the modal. */
  users: BasicUserDetails[];
  /** Function for setting up the users. */
  setUsers: (users: BasicUserDetails[]) => void;
};

const ProposalParticipants: React.FC<ProposalParticipantsProps> = ({
  error,
  users,
  setUsers,
}) => {
  const classes = useStyles();
  const [modalOpen, setOpen] = useState(false);

  const addUsers = (addedUsers: BasicUserDetails[]) => {
    setUsers([...users, ...addedUsers]);
    setOpen(false);
  };

  const removeUser = (user: BasicUserDetails) => {
    const newUsers = [...users];
    newUsers.splice(newUsers.indexOf(user), 1);
    setUsers(newUsers);
  };

  const openModal = () => {
    setOpen(true);
  };

  return (
    <React.Fragment>
      <ParticipantModal
        show={modalOpen}
        close={() => setOpen(false)}
        addParticipants={addUsers}
        selectedUsers={users.map(user => user.id)}
        title={'Add Co-Proposer'}
        selection={true}
        userRole={UserRole.USER}
      />
      <PeopleTable
        title="Co-Proposers"
        actionIcon={<People data-cy="co-proposers-button" />}
        actionText={'Add Co-Proposers'}
        action={openModal}
        isFreeAction={true}
        selection={false}
        data={users}
        search={false}
        userRole={UserRole.USER}
        invitationUserRole={UserRole.USER}
        onRemove={removeUser}
      />
      {error && (
        <p className={classes.errorText}>
          You must be part of the proposal. Either add yourself as Principal
          Investigator or a Co-Proposer!
        </p>
      )}
    </React.Fragment>
  );
};

ProposalParticipants.propTypes = {
  error: PropTypes.bool.isRequired,
  users: PropTypes.array.isRequired,
  setUsers: PropTypes.func.isRequired,
};

export default ProposalParticipants;
