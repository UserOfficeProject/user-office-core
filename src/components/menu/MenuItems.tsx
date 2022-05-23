import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CalendarToday from '@mui/icons-material/CalendarToday';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventIcon from '@mui/icons-material/Event';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FolderOpen from '@mui/icons-material/FolderOpen';
import FunctionsIcon from '@mui/icons-material/Functions';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import Help from '@mui/icons-material/Help';
import NoteAdd from '@mui/icons-material/NoteAdd';
import People from '@mui/icons-material/People';
import Settings from '@mui/icons-material/Settings';
import SettingsApplications from '@mui/icons-material/SettingsApplications';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import VpnKey from '@mui/icons-material/VpnKey';
import Collapse from '@mui/material/Collapse';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router';
import { NavLink } from 'react-router-dom';
import { encodeDate } from 'use-query-params';

import Tooltip from 'components/common/MenuTooltip';
import { getRelativeDatesFromToday } from 'components/experiment/DateFilter';
import { TimeSpan } from 'components/experiment/PresetDateSelector';
import { FeatureContext } from 'context/FeatureContextProvider';
import { Call, FeatureId, UserRole } from 'generated/sdk';

import BoxIcon from '../common/icons/BoxIcon';
import CommentQuestionIcon from '../common/icons/CommentQuestionIcon';
import ProposalSettingsIcon from '../common/icons/ProposalSettingsIcon';
import ProposalWorkflowIcon from '../common/icons/ProposalWorkflowIcon';
import ScienceIcon from '../common/icons/ScienceIcon';
import { TemplateMenuListItem } from './TemplateMenuListItem';

type MenuItemsProps = {
  currentRole: UserRole | null;
  callsData: Call[];
};

const SettingsMenuListItem = () => {
  const history = useHistory();
  const shouldExpand =
    history.location.pathname === '/ProposalStatuses' ||
    history.location.pathname === '/ProposalWorkflows' ||
    history.location.pathname.includes('ProposalWorkflowEditor');
  const [isExpanded, setIsExpanded] = useState(shouldExpand);
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <Tooltip title="Settings">
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
      </Tooltip>

      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <Tooltip title="Units">
          <ListItem component={NavLink} to="/Units" button>
            <ListItemIcon>
              <FunctionsIcon />
            </ListItemIcon>
            <ListItemText primary="Units" />
          </ListItem>
        </Tooltip>

        <Tooltip title="Proposal statuses">
          <ListItem component={NavLink} to="/ProposalStatuses" button>
            <ListItemIcon>
              <ProposalSettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Proposal statuses" />
          </ListItem>
        </Tooltip>

        <Tooltip title="Proposal workflows">
          <ListItem
            component={NavLink}
            isActive={() =>
              history.location.pathname.includes('/ProposalWorkflows') ||
              history.location.pathname.includes('ProposalWorkflowEditor')
            }
            to="/ProposalWorkflows"
            button
          >
            <ListItemIcon>
              <ProposalWorkflowIcon />
            </ListItemIcon>
            <ListItemText primary="Proposal workflows" />
          </ListItem>
        </Tooltip>

        <Tooltip title="API access tokens">
          <ListItem component={NavLink} to="/ApiAccessTokens" button>
            <ListItemIcon>
              <VpnKey />
            </ListItemIcon>
            <ListItemText primary="API access tokens" />
          </ListItem>
        </Tooltip>
        <Tooltip title="Features">
          <ListItem component={NavLink} to="/Features" button>
            <ListItemIcon>
              <ViewModuleIcon />
            </ListItemIcon>
            <ListItemText primary="Features" />
          </ListItem>
        </Tooltip>
      </Collapse>
    </>
  );
};

const SamplesMenuListItem = () => {
  return (
    <Tooltip title="Sample safety">
      <ListItem component={NavLink} to="/SampleSafety" button>
        <ListItemIcon>
          <BoxIcon />
        </ListItemIcon>
        <ListItemText primary="Sample safety" />
      </ListItem>
    </Tooltip>
  );
};

const MenuItems: React.FC<MenuItemsProps> = ({ currentRole, callsData }) => {
  const proposalDisabled = callsData.length === 0;
  const multipleCalls = callsData.length > 1;
  const context = useContext(FeatureContext);

  const isSchedulerEnabled = context.featuresMap.get(
    FeatureId.SCHEDULER
  )?.isEnabled;
  const isInstrumentManagementEnabled = context.featuresMap.get(
    FeatureId.INSTRUMENT_MANAGEMENT
  )?.isEnabled;
  const isSEPEnabled = context.featuresMap.get(FeatureId.SEP_REVIEW)?.isEnabled;
  const isUserManagementEnabled = context.featuresMap.get(
    FeatureId.USER_MANAGEMENT
  )?.isEnabled;
  const isSampleSafetyEnabled = context.featuresMap.get(
    FeatureId.SAMPLE_SAFETY
  )?.isEnabled;

  const { from, to } = getRelativeDatesFromToday(TimeSpan.NEXT_30_DAYS);

  const user = (
    <div data-cy="user-menu-items">
      <Tooltip title="Dashboard">
        <ListItem component={NavLink} to="/" exact button>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
      </Tooltip>
      <Tooltip title="New Proposal">
        <ListItem
          component={NavLink}
          to={
            multipleCalls
              ? '/ProposalSelectType'
              : `/ProposalCreate/${callsData[0]?.id}/${callsData[0]?.templateId}`
          }
          button
          disabled={proposalDisabled}
        >
          <ListItemIcon>
            <NoteAdd />
          </ListItemIcon>
          <ListItemText primary="New Proposal" />
        </ListItem>
      </Tooltip>
      {isSchedulerEnabled && (
        <Tooltip title="Experiment Times">
          <ListItem component={NavLink} to="/ExperimentTimes" button>
            <ListItemIcon>
              <EventIcon />
            </ListItemIcon>
            <ListItemText primary="Experiment Times" />
          </ListItem>
        </Tooltip>
      )}

      <Tooltip title="Help">
        <ListItem component={NavLink} to="/HelpPage" button>
          <ListItemIcon>
            <Help />
          </ListItemIcon>
          <ListItemText primary="Help" />
        </ListItem>
      </Tooltip>
    </div>
  );

  const userOfficer = (
    <div data-cy="officer-menu-items">
      <Tooltip title="Proposals">
        <ListItem component={NavLink} to="/Proposals" button>
          <ListItemIcon>
            <FolderOpen />
          </ListItemIcon>
          <ListItemText primary="Proposals" />
        </ListItem>
      </Tooltip>
      {isSchedulerEnabled && (
        <Tooltip title="Experiments">
          <ListItem
            component={NavLink}
            to={`/ExperimentPage?from=${encodeDate(from)}&to=${encodeDate(to)}`}
            button
          >
            <ListItemIcon>
              <EventIcon />
            </ListItemIcon>
            <ListItemText primary="Experiments" />
          </ListItem>
        </Tooltip>
      )}
      <Tooltip title="Calls">
        <ListItem component={NavLink} to="/Calls" button>
          <ListItemIcon>
            <CalendarToday />
          </ListItemIcon>
          <ListItemText primary="Calls" />
        </ListItem>
      </Tooltip>
      {isUserManagementEnabled && (
        <Tooltip title="People">
          <ListItem component={NavLink} to="/People" button>
            <ListItemIcon>
              <People />
            </ListItemIcon>
            <ListItemText primary="People" />
          </ListItem>
        </Tooltip>
      )}
      {isInstrumentManagementEnabled && (
        <Tooltip title="Instruments">
          <ListItem component={NavLink} to="/Instruments" button>
            <ListItemIcon>
              <ScienceIcon />
            </ListItemIcon>
            <ListItemText primary="Instruments" />
          </ListItem>
        </Tooltip>
      )}
      {isSEPEnabled && (
        <Tooltip title="Scientific evaluation panels">
          <ListItem component={NavLink} to="/SEPs" button>
            <ListItemIcon>
              <GroupWorkIcon />
            </ListItemIcon>
            <ListItemText primary="SEPs" />
          </ListItem>
        </Tooltip>
      )}
      <Tooltip title="Pages">
        <ListItem component={NavLink} to="/PageEditor" button>
          <ListItemIcon>
            <SettingsApplications />
          </ListItemIcon>
          <ListItemText primary="Pages" />
        </ListItem>
      </Tooltip>
      {isUserManagementEnabled && (
        <Tooltip title="Institutions">
          <ListItem component={NavLink} to="/Institutions" button>
            <ListItemIcon>
              <AccountBalanceIcon />
            </ListItemIcon>
            <ListItemText primary="Institutions" />
          </ListItem>
        </Tooltip>
      )}
      <TemplateMenuListItem />
      <Tooltip title="Questions">
        <ListItem component={NavLink} to="/Questions" button>
          <ListItemIcon>
            <CommentQuestionIcon />
          </ListItemIcon>
          <ListItemText primary="Questions" />
        </ListItem>
      </Tooltip>
      {isSampleSafetyEnabled && <SamplesMenuListItem />}
      <SettingsMenuListItem />
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
      <ListItem component={NavLink} to="/SEPs" button>
        <ListItemIcon>
          <GroupWorkIcon />
        </ListItemIcon>
        <Tooltip title="Scientific evaluation panels">
          <ListItemText primary="SEPs" />
        </Tooltip>
      </ListItem>
    </div>
  );

  const SEPReviewer = (
    <div data-cy="SEPReviewer-menu-items">
      <ListItem component={NavLink} to="/" exact button>
        <ListItemIcon>
          <FolderOpen />
        </ListItemIcon>
        <ListItemText primary="Review Proposals" />
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
      {isInstrumentManagementEnabled && (
        <ListItem component={NavLink} to="/Instruments" button>
          <ListItemIcon>
            <GroupWorkIcon />
          </ListItemIcon>
          <ListItemText primary="Instruments" />
        </ListItem>
      )}
      {isSchedulerEnabled && (
        <ListItem component={NavLink} to="/UpcomingExperimentTimes" button>
          <ListItemIcon>
            <EventIcon />
          </ListItemIcon>
          <ListItemText primary="Upcoming experiments" />
        </ListItem>
      )}
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
    case UserRole.INSTRUMENT_SCIENTIST:
      return instrumentScientist;
    case UserRole.SEP_CHAIR:
    case UserRole.SEP_SECRETARY:
      return SEPRoles;
    case UserRole.SEP_REVIEWER:
      return SEPReviewer;
    case UserRole.SAMPLE_SAFETY_REVIEWER:
      return sampleSafetyReviewer;
    default:
      return null;
  }
};

export default MenuItems;
