import DescriptionIcon from '@mui/icons-material/Description';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { ListItemButton } from '@mui/material';
import Collapse from '@mui/material/Collapse';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

import Tooltip from 'components/common/MenuTooltip';

const menuMap = {
  email: '/EmailStatusActionsLogs',
  proposalDownload: '/ProposalDownloadStatusActionsLogs',
};

export function StatusActionLogsMenuListItem() {
  const [isExpanded, setIsExpanded] = useState(false);

  React.useEffect(() => {
    setIsExpanded(Object.values(menuMap).includes(location.pathname));
  }, []);

  function toggleExpand() {
    setIsExpanded(!isExpanded);
  }

  return (
    <>
      <Tooltip title="Status Action Logs">
        <ListItemButton onClick={toggleExpand}>
          <ListItemIcon>
            <LibraryBooksIcon />
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
              <PictureAsPdfIcon />
            </ListItemIcon>
            <ListItemText primary="Email" />
          </ListItemButton>
        </Tooltip>

        <Tooltip title="Proposal download">
          <ListItemButton component={NavLink} to={menuMap['proposalDownload']}>
            <ListItemIcon>
              <DescriptionIcon />
            </ListItemIcon>
            <ListItemText primary="Proposal download" />
          </ListItemButton>
        </Tooltip>
      </Collapse>
    </>
  );
}
