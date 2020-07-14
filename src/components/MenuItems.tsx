import { Collapse } from '@material-ui/core';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import CalendarToday from '@material-ui/icons/CalendarToday';
import DashboardIcon from '@material-ui/icons/Dashboard';
import FolderOpen from '@material-ui/icons/FolderOpen';
import GroupWorkIcon from '@material-ui/icons/GroupWork';
import Help from '@material-ui/icons/Help';
import InboxIcon from '@material-ui/icons/Inbox';
import NoteAdd from '@material-ui/icons/NoteAdd';
import People from '@material-ui/icons/People';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import SettingsApplications from '@material-ui/icons/SettingsApplications';
import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import { UserContext } from 'context/UserContextProvider';
import { UserRole } from 'generated/sdk';
import { useCallsData } from 'hooks/useCallsData';

import ScienceIcon from './common/ScienceIcon';

const MenuItems: React.FC = () => {
  const { callsData } = useCallsData(true);
  const { currentRole } = useContext(UserContext);

  const proposalDisabled = callsData.length === 0;
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
      <ListItem component={Link} to="/InstrumentPage" button>
        <ListItemIcon>
          <ScienceIcon />
        </ListItemIcon>
        <ListItemText primary="Instruments" />
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
      <ListItem component={Link} to="/InstitutionPage" button>
        <ListItemIcon>
          <AccountBalanceIcon />
        </ListItemIcon>
        <ListItemText primary="Edit Institutions" />
      </ListItem>
      <TemplateMenuListItem />
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
    </div>
  );

  const instrumentScientist = (
    <div data-cy="instrument-scientist-menu-items">
      <ListItem component={Link} to="/InstrumentPage" button>
        <ListItemIcon>
          <GroupWorkIcon />
        </ListItemIcon>
        <ListItemText primary="Instruments" />
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
    case UserRole.INSTRUMENT_SCIENTIST:
      return instrumentScientist;
    case UserRole.SEP_CHAIR:
    case UserRole.SEP_SECRETARY:
    case UserRole.SEP_REVIEWER:
      return SEPRoles;
    default:
      return null;
  }
};

const TemplateMenuListItem = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  function toggleExpand() {
    setIsExpanded(!isExpanded);
  }

  return (
    <>
      <ListItem button onClick={toggleExpand}>
        <ListItemIcon>
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </ListItemIcon>
        <ListItemText primary="Templates" />
      </ListItem>
      <Collapse
        in={isExpanded}
        timeout="auto"
        unmountOnExit
        style={{ paddingLeft: 10 }}
      >
        <ListItem component={Link} to="/ProposalTemplates" button>
          <ListItemIcon>
            <QuestionAnswerIcon />
          </ListItemIcon>
          <ListItemText primary="Proposal" title="Proposal templates" />
        </ListItem>
        <ListItem component={Link} to="/SampleDeclarationTemplates" button>
          <ListItemIcon>
            <InboxIcon />
          </ListItemIcon>
          <ListItemText
            primary="Sample declaration"
            title="Sample declaration templates"
          />
        </ListItem>
      </Collapse>
    </>
  );
};

export default MenuItems;
