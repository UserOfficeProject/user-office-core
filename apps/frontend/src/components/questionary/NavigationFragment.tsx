import { Stack } from '@mui/material';
import React from 'react';

import UOLoader from 'components/common/UOLoader';

const NavigationFragment = (props: {
  isLoading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}) => {
  if (props.disabled) {
    return null;
  }

  return (
    <Stack
      direction="row"
      spacing={1}
      data-cy="navigation-fragment"
      sx={{
        justifyContent: 'flex-end',
        marginTop: 3,
        alignItems: 'center',
      }}
    >
      {props.isLoading && <UOLoader size="2em" />}
      <>{props.children}</>
    </Stack>
  );
};

export default NavigationFragment;
