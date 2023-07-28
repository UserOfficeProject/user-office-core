import {
  Autocomplete,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';

import { DataType, Question } from 'generated/sdk';
import { useProposalsData } from 'hooks/proposal/useProposalsData';

const useStyles = makeStyles((theme) => ({
  cardHeader: {
    fontSize: '18px',
    padding: '22px 0 0',
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

type ProposalAttachmentDownloadProps = {
  close: () => void;
  referenceNumbers: string[];
  downloadProposalAttachment: (
    proposalIds: number[],
    questionIds: string
  ) => void;
};

const ProposalAttachmentDownload = ({
  close,
  referenceNumbers,
  downloadProposalAttachment,
}: ProposalAttachmentDownloadProps) => {
  const classes = useStyles();
  const { proposalsData, loading } = useProposalsData({ referenceNumbers });
  const { enqueueSnackbar } = useSnackbar();
  const [selectedAttachmentsQuestions, setSelectedAttachmentsQuestions] =
    useState<string[]>([]);
  const attachmentQuestions: Question[] = [];

  if (proposalsData) {
    proposalsData
      .map((proposal) => {
        const genericTemplatesAttachmentQuestions =
          proposal.genericTemplates?.map((genericTemplate) =>
            genericTemplate.questionary.steps.map((step) => {
              return step.fields
                .filter(
                  (field) => field.question.dataType === DataType.FILE_UPLOAD
                )
                .map((field) => field.question);
            })
          );
        const proposalAttachmentQuestions = proposal.questionary.steps.map(
          (step) => {
            return step.fields
              .filter(
                (field) => field.question.dataType === DataType.FILE_UPLOAD
              )
              .map((field) => field.question);
          }
        );

        const samplesAttachmentQuestions = proposal.samples?.map((sample) =>
          sample.questionary.steps.map((step) => {
            return step.fields
              .filter(
                (field) => field.question.dataType === DataType.FILE_UPLOAD
              )
              .map((field) => field.question);
          })
        );

        return [
          genericTemplatesAttachmentQuestions,
          proposalAttachmentQuestions,
          samplesAttachmentQuestions,
        ];
      })
      .flat(4)
      .forEach((question) => {
        if (question && !attachmentQuestions.includes(question)) {
          attachmentQuestions.push(question);
        }
      });
  }

  return (
    <Container
      component="main"
      maxWidth="xs"
      data-cy="proposal-attachment-download"
    >
      <Typography variant="h6" component="h1" className={classes.cardHeader}>
        Download attachment on proposal/s
      </Typography>

      <Grid
        container
        spacing={1}
        justifyContent="center"
        alignItems="flex-start"
      >
        <Grid item xs={12}>
          <Autocomplete
            id="attachment-question-select"
            aria-labelledby="attachment-question-select-label"
            fullWidth={true}
            noOptionsText={'No matching attachment question'}
            disableClearable
            multiple
            onChange={(_event, selectedValue) => {
              setSelectedAttachmentsQuestions(
                selectedValue.map((value) => value.id)
              );
            }}
            getOptionLabel={(option) => option.question}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            options={attachmentQuestions.filter(
              (question, index) =>
                attachmentQuestions.findIndex(
                  (value) => value.id == question.id
                ) === index
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                key={params.id}
                data-cy="attachmentQuestionName"
                label="Attachment question"
                placeholder="Select attachment question"
              />
            )}
            renderOption={(props, option) => {
              return (
                <li {...props} key={option.id}>
                  {option.question}
                </li>
              );
            }}
            loading={loading}
          />
        </Grid>
        <Grid item xs={6}>
          <Button
            fullWidth
            className={classes.submit}
            disabled={loading || selectedAttachmentsQuestions.length <= 0}
            data-cy="proposalAttachmentDownloadButton"
            onClick={() => {
              const proposalIds = proposalsData.map(
                (proposal) => proposal.primaryKey
              );
              if (
                proposalIds.length > 0 &&
                selectedAttachmentsQuestions.length > 0
              ) {
                downloadProposalAttachment(
                  proposalIds,
                  selectedAttachmentsQuestions.join(',')
                );
                close();
              } else {
                enqueueSnackbar(
                  `Could not download proposal attachment(s) of selected question(s)`,
                  {
                    variant: 'info',
                  }
                );
              }
            }}
          >
            Download
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

// NOTE: This comparison is done to prevent component re-rendering on modal close
export default React.memo(
  ProposalAttachmentDownload,
  (prevProps, nextProps) =>
    JSON.stringify(prevProps.referenceNumbers) ===
    JSON.stringify(nextProps.referenceNumbers)
);
