import React, { Fragment, HTMLAttributes, useEffect, useState } from "react";
import { getAllFields } from "../../models/ProposalModelFunctions";
import {
  Table,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  makeStyles
} from "@material-ui/core";
import { Proposal, QuestionaryField } from "../../generated/sdk";
import { DataType } from "../../generated/sdk";
import { useDataApi } from "../../hooks/useDataApi";
import { FileMetaData } from "../../models/FileUpload";

export default function ProposalQuestionaryReview(
  props: HTMLAttributes<any> & {
    data: Proposal;
  }
) {
  const questionary = props.data.questionary!;
  const api = useDataApi();
  const [files, setFiles] = useState<FileMetaData[]>([]);

  const classes = makeStyles(theme => ({
    heading: {
      marginTop: theme.spacing(2)
    }
  }))();

  const allFields = getAllFields(questionary) as QuestionaryField[];
  const completedFields = allFields.filter(field => {
    return !!field.value;
  });

  // Get all questions with a file upload and create a string with fileid comma seperated
  const fileIds = completedFields.filter(field => field.data_type === DataType.FILE_UPLOAD).map(fileId => fileId.value).join(",");

  useEffect(() => {
    if (fileIds) {
      api()
        .getFileMetadata({ fileIds: fileIds.split(",") })
        .then(data => {
          setFiles(data?.fileMetadata || []);
        });
    }
  }, [api, fileIds]);

  if (!props.data) {
    return <div>Loading...</div>;
  }

const downloadLink = (file: FileMetaData | undefined) => <><a href={`/files/download/${file?.fileId}`} download>{file?.originalFileName}</a><br/></>; 

  const users = props.data.users || [];
  return (
    <Fragment>
      <Typography variant="h6" className={classes.heading} gutterBottom>
        Information
      </Typography>
      <Table>
        <TableBody>
          <TableRow key="title">
            <TableCell>Title</TableCell>
            <TableCell>{props.data.title}</TableCell>
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
          {completedFields.map((row: QuestionaryField) => (
            <TableRow key={row.proposal_question_id}>
              <TableCell>{row.question}</TableCell>
              <TableCell>{row.data_type === DataType.FILE_UPLOAD ?  row.value.split(",").map((value:string) => downloadLink(files.find(file => file.fileId === value))) : row.value.toString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Fragment>
  );
}
