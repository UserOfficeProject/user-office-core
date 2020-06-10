import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import CalendarToday from '@material-ui/icons/CalendarToday';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ExitToApp from '@material-ui/icons/ExitToApp';
import FolderOpen from '@material-ui/icons/FolderOpen';
import GroupWorkIcon from '@material-ui/icons/GroupWork';
import Help from '@material-ui/icons/Help';
import NoteAdd from '@material-ui/icons/NoteAdd';
import People from '@material-ui/icons/People';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import SettingsApplications from '@material-ui/icons/SettingsApplications';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import { UserContext } from '../context/UserContextProvider';
import { UserRole } from '../generated/sdk';
import { useCallsData } from '../hooks/useCallsData';

const MenuItems: React.FC = () => {
  const { loading, callsData } = useCallsData();
  const { currentRole } = useContext(UserContext);

  let proposalDisabled = false;

  // Checks if there is a call open, during the current time
  if (!loading) {
    const currentTime = new Date().getTime();
    proposalDisabled = callsData
      ? callsData.filter(
          call =>
            new Date(call.startCall).getTime() < currentTime &&
            currentTime < new Date(call.endCall).getTime()
        ).length === 0
      : false;
  }
  const user = (
    <div data-cy="user-menu-items">
      <ListItem component={Link} to="/" button>
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItem>
      <ListItem
        component={Link}
        to="/ProposalSelectType"
        button
        disabled={proposalDisabled}
      >
        <ListItemIcon>
          <NoteAdd />
        </ListItemIcon>
        <ListItemText primary="New Proposal" />
      </ListItem>
      <ListItem component={Link} to="/HelpPage" button>
        <ListItemIcon>
          <Help />
        </ListItemIcon>
        <ListItemText primary="Help" />
      </ListItem>
      <ListItem component={Link} to="/LogOut" button>
        <ListItemIcon>
          <ExitToApp />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItem>
    </div>
  );

  const userOfficer = (
    <div data-cy="officer-menu-items">
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
      <ListItem component={Link} to="/SEPPage" button>
        <ListItemIcon>
          <GroupWorkIcon />
        </ListItemIcon>
        <ListItemText primary="SEPs" />
      </ListItem>
      <ListItem component={Link} to="/PageEditor" button>
        <ListItemIcon>
          <SettingsApplications />
        </ListItemIcon>
        <ListItemText primary="Edit Pages" />
      </ListItem>
      <ListItem component={Link} to="/Questionaries" button>
        <ListItemIcon>
          <QuestionAnswerIcon />
        </ListItemIcon>
        <ListItemText primary="Questionaries" />
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
    <div data-cy="reviewer-menu-items">
      <ListItem component={Link} to="/" button>
        <ListItemIcon>
          <FolderOpen />
        </ListItemIcon>
        <ListItemText primary="Review Proposals" />
      </ListItem>
      <ListItem component={Link} to="/LogOut" button data-cy="logout">
        <ListItemIcon>
          <ExitToApp />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItem>
    </div>
  );

  const SEPRoles = (
    <div data-cy="SEPRoles-menu-items">
      <ListItem component={Link} to="/" button>
        <ListItemIcon>
          <FolderOpen />
        </ListItemIcon>
        <ListItemText primary="Review Proposals" />
      </ListItem>
      <ListItem component={Link} to="/SEPPage" button>
        <ListItemIcon>
          <GroupWorkIcon />
        </ListItemIcon>
        <ListItemText primary="SEPs" />
      </ListItem>
      <ListItem component={Link} to="/LogOut" button data-cy="logout">
        <ListItemIcon>
          <ExitToApp />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItem>
    </div>
  );

  switch (currentRole) {
    case UserRole.USER:
      return user;
    case UserRole.USER_OFFICER:
      return userOfficer;
    case UserRole.REVIEWER:
      return reviewer;
    case UserRole.SEP_CHAIR:
    case UserRole.SEP_SECRETARY:
    case UserRole.SEP_REVIEWER:
      return SEPRoles;
    default:
      return null;
  }
};

export default MenuItems;
