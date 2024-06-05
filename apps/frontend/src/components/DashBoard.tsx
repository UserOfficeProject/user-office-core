import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import BottomNavigation from '@mui/material/BottomNavigation';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import parse from 'html-react-parser';
import i18n from 'i18n';
import PropTypes from 'prop-types';
import React, { lazy, Suspense, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Switch } from 'react-router-dom';

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

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    ...theme.mixins.toolbar,

    '& .closeDrawer': {
      marginLeft: 'auto',
    },
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  content: {
    flexGrow: 1,
    height: 'calc(100vh - 64px)',
    marginTop: '64px',
    width: `calc(100% - ${drawerWidth}px)`,
  },
  bottomNavigation: {
    display: 'flex',
    marginTop: 'auto',
    marginBottom: theme.spacing(2),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
  },
}));

const Dashboard = () => {
  const [header, setHeader] = useState('User Office');
  const isTabletOrMobile = useMediaQuery('(max-width: 1224px)');
  const classes = useStyles();
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
    <div className={classes.root}>
      <CssBaseline />
      <AppToolbar
        open={open}
        handleDrawerOpen={handleDrawerOpen}
        header={header}
      />
      <Drawer
        variant={isTabletOrMobile ? 'temporary' : 'permanent'}
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          }),
        }}
        open={open}
        onClose={handleDrawerClose}
      >
        <div className={classes.toolbarIcon}>
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
        </div>
        <Divider />
        <List disablePadding>
          <MenuItems callsData={calls} currentRole={currentRole} />
        </List>
        <Divider />
      </Drawer>
      <main className={classes.content}>
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
          <Switch>
            <TitledRoute
              setHeader={setHeader}
              title="Edit Proposal"
              path="/ProposalEdit/:proposalPk"
              component={ProposalEdit}
            />
            <TitledRoute
              setHeader={setHeader}
              title="Select Proposal Type"
              path="/ProposalSelectType"
              component={() => <ProposalChooseCall callsData={calls} />}
            />
            <TitledRoute
              setHeader={setHeader}
              title="Create Proposal"
              path="/ProposalCreate/:callId/:templateId"
              component={ProposalCreate}
            />
            {isUserManagementEnabled && (
              <TitledRoute
                setHeader={setHeader}
                title="Profile"
                path="/ProfilePage/:id"
                component={ProfilePage}
              />
            )}
            {isUserOfficer && (
              <TitledRoute
                setHeader={setHeader}
                title="User"
                path="/People/:id"
                component={UserPage}
              />
            )}
            {isUserOfficer && <Route path="/People" component={PeoplePage} />}
            <TitledRoute
              setHeader={setHeader}
              title="Proposal"
              path="/Proposals"
              component={ProposalPage}
            />
            {isUserOfficer && (
              <TitledRoute
                setHeader={setHeader}
                title="Experiments"
                path="/ExperimentPage"
                component={ExperimentPage}
              />
            )}
            <TitledRoute
              setHeader={setHeader}
              title="Page Editor"
              path="/PageEditor"
              component={PageEditor}
            />
            {isUserOfficer && (
              <TitledRoute
                setHeader={setHeader}
                title="Call"
                path="/Calls"
                component={CallPage}
              />
            )}
            <TitledRoute
              setHeader={setHeader}
              title="Help"
              path="/HelpPage"
              component={HelpPage}
            />
            <TitledRoute
              setHeader={setHeader}
              title="Change role"
              path="/changeRole"
              component={ChangeRole}
            />
            {isFapEnabled && (
              <TitledRoute
                setHeader={setHeader}
                title="Fap"
                path="/FapPage/:id"
                component={FapPage}
              />
            )}
            {isFapEnabled && (
              <TitledRoute
                setHeader={setHeader}
                title="Faps"
                path="/Faps"
                component={FapsPage}
              />
            )}
            {isInstrumentManagementEnabled && (
              <TitledRoute
                setHeader={setHeader}
                title={i18n.format(t('instrument'), 'plural')}
                path="/Instruments"
                component={InstrumentsPage}
              />
            )}
            <TitledRoute
              setHeader={setHeader}
              title="Techniques"
              path="/Techniques"
              component={InstrumentsPage}
            />
            <TitledRoute
              setHeader={setHeader}
              title="Institution"
              path="/Institutions"
              component={InstitutionPage}
            />
            <TitledRoute
              setHeader={setHeader}
              title="Merge Institution"
              path="/MergeInstitutionsPage/:institutionId"
              component={MergeInstitutionsPage}
            />
            <TitledRoute
              setHeader={setHeader}
              title="Template Editor"
              path="/QuestionaryEditor/:templateId"
              component={TemplateEditor}
            />
            <TitledRoute
              setHeader={setHeader}
              title="PDF Template Editor"
              path="/PdfTemplateEditor/:templateId"
              component={PdfTemplateEditor}
            />
            <TitledRoute
              setHeader={setHeader}
              title="PDF Template"
              path="/PdfTemplates"
              component={PdfTemplatesPage}
            />
            <TitledRoute
              setHeader={setHeader}
              title="Proposal Template"
              path="/ProposalTemplates"
              component={ProposalTemplatesPage}
            />
            <TitledRoute
              setHeader={setHeader}
              title="Samples Template"
              path="/SampleDeclarationTemplates"
              component={SampleTemplatesPage}
            />
            <TitledRoute
              setHeader={setHeader}
              title="Generic Template"
              path="/GenericTemplates"
              component={GenericTemplatesPage}
            />
            <TitledRoute
              setHeader={setHeader}
              title="Shipment Template"
              path="/ShipmentDeclarationTemplates"
              component={ShipmentTemplatesPage}
            />
            {isVisitManagementEnabled && (
              <TitledRoute
                setHeader={setHeader}
                title="Visits Template"
                path="/VisitTemplates"
                component={VisitTemplatesPage}
              />
            )}
            <TitledRoute
              setHeader={setHeader}
              title="Feedback Template"
              path="/FeedbackTemplates"
              component={FeedbackTemplatesPage}
            />
            <TitledRoute
              setHeader={setHeader}
              title="Esi Proposal"
              path="/EsiTemplates"
              component={ProposalEsiPage}
            />
            <TitledRoute
              setHeader={setHeader}
              title="Esi Samples"
              path="/SampleEsiTemplates"
              component={SampleEsiPage}
            />
            {isUserOfficer && (
              <TitledRoute
                setHeader={setHeader}
                title="Units Table"
                path="/Units"
                component={UnitTablePage}
              />
            )}
            {isUserOfficer && (
              <TitledRoute
                setHeader={setHeader}
                title="Proposal Status"
                path="/ProposalStatuses"
                component={ProposalStatusesPage}
              />
            )}
            {isUserOfficer && (
              <TitledRoute
                setHeader={setHeader}
                title="Proposal Workflows"
                path="/ProposalWorkflows"
                component={ProposalWorkflowsPage}
              />
            )}
            {isUserOfficer && (
              <TitledRoute
                setHeader={setHeader}
                title="Proposal Workflow Editor"
                path="/ProposalWorkflowEditor/:workflowId"
                component={ProposalWorkflowEditor}
              />
            )}
            {isSampleSafetyEnabled &&
              (isSampleSafetyReviewer || isUserOfficer) && (
                <TitledRoute
                  setHeader={setHeader}
                  title="Samples Safety"
                  path="/SampleSafety"
                  component={SampleSafetyPage}
                />
              )}
            {isUserOfficer && (
              <TitledRoute
                setHeader={setHeader}
                title="Api Access Tokens"
                path="/ApiAccessTokens"
                component={ApiAccessTokensPage}
              />
            )}
            {isUserOfficer && (
              <TitledRoute
                setHeader={setHeader}
                title="Features"
                path="/Features"
                component={FeaturesPage}
              />
            )}
            {isUserOfficer && (
              <TitledRoute
                setHeader={setHeader}
                title="App settings"
                path="/Settings"
                component={AppSettingsPage}
              />
            )}
            {isSchedulerEnabled && (
              <TitledRoute
                setHeader={setHeader}
                title="User Experiment TimeTable"
                path="/ExperimentTimes"
                component={UserExperimentTimesTable}
              />
            )}
            {isSchedulerEnabled && (
              <TitledRoute
                setHeader={setHeader}
                title="InstrSci Upcoming Experiment TimeTable"
                path="/UpcomingExperimentTimes"
                component={InstrSciUpcomingExperimentTimesTable}
              />
            )}
            {isUserOfficer && (
              <TitledRoute
                setHeader={setHeader}
                title="Questions"
                path="/Questions"
                component={QuestionsPage}
              />
            )}
            {isUserOfficer && (
              <TitledRoute
                setHeader={setHeader}
                title="Import Templates"
                path="/ImportTemplate"
                component={ImportTemplatePage}
              />
            )}
            {isUserOfficer && (
              <TitledRoute
                setHeader={setHeader}
                title="Import Units"
                path="/ImportUnits"
                component={ImportUnitsPage}
              />
            )}
            <TitledRoute
              setHeader={setHeader}
              title="Create Esi Proposal"
              path="/CreateEsi/:scheduledEventId"
              component={CreateProposalEsiPage}
            />
            <TitledRoute
              setHeader={setHeader}
              title="Update Esi Proposal"
              path="/UpdateEsi/:esiId"
              component={UpdateProposalEsiPage}
            />
            <TitledRoute
              setHeader={setHeader}
              title="Create Feedback"
              path="/CreateFeedback/:scheduledEventId"
              component={CreateFeedbackPage}
            />
            <TitledRoute
              setHeader={setHeader}
              title="Update Feedback"
              path="/UpdateFeedback/:feedbackId"
              component={UpdateFeedbackPage}
            />
            <TitledRoute
              setHeader={setHeader}
              title="Declare Shipments"
              path="/DeclareShipments/:scheduledEventId"
              component={DeclareShipmentsPage}
            />
            <Can
              allowedRoles={[UserRole.USER_OFFICER]}
              yes={() => <Route component={ProposalPage} />}
              no={() => (
                <Can
                  allowedRoles={[UserRole.USER]}
                  yes={() => (
                    <Route
                      render={(props) => (
                        <OverviewPage {...props} userRole={UserRole.USER} />
                      )}
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
                          render={(props) => (
                            <OverviewPage
                              {...props}
                              userRole={currentRole as UserRole}
                            />
                          )}
                        />
                      )}
                    />
                  )}
                />
              )}
            />
          </Switch>
        </Suspense>
        {parse(footerContent)}
        <BottomNavigation className={classes.bottomNavigation}>
          <BottomNavItem
            text={privacyPageContent}
            linkText={'Privacy Statement'}
          />
          <BottomNavItem text={faqPageContent} linkText={'FAQ'} />
          <BottomNavItem />
        </BottomNavigation>
      </main>
    </div>
  );
};

export default Dashboard;
