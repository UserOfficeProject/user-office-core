import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import React, { useState } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import InputDialog from 'components/common/InputDialog';
import SampleDetails from 'components/sample/SampleDetails';
import {
  Answer,
  DataType,
  SubtemplateConfig,
  TemplateCategoryId,
} from 'generated/sdk';
import { useFileMetadata } from 'hooks/file/useFileMetadata';
import { useQuestionary } from 'hooks/questionary/useQuestionary';
import { useSamples } from 'hooks/sample/useSamples';
import { FileMetaData } from 'models/FileUpload';
import {
  areDependenciesSatisfied,
  getAllFields,
} from 'models/QuestionaryFunctions';
import { SampleBasic } from 'models/Sample';

const useStyles = makeStyles(theme => ({
  list: {
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

  const classes = useStyles();
  const { files } = useFileMetadata(fileIds);

  const downloadLink = (file: FileMetaData) => (
    <Link href={`/files/download/${file.fileId}`} download>
      {file.originalFileName}
    </Link>
  );

  return (
    <ul className={classes.list}>
      {files.map(file => (
        <li key={`file-id-${file.fileId}`}>{downloadLink(file)}</li>
      ))}
    </ul>
  );
}

function SampleList(props: {
  sampleIds: number[];
  onClick?: (sample: SampleBasic) => any;
}) {
  const { sampleIds } = props;

  const classes = useStyles();
  const { samples } = useSamples({ sampleIds });

  const sampleLink = (sample: SampleBasic) => (
    <Link href="#" onClick={() => props.onClick?.(sample)}>
      {sample.title}
    </Link>
  );

  return (
    <ul className={classes.list}>
      {samples.map(sample => (
        <li key={`sample-${sample.id}`}>{sampleLink(sample)}</li>
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
    return areDependenciesSatisfied(
      questionary.steps,
      field.question.proposalQuestionId
    );
  });

  const formatAnswer = (answer: Answer) => {
    switch (answer.question.dataType) {
      case DataType.FILE_UPLOAD:
        return <DownloadableFileList fileIds={answer.value} />;
      case DataType.SUBTEMPLATE:
        if (
          (answer.config as SubtemplateConfig).templateCategory ===
          TemplateCategoryId.SAMPLE_DECLARATION
        ) {
          return (
            <SampleList
              sampleIds={answer.value}
              onClick={sample => setSelectedSampleId(sample.id)}
            />
          );
        } else {
          return <span>unknown template</span>;
        }

      default:
        return answer.value.toString();
    }
  };

  return (
    <>
      <Table>
        <TableBody>
          {completedFields.map(row => (
            <TableRow key={`answer-${row.answerId}`}>
              <TableCell>{row.question.question}</TableCell>
              <TableCell>{formatAnswer(row)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <InputDialog
        maxWidth="sm"
        open={selectedSampleId !== null}
        onClose={() => setSelectedSampleId(null)}
      >
        {selectedSampleId ? (
          <SampleDetails sampleId={selectedSampleId} />
        ) : null}
        <ActionButtonContainer>
          <Button
            type="button"
            variant="outlined"
            onClick={() => setSelectedSampleId(null)}
            data-cy="close-sample-dialog"
          >
            Close
          </Button>
        </ActionButtonContainer>
      </InputDialog>
    </>
  );
}

export default QuestionaryDetails;
