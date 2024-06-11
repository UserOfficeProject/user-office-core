import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { getTranslation } from '@user-office-software/duo-localisation';
import React, { Fragment } from 'react';

import { TechnicalReview, UserRole } from 'generated/sdk';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { getFullUserName } from 'utils/user';

type TechnicalReviewInformationProps = {
  data: TechnicalReview | null | undefined;
};

const TechnicalReviewInformation = (props: TechnicalReviewInformationProps) => {
  const isInstrumentScientist = useCheckAccess([UserRole.INSTRUMENT_SCIENTIST]);

  if (!props.data) {
    return <p>Proposal has no technical review</p>;
  }

  return (
    <Fragment>
      <Typography
        variant="h6"
        sx={(theme) => ({ marginTop: theme.spacing(2) })}
        gutterBottom
      >
        Technical Review
      </Typography>
      <Table>
        <TableBody>
          <TableRow key="status">
            <TableCell>Status</TableCell>
            <TableCell>
              {props.data.status && getTranslation(props.data.status)}
            </TableCell>
          </TableRow>
          {isInstrumentScientist && (
            <TableRow key="internalComment">
              <TableCell>Internal Comment</TableCell>
              <TableCell
                dangerouslySetInnerHTML={{
                  __html: props.data?.comment || '-',
                }}
              />
            </TableRow>
          )}
          <TableRow key="publicComment">
            <TableCell>Comment</TableCell>
            <TableCell
              dangerouslySetInnerHTML={{
                __html: props.data?.publicComment || '-',
              }}
            />
          </TableRow>
          <TableRow key="timeAllocation">
            <TableCell>
              Time Allocation({props.data.proposal?.call?.allocationTimeUnit}s)
            </TableCell>
            <TableCell>{props.data.timeAllocation}</TableCell>
          </TableRow>
          <TableRow key="reviewer">
            <TableCell>Reviewer</TableCell>
            <TableCell>{getFullUserName(props.data.reviewer)}</TableCell>
          </TableRow>
          <TableRow key="assignee">
            <TableCell>Technical review assignee</TableCell>
            <TableCell>
              {getFullUserName(props.data.technicalReviewAssignee)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Fragment>
  );
};

export default TechnicalReviewInformation;
