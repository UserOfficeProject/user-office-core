import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

import { WorkflowStatus } from 'generated/sdk';
import withConfirm, { WithConfirmProps } from 'utils/withConfirm';
import { WORKFLOW_INITIAL_STATUSES } from 'utils/workflowInitialStatuses';

const Container = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ theme, selected }) => ({
  borderRadius: '12px',
  overflow: 'hidden',
  width: '300px',
  border: selected
    ? `2px solid ${theme.palette.primary.main}`
    : `1px solid ${theme.palette.divider}`,
  boxShadow: selected
    ? (theme.shadows[8] as string)
    : (theme.shadows[2] as string),
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[4] as string,
  },
}));

const Title = styled('div')(({ theme }) => ({
  background: theme.palette.background.default,
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 12px',
  lineHeight: '1',
}));

const TitleContent = styled('div')({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  flex: 1,
});

const ExpandIcon = styled(ExpandMoreIcon, {
  shouldForwardProp: (prop) => prop !== 'expanded',
})<{ expanded: boolean }>(({ expanded }) => ({
  fontSize: '16px',
  marginRight: '4px',
  transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', // Down when expanded, right when closed
}));

const Description = styled('div', {
  shouldForwardProp: (prop) => prop !== 'expanded',
})<{ expanded: boolean }>(({ expanded }) => ({
  alignItems: 'top',
  padding: expanded ? '10px' : '0 10px',
  lineHeight: '1',
  fontSize: '12px',
  maxHeight: expanded ? '200px' : '0',
  overflow: 'hidden',
  transition: 'max-height 0.3s ease-in-out, padding 0.3s ease-in-out',
  opacity: expanded ? 1 : 0,
}));

const StyledHandle = styled(Handle)(({ theme }) => ({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: theme.palette.primary.light,
  border: `2px solid ${theme.palette.primary.main}`,
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.5)',
  },
}));

const FlexSpan = styled('span')({
  flex: 1,
  display: 'flex',
  justifyContent: 'space-between',
});

const HighlightCount = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.secondary.contrastText,
  borderRadius: '12px',
  padding: '0 6px',
  minWidth: '20px',
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: '8px',
  fontSize: '12px',
  fontWeight: 'bold',
  lineHeight: 1,
}));

const DeleteButton = styled(IconButton)({
  position: 'absolute',
  right: '10px',
  background: '#EEE',
});

const WorkflowStatusId = styled(Typography)({
  padding: '0 10px 10px 10px',
});

const TooltipList = styled('ul')({
  listStyle: 'none',
  padding: 0,
  margin: 0,
});

interface StatusNodeProps extends WithConfirmProps {
  id: string; // Node ID from React Flow
  data: {
    label: string;
    workflowStatus: WorkflowStatus;
    onDelete: (connectionId: string) => void;
    isReadOnly?: boolean;
    highlightCount?: number;
    entityIds?: string[];
  };
  selected: boolean;
}

const StatusNode: React.FC<StatusNodeProps> = ({
  id,
  data,
  confirm,
  selected,
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleToggleExpand = (e: React.MouseEvent) => {
    if (!data.isReadOnly) {
      e.stopPropagation();
      setExpanded(!expanded);
    }
  };

  return (
    <div data-cy={`connection_${data.workflowStatus.statusId}`}>
      <StyledHandle type="target" position={Position.Top} id="top-target" />
      <StyledHandle
        type="target"
        position={Position.Right}
        id="right-target"
        style={{ top: '30%' }}
      />
      <StyledHandle
        type="source"
        position={Position.Right}
        id="right-source"
        style={{ top: '70%' }}
      />
      <Container selected={selected && data.isReadOnly}>
        <Title>
          <TitleContent onClick={handleToggleExpand}>
            {!data.isReadOnly && <ExpandIcon expanded={expanded} />}
            <FlexSpan>
              <Typography
                variant="subtitle1"
                color="textPrimary"
                fontWeight={600}
                fontSize={'14px'}
              >
                {data.workflowStatus.status.name}
              </Typography>
              {data.isReadOnly &&
                !!data.highlightCount &&
                data.highlightCount > 0 && (
                  <Tooltip
                    title={
                      data.entityIds && data.entityIds.length > 0 ? (
                        <TooltipList>
                          {data.entityIds.map((id) => (
                            <li key={id}>
                              <Typography variant="caption">{id}</Typography>
                            </li>
                          ))}
                        </TooltipList>
                      ) : (
                        ''
                      )
                    }
                  >
                    <HighlightCount>{data.highlightCount}</HighlightCount>
                  </Tooltip>
                )}
            </FlexSpan>
          </TitleContent>
          {!data.isReadOnly &&
            WORKFLOW_INITIAL_STATUSES.includes(data.workflowStatus.statusId) ===
              false && (
              <DeleteButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  confirm(
                    () => {
                      data.onDelete(id);
                    },
                    {
                      title: 'Delete status',
                      description: `Are you sure you want to delete the status?`,
                    }
                  )();
                }}
                title="Delete status"
              >
                <DeleteIcon
                  fontSize="small"
                  data-cy="remove-workflow-status-button"
                />
              </DeleteButton>
            )}
        </Title>
        {!data.isReadOnly && (
          <Description expanded={expanded}>
            {data.workflowStatus.status.id}{' '}
            {data.workflowStatus.status.description}
          </Description>
        )}
        {!data.isReadOnly && (
          <WorkflowStatusId
            variant="caption"
            color="textSecondary"
            hidden={!expanded}
          >
            Workflow Status ID: {data.workflowStatus.workflowStatusId}
          </WorkflowStatusId>
        )}

        <StyledHandle
          type="source"
          position={Position.Bottom}
          id="bottom-source"
        />
      </Container>
    </div>
  );
};

export default withConfirm(StatusNode);
