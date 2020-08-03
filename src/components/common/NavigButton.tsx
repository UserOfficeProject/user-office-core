import {
  StandardProps,
  ButtonProps,
  ButtonClassKey,
  Button,
} from '@material-ui/core';
import React, { Component } from 'react';

import UOLoader from './UOLoader';

export class NavigButton extends Component<
  StandardProps<ButtonProps & { isbusy?: boolean }, ButtonClassKey>
> {
  render() {
    const { className, isbusy, disabled, ...other } = this.props;

    return (
      <div className={className} style={{ position: 'relative' }}>
        <Button
          {...other}
          disabled={isbusy || disabled}
          style={{ opacity: isbusy ? 0.8 : 'inherit' }}
        />
        {isbusy && (
          <UOLoader
            size={24}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: -12,
              marginLeft: -12,
            }}
          />
        )}
      </div>
    );
  }
}
