import PropTypes from 'prop-types';
import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import UpdateUserInformation from './UpdateUserInformation';

const ProfilePagePropTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

type ProfilePageProps = PropTypes.InferProps<typeof ProfilePagePropTypes>;

const ProfilePage = ({ match }: ProfilePageProps) => {
  return (
    <StyledContainer>
      <StyledPaper>
        <UpdateUserInformation id={parseInt(match.params.id)} />
      </StyledPaper>
    </StyledContainer>
  );
};

ProfilePage.propTypes = ProfilePagePropTypes;

export default ProfilePage;
