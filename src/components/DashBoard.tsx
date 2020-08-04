import {
  BottomNavigation,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import { makeStyles } from '@material-ui/core/styles';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ExitToApp from '@material-ui/icons/ExitToApp';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Link } from 'react-router-dom';

import { UserContext } from 'context/UserContextProvider';
import { PageName, UserRole } from 'generated/sdk';
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
import ProposalReviewReviewer from './review/ProposalReviewReviewer';
import ProposalReviewUserOfficer from './review/ProposalReviewUserOfficer';
import ProposalTableReviewer from './review/ProposalTableReviewer';
import SampleSafetyPage from './sample/SampleSafetyPage';
import SEPPage from './SEP/SEPPage';
import SEPsPage from './SEP/SEPsPage';
import ProposalTemplates from './template/ProposalTemplates';
import SampleTemplatesPage from './template/SampleTemplates';
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

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
  },
  drawerPaperClose: {
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
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    padding: `0 ${theme.spacing(2)}px`,
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
  const [open, setOpen] = React.useState(true);
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const isSampleSafetyReviewer = useCheckAccess([
    UserRole.SAMPLE_SAFETY_REVIEWER,
  ]);

  const { currentRole } = useContext(UserContext);
  const { callsData } = useCallsData();

  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };
  const [, privacyPageContent] = useGetPageContent(PageName.PRIVACYPAGE);
  const [, faqPageContent] = useGetPageContent(PageName.HELPPAGE);

  const logoutMenuListItem = (
    <ListItem component={Link} to="/LogOut" button data-cy="logout">
      <ListItemIcon>
        <ExitToApp />
      </ListItemIcon>
      <ListItemText primary="Logout" />
    </ListItem>
  );

  // TODO: Check who can see what and modify the access controll here.
  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppToolbar open={open} handleDrawerOpen={handleDrawerOpen} />
      <Drawer
        variant="permanent"
        classes={{
          paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
        }}
        open={open}
      >
        <div className={classes.toolbarIcon}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <List>
          <MenuItems callsData={callsData} currentRole={currentRole} />
          {logoutMenuListItem}
        </List>
        <Divider />
      </Drawer>
      <main className={classes.content}>
        <Switch>
          <Route path="/ProposalEdit/:proposalID" component={ProposalEdit} />
          <Route
            path="/ProposalSelectType"
            component={() => <ProposalChooseCall callsData={callsData} />}
          />
          <Route path="/ProposalCreate/:callId" component={ProposalCreate} />
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
          <Route path="/ProposalGrade/:id" component={ProposalReviewReviewer} />
          <Route path="/ProposalTemplates" component={ProposalTemplates} />
          <Route
            path="/SampleDeclarationTemplates"
            component={SampleTemplatesPage}
          />
          <Route
            path="/ProposalTableReviewer"
            component={ProposalTableReviewer}
          />
          <Route
            path="/ProposalReviewUserOfficer/:id"
            component={ProposalReviewUserOfficer}
          />
          {isSampleSafetyReviewer && (
            <Route path="/SampleSafety" component={SampleSafetyPage} />
          )}
          <Can
            allowedRoles={[UserRole.USER_OFFICER]}
            yes={() => <Route component={ProposalPage} />}
            no={() => (
              <Can
                allowedRoles={[UserRole.USER]}
                yes={() => (
                  <Route
                    render={props => (
                      <OverviewPage {...props} userRole={UserRole.USER} />
                    )}
                  />
                )}
                no={() => (
                  <Can
                    allowedRoles={[
                      UserRole.REVIEWER,
                      UserRole.SEP_REVIEWER,
                      UserRole.SEP_CHAIR,
                      UserRole.SEP_SECRETARY,
                      UserRole.INSTRUMENT_SCIENTIST,
                    ]}
                    yes={() => (
                      <Route
                        render={props => (
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
