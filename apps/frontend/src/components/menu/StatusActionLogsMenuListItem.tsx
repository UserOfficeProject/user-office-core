import EventNoteIcon from '@mui/icons-material/EventNote';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import MailIcon from '@mui/icons-material/Mail';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { ListItemButton } from '@mui/material';
import Collapse from '@mui/material/Collapse';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';

import Tooltip from 'components/common/MenuTooltip';
import { FeatureContext } from 'context/FeatureContextProvider';
import { FeatureId } from 'generated/sdk';

const menuMap = {
  email: '/EmailStatusActionsLogs',
  proposalDownload: '/ProposalDownloadStatusActionsLogs',
};

export function StatusActionLogsMenuListItem() {
  const featureContext = useContext(FeatureContext);
  const isPregeneratedProposalsEnabled = featureContext.featuresMap.get(
    FeatureId.PREGENERATED_PROPOSALS
  )?.isEnabled;

  const [isExpanded, setIsExpanded] = useState(false);

  React.useEffect(() => {
    setIsExpanded(Object.values(menuMap).includes(location.pathname));
  }, []);

  function toggleExpand() {
    setIsExpanded(!isExpanded);
  }

  // Single menu item
  if (!isPregeneratedProposalsEnabled) {
    return (
      <Tooltip title="Status Action Logs">
        <ListItemButton component={NavLink} to={menuMap['email']}>
          <ListItemIcon>
            <MailIcon />
          </ListItemIcon>
          <ListItemText primary="Status Action Logs" />
        </ListItemButton>
      </Tooltip>
    );
  }

  // Expandable menu with sub-items
  return (
    <>
      <Tooltip title="Status Action Logs">
        <ListItemButton onClick={toggleExpand}>
          <ListItemIcon>
            <EventNoteIcon />
            {isExpanded ? (
              <ExpandLess fontSize="small" />
            ) : (
              <ExpandMore fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText primary="Status Action Logs" />
        </ListItemButton>
      </Tooltip>

      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <Tooltip title="Email">
          <ListItemButton component={NavLink} to={menuMap['email']}>
            <ListItemIcon>
              <MailIcon />
            </ListItemIcon>
            <ListItemText primary="Email" />
          </ListItemButton>
        </Tooltip>

        <Tooltip title="Proposal Download">
          <ListItemButton component={NavLink} to={menuMap['proposalDownload']}>
            <ListItemIcon>
              <PictureAsPdfIcon />
            </ListItemIcon>
            <ListItemText primary="Proposal Download" />
          </ListItemButton>
        </Tooltip>
      </Collapse>
    </>
  );
}
