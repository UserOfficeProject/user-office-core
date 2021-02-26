import makeStyles from '@material-ui/core/styles/makeStyles';
import PropTypes from 'prop-types';
import React, { PropsWithChildren } from 'react';

const ProposalErrorLabel: React.FC<
  PropsWithChildren<Record<string, unknown>>
> = ({ children }) => {
  const classes = makeStyles((theme) => ({
    error: {
      color: theme.palette.error.main,
      fontSize: '12px',
      fontWeight: 400,
    },
  }))();

  return <span className={classes.error}>{children}</span>;
};

ProposalErrorLabel.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

export default ProposalErrorLabel;
