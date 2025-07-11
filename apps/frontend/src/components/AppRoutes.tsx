import i18n from 'i18n';
import React, { lazy, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

import { FeatureContext } from 'context/FeatureContextProvider';
import { UserContext } from 'context/UserContextProvider';
import { FeatureId, UserRole, WorkflowType } from 'generated/sdk';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { useTechniqueProposalAccess } from 'hooks/common/useTechniqueProposalAccess';

import ChangeRole from './common/ChangeRole';
import OverviewPage from './pages/OverviewPage';
import ProposalPage from './proposal/ProposalPage';
import EmailStatusActionsLogsPage from './statusActionsLogs/EmailStatusActionsLogsPage';
import ProposalDownloadStatusActionsLogsPage from './statusActionsLogs/ProposalDownloadStatusActionsLogsPage';
import TechniqueProposalTable from './techniqueProposal/TechniqueProposalTable';
import TitledRoute from './TitledRoute';
import ExternalAuth, { getCurrentUrlValues } from './user/ExternalAuth';

const CallPage = lazy(() => import('./call/CallPage'));
const ExperimentPage = lazy(() => import('./experiment/ExperimentPage'));
const FapPage = lazy(() => import('./fap/FapPage'));
const FapsPage = lazy(() => import('./fap/FapsPage'));
const CreateFeedbackPage = lazy(() => import('./feedback/CreateFeedbackPage'));
const UpdateFeedbackPage = lazy(() => import('./feedback/UpdateFeedbackPage'));
const InstitutionPage = lazy(() => import('./institution/InstitutionPage'));
const MergeInstitutionsPage = lazy(
  () => import('./institution/MergeInstitutionPage')
);
const InstrumentsPage = lazy(() => import('./instrument/InstrumentsPage'));
const TechniquesPage = lazy(() => import('./technique/TechniquesPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const PageEditor = lazy(() => import('./pages/PageEditor'));
const ProposalChooseCall = lazy(() => import('./proposal/ProposalChooseCall'));
const ProposalCreate = lazy(() => import('./proposal/ProposalCreate'));
const ProposalEdit = lazy(() => import('./proposal/ProposalEdit'));

const UserExperimentTimesTable = lazy(
  () => import('./proposalBooking/UserExperimentsTable')
);
const ExperimentSafetyPage = lazy(
  () => import('./experimentSafety/ExperimentSafetyPage')
);
const ExperimentSafetyReviewPage = lazy(
  () => import('./experimentSafetyReview/ExperimentSafetyReviewPage')
);
const ApiAccessTokensPage = lazy(
  () => import('./settings/apiAccessTokens/ApiAccessTokensPage')
);
const AppSettingsPage = lazy(
  () => import('./settings/appSettings/AppSettingsPage')
);
const FeaturesPage = lazy(() => import('./settings/features/FeaturesPage'));
const ProposalStatusesPage = lazy(
  () => import('./settings/proposalStatus/ProposalStatusesPage')
);
const WorkflowEditor = lazy(() => import('./settings/workflow/WorkflowEditor'));
const ProposalWorkflowsPage = lazy(
  () => import('./settings/workflow/ProposalWorkflowsPage')
);

const ExperimentWorkflowsPage = lazy(
  () => import('./settings/experimentWorkflow/ExperimentWorkflowsPage')
);
const UnitTablePage = lazy(() => import('./settings/unitList/UnitTablePage'));
const DeclareShipmentsPage = lazy(
  () => import('./shipments/DeclareShipmentsPage')
);
const ProposalEsiPage = lazy(() => import('./template/EsiPage'));
const FeedbackTemplatesPage = lazy(
  () => import('./template/FeedbackTemplatesPage')
);
const GenericTemplatesPage = lazy(
  () => import('./template/GenericTemplatesPage')
);
const ImportTemplatePage = lazy(
  () => import('./template/import/ImportTemplatePage')
);
const PdfTemplateEditor = lazy(() => import('./template/PdfTemplateEditor'));
const PdfTemplatesPage = lazy(() => import('./template/PdfTemplatesPage'));
const ProposalTemplatesPage = lazy(
  () => import('./template/ProposalTemplatesPage')
);
const FapReviewTemplatesPage = lazy(
  () => import('./template/FapReviewTemplatesPage')
);
const TechnicalReviewTemplatesPage = lazy(
  () => import('./template/TechnicalReviewTemplatesPage')
);
const QuestionsPage = lazy(() => import('./template/QuestionsPage'));
const SampleEsiPage = lazy(() => import('./template/SampleEsiPage'));
const SampleTemplatesPage = lazy(
  () => import('./template/SampleTemplatesPage')
);
const ShipmentTemplatesPage = lazy(
  () => import('./template/ShipmentTemplatesPage')
);
const TemplateEditor = lazy(() => import('./template/TemplateEditor'));
const VisitTemplatesPage = lazy(() => import('./template/VisitTemplatesPage'));
const ImportUnitsPage = lazy(() => import('./unit/ImportUnitsPage'));
const PeoplePage = lazy(() => import('./user/PeoplePage'));
const ProfilePage = lazy(() => import('./user/ProfilePage'));
const UserPage = lazy(() => import('./user/UserPage'));

const PrivateOutlet = () => (
  <UserContext.Consumer>
    {({ roles, token, currentRole, handleRole }): JSX.Element => {
      if (!token) {
        const { queryParams, pathName } = getCurrentUrlValues();
        const redirectPath = queryParams.size
          ? `${pathName}?${queryParams.toString()}`
          : pathName;
        localStorage.redirectPath = redirectPath;

        return <Navigate to="/external-auth" />;
      }

      if (!currentRole) {
        handleRole(roles[0].shortCode);
      }

      return <Outlet />;
    }}
  </UserContext.Consumer>
);

const AppRoutes = () => {
  const { t } = useTranslation();
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const isUser = useCheckAccess([UserRole.USER]);
  const isExperimentSafetyReviewer = useCheckAccess([
    UserRole.EXPERIMENT_SAFETY_REVIEWER,
  ]);
  const isInstrumentScientist = useCheckAccess([UserRole.INSTRUMENT_SCIENTIST]);

  const featureContext = useContext(FeatureContext);
  const isSchedulerEnabled = featureContext.featuresMap.get(
    FeatureId.SCHEDULER
  )?.isEnabled;
  const isInstrumentManagementEnabled = featureContext.featuresMap.get(
    FeatureId.INSTRUMENT_MANAGEMENT
  )?.isEnabled;
  const isFapEnabled = featureContext.featuresMap.get(
    FeatureId.FAP_REVIEW
  )?.isEnabled;
  const isUserManagementEnabled = featureContext.featuresMap.get(
    FeatureId.USER_MANAGEMENT
  )?.isEnabled;
  const isVisitManagementEnabled = featureContext.featuresMap.get(
    FeatureId.VISIT_MANAGEMENT
  )?.isEnabled;
  const isExperimentSafetyReviewEnabled = featureContext.featuresMap.get(
    FeatureId.EXPERIMENT_SAFETY_REVIEW
  )?.isEnabled;
  const isTechniqueProposalsEnabled = useTechniqueProposalAccess([
    UserRole.USER_OFFICER,
    UserRole.INSTRUMENT_SCIENTIST,
  ]);
  const isExperimentSafetyEnabled = featureContext.featuresMap.get(
    FeatureId.EXPERIMENT_SAFETY_REVIEW
  )?.isEnabled;
  const { currentRole } = useContext(UserContext);

  return (
    <Routes>
      <Route path="/external-auth/:sessionId" element={<ExternalAuth />} />
      <Route path="/external-auth/:token" element={<ExternalAuth />} />
      <Route path="/external-auth/:code" element={<ExternalAuth />} />
      <Route path="/external-auth/" element={<ExternalAuth />} />
      <Route path="/" element={<PrivateOutlet />}>
        <Route
          path="/ProposalEdit/:proposalPk"
          element={
            <TitledRoute title="Edit Proposal" element={<ProposalEdit />} />
          }
        />
        <Route
          path="/ProposalSelectType"
          element={
            <TitledRoute
              title="Select Proposal Type"
              element={<ProposalChooseCall />}
            />
          }
        />
        <Route
          path="/ProposalCreate/:callId/:templateId"
          element={
            <TitledRoute title="Create Proposal" element={<ProposalCreate />} />
          }
        />
        {isUserManagementEnabled && (
          <Route
            path="/ProfilePage/:id"
            element={<TitledRoute title="Profile" element={<ProfilePage />} />}
          />
        )}
        {isUserOfficer && (
          <Route
            path="/People/:id"
            element={<TitledRoute title="User" element={<UserPage />} />}
          />
        )}
        {isUserOfficer && (
          <Route
            path="/People"
            element={<TitledRoute title="People" element={<PeoplePage />} />}
          />
        )}
        <Route
          path="/Proposals"
          element={<TitledRoute title="Proposals" element={<ProposalPage />} />}
        />
        {isTechniqueProposalsEnabled &&
          (isInstrumentScientist || isUserOfficer) && (
            <Route
              path="/TechniqueProposals"
              element={
                <TitledRoute
                  title={t('Technique Proposals')}
                  element={<TechniqueProposalTable />}
                />
              }
            />
          )}
        {isUserOfficer && (
          <Route
            path="/ExperimentPage"
            element={
              <TitledRoute title="Experiments" element={<ExperimentPage />} />
            }
          />
        )}
        <Route
          path="/PageEditor"
          element={<TitledRoute title="Page Editor" element={<PageEditor />} />}
        />
        {isUserOfficer && (
          <Route
            path="/Calls"
            element={<TitledRoute title="Calls" element={<CallPage />} />}
          />
        )}
        {isUserOfficer && (
          <Route
            path="/EmailStatusActionsLogs"
            element={
              <TitledRoute
                title="Status Actions Logs"
                element={<EmailStatusActionsLogsPage />}
              />
            }
          />
        )}
        {isUserOfficer && (
          <Route
            path="/ProposalDownloadStatusActionsLogs"
            element={
              <TitledRoute
                title="Status Actions Logs"
                element={<ProposalDownloadStatusActionsLogsPage />}
              />
            }
          />
        )}
        <Route
          path="/HelpPage"
          element={<TitledRoute title="Help" element={<HelpPage />} />}
        />
        <Route
          path="/ChangeRole"
          element={<TitledRoute title="Change role" element={<ChangeRole />} />}
        />
        {isFapEnabled && (
          <Route
            path="/FapPage/:id"
            element={<TitledRoute title={t('Fap')} element={<FapPage />} />}
          />
        )}
        {isFapEnabled && (
          <Route
            path="/Faps"
            element={
              <TitledRoute
                title={i18n.format(t('Fap'), 'plural')}
                element={<FapsPage />}
              />
            }
          />
        )}
        {isInstrumentManagementEnabled && (
          <Route
            path="/Instruments"
            element={
              <TitledRoute
                title={i18n.format(t('instrument'), 'plural')}
                element={<InstrumentsPage />}
              />
            }
          />
        )}
        {isUserOfficer && (
          <Route
            path="/Techniques"
            element={
              <TitledRoute
                title={i18n.format(t('Technique'), 'plural')}
                element={<TechniquesPage />}
              />
            }
          />
        )}
        <Route
          path="/Institutions"
          element={
            <TitledRoute title="Institutions" element={<InstitutionPage />} />
          }
        />
        <Route
          path="/MergeInstitutionsPage/:institutionId"
          element={
            <TitledRoute
              title="Merge Institutions"
              element={<MergeInstitutionsPage />}
            />
          }
        />
        <Route
          path="/QuestionaryEditor/:templateId"
          element={
            <TitledRoute title="Template Editor" element={<TemplateEditor />} />
          }
        />
        <Route
          path="/PdfTemplateEditor/:templateId"
          element={
            <TitledRoute
              title="PDF Template Editor"
              element={<PdfTemplateEditor />}
            />
          }
        />
        <Route
          path="/PdfTemplates"
          element={
            <TitledRoute title="PDF Templates" element={<PdfTemplatesPage />} />
          }
        />
        <Route
          path="/FapReviewTemplates"
          element={
            <TitledRoute
              title={i18n.format(t('FAP Review Template'), 'plural')}
              element={<FapReviewTemplatesPage />}
            />
          }
        />
        <Route
          path="/TechnicalReviewTemplates"
          element={
            <TitledRoute
              title="Technical Review Templates"
              element={<TechnicalReviewTemplatesPage />}
            />
          }
        />
        <Route
          path="/ProposalTemplates"
          element={
            <TitledRoute
              title="Proposal Templates"
              element={<ProposalTemplatesPage />}
            />
          }
        />
        <Route
          path="/SampleDeclarationTemplates"
          element={
            <TitledRoute
              title="Sample Templates"
              element={<SampleTemplatesPage />}
            />
          }
        />
        <Route
          path="/GenericTemplates"
          element={
            <TitledRoute
              title="Generic Templates"
              element={<GenericTemplatesPage />}
            />
          }
        />
        <Route
          path="/ShipmentDeclarationTemplates"
          element={
            <TitledRoute
              title="Shipment Templates"
              element={<ShipmentTemplatesPage />}
            />
          }
        />
        {isVisitManagementEnabled && (
          <Route
            path="/VisitTemplates"
            element={
              <TitledRoute
                title="Visit Templates"
                element={<VisitTemplatesPage />}
              />
            }
          />
        )}
        <Route
          path="/FeedbackTemplates"
          element={
            <TitledRoute
              title="Feedback Templates"
              element={<FeedbackTemplatesPage />}
            />
          }
        />
        <Route
          path="/EsiTemplates"
          element={
            <TitledRoute
              title="Proposal ESI Templates"
              element={<ProposalEsiPage />}
            />
          }
        />
        <Route
          path="/SampleEsiTemplates"
          element={
            <TitledRoute
              title="Sample ESI Templates"
              element={<SampleEsiPage />}
            />
          }
        />
        {isUserOfficer && (
          <Route
            path="/Units"
            element={<TitledRoute title="Units" element={<UnitTablePage />} />}
          />
        )}
        {isUserOfficer && (
          <Route
            path="/ProposalStatuses"
            element={
              <TitledRoute
                title="Proposal Statuses"
                element={<ProposalStatusesPage />}
              />
            }
          />
        )}
        {isUserOfficer && (
          <Route
            path="/ProposalWorkflows"
            element={
              <TitledRoute
                title="Proposal Workflows"
                element={<ProposalWorkflowsPage />}
              />
            }
          />
        )}
        {isExperimentSafetyEnabled && isUserOfficer && (
          <Route
            path="/ExperimentWorkflows"
            element={
              <TitledRoute
                title="Experiment Workflows"
                element={<ExperimentWorkflowsPage />}
              />
            }
          />
        )}
        {isUserOfficer && (
          <Route
            path="/ExperimentWorkflows"
            element={
              <TitledRoute
                title="Experiment Workflows"
                element={<ExperimentWorkflowsPage />}
              />
            }
          />
        )}
        {isUserOfficer && (
          <Route
            path="/ProposalWorkflowEditor/:workflowId"
            element={
              <TitledRoute
                title="Proposal Workflow Editor"
                element={<WorkflowEditor entityType={WorkflowType.PROPOSAL} />}
              />
            }
          />
        )}
        {isExperimentSafetyEnabled && isUserOfficer && (
          <Route
            path="/ExperimentWorkflowEditor/:workflowId"
            element={
              <TitledRoute
                title="Experiment Workflow Editor"
                element={
                  <WorkflowEditor entityType={WorkflowType.EXPERIMENT} />
                }
              />
            }
          />
        )}
        {isExperimentSafetyReviewEnabled &&
          (isExperimentSafetyReviewer ||
            isUserOfficer ||
            isInstrumentScientist) && (
            <Route
              path="/ExperimentSafetyReview"
              element={
                <TitledRoute
                  title="Experiment Safety Review"
                  element={<ExperimentSafetyReviewPage />}
                />
              }
            />
          )}
        {isUserOfficer && (
          <Route
            path="/ApiAccessTokens"
            element={
              <TitledRoute
                title="Api Access Tokens"
                element={<ApiAccessTokensPage />}
              />
            }
          />
        )}
        {isUserOfficer && (
          <Route
            path="/Features"
            element={
              <TitledRoute title="Features" element={<FeaturesPage />} />
            }
          />
        )}
        {isUserOfficer && (
          <Route
            path="/Settings"
            element={
              <TitledRoute title="App Settings" element={<AppSettingsPage />} />
            }
          />
        )}
        {isSchedulerEnabled && (
          <Route
            path="/ExperimentTimes"
            element={
              <TitledRoute
                title="User Experiment Times"
                element={<UserExperimentTimesTable />}
              />
            }
          />
        )}
        {isUserOfficer && (
          <Route
            path="/Questions"
            element={
              <TitledRoute title="Questions" element={<QuestionsPage />} />
            }
          />
        )}
        {isUserOfficer && (
          <Route
            path="/ImportTemplate"
            element={
              <TitledRoute
                title="Import Templates"
                element={<ImportTemplatePage />}
              />
            }
          />
        )}
        {isUserOfficer && (
          <Route
            path="/ImportUnits"
            element={
              <TitledRoute title="Import Units" element={<ImportUnitsPage />} />
            }
          />
        )}
        <Route
          path="/ExperimentSafety/:experimentPk"
          element={
            <TitledRoute
              title="Experiment Safety"
              element={<ExperimentSafetyPage />}
            />
          }
        />
        <Route
          path="/CreateFeedback/:experimentPk"
          element={
            <TitledRoute
              title="Create Feedback"
              element={<CreateFeedbackPage />}
            />
          }
        />
        <Route
          path="/UpdateFeedback/:feedbackId"
          element={
            <TitledRoute
              title="Update Feedback"
              element={<UpdateFeedbackPage />}
            />
          }
        />
        <Route
          path="/DeclareShipments/:experimentPk"
          element={
            <TitledRoute
              title="Declare Shipments"
              element={<DeclareShipmentsPage />}
            />
          }
        />
        {isUserOfficer ? (
          <Route
            path="/"
            element={<TitledRoute title="" element={<ProposalPage />} />}
          />
        ) : isUser ? (
          <Route
            path="/"
            element={
              <TitledRoute
                title=""
                element={<OverviewPage userRole={UserRole.USER} />}
              />
            }
          />
        ) : isExperimentSafetyReviewer ? (
          <Route
            path="/"
            element={
              <TitledRoute title="" element={<ExperimentSafetyReviewPage />} />
            }
          />
        ) : (
          <Route
            path="/"
            element={
              <TitledRoute
                title=""
                element={<OverviewPage userRole={currentRole as UserRole} />}
              />
            }
          />
        )}
      </Route>
    </Routes>
  );
};

export default AppRoutes;
