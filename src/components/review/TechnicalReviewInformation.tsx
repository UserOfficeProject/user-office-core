import { getTranslation } from '@esss-swap/duo-localisation';
import {
  Table,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  makeStyles,
} from '@material-ui/core';
import React, { Fragment, HTMLAttributes } from 'react';

import { TechnicalReview } from '../../generated/sdk';

export default function TechnicalReviewInformation(
  props: HTMLAttributes<any> & {
    data: TechnicalReview | null | undefined;
  }
) {
  const classes = makeStyles(theme => ({
    heading: {
      marginTop: theme.spacing(2),
    },
  }))();

  if (!props.data) {
    return <p>Can&apos;t find technical review</p>;
  }

  return (
    <Fragment>
      <Typography variant="h6" className={classes.heading} gutterBottom>
        Tehnical Reivew
      </Typography>
      <Table>
        <TableBody>
          <TableRow key="status">
            <TableCell>Status</TableCell>
            <TableCell>
              {props.data.status && getTranslation(props.data.status)}
            </TableCell>
          </TableRow>
          <TableRow key="comment">
            <TableCell>Comment</TableCell>
            <TableCell>{props.data.publicComment}</TableCell>
          </TableRow>
          <TableRow key="timeAllocation">
            <TableCell>Time Allocation</TableCell>
            <TableCell>{props.data.timeAllocation}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Fragment>
  );
}
