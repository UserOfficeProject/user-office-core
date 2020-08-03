import {
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@material-ui/core';
import React, { Fragment, HTMLAttributes } from 'react';

import UOLoader from 'components/common/UOLoader';
import { Answer, DataType } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { FileMetaData } from 'models/FileUpload';
import QuestionaryDetails from 'components/questionary/QuestionaryDetails';
import { ProposalSubsetSumbission } from 'models/ProposalModel';

const useStyles = makeStyles(theme => ({
  heading: {
    marginTop: theme.spacing(2),
  },
}));

export default function ProposalQuestionaryReview(
  props: HTMLAttributes<any> & {
    data: ProposalSubsetSumbission;
  }
) {
  const classes = useStyles();

  const classes = makeStyles(theme => ({
    heading: {
      marginTop: theme.spacing(2),
    },
  }))();

  const allFields = getAllFields(questionary.steps) as Answer[];
  const completedFields = allFields.filter(field => {
    return !!field.value;
  });

  // Get all questions with a file upload and create a string with fileid comma separated
  const fileIds = completedFields
    .filter(field => field.question.dataType === DataType.FILE_UPLOAD)
    .map(fileId => fileId.value)
    .join(',');

  useEffect(() => {
    if (fileIds) {
      api()
        .getFileMetadata({ fileIds: fileIds.split(',') })
        .then(data => {
          setFiles(data?.fileMetadata || []);
        });
    }
  }, [api, fileIds]);

  if (!props.data) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }
  const questionary = props.data.questionary;
  const users = props.data.users || [];

  return (
    <Fragment>
      <Typography variant="h6" className={classes.heading} gutterBottom>
        Proposal information
      </Typography>
      <Table>
        <TableBody>
          <TableRow key="title">
            <TableCell>Title</TableCell>
            <TableCell>{props.data.title}</TableCell>
          </TableRow>
          <TableRow key="shortCode">
            <TableCell>Proposal ID</TableCell>
            <TableCell>{props.data.shortCode}</TableCell>
          </TableRow>
          <TableRow key="abstract">
            <TableCell>Abstract</TableCell>
            <TableCell>{props.data.abstract}</TableCell>
          </TableRow>
          <TableRow key="principalinvestigator">
            <TableCell>Principal Investigator</TableCell>
            <TableCell>{`${props.data.proposer.firstname} ${props.data.proposer.lastname}`}</TableCell>
          </TableRow>
          <TableRow key="coproposers">
            <TableCell>Co-Proposers</TableCell>
            <TableCell>
              {users
                .map((user: any) => ` ${user.firstname} ${user.lastname}`)
                .toString()}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Typography variant="h6" className={classes.heading} gutterBottom>
        Questionary
      </Typography>
      <QuestionaryDetails questionaryId={questionary.questionaryId!} />
    </Fragment>
  );
}
