import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import React, { Fragment } from 'react';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(3),
    overflowX: 'auto',
  },
  table: {
    minWidth: 650,
  },
}));

export default function ReviewTable(props) {
  const classes = useStyles();
  const reviewAverage =
    props.reviews.reduce((acc, curr) => acc + curr.grade, 0) /
    props.reviews.length;

  return (
    <Fragment>
      <Typography variant="h6" className={classes.heading} gutterBottom>
        Review
      </Typography>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>Username</TableCell>
            <TableCell align="right">Comments</TableCell>
            <TableCell align="right">Grade</TableCell>
            <TableCell align="right">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.reviews.map(review => (
            <TableRow key={review.id}>
              <TableCell component="th" scope="row">
                {review.reviewer.username}
              </TableCell>
              <TableCell align="right">{review.comment}</TableCell>
              <TableCell align="right">{review.grade}</TableCell>
              <TableCell align="right">{review.status}</TableCell>
            </TableRow>
          ))}
          <TableRow key="total">
            <TableCell component="th" scope="row">
              <b>Average</b>
            </TableCell>
            <TableCell align="right"></TableCell>
            <TableCell align="right">{reviewAverage}</TableCell>
            <TableCell align="right"></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Fragment>
  );
}
