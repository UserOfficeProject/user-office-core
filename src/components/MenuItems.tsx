import Collapse from '@material-ui/core/Collapse';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Tooltip from '@material-ui/core/Tooltip';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import CalendarToday from '@material-ui/icons/CalendarToday';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import FolderOpen from '@material-ui/icons/FolderOpen';
import GroupWorkIcon from '@material-ui/icons/GroupWork';
import Help from '@material-ui/icons/Help';
import InboxIcon from '@material-ui/icons/Inbox';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import NoteAdd from '@material-ui/icons/NoteAdd';
import People from '@material-ui/icons/People';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import Settings from '@material-ui/icons/Settings';
import SettingsApplications from '@material-ui/icons/SettingsApplications';
import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { NavLink } from 'react-router-dom';

import { UserRole, Call } from 'generated/sdk';

import BoxIcon from './common/icons/BoxIcon';
import ProposalSettingsIcon from './common/icons/ProposalSettingsIcon';
import ProposalWorkflowIcon from './common/icons/ProposalWorkflowIcon';
import ScienceIcon from './common/icons/ScienceIcon';

type MenuItemsProps = {
  currentRole: UserRole | null;
  callsData: Call[];
};

const MenuItems: React.FC<MenuItemsProps> = ({ currentRole, callsData }) => {
  const proposalDisabled = callsData.length === 0;
  const multipleCalls = callsData.length > 1;

  const user = (
    <div data-cy="user-menu-items">
      <ListItem component={NavLink} to="/" exact button>
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItem>
      <ListItem
        component={NavLink}
        to={
          multipleCalls
            ? '/ProposalSelectType'
            : `/ProposalCreate/${callsData[0]?.templateId}`
        }
        button
        disabled={proposalDisabled}
      >
        <ListItemIcon>
          <NoteAdd />
        </ListItemIcon>
        <ListItemText primary="New Proposal" />
      </ListItem>
      <ListItem component={NavLink} to="/HelpPage" button>
        <ListItemIcon>
          <Help />
        </ListItemIcon>
        <ListItemText primary="Help" />
      </ListItem>
    </div>
  );

  const userOfficer = (
    <div data-cy="officer-menu-items">
      <ListItem component={NavLink} to="/ProposalPage" button>
        <ListItemIcon>
          <FolderOpen />
        </ListItemIcon>
        <ListItemText primary="Proposals" />
      </ListItem>
      <ListItem component={NavLink} to="/CallPage" button>
        <ListItemIcon>
          <CalendarToday />
        </ListItemIcon>
        <ListItemText primary="Calls" />
      </ListItem>
      <ListItem component={NavLink} to="/PeoplePage" button>
        <ListItemIcon>
          <People />
        </ListItemIcon>
        <ListItemText primary="People" />
      </ListItem>
      <ListItem component={NavLink} to="/InstrumentPage" button>
        <ListItemIcon>
          <ScienceIcon />
        </ListItemIcon>
        <ListItemText primary="Instruments" />
      </ListItem>
      <Tooltip title="Scientific evaluation panels">
        <ListItem component={NavLink} to="/SEPPage" button>
          <ListItemIcon>
            <GroupWorkIcon />
          </ListItemIcon>
          <ListItemText primary="SEPs" />
        </ListItem>
      </Tooltip>
      <ListItem component={NavLink} to="/PageEditor" button>
        <ListItemIcon>
          <SettingsApplications />
        </ListItemIcon>
        <ListItemText primary="Pages" />
      </ListItem>
      <ListItem component={NavLink} to="/InstitutionPage" button>
        <ListItemIcon>
          <AccountBalanceIcon />
        </ListItemIcon>
        <ListItemText primary="Institutions" />
      </ListItem>
      <TemplateMenuListItem />
      <SamplesMenuListItem />
      <SettingsMenuListItem />
    </div>
  );

  const reviewer = (
    <div data-cy="reviewer-menu-items">
      <ListItem component={NavLink} to="/" exact button>
        <ListItemIcon>
          <FolderOpen />
        </ListItemIcon>
        <ListItemText primary="Review Proposals" />
      </ListItem>
    </div>
  );

  const SEPRoles = (
    <div data-cy="SEPRoles-menu-items">
      <ListItem component={NavLink} to="/" exact button>
        <ListItemIcon>
          <FolderOpen />
        </ListItemIcon>
        <ListItemText primary="Review Proposals" />
      </ListItem>
      <ListItem component={NavLink} to="/SEPPage" button>
        <ListItemIcon>
          <GroupWorkIcon />
        </ListItemIcon>
        <Tooltip title="Scientific evaluation panels">
          <ListItemText primary="SEPs" />
        </Tooltip>
      </ListItem>
    </div>
  );

  const instrumentScientist = (
    <div data-cy="instrument-scientist-menu-items">
      <ListItem component={NavLink} to="/" exact button>
        <ListItemIcon>
          <FolderOpen />
        </ListItemIcon>
        <ListItemText primary="Proposals" />
      </ListItem>
      <ListItem component={NavLink} to="/InstrumentPage" button>
        <ListItemIcon>
          <GroupWorkIcon />
        </ListItemIcon>
        <ListItemText primary="Instruments" />
      </ListItem>
    </div>
  );

  const sampleSafetyReviewer = (
    <div data-cy="reviewer-menu-items">
      <SamplesMenuListItem />
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
    case UserRole.SAMPLE_SAFETY_REVIEWER:
      return sampleSafetyReviewer;
    default:
      return null;
  }
};

const SettingsMenuListItem = () => {
  const history = useHistory();
  const shouldExpand =
    history.location.pathname === '/ProposalStatuses' ||
    history.location.pathname === '/ProposalWorkflows';
  const [isExpanded, setIsExpanded] = useState(shouldExpand);
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <ListItem button onClick={toggleExpand}>
        <ListItemIcon>
          {isExpanded ? (
            <>
              <Settings />
              <ExpandLess fontSize="small" />
            </>
          ) : (
            <>
              <Settings />
              <ExpandMore fontSize="small" />
            </>
          )}
        </ListItemIcon>
        <ListItemText primary="Settings" />
      </ListItem>
      <Collapse
        in={isExpanded}
        timeout="auto"
        unmountOnExit
        style={{ paddingLeft: 10 }}
      >
        <ListItem component={NavLink} to="/ProposalStatuses" button>
          <ListItemIcon>
            <ProposalSettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Proposal statuses" />
        </ListItem>
        <ListItem component={NavLink} to="/ProposalWorkflows" button>
          <ListItemIcon>
            <ProposalWorkflowIcon />
          </ListItemIcon>
          <ListItemText primary="Proposal workflows" />
        </ListItem>
      </Collapse>
    </>
  );
};

const TemplateMenuListItem = () => {
  const history = useHistory();
  const shouldExpand =
    history.location.pathname === '/ProposalTemplates' ||
    history.location.pathname === '/SampleDeclarationTemplates';
  const [isExpanded, setIsExpanded] = useState(shouldExpand);
  function toggleExpand() {
    setIsExpanded(!isExpanded);
  }

  return (
    <>
      <ListItem button onClick={toggleExpand}>
        <ListItemIcon>
          {isExpanded ? (
            <>
              <LibraryBooksIcon />
              <ExpandLess fontSize="small" />
            </>
          ) : (
            <>
              <LibraryBooksIcon />
              <ExpandMore fontSize="small" />
            </>
          )}
        </ListItemIcon>
        <ListItemText primary="Templates" />
      </ListItem>
      <Collapse
        in={isExpanded}
        timeout="auto"
        unmountOnExit
        style={{ paddingLeft: 10 }}
      >
        <ListItem component={NavLink} to="/ProposalTemplates" button>
          <ListItemIcon>
            <QuestionAnswerIcon />
          </ListItemIcon>
          <ListItemText primary="Proposal" title="Proposal templates" />
        </ListItem>
        <ListItem component={NavLink} to="/SampleDeclarationTemplates" button>
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

const SamplesMenuListItem = () => {
  return (
    <ListItem component={NavLink} to="/SampleSafety" button>
      <ListItemIcon>
        <BoxIcon />
      </ListItemIcon>
      <ListItemText primary="Sample safety" />
    </ListItem>
  );
};

export default MenuItems;
