import { Science, Topic, Apartment } from '@mui/icons-material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CalendarToday from '@mui/icons-material/CalendarToday';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventIcon from '@mui/icons-material/Event';
import FolderOpen from '@mui/icons-material/FolderOpen';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import Help from '@mui/icons-material/Help';
import NoteAdd from '@mui/icons-material/NoteAdd';
import People from '@mui/icons-material/People';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import i18n from 'i18n';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import Tooltip from 'components/common/MenuTooltip';
import { FeatureContext } from 'context/FeatureContextProvider';
import { FeatureId, PermissionRuleFragment, UserRole } from 'generated/sdk';
import { CallsDataQuantity, useCallsData } from 'hooks/call/useCallsData';
import { useTechniqueProposalAccess } from 'hooks/common/useTechniqueProposalAccess';

import SettingsMenuListItem from './SettingsMenuListItem';
import { StatusActionLogsMenuListItem } from './StatusActionLogsMenuListItem';
import { TemplateMenuListItem } from './TemplateMenuListItem';
import CommentQuestionIcon from '../common/icons/CommentQuestionIcon';
import ProposalWorkflowIcon from '../common/icons/ProposalWorkflowIcon';
import ScienceIcon from '../common/icons/ScienceIcon';
import {Can} from '@casl/react'
import { defineAbility } from '@casl/ability';

type MenuItemsProps = {
  currentRole: UserRole | null;
  permissionRules: PermissionRuleFragment[]
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

const MenuItems = ({ currentRole }: MenuItemsProps) => {
  const context = useContext(FeatureContext);
  const { t } = useTranslation();

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

  const isTechniqueProposalsEnabled = useTechniqueProposalAccess([
    UserRole.USER_OFFICER,
    UserRole.INSTRUMENT_SCIENTIST,
  ]);

  const isTagsEnabled = context.featuresMap.get(FeatureId.TAGS)?.isEnabled;

  const ability = defineAbility((can) => {
    can('read', 'dashboard')
});
  const calls = useCallsData(
    {
      proposalStatusShortCode: 'QUICK_REVIEW',
    },
    CallsDataQuantity.MINIMAL
  ).calls;

  const openCall = calls?.find((call) => call.isActive);

  const techniqueProposalUrl =
    openCall && openCall.id
      ? `/TechniqueProposals?call=${openCall?.id}`
      : '/TechniqueProposals';

  const user = (
    <div data-cy="user-menu-items">
      <Can I="read" a="dashboard" ability={ability}>
      <Tooltip title="Dashboard">
        <ListItemButton component={NavLink} to="/">
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
      </Tooltip>
      </Can>
      <Can I="create" a="proposal" ability={ability}>
      <Tooltip title="New Proposal">
        <ListItemButton component={NavLink} to="/ProposalSelectType">
          <ListItemIcon>
            <NoteAdd />
          </ListItemIcon>
          <ListItemText primary="New Proposal" />
        </ListItemButton>
      </Tooltip>
      </Can>
      {isSchedulerEnabled && (
        <Can I="read" a="experiment_times" ability={ability}>
        <Tooltip title="Experiment Times">
          <ListItemButton component={NavLink} to="/ExperimentTimes">
            <ListItemIcon>
              <EventIcon />
            </ListItemIcon>
            <ListItemText primary="Experiment Times" />
          </ListItemButton>
        </Tooltip>
        </Can>
      )}
      <Can I="read" a="help" ability={ability}>
      <Tooltip title="Help">
        <ListItemButton component={NavLink} to="/HelpPage">
          <ListItemIcon>
            <Help />
          </ListItemIcon>
          <ListItemText primary="Help" />
        </ListItemButton>
      </Tooltip>
      </Can>
    </div>
  );

  const userOfficer = (
    <div data-cy="officer-menu-items">
      <Can I="read" a="call" ability={ability}>
      <Tooltip title="Calls">
        <ListItemButton component={NavLink} to="/Calls">
          <ListItemIcon>
            <CalendarToday />
          </ListItemIcon>
          <ListItemText primary="Calls" />
        </ListItemButton>
      </Tooltip>
      </Can>
      <Can I="read" a="proposal" ability={ability}>
      <Tooltip title="Proposals">
        <ListItemButton component={NavLink} to="/Proposals">
          <ListItemIcon>
            <FolderOpen />
          </ListItemIcon>
          <ListItemText primary="Proposals" />
        </ListItemButton>
      </Tooltip>
      </Can>
      <Can I="read" a="permission" ability={ability}>
      <Tooltip title="Permissions">
        <ListItemButton component={NavLink} to="/Permissions">
          <ListItemIcon>
            <CommentQuestionIcon />
          </ListItemIcon>
          <ListItemText primary="Permissions" />
        </ListItemButton>
      </Tooltip>
      </Can>
      {isTechniqueProposalsEnabled && (
        <Can I="read" a="technique_proposal" ability={ability}>
        <Tooltip title={t('Technique Proposals')}>
          <ListItemButton component={NavLink} to={techniqueProposalUrl}>
            <ListItemIcon>
              <Topic />
            </ListItemIcon>
            <ListItemText primary={t('Technique Proposals')} />
          </ListItemButton>
        </Tooltip>
        </Can>
      )}
      {isSchedulerEnabled && (
        <Can I="read" an="experiment" ability={ability}>
        <Tooltip title="Experiments">
          <ListItemButton component={NavLink} to={`/Experiments`}>
            <ListItemIcon>
              <EventIcon />
            </ListItemIcon>
            <ListItemText primary="Experiments" />
          </ListItemButton>
        </Tooltip>
        </Can>
      )}
      {isFapEnabled && (
        <Can I="read" a="fap" ability={ability}>
        <Tooltip title={i18n.format(t('Facility access panel'), 'plural')}>
          <ListItemButton component={NavLink} to="/Faps">
            <ListItemIcon>
              <GroupWorkIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.format(t('FAP'), 'plural')} />
          </ListItemButton>
        </Tooltip>
        </Can>
      )}
      {isInstrumentManagementEnabled && (
        <Can I="read" an="instrument" ability={ability}>
        <Tooltip title={i18n.format(t('instrument'), 'plural')}>
          <ListItemButton component={NavLink} to="/Instruments">
            <ListItemIcon>
              <ScienceIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.format(t('instrument'), 'plural')} />
          </ListItemButton>
        </Tooltip>
        </Can>
      )}
      <Can I="read" a="technique" ability={ability}>
      <Tooltip title="Techniques">
        <ListItemButton component={NavLink} to="/Techniques">
          <ListItemIcon>
            <Science />
          </ListItemIcon>
          <ListItemText primary={i18n.format(t('Technique'), 'plural')} />
        </ListItemButton>
      </Tooltip>
      </Can>
      {isTagsEnabled && (
        <Can I="read" a="tag" ability={ability}>
        <Tooltip title="Tag">
          <ListItemButton component={NavLink} to="/Tag">
            <ListItemIcon>
              <Apartment />
            </ListItemIcon>
            <ListItemText primary={'Tag'} />
          </ListItemButton>
        </Tooltip>
        </Can>
      )}
      <Tooltip title="Proposal workflows">
        <ListItemButton
          component={NavLink}
          selected={
            location.pathname.includes('/ProposalWorkflows') ||
            location.pathname.includes('ProposalWorkflowEditor')
          }
          to={'/ProposalWorkflows'}
        >
          <ListItemIcon>
            <ProposalWorkflowIcon />
          </ListItemIcon>
          <ListItemText primary="Proposal workflows" />
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
      <StatusActionLogsMenuListItem />
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
      <Tooltip title="Questions">
        <ListItemButton component={NavLink} to="/Questions">
          <ListItemIcon>
            <CommentQuestionIcon />
          </ListItemIcon>
          <ListItemText primary="Questions" />
        </ListItemButton>
      </Tooltip>
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
        <Tooltip title={i18n.format(t('Facility access panel'), 'plural')}>
          <ListItemText primary={i18n.format(t('FAP'), 'plural')} />
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
      {isTechniqueProposalsEnabled && (
        <ListItemButton component={NavLink} to={techniqueProposalUrl}>
          <ListItemIcon>
            <Topic />
          </ListItemIcon>
          <ListItemText primary={t('Technique Proposals')} />
        </ListItemButton>
      )}
      {isSchedulerEnabled && (
        <Tooltip title="Experiments">
          <ListItemButton component={NavLink} to={`/Experiments`}>
            <ListItemIcon>
              <EventIcon />
            </ListItemIcon>
            <ListItemText primary="Experiments" />
          </ListItemButton>
        </Tooltip>
      )}
      {isInstrumentManagementEnabled && (
        <ListItemButton component={NavLink} to="/Instruments">
          <ListItemIcon>
            <GroupWorkIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.format(t('instrument'), 'plural')} />
        </ListItemButton>
      )}
    </div>
  );

  const ExperimentSafetyReviewPageReviewer = (
    <div data-cy="reviewer-menu-items">
      {isSchedulerEnabled && (
        <Tooltip title="Experiments">
          <ListItemButton component={NavLink} to={`/Experiments`}>
            <ListItemIcon>
              <EventIcon />
            </ListItemIcon>
            <ListItemText primary="Experiments" />
          </ListItemButton>
        </Tooltip>
      )}
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
    case UserRole.EXPERIMENT_SAFETY_REVIEWER:
      return ExperimentSafetyReviewPageReviewer;
    case UserRole.INTERNAL_REVIEWER:
      return internalReviewer;
    default:
      return null;
  }
};

export default MenuItems;
