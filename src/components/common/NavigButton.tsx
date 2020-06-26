import React, { Component } from 'react';
import {
  StandardProps,
  ButtonProps,
  ButtonClassKey,
  Button,
  CircularProgress,
} from '@material-ui/core';

export class NavigButton extends Component<
  StandardProps<ButtonProps & { isbusy?: boolean }, ButtonClassKey>
> {
  render() {
    const { className, isbusy, ...other } = this.props;

    return (
      <div className={className} style={{ position: 'relative' }}>
        <Button
          {...other}
          disabled={isbusy}
          style={{ opacity: isbusy ? 0.8 : 'inherit' }}
        />
        {isbusy && (
          <CircularProgress
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
