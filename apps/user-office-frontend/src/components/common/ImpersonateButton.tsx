import Button, { ButtonProps } from '@mui/material/Button';
import React, { useContext } from 'react';
import { useHistory } from 'react-router';

import { UserContext } from 'context/UserContextProvider';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

type ImpersonateButtonProps = ButtonProps & {
  userId: number;
};

const ImpersonateButton: React.FC<ImpersonateButtonProps> = ({
  userId,
  children,
  ...rest
}) => {
  const { api } = useDataApiWithFeedback();
  const { handleLogin } = useContext(UserContext);
  const history = useHistory();

  const handleButtonClick = async () => {
    const { getTokenForUser } = await api().getTokenForUser({ userId });

    handleLogin(getTokenForUser);
    history.push('/');
  };

  return (
    <Button onClick={handleButtonClick} {...rest}>
      {children}
    </Button>
  );
};

export default ImpersonateButton;
