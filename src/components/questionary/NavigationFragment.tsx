import { Stack } from '@mui/material';
import React from 'react';

import UOLoader from 'components/common/UOLoader';

const NavigationFragment = (props: {
  isLoading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}): JSX.Element | null => {
  if (props.disabled) {
    return null;
  }

  return (
    <Stack
      direction="row"
      justifyContent="flex-end"
      marginTop={3}
      spacing={1}
      alignItems="center"
    >
      {props.isLoading && <UOLoader size="2em" />}
      <>{props.children}</>
    </Stack>
  );
};

export default NavigationFragment;
