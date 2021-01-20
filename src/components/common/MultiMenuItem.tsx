import {
  Checkbox,
  MenuItem,
  MenuItemProps,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import React from 'react';

const styles = () => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    outline: 'none',
    padding: '5px',
  },
});

class MultiMenuItem extends React.Component<
  MenuItemProps & WithStyles<typeof styles>
> {
  render() {
    const { classes, ...rest } = this.props;

    return (
      <MenuItem {...rest} button={false} className={classes.container}>
        <Checkbox checked={this.props.selected} />
        <div>{this.props.children}</div>
      </MenuItem>
    );
  }
}

export default withStyles(styles)(MultiMenuItem);
