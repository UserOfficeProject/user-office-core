import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CalendarToday from '@mui/icons-material/CalendarToday';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
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
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import i18n from 'i18n';
import { DateTime } from 'luxon';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';

import Tooltip from 'components/common/MenuTooltip';
import {
  DEFAULT_DATE_FORMAT,
  getRelativeDatesFromToday,
} from 'components/experiment/DateFilter';
import { TimeSpan } from 'components/experiment/PresetDateSelector';
import { FeatureContext } from 'context/FeatureContextProvider';
import { Call, FeatureId, SettingsId, UserRole } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';

import { TemplateMenuListItem } from './TemplateMenuListItem';
import BoxIcon from '../common/icons/BoxIcon';
import CommentQuestionIcon from '../common/icons/CommentQuestionIcon';
import ProposalSettingsIcon from '../common/icons/ProposalSettingsIcon';
import ProposalWorkflowIcon from '../common/icons/ProposalWorkflowIcon';
import ScienceIcon from '../common/icons/ScienceIcon';

type MenuItemsProps = {
  currentRole: UserRole | null;
  callsData: Call[];
};

const SettingsMenuListItem = () => {
  const location = useLocation();
  const shouldExpand =
    location.pathname === '/ProposalStatuses' ||
    location.pathname === '/ProposalWorkflows' ||
    location.pathname.includes('ProposalWorkflowEditor');
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
          <ListItemButton
            component={NavLink}
            to="/ProposalStatuses"
            selected={location.pathname.includes('/ProposalStatuses')}
          >
            <ListItemIcon>
              <ProposalSettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Proposal statuses" />
          </ListItemButton>
        </Tooltip>

        <Tooltip title="Proposal workflows">
          <ListItemButton
            component={NavLink}
            selected={
              location.pathname.includes('/ProposalWorkflows') ||
              location.pathname.includes('ProposalWorkflowEditor')
            }
            to="/ProposalWorkflows"
          >
            <ListItemIcon>
              <ProposalWorkflowIcon />
            </ListItemIcon>
            <ListItemText primary="Proposal workflows" />
          </ListItemButton>
        </Tooltip>

        <Tooltip title="API access tokens">
          <ListItemButton component={NavLink} to="/ApiAccessTokens">
            <ListItemIcon>
              <VpnKey />
            </ListItemIcon>
            <ListItemText primary="API access tokens" />
          </ListItemButton>
        </Tooltip>
        <Tooltip title="Features">
          <ListItemButton component={NavLink} to="/Features">
            <ListItemIcon>
              <ViewModuleIcon />
            </ListItemIcon>
            <ListItemText primary="Features" />
          </ListItemButton>
        </Tooltip>
        <Tooltip title="App settings">
          <ListItemButton component={NavLink} to="/Settings">
            <ListItemIcon>
              <DisplaySettingsIcon />
            </ListItemIcon>
            <ListItemText primary="App settings" />
          </ListItemButton>
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

const ProposalsMenuListItem = () => {
  return (
    <Tooltip title="Review Proposals">
      <ListItemButton component={NavLink} to="/">
        <ListItemIcon>
          <FolderOpen />
        </ListItemIcon>
        <ListItemText primary="Review Proposals" />
      </ListItemButton>
    </Tooltip>
  );
};

const MenuItems = ({ currentRole, callsData }: MenuItemsProps) => {
  const proposalDisabled = callsData.length === 0;
  const context = useContext(FeatureContext);
  const { t } = useTranslation();
  const { format } = useFormattedDateTime({
    settingsFormatToUse: SettingsId.DATE_FORMAT,
  });

  const isSchedulerEnabled = context.featuresMap.get(
    FeatureId.SCHEDULER
  )?.isEnabled;
  const isInstrumentManagementEnabled = context.featuresMap.get(
    FeatureId.INSTRUMENT_MANAGEMENT
  )?.isEnabled;
  const isFapEnabled = context.featuresMap.get(FeatureId.FAP_REVIEW)?.isEnabled;
  const isUserManagementEnabled = context.featuresMap.get(
    FeatureId.USER_MANAGEMENT
  )?.isEnabled;
  const isSampleSafetyEnabled = context.featuresMap.get(
    FeatureId.SAMPLE_SAFETY
  )?.isEnabled;

  const { from, to } = getRelativeDatesFromToday(TimeSpan.NEXT_30_DAYS);

  const formattedDate = (value?: Date) =>
    value
      ? DateTime.fromJSDate(value).toFormat(format || DEFAULT_DATE_FORMAT)
      : undefined;

  const user = (
    <div data-cy="user-menu-items">
      <Tooltip title="Dashboard">
        <ListItemButton component={NavLink} to="/">
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
      </Tooltip>
      <Tooltip title="New Proposal">
        <ListItemButton
          component={NavLink}
          to="/ProposalSelectType"
          disabled={proposalDisabled}
        >
          <ListItemIcon>
            <NoteAdd />
          </ListItemIcon>
          <ListItemText primary="New Proposal" />
        </ListItemButton>
      </Tooltip>
      {isSchedulerEnabled && (
        <Tooltip title="Experiment Times">
          <ListItemButton component={NavLink} to="/ExperimentTimes">
            <ListItemIcon>
              <EventIcon />
            </ListItemIcon>
            <ListItemText primary="Experiment Times" />
          </ListItemButton>
        </Tooltip>
      )}

      <Tooltip title="Help">
        <ListItemButton component={NavLink} to="/HelpPage">
          <ListItemIcon>
            <Help />
          </ListItemIcon>
          <ListItemText primary="Help" />
        </ListItemButton>
      </Tooltip>
    </div>
  );

  const userOfficer = (
    <div data-cy="officer-menu-items">
      <Tooltip title="Proposals">
        <ListItemButton component={NavLink} to="/Proposals">
          <ListItemIcon>
            <FolderOpen />
          </ListItemIcon>
          <ListItemText primary="Proposals" />
        </ListItemButton>
      </Tooltip>
      {isSchedulerEnabled && (
        <Tooltip title="Experiments">
          <ListItemButton
            component={NavLink}
            to={`/ExperimentPage?from=${formattedDate(from)}&to=${formattedDate(to)}`}
          >
            <ListItemIcon>
              <EventIcon />
            </ListItemIcon>
            <ListItemText primary="Experiments" />
          </ListItemButton>
        </Tooltip>
      )}
      <Tooltip title="Calls">
        <ListItemButton component={NavLink} to="/Calls">
          <ListItemIcon>
            <CalendarToday />
          </ListItemIcon>
          <ListItemText primary="Calls" />
        </ListItemButton>
      </Tooltip>
      {isUserManagementEnabled && (
        <Tooltip title="People">
          <ListItemButton component={NavLink} to="/People">
            <ListItemIcon>
              <People />
            </ListItemIcon>
            <ListItemText primary="People" />
          </ListItemButton>
        </Tooltip>
      )}
      {isInstrumentManagementEnabled && (
        <Tooltip title="Instruments">
          <ListItemButton component={NavLink} to="/Instruments">
            <ListItemIcon>
              <ScienceIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.format(t('instrument'), 'plural')} />
          </ListItemButton>
        </Tooltip>
      )}
      {isFapEnabled && (
        <Tooltip title="Facility access panels">
          <ListItemButton component={NavLink} to="/Faps">
            <ListItemIcon>
              <GroupWorkIcon />
            </ListItemIcon>
            <ListItemText primary="FAPs" />
          </ListItemButton>
        </Tooltip>
      )}
      <Tooltip title="Pages">
        <ListItemButton component={NavLink} to="/PageEditor">
          <ListItemIcon>
            <SettingsApplications />
          </ListItemIcon>
          <ListItemText primary="Pages" />
        </ListItemButton>
      </Tooltip>
      {isUserManagementEnabled && (
        <Tooltip title="Institutions">
          <ListItemButton component={NavLink} to="/Institutions">
            <ListItemIcon>
              <AccountBalanceIcon />
            </ListItemIcon>
            <ListItemText primary="Institutions" />
          </ListItemButton>
        </Tooltip>
      )}
      <TemplateMenuListItem />
      <Tooltip title="Questions">
        <ListItemButton component={NavLink} to="/Questions">
          <ListItemIcon>
            <CommentQuestionIcon />
          </ListItemIcon>
          <ListItemText primary="Questions" />
        </ListItemButton>
      </Tooltip>
      {isSampleSafetyEnabled && <SamplesMenuListItem />}
      <SettingsMenuListItem />
    </div>
  );

  const FapRoles = (
    <div data-cy="FapRoles-menu-items">
      <ListItemButton component={NavLink} to="/">
        <ListItemIcon>
          <FolderOpen />
        </ListItemIcon>
        <ListItemText primary="Review Proposals" />
      </ListItemButton>
      <ListItemButton component={NavLink} to="/Faps">
        <ListItemIcon>
          <GroupWorkIcon />
        </ListItemIcon>
        <Tooltip title="Facility access panels">
          <ListItemText primary="FAPs" />
        </Tooltip>
      </ListItemButton>
    </div>
  );

  const instrumentScientist = (
    <div data-cy="instrument-scientist-menu-items">
      <ListItemButton component={NavLink} to="/">
        <ListItemIcon>
          <FolderOpen />
        </ListItemIcon>
        <ListItemText primary="Proposals" />
      </ListItemButton>
      {isInstrumentManagementEnabled && (
        <ListItemButton component={NavLink} to="/Instruments">
          <ListItemIcon>
            <GroupWorkIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.format(t('instrument'), 'plural')} />
        </ListItemButton>
      )}
      {isSchedulerEnabled && (
        <ListItemButton component={NavLink} to="/UpcomingExperimentTimes">
          <ListItemIcon>
            <EventIcon />
          </ListItemIcon>
          <ListItemText primary="Upcoming experiments" />
        </ListItemButton>
      )}
    </div>
  );

  const sampleSafetyReviewer = (
    <div data-cy="reviewer-menu-items">
      <SamplesMenuListItem />
    </div>
  );

  const internalReviewer = (
    <div data-cy="internal-reviewer-menu-items">
      <ProposalsMenuListItem />
    </div>
  );

  switch (currentRole) {
    case UserRole.USER:
      return user;
    case UserRole.USER_OFFICER:
      return userOfficer;
    case UserRole.INSTRUMENT_SCIENTIST:
      return instrumentScientist;
    case UserRole.FAP_CHAIR:
    case UserRole.FAP_SECRETARY:
    case UserRole.FAP_REVIEWER:
      return FapRoles;
    case UserRole.SAMPLE_SAFETY_REVIEWER:
      return sampleSafetyReviewer;
    case UserRole.INTERNAL_REVIEWER:
      return internalReviewer;
    default:
      return null;
  }
};

export default MenuItems;
