import {
  Autocomplete,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';

import {
  DataType,
  GetTemplatesQuery,
  Proposal,
  Question,
  TemplateGroupId,
} from 'generated/sdk';
import { useProposalsData } from 'hooks/proposal/useProposalsData';
import { useTemplates } from 'hooks/template/useTemplates';

const useStyles = makeStyles((theme) => ({
  cardHeader: {
    fontSize: '18px',
    padding: '22px 0 0',
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

type Templates = GetTemplatesQuery['templates'];

type ProposalAttachmentDownloadProps = {
  close: () => void;
  referenceNumbers: string[];
  downloadProposalAttachment: (
    proposalIds: number[],
    title: string,
    pdfTemplateId: string,
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
  const [pdfTemplates, setPdfTemplates] = useState<NonNullable<Templates>>([]);
  const [includeAllProposals, setIncludeAllProposals] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const { templates, loadingTemplates } = useTemplates({
    isArchived: false,
    group: TemplateGroupId.PDF_TEMPLATE,
  });
  const [selectedPdfTemplate, setSelectedPdfTemplate] = useState<
    number | null
  >();
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

  const getProposalIds = (
    includeAllProposals: boolean,
    proposals: Proposal[],
    questions: string[]
  ): number[] => {
    if (includeAllProposals) {
      return proposals.map((proposal) => proposal.primaryKey);
    }

    return proposals
      .filter((proposal) => {
        return (
          proposal.questionary.steps.some((step) => {
            return step.fields.some((field) => {
              return (
                questions.includes(field.question.id) &&
                Array.isArray(field.value) &&
                field.value.length > 0
              );
            });
          }) ||
          proposal.genericTemplates?.some((gen) =>
            gen.questionary.steps.some((step) => {
              return step.fields.some((field) => {
                return (
                  questions.includes(field.question.id) &&
                  Array.isArray(field.value) &&
                  field.value.length > 0
                );
              });
            })
          ) ||
          proposal.samples?.some((sample) =>
            sample.questionary.steps.some((step) => {
              return step.fields.some((field) => {
                return (
                  questions.includes(field.question.id) &&
                  Array.isArray(field.value) &&
                  field.value.length > 0
                );
              });
            })
          )
        );
      })
      .map((proposal) => proposal.primaryKey);
  };
  useEffect(() => {
    if (templates && templates[0]) {
      setPdfTemplates(templates);
    }
  }, [templates]);

  return (
    <Container
      component="main"
      maxWidth="xs"
      data-cy="proposal-attachment-download"
    >
      <Typography variant="h6" component="h1" className={classes.cardHeader}>
        Download attachment on proposal/s
      </Typography>

      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Autocomplete
            id="pdf-template-select"
            aria-labelledby="pdf-template-select-label"
            fullWidth={true}
            noOptionsText={'No matching pdf template'}
            disableClearable
            onChange={(_event, selectedValue) => {
              setSelectedPdfTemplate(selectedValue.templateId);
            }}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) =>
              option.templateId === value.templateId
            }
            options={pdfTemplates.filter(
              (template, index) =>
                pdfTemplates.findIndex(
                  (value) => value.templateId == template.templateId
                ) === index
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                key={params.id}
                data-cy="pdfTemplateName"
                label="Pdf Template"
                placeholder="Select pdf template"
              />
            )}
            renderOption={(props, option) => {
              return (
                <li {...props} key={option.templateId}>
                  {option.name}
                </li>
              );
            }}
            loading={loadingTemplates}
          />
        </Grid>

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
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={includeAllProposals}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setIncludeAllProposals(event.target.checked);
                }}
              />
            }
            label="Include proposal(s) which may not have the selected questions"
          />
        </Grid>
      </Grid>
      <Button
        fullWidth
        className={classes.submit}
        disabled={
          loadingTemplates ||
          loading ||
          !selectedPdfTemplate ||
          selectedAttachmentsQuestions.length < 0
        }
        data-cy="proposalAttachmentDownloadButton"
        onClick={() => {
          const proposalIds = getProposalIds(
            includeAllProposals,
            proposalsData,
            selectedAttachmentsQuestions
          );
          if (
            proposalIds.length > 0 &&
            selectedPdfTemplate &&
            selectedAttachmentsQuestions.length > 0
          ) {
            const title = proposalsData.filter((proposal) =>
              proposalIds.includes(proposal.primaryKey)
            );
            downloadProposalAttachment(
              proposalIds,
              title?.[0].title || '',
              selectedPdfTemplate.toString(),
              selectedAttachmentsQuestions.join(',')
            );
            close();
          } else {
            enqueueSnackbar(
              `Could not download attachment(s) selected proposal(s) don't have the selected question`,
              {
                variant: 'info',
              }
            );
          }
        }}
      >
        Download
      </Button>
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
