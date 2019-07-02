import React from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import DashboardIcon from "@material-ui/icons/Dashboard";
import NoteAdd from "@material-ui/icons/NoteAdd";
import People from "@material-ui/icons/People";
import FolderOpen from "@material-ui/icons/FolderOpen";
import ExitToApp from "@material-ui/icons/ExitToApp";
import { Link } from "react-router-dom";

export const menuItems = {
  user: (
    <div>
      <ListItem component={Link} to="/" button>
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItem>
      <ListItem component={Link} to="/ProposalSubmission" button>
        <ListItemIcon>
          <NoteAdd />
        </ListItemIcon>
        <ListItemText primary="New Proposal" />
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
  ),
  user_officer: (
    <div>
      <ListItem component={Link} to="/" button>
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItem>
      <ListItem component={Link} to="/ProposalPage" button>
        <ListItemIcon>
          <FolderOpen />
        </ListItemIcon>
        <ListItemText primary="View Proposals" />
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
  )
};
