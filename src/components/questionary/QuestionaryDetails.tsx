import React, { useEffect, useState } from 'react';
import { useQuestionary } from 'hooks/questionary/useQuestionary';
import { getAllFields } from 'models/ProposalModelFunctions';
import {
  Answer,
  DataType,
  SubtemplateConfig,
  TemplateCategoryId,
} from 'generated/sdk';
import {
  Table,
  TableRow,
  TableCell,
  makeStyles,
  Dialog,
  Link,
} from '@material-ui/core';
import { FileMetaData } from 'models/FileUpload';
import { useDataApi } from 'hooks/common/useDataApi';
import SampleDeclarationEditor from 'components/proposal/SampleDeclarationEditor';
import SampleDetails from 'components/sample/SampleDetails';
import { stringToNumericArray } from 'utils/ArrayUtils';

const useStyles = makeStyles(theme => ({
  fileList: {
    padding: 0,
    margin: 0,
    '& li': {
      display: 'block',
      marginRight: theme.spacing(1),
    },
  },
}));

function DownloadableFileList(props: { fileIds: string[] }) {
  const { fileIds } = props;

  const api = useDataApi();
  const classes = useStyles();
  const [files, setFiles] = useState<FileMetaData[]>([]);

  const downloadLink = (file: FileMetaData | undefined) => (
    <a href={`/files/download/${file?.fileId}`} download>
      {file?.originalFileName}
    </a>
  );

  useEffect(() => {
    if (fileIds) {
      api()
        .getFileMetadata({ fileIds })
        .then(data => {
          setFiles(data?.fileMetadata || []);
        });
    }
  }, [api, fileIds]);

  return (
    <ul className={classes.fileList}>
      {files.map(file => (
        <li>{downloadLink(file)}</li>
      ))}
    </ul>
  );
}

function QuestionaryDetails(props: { questionaryId: number }) {
  const { questionary } = useQuestionary(props.questionaryId);
  const [selectedSampleId, setSelectedSampleId] = useState<number | null>(null);

  if (!questionary) {
    return <span>loading...</span>;
  }

  const allFields = getAllFields(questionary.steps) as Answer[];
  const completedFields = allFields.filter(field => {
    return !!field.value;
  });

  const formatAnswer = (answer: Answer) => {
    switch (answer.question.dataType) {
      case DataType.FILE_UPLOAD:
        return <DownloadableFileList fileIds={answer.value.split(',')} />;
      case DataType.SUBTEMPLATE:
        if (
          (answer.config as SubtemplateConfig).templateCategory ===
          TemplateCategoryId.SAMPLE_DECLARATION
        ) {
          return stringToNumericArray(answer.value).map(sampleId => (
            <Link href="#" onClick={preventDefault}>
              Link
            </Link>
          ));
        }

      default:
        return answer.value.toString();
    }
  };
  return (
    <>
      <Table>
        {completedFields.map(row => (
          <TableRow key={row.question.proposalQuestionId}>
            <TableCell>{row.question.question}</TableCell>
            <TableCell>{formatAnswer(row)}</TableCell>
          </TableRow>
        ))}
      </Table>
      <Dialog
        maxWidth="sm"
        open={selectedSampleId !== null}
        onClose={() => setSelectedSampleId(null)}
      >
        <SampleDetails sampleId={selectedSampleId} />
      </Dialog>
    </>
  );
}

export default QuestionaryDetails;
