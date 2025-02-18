import { Science } from '@mui/icons-material';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FunctionsIcon from '@mui/icons-material/Functions';
import Settings from '@mui/icons-material/Settings';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import VpnKey from '@mui/icons-material/VpnKey';
import { ListItemButton } from '@mui/material';
import Collapse from '@mui/material/Collapse';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import Tooltip from 'components/common/MenuTooltip';

import ProposalSettingsIcon from '../common/icons/ProposalSettingsIcon';
import ProposalWorkflowIcon from '../common/icons/ProposalWorkflowIcon';

const menuMap = {
  Units: '/Units',
  ProposalStatuses: '/ProposalStatuses',
  ProposalWorkflows: '/ProposalWorkflows',
  ExperimentWorkflows: '/ExperimentWorkflows',
  ApiAccessTokens: '/ApiAccessTokens',
  Features: '/Features',
  Settings: '/Settings',
  SampleEsiTemplates: '/SampleEsiTemplates',
};

const SettingsMenuListItem = () => {
  const location = useLocation();

  const [isExpanded, setIsExpanded] = useState(false);

  React.useEffect(() => {
    setIsExpanded(Object.values(menuMap).includes(location.pathname));
  }, [location.pathname]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <Tooltip title="Settings">
        <ListItemButton onClick={toggleExpand}>
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
        </ListItemButton>
      </Tooltip>

      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <Tooltip title="Units">
          <ListItemButton component={NavLink} to={menuMap['Units']}>
            <ListItemIcon>
              <FunctionsIcon />
            </ListItemIcon>
            <ListItemText primary="Units" />
          </ListItemButton>
        </Tooltip>

        <Tooltip title="Proposal statuses">
          <ListItemButton
            component={NavLink}
            to={menuMap['ProposalStatuses']}
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
            to={menuMap['ProposalWorkflows']}
          >
            <ListItemIcon>
              <ProposalWorkflowIcon />
            </ListItemIcon>
            <ListItemText primary="Proposal workflows" />
          </ListItemButton>
        </Tooltip>

        <Tooltip title="Experiment workflows">
          <ListItemButton
            component={NavLink}
            selected={
              location.pathname.includes('/ExperimentWorkflows') ||
              location.pathname.includes('ExperimentWorkflowEditor')
            }
            to={menuMap['ExperimentWorkflows']}
          >
            <ListItemIcon>
              <Science />
            </ListItemIcon>
            <ListItemText primary="Experiment workflows" />
          </ListItemButton>
        </Tooltip>

        <Tooltip title="API access tokens">
          <ListItemButton component={NavLink} to={menuMap['ApiAccessTokens']}>
            <ListItemIcon>
              <VpnKey />
            </ListItemIcon>
            <ListItemText primary="API access tokens" />
          </ListItemButton>
        </Tooltip>
        <Tooltip title="Features">
          <ListItemButton component={NavLink} to={menuMap['Features']}>
            <ListItemIcon>
              <ViewModuleIcon />
            </ListItemIcon>
            <ListItemText primary="Features" />
          </ListItemButton>
        </Tooltip>
        <Tooltip title="App settings">
          <ListItemButton component={NavLink} to={menuMap['Settings']}>
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

export default SettingsMenuListItem;
