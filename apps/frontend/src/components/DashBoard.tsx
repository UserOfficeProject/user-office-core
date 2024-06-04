import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import BottomNavigation from '@mui/material/BottomNavigation';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import parse from 'html-react-parser';
import i18n from 'i18n';
import PropTypes from 'prop-types';
import React, { lazy, Suspense, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';

import { FeatureContext } from 'context/FeatureContextProvider';
import { UserContext } from 'context/UserContextProvider';
import { CallsFilter, FeatureId, PageName, UserRole } from 'generated/sdk';
import { useGetPageContent } from 'hooks/admin/useGetPageContent';
import { useCallsData } from 'hooks/call/useCallsData';

import AppToolbar from './AppToolbar/AppToolbar';
import Can, { useCheckAccess } from './common/Can';
import ChangeRole from './common/ChangeRole';
import MenuItems from './menu/MenuItems';
import InformationModal from './pages/InformationModal';
import OverviewPage from './pages/OverviewPage';
import ProposalPage from './proposal/ProposalPage';
import TitledRoute from './TitledRoute';

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
const HelpPage = lazy(() => import('./pages/HelpPage'));
const PageEditor = lazy(() => import('./pages/PageEditor'));
const ProposalChooseCall = lazy(() => import('./proposal/ProposalChooseCall'));
const ProposalCreate = lazy(() => import('./proposal/ProposalCreate'));
const ProposalEdit = lazy(() => import('./proposal/ProposalEdit'));
const InstrSciUpcomingExperimentTimesTable = lazy(
  () => import('./proposalBooking/InstrSciUpcomingExperimentTimesTable')
);
const UserExperimentTimesTable = lazy(
  () => import('./proposalBooking/UserExperimentsTable')
);
const CreateProposalEsiPage = lazy(
  () => import('./proposalEsi/CreateProposalEsiPage')
);
const UpdateProposalEsiPage = lazy(
  () => import('./proposalEsi/UpdateProposalEsiPage')
);
const SampleSafetyPage = lazy(() => import('./sample/SampleSafetyPage'));
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
const ProposalWorkflowEditor = lazy(
  () => import('./settings/proposalWorkflow/ProposalWorkflowEditor')
);
const ProposalWorkflowsPage = lazy(
  () => import('./settings/proposalWorkflow/ProposalWorkflowsPage')
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

type BottomNavItemProps = {
  /** Content of the information modal. */
  text?: string;
  /** Text of the button link in the information modal. */
  linkText?: string;
};

const BottomNavItem = ({ text, linkText }: BottomNavItemProps) => {
  return (
    <InformationModal
      text={text}
      linkText={linkText}
      linkStyle={{
        fontSize: '12px',
        minWidth: 'auto',
        padding: '10px',
      }}
    />
  );
};

BottomNavItem.propTypes = {
  text: PropTypes.string,
  linkText: PropTypes.string,
};

const drawerWidth = 250;

const Dashboard = () => {
  const theme = useTheme();
  const [header, setHeader] = useState('User Office');
  const isTabletOrMobile = useMediaQuery('(max-width: 1224px)');
  const [open, setOpen] = React.useState(
    localStorage.drawerOpen
      ? localStorage.drawerOpen === '1'
      : !isTabletOrMobile
  );
  const { t } = useTranslation();

  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const isSampleSafetyReviewer = useCheckAccess([
    UserRole.SAMPLE_SAFETY_REVIEWER,
  ]);

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
  const isSampleSafetyEnabled = featureContext.featuresMap.get(
    FeatureId.SAMPLE_SAFETY
  )?.isEnabled;

  const { currentRole, isInternalUser } = useContext(UserContext);
  function getDashBoardCallFilter(): CallsFilter {
    return isInternalUser
      ? {
          isActive: true,
          isEnded: false,
          isActiveInternal: true,
        }
      : {
          isActive: true,
          isEnded: false,
        };
  }
  const { calls } = useCallsData(getDashBoardCallFilter());

  const drawer = {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  };
  const drawerOpen = () => ({
    width: drawerWidth,
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  });
  const drawerClose = () => ({
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  });

  const handleDrawerOpen = () => {
    localStorage.setItem('drawerOpen', '1');
    setOpen(true);
  };
  const handleDrawerClose = () => {
    localStorage.setItem('drawerOpen', '0');
    setOpen(false);
  };

  useEffect(() => {
    if (isTabletOrMobile) {
      // NOTE: Closing drawer in the next event cycle fixes the bug where drawer cannot be re-opened when switching from desktop to mobile view.
      setTimeout(() => {
        handleDrawerClose();
      });
    } else if (localStorage.getItem('drawerOpen') === '1') {
      handleDrawerOpen();
    }
  }, [isTabletOrMobile]);

  const [, privacyPageContent] = useGetPageContent(PageName.PRIVACYPAGE);
  const [, faqPageContent] = useGetPageContent(PageName.HELPPAGE);
  const [, footerContent] = useGetPageContent(PageName.FOOTERCONTENT);

  // TODO: Check who can see what and modify the access control here.
  return (
    <Box component="div" sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppToolbar
        open={open}
        handleDrawerOpen={handleDrawerOpen}
        header={header}
      />
      <Drawer
        variant={isTabletOrMobile ? 'temporary' : 'permanent'}
        sx={{
          ...drawer,
          ...(open && drawerOpen()),
          ...(!open && drawerClose()),
        }}
        open={open}
        onClose={handleDrawerClose}
      >
        <Box
          component="div"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(1),
            ...theme.mixins.toolbar,
            '& .closeDrawer': {
              marginLeft: 'auto',
            },
          }}
        >
          {isTabletOrMobile && (
            <Typography component="h1" variant="h6" color="inherit" noWrap>
              {header}
            </Typography>
          )}
          <IconButton
            aria-label="Close drawer"
            onClick={handleDrawerClose}
            className="closeDrawer"
            data-cy="close-drawer"
          >
            <ChevronLeftIcon />
          </IconButton>
        </Box>
        <Divider />
        <List disablePadding>
          <MenuItems callsData={calls} currentRole={currentRole} />
        </List>
        <Divider />
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: 'calc(100vh - 64px)',
          marginTop: '64px',
          width: `calc(100% - ${drawerWidth}px)`,
        }}
      >
        <Suspense
          fallback={
            <div
              data-cy="loading"
              style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              Loading...
            </div>
          }
        >
          <Routes>
            <Route
              path="/ProposalEdit/:proposalPk"
              element={
                <TitledRoute
                  title="Edit Proposal"
                  setHeader={setHeader}
                  element={<ProposalEdit />}
                />
              }
            />
            <Route
              path="/ProposalSelectType"
              element={
                <TitledRoute
                  title="Select Proposal Type"
                  setHeader={setHeader}
                  element={<ProposalChooseCall callsData={calls} />}
                />
              }
            />
            <Route
              path="/ProposalCreate/:callId/:templateId"
              element={
                <TitledRoute
                  title="Create Proposal"
                  setHeader={setHeader}
                  element={<ProposalCreate />}
                />
              }
            />
            {isUserManagementEnabled && (
              <Route
                path="/ProfilePage/:id"
                element={
                  <TitledRoute
                    title="Profile"
                    setHeader={setHeader}
                    element={<ProfilePage />}
                  />
                }
              />
            )}
            {isUserOfficer && (
              <Route
                path="/People/:id"
                element={
                  <TitledRoute
                    title="User"
                    setHeader={setHeader}
                    element={<UserPage />}
                  />
                }
              />
            )}
            {isUserOfficer && (
              <Route
                path="/People"
                element={
                  <TitledRoute
                    title="People"
                    setHeader={setHeader}
                    element={<PeoplePage />}
                  />
                }
              />
            )}
            <Route
              path="/Proposals"
              element={
                <TitledRoute
                  title="Proposals"
                  setHeader={setHeader}
                  element={<ProposalPage />}
                />
              }
            />
            {isUserOfficer && (
              <Route
                path="/ExperimentPage"
                element={
                  <TitledRoute
                    title="Experiments"
                    setHeader={setHeader}
                    element={<ExperimentPage />}
                  />
                }
              />
            )}
            <Route
              path="/PageEditor"
              element={
                <TitledRoute
                  title="Page Editor"
                  setHeader={setHeader}
                  element={<PageEditor />}
                />
              }
            />
            {isUserOfficer && (
              <Route
                path="/Calls"
                element={
                  <TitledRoute
                    title="Calls"
                    setHeader={setHeader}
                    element={<CallPage />}
                  />
                }
              />
            )}
            <Route
              path="/HelpPage"
              element={
                <TitledRoute
                  title="Help"
                  setHeader={setHeader}
                  element={<HelpPage />}
                />
              }
            />
            <Route
              path="/ChangeRole"
              element={
                <TitledRoute
                  title="Change role"
                  setHeader={setHeader}
                  element={<ChangeRole />}
                />
              }
            />
            {isFapEnabled && (
              <Route
                path="/FapPage/:id"
                element={
                  <TitledRoute
                    title="Fap"
                    setHeader={setHeader}
                    element={<FapPage />}
                  />
                }
              />
            )}
            {isFapEnabled && (
              <Route
                path="/Faps"
                element={
                  <TitledRoute
                    title="Faps"
                    setHeader={setHeader}
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
                    setHeader={setHeader}
                    element={<InstrumentsPage />}
                  />
                }
              />
            )}
            <Route
              path="/Institutions"
              element={
                <TitledRoute
                  title="Institutions"
                  setHeader={setHeader}
                  element={<InstitutionPage />}
                />
              }
            />
            <Route
              path="/MergeInstitutionsPage/:institutionId"
              element={
                <TitledRoute
                  title="Merge Institutions"
                  setHeader={setHeader}
                  element={<MergeInstitutionsPage />}
                />
              }
            />
            <Route
              path="/QuestionaryEditor/:templateId"
              element={
                <TitledRoute
                  title="Template Editor"
                  setHeader={setHeader}
                  element={<TemplateEditor />}
                />
              }
            />
            <Route
              path="/PdfTemplateEditor/:templateId"
              element={
                <TitledRoute
                  title="PDF Template Editor"
                  setHeader={setHeader}
                  element={<PdfTemplateEditor />}
                />
              }
            />
            <Route
              path="/PdfTemplates"
              element={
                <TitledRoute
                  title="PDF Templates"
                  setHeader={setHeader}
                  element={<PdfTemplatesPage />}
                />
              }
            />
            <Route
              path="/ProposalTemplates"
              element={
                <TitledRoute
                  title="Proposal Templates"
                  setHeader={setHeader}
                  element={<ProposalTemplatesPage />}
                />
              }
            />
            <Route
              path="/SampleDeclarationTemplates"
              element={
                <TitledRoute
                  title="Sample Templates"
                  setHeader={setHeader}
                  element={<SampleTemplatesPage />}
                />
              }
            />
            <Route
              path="/GenericTemplates"
              element={
                <TitledRoute
                  title="Generic Templates"
                  setHeader={setHeader}
                  element={<GenericTemplatesPage />}
                />
              }
            />
            <Route
              path="/ShipmentDeclarationTemplates"
              element={
                <TitledRoute
                  title="Shipment Templates"
                  setHeader={setHeader}
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
                    setHeader={setHeader}
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
                  setHeader={setHeader}
                  element={<FeedbackTemplatesPage />}
                />
              }
            />
            <Route
              path="/EsiTemplates"
              element={
                <TitledRoute
                  title="Proposal ESI Templates"
                  setHeader={setHeader}
                  element={<ProposalEsiPage />}
                />
              }
            />
            <Route
              path="/SampleEsiTemplates"
              element={
                <TitledRoute
                  title="Sample ESI Templates"
                  setHeader={setHeader}
                  element={<SampleEsiPage />}
                />
              }
            />
            {isUserOfficer && (
              <Route
                path="/Units"
                element={
                  <TitledRoute
                    title="Units"
                    setHeader={setHeader}
                    element={<UnitTablePage />}
                  />
                }
              />
            )}
            {isUserOfficer && (
              <Route
                path="/ProposalStatuses"
                element={
                  <TitledRoute
                    title="Proposal Statuses"
                    setHeader={setHeader}
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
                    setHeader={setHeader}
                    element={<ProposalWorkflowsPage />}
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
                    setHeader={setHeader}
                    element={<ProposalWorkflowEditor />}
                  />
                }
              />
            )}
            {isSampleSafetyEnabled &&
              (isSampleSafetyReviewer || isUserOfficer) && (
                <Route
                  path="/SampleSafety"
                  element={
                    <TitledRoute
                      title="Samples Safety"
                      setHeader={setHeader}
                      element={<SampleSafetyPage />}
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
                    setHeader={setHeader}
                    element={<ApiAccessTokensPage />}
                  />
                }
              />
            )}
            {isUserOfficer && (
              <Route
                path="/Features"
                element={
                  <TitledRoute
                    title="Features"
                    setHeader={setHeader}
                    element={<FeaturesPage />}
                  />
                }
              />
            )}
            {isUserOfficer && (
              <Route
                path="/Settings"
                element={
                  <TitledRoute
                    title="App Settings"
                    setHeader={setHeader}
                    element={<AppSettingsPage />}
                  />
                }
              />
            )}
            {isSchedulerEnabled && (
              <Route
                path="/ExperimentTimes"
                element={
                  <TitledRoute
                    title="User Experiment Times"
                    setHeader={setHeader}
                    element={<UserExperimentTimesTable />}
                  />
                }
              />
            )}
            {isSchedulerEnabled && (
              <Route
                path="/UpcomingExperimentTimes"
                element={
                  <TitledRoute
                    title="Upcoming Experiment Times"
                    setHeader={setHeader}
                    element={<InstrSciUpcomingExperimentTimesTable />}
                  />
                }
              />
            )}
            {isUserOfficer && (
              <Route
                path="/Questions"
                element={
                  <TitledRoute
                    title="Questions"
                    setHeader={setHeader}
                    element={<QuestionsPage />}
                  />
                }
              />
            )}
            {isUserOfficer && (
              <Route
                path="/ImportTemplate"
                element={
                  <TitledRoute
                    title="Import Templates"
                    setHeader={setHeader}
                    element={<ImportTemplatePage />}
                  />
                }
              />
            )}
            {isUserOfficer && (
              <Route
                path="/ImportUnits"
                element={
                  <TitledRoute
                    title="Import Units"
                    setHeader={setHeader}
                    element={<ImportUnitsPage />}
                  />
                }
              />
            )}
            <Route
              path="/CreateEsi/:scheduledEventId"
              element={
                <TitledRoute
                  title="Create ESI Proposal"
                  setHeader={setHeader}
                  element={<CreateProposalEsiPage />}
                />
              }
            />
            <Route
              path="/UpdateEsi/:esiId"
              element={
                <TitledRoute
                  title="Update ESI Proposal"
                  setHeader={setHeader}
                  element={<UpdateProposalEsiPage />}
                />
              }
            />
            <Route
              path="/CreateFeedback/:scheduledEventId"
              element={
                <TitledRoute
                  title="Create Feedback"
                  setHeader={setHeader}
                  element={<CreateFeedbackPage />}
                />
              }
            />
            <Route
              path="/UpdateFeedback/:feedbackId"
              element={
                <TitledRoute
                  title="Update Feedback"
                  setHeader={setHeader}
                  element={<UpdateFeedbackPage />}
                />
              }
            />
            <Route
              path="/DeclareShipments/:scheduledEventId"
              element={
                <TitledRoute
                  title="Declare Shipments"
                  setHeader={setHeader}
                  element={<DeclareShipmentsPage />}
                />
              }
            />
            {/* <Can
              allowedRoles={[UserRole.USER_OFFICER]}
              yes={() => <Route element={<ProposalPage />} />}
              no={() => (
                <Can
                  allowedRoles={[UserRole.USER]}
                  yes={() => (
                    <Route
                      element={<OverviewPage userRole={UserRole.USER} />}
                    />
                  )}
                  no={() => (
                    <Can
                      allowedRoles={[
                        UserRole.FAP_REVIEWER,
                        UserRole.FAP_CHAIR,
                        UserRole.FAP_SECRETARY,
                        UserRole.INSTRUMENT_SCIENTIST,
                        UserRole.INTERNAL_REVIEWER,
                      ]}
                      yes={() => (
                        <Route
                          element={
                            <OverviewPage userRole={currentRole as UserRole} />
                          }
                        />
                      )}
                    />
                  )}
                />
              )}
            /> */}
          </Routes>
        </Suspense>
        {parse(footerContent)}
        <BottomNavigation
          sx={{
            display: 'flex',
            marginTop: 'auto',
            marginBottom: theme.spacing(2),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
          }}
        >
          <BottomNavItem
            text={privacyPageContent}
            linkText={'Privacy Statement'}
          />
          <BottomNavItem text={faqPageContent} linkText={'FAQ'} />
          <BottomNavItem />
        </BottomNavigation>
      </Box>
    </Box>
  );
};

export default Dashboard;
