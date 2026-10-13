import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { ListItemButton } from '@mui/material';
import Collapse from '@mui/material/Collapse';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';

import { IconPackIcon } from 'components/common/icons/IconPackIcon';
import Tooltip from 'components/common/MenuTooltip';
import { FeatureContext } from 'context/FeatureContextProvider';
import { FeatureId } from 'generated/sdk';

const menuMap = {
  ProposalPdfTemplates: '/PdfTemplates/proposal',
  ExperimentSafetyPdfTemplates: '/PdfTemplates/experimentSafety',
  ExperimentSafetyReviewTemplates: '/ExperimentSafetyReviewTemplates',
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
  EmailTemplates: '/EmailTemplates',
};

function EsiTemplatesMenuListItem() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <>
      <Tooltip title="Experiment Safety Input (ESI)">
        <ListItemButton onClick={() => setIsExpanded(!isExpanded)}>
          <ListItemIcon>
            <IconPackIcon icon="ESITemplate" />
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
              <IconPackIcon icon="ESIProposalTemplate" />
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
              <IconPackIcon icon="ESISampleTemplate" />
            </ListItemIcon>
            <ListItemText primary="Sample ESI" title="Sample ESI" />
          </ListItemButton>
        </Tooltip>
      </Collapse>
    </>
  );
}

function PdfTemplatesMenuListItem() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <>
      <Tooltip title="PDF Templates">
        <ListItemButton onClick={() => setIsExpanded(!isExpanded)}>
          <ListItemIcon>
            <IconPackIcon icon="PDFTemplate" />
            {isExpanded ? (
              <ExpandLess fontSize="small" />
            ) : (
              <ExpandMore fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText primary="PDF" />
        </ListItemButton>
      </Tooltip>

      <Collapse
        in={isExpanded}
        timeout="auto"
        unmountOnExit
        style={{ marginLeft: '10px' }}
      >
        <Tooltip title="PDF (Proposal)">
          <ListItemButton
            component={NavLink}
            to={menuMap['ProposalPdfTemplates']}
          >
            <ListItemIcon>
              <IconPackIcon icon="PDFProposalTemplate" />
            </ListItemIcon>
            <ListItemText primary="Proposal" title="Proposal" />
          </ListItemButton>
        </Tooltip>
        <Tooltip title="PDF (Experiment Safety)">
          <ListItemButton
            component={NavLink}
            to={menuMap['ExperimentSafetyPdfTemplates']}
          >
            <ListItemIcon>
              <IconPackIcon icon="PDFExperimentSafetyTemplate" />
            </ListItemIcon>
            <ListItemText
              primary="Experiment Safety"
              title="Experiment Safety"
            />
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
            <IconPackIcon icon="Template" />
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
        <Tooltip title="Experiment Safety Review">
          <ListItemButton
            component={NavLink}
            to={menuMap['ExperimentSafetyReviewTemplates']}
          >
            <ListItemIcon>
              <IconPackIcon icon="ExpSafetyReviewTemplate" />
            </ListItemIcon>
            <ListItemText primary="Exp Safety Review" />
          </ListItemButton>
        </Tooltip>

        <Tooltip title="Proposal">
          <ListItemButton component={NavLink} to={menuMap['ProposalTemplates']}>
            <ListItemIcon>
              <IconPackIcon icon="ProposalTemplate" />
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
              <IconPackIcon icon="FAPReviewTemplate" />
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
              <IconPackIcon icon="TechnicalReviewTemplate" />
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
              <IconPackIcon icon="SampleDeclarationTemplate" />
            </ListItemIcon>
            <ListItemText primary="Sample declaration" />
          </ListItemButton>
        </Tooltip>

        <Tooltip title="Email">
          <ListItemButton component={NavLink} to={menuMap['EmailTemplates']}>
            <ListItemIcon>
              <IconPackIcon icon="EmailTemplate" />
            </ListItemIcon>
            <ListItemText primary="Email" />
          </ListItemButton>
        </Tooltip>

        <Tooltip title="Sub Template">
          <ListItemButton component={NavLink} to={menuMap['GenericTemplates']}>
            <ListItemIcon>
              <IconPackIcon icon="SubTemplate" />
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
                <IconPackIcon icon="ShipmentDeclarationTemplate" />
              </ListItemIcon>
              <ListItemText primary="Shipment declaration" />
            </ListItemButton>
          </Tooltip>
        )}
        {isVisitManagementEnabled && (
          <Tooltip title="Visit registration">
            <ListItemButton component={NavLink} to={menuMap['VisitTemplates']}>
              <ListItemIcon>
                <IconPackIcon icon="VisitRegistrationTemplate" />
              </ListItemIcon>
              <ListItemText primary="Visit registration" />
            </ListItemButton>
          </Tooltip>
        )}

        {isRiskAssessmentFeatureEnabled && <EsiTemplatesMenuListItem />}
        <PdfTemplatesMenuListItem />
        <Tooltip title="Feedback">
          <ListItemButton component={NavLink} to={menuMap['FeedbackTemplates']}>
            <ListItemIcon>
              <IconPackIcon icon="FeedbackTemplate" />
            </ListItemIcon>
            <ListItemText primary="Feedback" />
          </ListItemButton>
        </Tooltip>
      </Collapse>
    </>
  );
}
