import { Box } from '@mui/system';
import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import SimpleTabs from 'components/common/SimpleTabs';
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

  return (
    <>
      {experimentSafety.samples ? (
        <>
          <SimpleTabs
            tabNames={[
              ...experimentSafety.samples.map(
                (sample) =>
                  `Sample Safety Input - ${sample.sample.title}` ||
                  `Sample Safety Input - ${sample.sampleId}`
              ),
              'Experiment Safety Input',
            ]}
            tabPanelPadding={2}
          >
            {experimentSafety.samples.map((sample) => (
              <div key={sample.sampleId}>
                <QuestionaryDetails
                  questionaryId={sample.sampleEsiQuestionaryId}
                />
              </div>
            ))}
            <div key={'Experiment Safety Input'}>
              <QuestionaryDetails
                questionaryId={experimentSafety.esiQuestionaryId}
              />
            </div>
          </SimpleTabs>
        </>
      ) : (
        <Box display="flex" flexDirection="column" alignItems="center">
          <h2>Experiment Safety not found</h2>
        </Box>
      )}
    </>
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

  const VisitTab = <>VisitTab</>;

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
              <>Experiment Safety PK Not Found</>
            )}
          </Fragment>
        );
      case EXPERIMENT_MODAL_TAB_NAMES.EXPERIMENT_SAFETY_REVIEW:
        return <Fragment key={index}>{ExperimentSafetyReviewTab}</Fragment>;
      case EXPERIMENT_MODAL_TAB_NAMES.VISIT:
        return <Fragment key={index}>{VisitTab}</Fragment>;
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
