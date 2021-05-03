import BottomNavigation from '@material-ui/core/BottomNavigation';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import makeStyles from '@material-ui/core/styles/makeStyles';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { Route, Switch } from 'react-router-dom';

import { FeatureContext } from 'context/FeatureContextProvider';
import { UserContext } from 'context/UserContextProvider';
import { FeatureId, PageName, UserRole } from 'generated/sdk';
import { useGetPageContent } from 'hooks/admin/useGetPageContent';
import { useCallsData } from 'hooks/call/useCallsData';

import AppToolbar from './AppToolbar/AppToolbar';
import CallPage from './call/CallPage';
import Can, { useCheckAccess } from './common/Can';
import InstitutionPage from './institution/InstitutionPage';
import InstrumentsPage from './instrument/InstrumentsPage';
import MenuItems from './MenuItems';
import HelpPage from './pages/HelpPage';
import InformationModal from './pages/InformationModal';
import OverviewPage from './pages/OverviewPage';
import PageEditor from './pages/PageEditor';
import ProposalChooseCall from './proposal/ProposalChooseCall';
import ProposalCreate from './proposal/ProposalCreate';
import ProposalEdit from './proposal/ProposalEdit';
import ProposalPage from './proposal/ProposalPage';
import InstrSciUpcomingBeamTimesTable from './proposalBooking/InstrSciUpcomingBeamTimesTable';
import UserMyBeamTimesTable from './proposalBooking/UserMyBeamTimesTable';
import ProposalTableReviewer from './review/ProposalTableReviewer';
import SampleSafetyPage from './sample/SampleSafetyPage';
import SEPPage from './SEP/SEPPage';
import SEPsPage from './SEP/SEPsPage';
import ApiAccessTokensPage from './settings/apiAccessTokens/ApiAccessTokensPage';
import ProposalStatusesPage from './settings/proposalStatus/ProposalStatusesPage';
import ProposalWorkflowEditor from './settings/proposalWorkflow/ProposalWorkflowEditor';
import ProposalWorkflowsPage from './settings/proposalWorkflow/ProposalWorkflowsPage';
import UnitTablePage from './settings/unitList/UnitTablePage';
import ShipmentCreate from './shipments/CreateUpdateShipment';
import MyShipments from './shipments/MyShipments';
import ShipmentsPage from './shipments/ShipmentsPage';
import ProposalTemplates from './template/ProposalTemplates';
import QuestionsPage from './template/QuestionsPage';
import SampleTemplatesPage from './template/SampleTemplates';
import ShipmentTemplatesPage from './template/ShipmentTemplatesPage';
import TemplateEditor from './template/TemplateEditor';
import PeoplePage from './user/PeoplePage';
import ProfilePage from './user/ProfilePage';
import UserPage from './user/UserPage';

type BottomNavItemProps = {
  /** Content of the information modal. */
  text?: string;
  /** Text of the button link in the information modal. */
  linkText?: string;
};

const BottomNavItem: React.FC<BottomNavItemProps> = ({ text, linkText }) => {
  return (
    <InformationModal
      text={text}
      linkText={linkText}
      linkStyle={{
        fontSize: '10px',
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
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
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
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: 'calc(100vh - 64px)',
    marginTop: '64px',
    padding: `0 ${theme.spacing(2)}px`,
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

const Dashboard: React.FC = () => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(
    localStorage.drawerOpen ? localStorage.drawerOpen === '1' : true
  );
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const isSampleSafetyReviewer = useCheckAccess([
    UserRole.SAMPLE_SAFETY_REVIEWER,
  ]);

  const featureContext = useContext(FeatureContext);
  const isShipmentEnabled = !!featureContext.features.get(FeatureId.SHIPPING)
    ?.isEnabled;
  const isSchedulerEnabled = featureContext.features.get(FeatureId.SCHEDULER)
    ?.isEnabled;

  const { currentRole } = useContext(UserContext);
  const { calls } = useCallsData({ isActive: true });

  const handleDrawerOpen = () => {
    localStorage.setItem('drawerOpen', '1');
    setOpen(true);
  };
  const handleDrawerClose = () => {
    localStorage.setItem('drawerOpen', '0');
    setOpen(false);
  };

  const [, privacyPageContent] = useGetPageContent(PageName.PRIVACYPAGE);
  const [, faqPageContent] = useGetPageContent(PageName.HELPPAGE);

  // TODO: Check who can see what and modify the access control here.
  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppToolbar open={open} handleDrawerOpen={handleDrawerOpen} />
      <Drawer
        variant="permanent"
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
      >
        <div className={classes.toolbarIcon}>
          <IconButton onClick={handleDrawerClose}>
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
        <Switch>
          <Route path="/ProposalEdit/:proposalID" component={ProposalEdit} />
          <Route
            path="/ProposalSelectType"
            component={() => <ProposalChooseCall callsData={calls} />}
          />
          <Route
            path="/ProposalCreate/:callId/:templateId"
            component={ProposalCreate}
          />
          {isShipmentEnabled && (
            <Route path="/ShipmentCreate" component={ShipmentCreate} />
          )}
          {isShipmentEnabled && (
            <Route path="/MyShipments" component={MyShipments} />
          )}
          <Route path="/ProfilePage/:id" component={ProfilePage} />
          {isUserOfficer && (
            <Route path="/PeoplePage/:id" component={UserPage} />
          )}
          {isUserOfficer && <Route path="/PeoplePage" component={PeoplePage} />}
          <Route path="/ProposalPage" component={ProposalPage} />
          <Route path="/PageEditor" component={PageEditor} />
          {isUserOfficer && <Route path="/CallPage" component={CallPage} />}
          <Route path="/HelpPage" component={HelpPage} />
          <Route path="/SEPPage/:id" component={SEPPage} />
          <Route path="/SEPPage" component={SEPsPage} />
          <Route path="/InstrumentPage" component={InstrumentsPage} />
          <Route path="/InstitutionPage" component={InstitutionPage} />
          <Route
            path="/QuestionaryEditor/:templateId"
            component={TemplateEditor}
          />
          <Route path="/ProposalTemplates" component={ProposalTemplates} />
          <Route
            path="/SampleDeclarationTemplates"
            component={SampleTemplatesPage}
          />
          <Route
            path="/ShipmentDeclarationTemplates"
            component={ShipmentTemplatesPage}
          />
          <Route
            path="/ProposalTableReviewer"
            component={ProposalTableReviewer}
          />
          {isUserOfficer && <Route path="/Units" component={UnitTablePage} />}
          {isUserOfficer && (
            <Route path="/ProposalStatuses" component={ProposalStatusesPage} />
          )}
          {isUserOfficer && (
            <Route
              path="/ProposalWorkflows"
              component={ProposalWorkflowsPage}
            />
          )}
          {isUserOfficer && (
            <Route
              path="/ProposalWorkflowEditor/:workflowId"
              component={ProposalWorkflowEditor}
            />
          )}
          {(isSampleSafetyReviewer || isUserOfficer) && (
            <Route path="/SampleSafety" component={SampleSafetyPage} />
          )}
          {isUserOfficer && (
            <Route path="/Shipments" component={ShipmentsPage} />
          )}
          {isUserOfficer && (
            <Route path="/ApiAccessTokens" component={ApiAccessTokensPage} />
          )}
          {isSchedulerEnabled && (
            <Route path="/MyBeamTimes" component={UserMyBeamTimesTable} />
          )}
          {isSchedulerEnabled && (
            <Route
              path="/UpcomingBeamTimes"
              component={InstrSciUpcomingBeamTimesTable}
            />
          )}
          {isUserOfficer && (
            <Route path="/Questions" component={QuestionsPage} />
          )}
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
                      UserRole.SEP_REVIEWER,
                      UserRole.SEP_CHAIR,
                      UserRole.SEP_SECRETARY,
                      UserRole.INSTRUMENT_SCIENTIST,
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
