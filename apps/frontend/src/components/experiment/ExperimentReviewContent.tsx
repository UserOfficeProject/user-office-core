import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DialogActions, DialogContent } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';
import React, { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

import SimpleTabs from 'components/common/SimpleTabs';
import StyledDialog from 'components/common/StyledDialog';
import UOLoader from 'components/common/UOLoader';
import ExperimentSafetyReview from 'components/experimentSafetyReview/ExperimentSafetyReview';
import GeneralInformation from 'components/proposal/GeneralInformation';
import { AnswersTable } from 'components/questionary/AnswersTable';
import QuestionaryDetails from 'components/questionary/QuestionaryDetails';
import { SettingsId } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useExperiment } from 'hooks/experiment/useExperiment';
import { useExperimentSafety } from 'hooks/experimentSafety/useExperimentSafety';
import { useProposalData } from 'hooks/proposal/useProposalData';

import ExperimentVisitsTable from './ExperimentVisitsTable';

export enum EXPERIMENT_MODAL_TAB_NAMES {
  EXPERIMENT_INFORMATION = 'Experiment Information',
  PROPOSAL_INFORMATION = 'Proposal Information',
  EXPERIMENT_SAFETY_FORM = 'Experiment Safety Form',
  EXPERIMENT_SAFETY_REVIEW = 'Experiment Safety Review',
  VISIT = 'Visit',
}

type ExperimentReviewContentProps = {
  tabNames: EXPERIMENT_MODAL_TAB_NAMES[];
  experimentPk: number;
  isInsideModal?: boolean;
};

const ExperimentSafetyFormTab = ({
  experimentSafetyPk,
}: {
  experimentSafetyPk: number;
}) => {
  const [selectedSampleId, setSelectedSampleId] = useState<number | null>(null);
  const { experimentSafety, loading: experimentSafetyLoading } =
    useExperimentSafety(experimentSafetyPk);

  if (experimentSafetyLoading) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  if (!experimentSafety) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center">
        <h2>Experiment Safety not found</h2>
      </Box>
    );
  }

  const SampleList = () => (
    <List
      sx={(theme) => ({
        padding: 0,
        margin: 0,
        '& li': {
          display: 'block',
          marginRight: theme.spacing(1),
        },
      })}
    >
      {experimentSafety.samples?.map((sample) => (
        <ListItem key={`sample-${sample.sampleId}`}>
          <Link
            href="#"
            onClick={() => setSelectedSampleId(sample.sampleId)}
            style={{ cursor: 'pointer' }}
          >
            {sample.sample.title || `Sample ${sample.sampleId}`}
          </Link>
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box>
      {/* Sample Safety Input Accordion */}
      {experimentSafety.samples && experimentSafety.samples.length > 0 && (
        <Accordion
          defaultExpanded
          disableGutters
          elevation={0}
          square
          sx={(theme) => ({
            ':before': { display: 'none' },
            border: `1px solid ${theme.palette.grey[200]}`,
            marginBottom: theme.spacing(2),
          })}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={(theme) => ({
              background: theme.palette.grey[100],
            })}
          >
            <Typography variant="h6">Sample Safety Input</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ marginBottom: '10px' }}>
            <SampleList />
          </AccordionDetails>
        </Accordion>
      )}

      {/* Experiment Safety Input Accordion */}
      <Accordion
        defaultExpanded
        disableGutters
        elevation={0}
        square
        sx={(theme) => ({
          ':before': { display: 'none' },
          border: `1px solid ${theme.palette.grey[200]}`,
        })}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={(theme) => ({
            background: theme.palette.grey[100],
          })}
        >
          <Typography variant="h6">Experiment Safety Input</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ marginBottom: '10px' }}>
          <QuestionaryDetails
            questionaryId={experimentSafety.esiQuestionaryId}
          />
        </AccordionDetails>
      </Accordion>

      {/* Sample Details Modal */}
      <StyledDialog
        maxWidth="lg"
        fullWidth
        open={selectedSampleId !== null}
        onClose={() => setSelectedSampleId(null)}
        title={
          selectedSampleId
            ? (() => {
                const selectedSample = experimentSafety.samples?.find(
                  (sample) => sample.sampleId === selectedSampleId
                );

                return `Sample Safety Input - ${
                  selectedSample?.sample.title || `Sample ${selectedSampleId}`
                }`;
              })()
            : 'Sample Safety Input'
        }
      >
        <DialogContent>
          {selectedSampleId
            ? (() => {
                const selectedSample = experimentSafety.samples?.find(
                  (sample) => sample.sampleId === selectedSampleId
                );

                return selectedSample?.sampleEsiQuestionaryId ? (
                  <QuestionaryDetails
                    questionaryId={selectedSample.sampleEsiQuestionaryId}
                  />
                ) : (
                  <Box>No questionary found for this sample</Box>
                );
              })()
            : null}
        </DialogContent>
        <DialogActions>
          <Button
            type="button"
            variant="outlined"
            onClick={() => setSelectedSampleId(null)}
            data-cy="close-sample-dialog"
          >
            Close
          </Button>
        </DialogActions>
      </StyledDialog>
    </Box>
  );
};

const ProposalInformationTab = ({ proposalPk }: { proposalPk: number }) => {
  const { proposalData, loading: proposalLoading } =
    useProposalData(proposalPk);

  if (proposalLoading) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  return (
    <>
      {proposalData ? (
        <GeneralInformation data={proposalData} />
      ) : (
        <Box display="flex" flexDirection="column" alignItems="center">
          <h2>Proposal not found</h2>
        </Box>
      )}
    </>
  );
};

const ExperimentReviewContent = ({
  experimentPk,
  tabNames,
  isInsideModal,
}: ExperimentReviewContentProps) => {
  const { experiment, loading: experimentLoading } =
    useExperiment(experimentPk);

  const { t } = useTranslation();
  const { toFormattedDateTime } = useFormattedDateTime({
    shouldUseTimeZone: true,
    settingsFormatToUse: SettingsId.DATE_FORMAT,
  });

  if (experimentLoading) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  if (!experiment) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center">
        <h2>Experiment not found</h2>
      </Box>
    );
  }

  const ExperimentInformationTab = () => {
    const rows = [
      { label: 'Experiment Number', value: experiment.experimentId },
      {
        label: 'Start',
        value: toFormattedDateTime(experiment.startsAt),
      },
      {
        label: 'End',
        value: toFormattedDateTime(experiment.endsAt),
      },
      {
        label: 'Experiment Safety Review Status',
        value: experiment.experimentSafety?.status?.name ?? 'ESF Not Started',
      },
    ];

    return <AnswersTable rows={rows} />;
  };

  const ExperimentSafetyReviewTab = (
    <>
      {experiment.experimentSafety?.experimentSafetyPk ? (
        <ExperimentSafetyReview
          experimentSafetyPk={experiment.experimentSafety.experimentSafetyPk}
        />
      ) : (
        <Box display="flex" flexDirection="column" alignItems="center">
          <h2>Experiment Safety not found</h2>
        </Box>
      )}
    </>
  );

  const tabsContent = tabNames.map((tab, index) => {
    switch (tab) {
      case EXPERIMENT_MODAL_TAB_NAMES.EXPERIMENT_INFORMATION:
        return (
          <Fragment key={index}>
            <ExperimentInformationTab />
          </Fragment>
        );
      case EXPERIMENT_MODAL_TAB_NAMES.PROPOSAL_INFORMATION:
        return (
          <Fragment key={index}>
            <ProposalInformationTab proposalPk={experiment.proposalPk} />
          </Fragment>
        );
      case EXPERIMENT_MODAL_TAB_NAMES.EXPERIMENT_SAFETY_FORM:
        return (
          <Fragment key={index}>
            {experiment.experimentSafety?.experimentSafetyPk ? (
              <ExperimentSafetyFormTab
                experimentSafetyPk={
                  experiment.experimentSafety.experimentSafetyPk
                }
              />
            ) : (
              <>Experiment Safety Not Submitted by the User</>
            )}
          </Fragment>
        );
      case EXPERIMENT_MODAL_TAB_NAMES.EXPERIMENT_SAFETY_REVIEW:
        return <Fragment key={index}>{ExperimentSafetyReviewTab}</Fragment>;
      case EXPERIMENT_MODAL_TAB_NAMES.VISIT:
        return (
          <Fragment key={index}>
            <ExperimentVisitsTable experiment={experiment} />
          </Fragment>
        );
      default:
        return null;
    }
  });

  return (
    <>
      {tabNames.length > 1 ? (
        <SimpleTabs
          tabNames={tabNames.map((name) => t(name))}
          isInsideModal={isInsideModal}
        >
          {tabsContent}
        </SimpleTabs>
      ) : (
        <>{tabsContent}</>
      )}
    </>
  );
};

export default ExperimentReviewContent;
