import { BottomNavigation } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Badge from '@material-ui/core/Badge';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import { makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import AccountCircle from '@material-ui/icons/AccountCircle';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import MenuIcon from '@material-ui/icons/Menu';
import clsx from 'clsx';
import React, { useContext } from 'react';
import { Link, Route, Switch } from 'react-router-dom';

import { UserContext } from '../context/UserContextProvider';
import { UserRole } from '../generated/sdk';
import { useGetPageContent } from '../hooks/useGetPageContent';
import CallPage from './call/CallPage';
import MenuItems from './MenuItems';
import HelpPage from './pages/HelpPage';
import InformationModal from './pages/InformationModal';
import OverviewPage from './pages/OverviewPage';
import PageEditor from './pages/PageEditor';
import ProposalCreate from './proposal/ProposaCreate';
import ProposalChooseCall from './proposal/ProposalChooseCall';
import ProposalEdit from './proposal/ProposalEdit';
import ProposalPage from './proposal/ProposalPage';
import ProposalGrade from './review/ProposalGrade';
import ProposalReviewUserOfficer from './review/ProposalReviewUserOfficer';
import ProposalTableReviewer from './review/ProposalTableReviewer';
import ProposalTemplates from './template/ProposalTemplates';
import QuestionaryEditor from './template/QuestionaryEditor';
import PeoplePage from './user/PeoplePage';
import ProfilePage from './user/ProfilePage';
import UserPage from './user/UserPage';

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

export default function Dashboard({ match }) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);
  const { user, currentRole } = useContext(UserContext);
  const { id } = user;
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };
  const [, privacyPageContent] = useGetPageContent('PRIVACYPAGE');
  const [, faqPageContent] = useGetPageContent('HELPPAGE');

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, open && classes.appBarShift)}
      >
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="Open drawer"
            onClick={handleDrawerOpen}
            className={clsx(
              classes.menuButton,
              open && classes.menuButtonHidden
            )}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            User Office
          </Typography>
          <IconButton
            color="inherit"
            component={Link}
            to={`/ProfilePage/${id}`}
            data-cy="profile-page-btn"
          >
            <Badge badgeContent={0} color="secondary">
              <AccountCircle />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>
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
          <MenuItems role={currentRole} />
        </List>
        <Divider />
      </Drawer>
      <main className={classes.content}>
        <Switch>
          <Route path="/ProposalEdit/:proposalID" component={ProposalEdit} />
          <Route path="/ProposalSelectType" component={ProposalChooseCall} />
          <Route path="/ProposalCreate/:callId" component={ProposalCreate} />
          <Route path="/ProfilePage/:id" component={ProfilePage} />
          <Route path="/PeoplePage/:id" component={UserPage} />
          <Route path="/PeoplePage" component={PeoplePage} />
          <Route path="/ProposalPage" component={ProposalPage} />
          <Route path="/PageEditor" component={PageEditor} />
          <Route path="/CallPage" component={CallPage} />
          <Route path="/HelpPage" component={HelpPage} />
          <Route path="/QuestionaryEditor" component={QuestionaryEditor} />
          <Route path="/ProposalGrade/:id" component={ProposalGrade} />
          <Route path="/Questionaries" component={ProposalTemplates} />
          <Route
            path="/ProposalTableReviewer"
            component={ProposalTableReviewer}
          />
          <Route
            path="/ProposalReviewUserOfficer/:id"
            component={ProposalReviewUserOfficer}
          />
          {currentRole === 'user_officer' && <Route component={ProposalPage} />}
          {currentRole === 'user' && (
            <Route
              render={props => (
                <OverviewPage {...props} userRole={UserRole.USER} />
              )}
            />
          )}
          {currentRole === 'reviewer' && (
            <Route
              render={props => (
                <OverviewPage {...props} userRole={UserRole.REVIEWER} />
              )}
            />
          )}
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
}

const BottomNavItem = props => {
  return (
    <InformationModal
      text={props.text}
      linkText={props.linkText}
      linkStyle={{
        fontSize: '10px',
        minWidth: 'auto',
        padding: '10px',
      }}
    />
  );
};
