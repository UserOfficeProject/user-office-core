import React from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import DashboardIcon from "@material-ui/icons/Dashboard";
import NoteAdd from "@material-ui/icons/NoteAdd";
import People from "@material-ui/icons/People";
import FolderOpen from "@material-ui/icons/FolderOpen";
import ExitToApp from "@material-ui/icons/ExitToApp";
import CalendarToday from "@material-ui/icons/CalendarToday";
import { Link } from "react-router-dom";
import { useCallsData } from "./useCallsData";

export default function MenuItems({ role }) {
  const { loading, callsData } = useCallsData();

  let proposalDisabled = false;

  // Checks if there is a call open, during the current time
  if (!loading) {
    const currentTime = new Date().getTime();
    proposalDisabled = callsData
      ? callsData.filter(
          call =>
            new Date(call.startDate).getTime() < currentTime &&
            currentTime < new Date(call.endDate).getTime()
        ).length === 0
      : false;
  }
  const user = (
    <div>
      <ListItem component={Link} to="/" button>
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItem>
      <ListItem
        component={Link}
        to="/ProposalSubmission"
        button
        disabled={proposalDisabled}
      >
        <ListItemIcon>
          <NoteAdd />
        </ListItemIcon>
        <ListItemText primary="New Proposal" />
      </ListItem>
      <ListItem component={Link} to="/LogOut" button>
        <ListItemIcon>
          <ExitToApp />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItem>
    </div>
  );

  const user_officer = (
    <div>
      <ListItem component={Link} to="/ProposalPage" button>
        <ListItemIcon>
          <FolderOpen />
        </ListItemIcon>
        <ListItemText primary="View Proposals" />
      </ListItem>
      <ListItem component={Link} to="/CallPage" button>
        <ListItemIcon>
          <CalendarToday />
        </ListItemIcon>
        <ListItemText primary="View Calls" />
      </ListItem>
      <ListItem component={Link} to="/PeoplePage" button>
        <ListItemIcon>
          <People />
        </ListItemIcon>
        <ListItemText primary="View People" />
      </ListItem>
      <ListItem component={Link} to="/LogOut" button>
        <ListItemIcon>
          <ExitToApp />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItem>
    </div>
  );
  const reviewer = (
    <div>
      <ListItem component={Link} to="/ProposalTableReviewer" button>
        <ListItemIcon>
          <FolderOpen />
        </ListItemIcon>
        <ListItemText primary="Review Proposals" />
      </ListItem>
      <ListItem component={Link} to="/LogOut" button>
        <ListItemIcon>
          <ExitToApp />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItem>
    </div>
  );

  switch (role) {
    case "user":
      return user;
    case "user_officer":
      return user_officer;
    case "reviewer":
      return reviewer;
    default:
      return null;
  }
}
