import Button, { ButtonProps, ButtonClassKey } from '@material-ui/core/Button';
import { StandardProps } from '@material-ui/core/index';
import React, { Component } from 'react';

import UOLoader from './UOLoader';

export class NavigButton extends Component<
  StandardProps<ButtonProps & { isBusy?: boolean }, ButtonClassKey>
> {
  render() {
    const { className, isBusy, disabled, ...other } = this.props;

    return (
      <div className={className} style={{ position: 'relative' }}>
        <Button
          {...other}
          disabled={isBusy || disabled}
          style={{ opacity: isBusy ? 0.8 : 'inherit' }}
        />
        {isBusy && (
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
