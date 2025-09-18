import { Topic } from '@mui/icons-material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FolderCopyIcon from '@mui/icons-material/FolderCopy';
import FolderOpen from '@mui/icons-material/FolderOpen';
import { ListItemButton } from '@mui/material';
import Collapse from '@mui/material/Collapse';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import Tooltip from 'components/common/MenuTooltip';
import { UserRole } from 'generated/sdk';
import { CallsDataQuantity, useCallsData } from 'hooks/call/useCallsData';
import { useTechniqueProposalAccess } from 'hooks/common/useTechniqueProposalAccess';

export function ProposalMenuListItem() {
  const isTechniqueProposalsEnabled = useTechniqueProposalAccess([
    UserRole.USER_OFFICER,
    UserRole.INSTRUMENT_SCIENTIST,
  ]);

  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

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

  function toggleExpand() {
    setIsExpanded(!isExpanded);
  }

  // Single menu item

  return (
    <>
      <Tooltip title="Proposals">
        <ListItemButton onClick={toggleExpand}>
          <ListItemIcon>
            <FolderCopyIcon />
            {isExpanded ? (
              <ExpandLess fontSize="small" />
            ) : (
              <ExpandMore fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText primary="Proposals" />
        </ListItemButton>
      </Tooltip>

      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <Tooltip title="Proposals">
          <ListItemButton component={NavLink} to="/Proposals">
            <ListItemIcon>
              <FolderOpen />
            </ListItemIcon>
            <ListItemText primary="Proposals" />
          </ListItemButton>
        </Tooltip>
        {isTechniqueProposalsEnabled && (
          <Tooltip title={t('Technique Proposals')}>
            <ListItemButton component={NavLink} to={techniqueProposalUrl}>
              <ListItemIcon>
                <Topic />
              </ListItemIcon>
              <ListItemText primary={t('Technique Proposals')} />
            </ListItemButton>
          </Tooltip>
        )}
      </Collapse>
    </>
  );
}
