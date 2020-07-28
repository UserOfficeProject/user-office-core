import {
  Button,
  Link,
  makeStyles,
  Table,
  TableCell,
  TableRow,
  TableBody,
} from '@material-ui/core';
import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import InputDialog from 'components/common/InputDialog';
import SampleDetails from 'components/sample/SampleDetails';
import {
  Answer,
  DataType,
  Sample,
  SubtemplateConfig,
  TemplateCategoryId,
} from 'generated/sdk';
import { useFileMetadata } from 'hooks/file/useFileMetadata';
import { useQuestionary } from 'hooks/questionary/useQuestionary';
import { useSamples } from 'hooks/sample/useSamples';
import { FileMetaData } from 'models/FileUpload';
import { getAllFields } from 'models/ProposalModelFunctions';
import React, { useState } from 'react';
import { stringToNumericArray, stringToTextArray } from 'utils/ArrayUtils';

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
  onClick?: (sample: Sample) => any;
}) {
  const { sampleIds } = props;

  const classes = useStyles();
  const { samples } = useSamples({ sampleIds });

  const sampleLink = (sample: Sample) => (
    <Link href="#" onClick={() => props.onClick?.(sample)}>
      {sample.title}
    </Link>
  );

  return (
    <ul className={classes.list}>
      {samples.map(sample => (
        <li>{sampleLink(sample)}</li>
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
        return (
          <DownloadableFileList fileIds={stringToTextArray(answer.value)} />
        );
      case DataType.SUBTEMPLATE:
        if (
          (answer.config as SubtemplateConfig).templateCategory ===
          TemplateCategoryId.SAMPLE_DECLARATION
        ) {
          return (
            <SampleList
              sampleIds={stringToNumericArray(answer.value)}
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
