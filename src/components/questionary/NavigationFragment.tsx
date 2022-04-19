import { Stack } from '@mui/material';
import React, { Fragment } from 'react';

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
    <Stack direction="row" justifyContent="flex-end" marginTop={3} spacing={1}>
      {props.isLoading ? (
        <UOLoader size="2em" />
      ) : (
        <Fragment>{props.children}</Fragment>
      )}
    </Stack>
  );
};

export default NavigationFragment;
