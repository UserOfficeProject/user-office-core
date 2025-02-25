import {
  Autocomplete,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';

import { useProposalsAttachmentsData } from 'hooks/proposal/useProposalsAttachmentsData';

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
  const { proposalsAttachmentsData, loading } = useProposalsAttachmentsData({
    referenceNumbers,
  });
  const { enqueueSnackbar } = useSnackbar();
  const [selectedAttachmentsQuestions, setSelectedAttachmentsQuestions] =
    useState<string[]>([]);

  const attachmentQuestions = proposalsAttachmentsData.flatMap(
    (proposal) => proposal?.attachments?.questions ?? []
  );

  return (
    <Container
      component="main"
      maxWidth="xs"
      data-cy="proposal-attachment-download"
    >
      <Typography
        variant="h6"
        component="h1"
        sx={{
          fontSize: '18px',
          padding: '22px 0 0',
        }}
      >
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
            sx={(theme) => ({
              margin: theme.spacing(3, 0, 2),
            })}
            disabled={loading || selectedAttachmentsQuestions.length <= 0}
            data-cy="proposalAttachmentDownloadButton"
            onClick={() => {
              const proposalIds = proposalsAttachmentsData.map(
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
