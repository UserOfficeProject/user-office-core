import PropTypes from 'prop-types';
import React from 'react';

import SimpleTabs from 'components/common/TabPanel';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import UpdatePassword from './UpdatePassword';
import UpdateUserInformation from './UpdateUserInformation';

const ProfilePagePropTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

type ProfilePageProps = PropTypes.InferProps<typeof ProfilePagePropTypes>;

const ProfilePage: React.FC<ProfilePageProps> = ({ match }) => {
  return (
    <StyledContainer>
      <StyledPaper>
        <SimpleTabs tabNames={['General', 'Settings']}>
          <UpdateUserInformation id={parseInt(match.params.id)} />
          <UpdatePassword id={parseInt(match.params.id)} />
        </SimpleTabs>
      </StyledPaper>
    </StyledContainer>
  );
};

ProfilePage.propTypes = ProfilePagePropTypes;

export default ProfilePage;
