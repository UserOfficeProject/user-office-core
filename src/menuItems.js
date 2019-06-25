import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DashboardIcon from '@material-ui/icons/Dashboard';
import NoteAdd from '@material-ui/icons/NoteAdd';
import Edit from '@material-ui/icons/Edit';
import People from '@material-ui/icons/People';
import FolderOpen from '@material-ui/icons/FolderOpen';
import ExitToApp from '@material-ui/icons/ExitToApp';
import {Link} from 'react-router-dom'

export const menuItems = (
  <div>
    <ListItem component={Link} to="/DashBoard/" button>
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary="Dashboard" />
    </ListItem>
    <ListItem component={Link} to="/DashBoard/ProposalSubmission" button>
      <ListItemIcon>
        <NoteAdd />
      </ListItemIcon>
      <ListItemText primary="New Proposal" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <Edit />
      </ListItemIcon>
      <ListItemText primary="Edit Proposals" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <FolderOpen />
      </ListItemIcon>
      <ListItemText primary="View Proposals" />
    </ListItem>
    <ListItem component={Link} to="/DashBoard/PeoplePage" button>
      <ListItemIcon>
        <People />
      </ListItemIcon>
      <ListItemText primary="View People" />
    </ListItem>
    <ListItem component={Link} to="/SignIn" button>
      <ListItemIcon>
        <ExitToApp />
      </ListItemIcon>
      <ListItemText primary="Logout" />
    </ListItem>
  </div>
);