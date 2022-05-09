import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import makeStyles from '@mui/styles/makeStyles';
import PropTypes from 'prop-types';
import React from 'react';

const useStyles = makeStyles(() => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage:
      'url(https://lh3.googleusercontent.com/n4PhGyTc1Ov9X1PA6G2zBmXtJGBpRKLDnHMlaBUujxzdgf5e4ZMtS0ClXszkbMXbHgXDvXsccPGzyhdK7iPZRvo58aYFIrdoqkmEOR4fDXxN1o2kn_OEi0hhnSpatLUigyyGgi68f7qy_B96-cbv0kFMMEEVten-S967xxSvndXdWx-zP9SBODEJEXs0UDF8kvPWILuyVDaa8qZyUfO7sS6XQ2D9sfzMMFn3t5MXNMkChg-YduoHAccl7uoYO8sCFgyjEvcGISyQoiGr8ehFHl2o4KDT7aI5Gvo3HB4cTIDoAgFDghVytBVgSZBE4v-Ha-HeCrWBXvdDaY9hZKAO-DHIhGSE434HlCqYhJTB35F7PZBvh4CASWphuMWUWEE61TaFXmTN_RHQegIoiqqGepsBNu7InWGsQarghL_wx5Sa6tOjLktqUOiLx89NdhptlaPTzfnNDit6XO8ofMwZxtoI66QlccTV7ZZDGBdqUqC00ATnBqtA5f0khFsz-aA56hgRIL5k-sxogbkLqeXwbJRX4G32KXiIJPnR93sIl3-3VirEblPdl6yGcWHj4qFdb__M0BgtD4KV9lf4cYkUGSVKTrwlusQMfiGpqHziAUmxUgLl97uG=w1492-h1186)',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
}));

const PhotoInSide: React.FC = (props) => {
  const classes = useStyles();

  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        {props.children}
      </Grid>
    </Grid>
  );
};

PhotoInSide.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default PhotoInSide;
