import Container from '@material-ui/core/Container';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import React, { PropsWithChildren } from 'react';

const TitledContainer: React.FC<PropsWithChildren<{
  children: NonNullable<React.ReactNode>;
  label?: string;
}>> = ({ children, label }) => {
  const classes = makeStyles(theme => ({
    container: {
      marginTop: '35px',
      position: 'relative',
    },
    heading: {
      top: '-15px',
      left: '10px',
      position: 'absolute',
      marginBottom: '-15px',
      background: '#FFF',
      zIndex: 1,
      padding: '0 8px',
      color: theme.palette.grey[600],
    },
    contents: {
      border: '1px solid #ccc',
      borderRadius: '5px',
      paddingTop: '26px',
      padding: '16px',
      zIndex: 0,
    },
  }))();

  return (
    <div className={classes.container}>
      <Typography variant="h6" className={classes.heading}>
        {label}
      </Typography>
      <Container className={classes.contents}>{children}</Container>
    </div>
  );
};

TitledContainer.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default TitledContainer;
