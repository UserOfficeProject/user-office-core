import DescriptionIcon from '@mui/icons-material/Description';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FeedbackIcon from '@mui/icons-material/Feedback';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import InboxIcon from '@mui/icons-material/Inbox';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { ListItemButton } from '@mui/material';
import Collapse from '@mui/material/Collapse';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';

import EsiIcon from 'components/common/icons/EsiIcon';
import Tooltip from 'components/common/MenuTooltip';
import { FeatureContext } from 'context/FeatureContextProvider';
import { FeatureId } from 'generated/sdk';

const menuMap = {
  PdfTemplates: '/PdfTemplates',
  ProposalTemplates: '/ProposalTemplates',
  FapReviewTemplates: '/FapReviewTemplates',
  TechnicalReviewTemplates: '/TechnicalReviewTemplates',
  SampleDeclarationTemplates: '/SampleDeclarationTemplates',
  GenericTemplates: '/GenericTemplates',
  ShipmentDeclarationTemplates: '/ShipmentDeclarationTemplates',
  VisitTemplates: '/VisitTemplates',
  FeedbackTemplates: '/FeedbackTemplates',
  EsiTemplates: '/EsiTemplates',
  SampleEsiTemplates: '/SampleEsiTemplates',
};

function EsiTemplatesMenuListItem() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <>
      <Tooltip title="Experiment Safety Input (ESI)">
        <ListItemButton onClick={() => setIsExpanded(!isExpanded)}>
          <ListItemIcon>
            <EsiIcon />
            {isExpanded ? (
              <ExpandLess fontSize="small" />
            ) : (
              <ExpandMore fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText primary="ESI" />
        </ListItemButton>
      </Tooltip>

      <Collapse
        in={isExpanded}
        timeout="auto"
        unmountOnExit
        style={{ marginLeft: '10px' }}
      >
        <Tooltip title="Experiment Safety Input (Proposal)">
          <ListItemButton component={NavLink} to={menuMap['EsiTemplates']}>
            <ListItemIcon>
              <DescriptionIcon />
            </ListItemIcon>
            <ListItemText primary="Proposal ESI" title="Proposal ESI" />
          </ListItemButton>
        </Tooltip>
        <Tooltip title="Experiment Safety Input (Sample)">
          <ListItemButton
            component={NavLink}
            to={menuMap['SampleEsiTemplates']}
          >
            <ListItemIcon>
              <InboxIcon />
            </ListItemIcon>
            <ListItemText primary="Sample ESI" title="Sample ESI" />
          </ListItemButton>
        </Tooltip>
      </Collapse>
    </>
  );
}

export function TemplateMenuListItem() {
  const location = useLocation();
  const { t } = useTranslation();

  const [isExpanded, setIsExpanded] = useState(false);

  const context = useContext(FeatureContext);
  const isShipmentFeatureEnabled = !!context.featuresMap.get(FeatureId.SHIPPING)
    ?.isEnabled;
  const isRiskAssessmentFeatureEnabled = !!context.featuresMap.get(
    FeatureId.RISK_ASSESSMENT
  )?.isEnabled;
  const isVisitManagementEnabled = !!context.featuresMap.get(
    FeatureId.VISIT_MANAGEMENT
  )?.isEnabled;

  React.useEffect(() => {
    setIsExpanded(Object.values(menuMap).includes(location.pathname));
  }, [location.pathname]);

  function toggleExpand() {
    setIsExpanded(!isExpanded);
  }

  return (
    <>
      <Tooltip title="Templates">
        <ListItemButton onClick={toggleExpand}>
          <ListItemIcon>
            <LibraryBooksIcon />
            {isExpanded ? (
              <ExpandLess fontSize="small" />
            ) : (
              <ExpandMore fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText primary="Templates" />
        </ListItemButton>
      </Tooltip>

      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <Tooltip title="PDF">
          <ListItemButton component={NavLink} to={menuMap['PdfTemplates']}>
            <ListItemIcon>
              <PictureAsPdfIcon />
            </ListItemIcon>
            <ListItemText primary="PDF" />
          </ListItemButton>
        </Tooltip>

        <Tooltip title="Experiment Safety Review">
          <ListItemButton
            component={NavLink}
            to="/ExperimentSafetyReviewTemplates"
          >
            <ListItemIcon>
              <DescriptionIcon />
            </ListItemIcon>
            <ListItemText primary="Experiment Safety Review" />
          </ListItemButton>
        </Tooltip>

        <Tooltip title="Proposal">
          <ListItemButton component={NavLink} to={menuMap['ProposalTemplates']}>
            <ListItemIcon>
              <DescriptionIcon />
            </ListItemIcon>
            <ListItemText primary="Proposal" />
          </ListItemButton>
        </Tooltip>

        <Tooltip title={t('FAP Review')}>
          <ListItemButton
            component={NavLink}
            to={menuMap['FapReviewTemplates']}
          >
            <ListItemIcon>
              <DescriptionIcon />
            </ListItemIcon>
            <ListItemText primary={t('FAP Review')} />
          </ListItemButton>
        </Tooltip>

        <Tooltip title="Technical Review">
          <ListItemButton
            component={NavLink}
            to={menuMap['TechnicalReviewTemplates']}
          >
            <ListItemIcon>
              <DescriptionIcon />
            </ListItemIcon>
            <ListItemText primary="Technical Review" />
          </ListItemButton>
        </Tooltip>

        <Tooltip title="Sample declaration">
          <ListItemButton
            component={NavLink}
            to={menuMap['SampleDeclarationTemplates']}
          >
            <ListItemIcon>
              <InboxIcon />
            </ListItemIcon>
            <ListItemText primary="Sample declaration" />
          </ListItemButton>
        </Tooltip>

        <Tooltip title="Sub Template">
          <ListItemButton component={NavLink} to={menuMap['GenericTemplates']}>
            <ListItemIcon>
              <DynamicFeedIcon />
            </ListItemIcon>
            <ListItemText primary="Sub Template" />
          </ListItemButton>
        </Tooltip>

        {isShipmentFeatureEnabled && (
          <Tooltip title="Shipment declaration templates">
            <ListItemButton
              component={NavLink}
              to={menuMap['ShipmentDeclarationTemplates']}
            >
              <ListItemIcon>
                <LocalShippingIcon />
              </ListItemIcon>
              <ListItemText primary="Shipment declaration" />
            </ListItemButton>
          </Tooltip>
        )}
        {isVisitManagementEnabled && (
          <Tooltip title="Visit registration">
            <ListItemButton component={NavLink} to={menuMap['VisitTemplates']}>
              <ListItemIcon>
                <FlightTakeoffIcon />
              </ListItemIcon>
              <ListItemText primary="Visit registration" />
            </ListItemButton>
          </Tooltip>
        )}

        {isRiskAssessmentFeatureEnabled && <EsiTemplatesMenuListItem />}

        <Tooltip title="Feedback">
          <ListItemButton component={NavLink} to={menuMap['FeedbackTemplates']}>
            <ListItemIcon>
              <FeedbackIcon />
            </ListItemIcon>
            <ListItemText primary="Feedback" />
          </ListItemButton>
        </Tooltip>
      </Collapse>
    </>
  );
}
