import Button, { ButtonProps } from '@mui/material/Button';
import React, { Component } from 'react';

// import UOLoader from './UOLoader';

export class NavigButton extends Component<ButtonProps & { isBusy?: boolean }> {
  render() {
    const { className, isBusy, disabled, ...other } = this.props;

    return (
      <div className={className} style={{ position: 'relative' }}>
        <Button
          {...other}
          disabled={isBusy || disabled}
          style={{ opacity: isBusy ? 0.8 : 'inherit' }}
        />
      </div>
    );
  }
}
