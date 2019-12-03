import React, { useContext } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import Badge from "@material-ui/core/Badge";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import AccountCircle from "@material-ui/icons/AccountCircle";
import MenuItems from "./MenuItems";
import { Route, Switch } from "react-router-dom";
import ProposalSubmission from "./ProposalSubmission";
import ProposalReviewUserOfficer from "./ProposalReviewUserOfficer";
import ProposalTableReviewer from "./ProposalTableReviewer";
import ProposalEdit from "./ProposalEdit";
import PeoplePage from "./PeoplePage";
import ProposalGrade from "./ProposalGrade";
import UserPage from "./UserPage";
import PageEditor from "./PageEditor";
import ProposalPage from "./ProposalPage";
import CallPage from "./CallPage";
import ProfilePage from "./ProfilePage";
import OverviewPage from "./OverviewPage";
import HelpPage from "./HelpPage";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContextProvider";
import QuestionaryEditor from "./QuestionaryEditor"
import { BottomNavigation } from '@material-ui/core';
import InformationModal from "./InformationModal";
import { useGetPageContent } from "../hooks/useGetPageContent";

const drawerWidth = 240;


const useStyles = makeStyles(theme => ({
  root: {
    display: "flex"
  },
  toolbar: {
    paddingRight: 24 // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginRight: 36
  },
  menuButtonHidden: {
    display: "none"
  },
  title: {
    flexGrow: 1
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9)
    }
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
    display:"flex",
    flexDirection:"column",
  },
  bottomNavigation: {
    display:"flex",
    marginTop:"auto",
    marginBottom: theme.spacing(2),
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center"
  }
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
  const [, privacyPageContent] = useGetPageContent("PRIVACYPAGE");
  const [, faqPageContent] = useGetPageContent("HELPPAGE");

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="absolute"
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
          paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose)
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
        <div className={classes.appBarSpacer} />
        <Switch>
          <Route
            path="/ProposalSubmission/:proposalID"
            component={ProposalEdit}
          />
          <Route path="/ProposalSubmission" component={ProposalSubmission} />
          <Route path="/ProfilePage/:id" component={ProfilePage} />
          <Route path="/PeoplePage/:id" component={UserPage} />
          <Route path="/PeoplePage" component={PeoplePage} />
          <Route path="/ProposalPage" component={ProposalPage} />
          <Route path="/PageEditor" component={PageEditor} />
          <Route path="/CallPage" component={CallPage} />
          <Route path="/HelpPage" component={HelpPage} />
          <Route path="/QuestionaryEditor" component={QuestionaryEditor} />
          <Route path="/ProposalGrade/:id" component={ProposalGrade} />
          <Route
            path="/ProposalTableReviewer"
            component={ProposalTableReviewer}
          />
          <Route
            path="/ProposalReviewUserOfficer/:id"
            component={ProposalReviewUserOfficer}
          />
          {currentRole === "user_officer" && <Route component={ProposalPage} />}
          {currentRole === "user" && <Route component={OverviewPage} />}
          {currentRole === "reviewer" && (
            <Route component={ProposalTableReviewer} />
          )}
        </Switch>
        <BottomNavigation class={classes.bottomNavigation}>
        <BottomNavItem
          text={privacyPageContent}
          linkText={"Privacy Statement"}
        />
        <BottomNavItem
          text={faqPageContent}
          linkText={"FAQ"}
        />
        <BottomNavItem />
        </BottomNavigation>
      </main>
    </div>
  );
}


const BottomNavItem = (props) => {
  return (
      <InformationModal
      text={props.text}
      linkText={props.linkText}
      linkStyle={{
        fontSize:"10px",
        minWidth:"auto",
        padding:"10px"
      }}/>
  );
}
