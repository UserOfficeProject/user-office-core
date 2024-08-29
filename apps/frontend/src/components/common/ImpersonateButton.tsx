import Button, { ButtonProps } from '@mui/material/Button';
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { UserContext } from 'context/UserContextProvider';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

type ImpersonateButtonProps = ButtonProps & {
  userId: number;
};

const ImpersonateButton = ({
  userId,
  children,
  ...rest
}: ImpersonateButtonProps) => {
  const { api } = useDataApiWithFeedback();
  const { handleLogin } = useContext(UserContext);
  const navigate = useNavigate();

  const handleButtonClick = async () => {
    const { getTokenForUser } = await api().getTokenForUser({ userId });

    handleLogin(getTokenForUser);
    navigate('/');
  };

  return (
    <Button onClick={handleButtonClick} {...rest}>
      {children}
    </Button>
  );
};

export default ImpersonateButton;
