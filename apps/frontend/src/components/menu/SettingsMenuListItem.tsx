import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { ListItemButton } from '@mui/material';
import Collapse from '@mui/material/Collapse';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import React, { useContext, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { IconPackIcon } from 'components/common/icons/IconPackIcon';
import Tooltip from 'components/common/MenuTooltip';
import { FeatureContext } from 'context/FeatureContextProvider';
import { FeatureId } from 'generated/sdk';

const menuMap = {
  Units: '/Units',
  ProposalStatuses: '/ProposalStatuses',
  ExperimentWorkflows: '/ExperimentWorkflows',
  ApiAccessTokens: '/ApiAccessTokens',
  Features: '/Features',
  Settings: '/Settings',
  RoleManagement: '/admin/roles',
  SampleEsiTemplates: '/SampleEsiTemplates',
};

const SettingsMenuListItem = () => {
  const location = useLocation();
  const featureContext = useContext(FeatureContext);

  const [isExpanded, setIsExpanded] = useState(false);

  const isExperimentSafetyEnabled = featureContext.featuresMap.get(
    FeatureId.EXPERIMENT_SAFETY_REVIEW
  )?.isEnabled;

  React.useEffect(() => {
    setIsExpanded(Object.values(menuMap).includes(location.pathname));
  }, [location.pathname]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <Tooltip title="Configuration Settings">
        <ListItemButton onClick={toggleExpand}>
          <ListItemIcon>
            {isExpanded ? (
              <>
                <IconPackIcon icon="ConfigurationSettings" />
                <ExpandLess fontSize="small" />
              </>
            ) : (
              <>
                <IconPackIcon icon="ConfigurationSettings" />
                <ExpandMore fontSize="small" />
              </>
            )}
          </ListItemIcon>
          <ListItemText primary="Configuration Settings" />
        </ListItemButton>
      </Tooltip>

      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <Tooltip title="Units">
          <ListItemButton component={NavLink} to={menuMap['Units']}>
            <ListItemIcon>
              <IconPackIcon icon="Unit" />
            </ListItemIcon>
            <ListItemText primary="Units" />
          </ListItemButton>
        </Tooltip>
        <Tooltip title="Pages">
          <ListItemButton component={NavLink} to="/PageEditor">
            <ListItemIcon>
              <IconPackIcon icon="Page" />
            </ListItemIcon>
            <ListItemText primary="Pages" />
          </ListItemButton>
        </Tooltip>

        <Tooltip title="Proposal statuses">
          <ListItemButton
            component={NavLink}
            to={menuMap['ProposalStatuses']}
            selected={location.pathname.includes('/ProposalStatuses')}
          >
            <ListItemIcon>
              <IconPackIcon icon="ProposalStatuses" />
            </ListItemIcon>
            <ListItemText primary="Proposal statuses" />
          </ListItemButton>
        </Tooltip>

        {isExperimentSafetyEnabled && (
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
                <IconPackIcon icon="ExperimentWorkflows" />
              </ListItemIcon>
              <ListItemText primary="Experiment workflows" />
            </ListItemButton>
          </Tooltip>
        )}

        <Tooltip title="API access tokens">
          <ListItemButton component={NavLink} to={menuMap['ApiAccessTokens']}>
            <ListItemIcon>
              <IconPackIcon icon="APIAccessToken" />
            </ListItemIcon>
            <ListItemText primary="API access tokens" />
          </ListItemButton>
        </Tooltip>
        <Tooltip title="Role management">
          <ListItemButton component={NavLink} to={menuMap['RoleManagement']}>
            <ListItemIcon>
              <IconPackIcon icon="RoleManagement" />
            </ListItemIcon>
            <ListItemText primary="Role management" />
          </ListItemButton>
        </Tooltip>
        <Tooltip title="Features">
          <ListItemButton component={NavLink} to={menuMap['Features']}>
            <ListItemIcon>
              <IconPackIcon icon="Feature" />
            </ListItemIcon>
            <ListItemText primary="Features" />
          </ListItemButton>
        </Tooltip>
        <Tooltip title="App settings">
          <ListItemButton component={NavLink} to={menuMap['Settings']}>
            <ListItemIcon>
              <IconPackIcon icon="AppSettings" />
            </ListItemIcon>
            <ListItemText primary="App settings" />
          </ListItemButton>
        </Tooltip>
      </Collapse>
    </>
  );
};

export default SettingsMenuListItem;
