import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IconButton, Paper, Typography } from '@mui/material';
import { styled } from '@mui/system';
import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

import { Status } from 'generated/sdk';

const Container = styled(Paper)({
  borderRadius: '15px',
  overflow: 'hidden',
  width: '300px',
});

const Title = styled('div')(({ theme }) => ({
  background: theme.palette.grey[200],
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '4px 10px 2px 10px',
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

const StyledHandle = styled(Handle)({
  borderRadius: '50%',
  background: '#333',
});

interface StatusNodeProps {
  id: string; // Node ID from React Flow
  data: {
    label: string;
    status: Status;
    onDelete: (connectionId: string) => void;
  };
  selected: boolean;
}

const StatusNode: React.FC<StatusNodeProps> = ({ id, data }) => {
  const [expanded, setExpanded] = useState(false);

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <div data-cy={`connection_${data.status.name}`}>
      <StyledHandle type="target" position={Position.Top} />
      <Container>
        <Title>
          <TitleContent onClick={handleToggleExpand}>
            <ExpandIcon expanded={expanded} />
            <Typography variant="subtitle1" color="black" fontSize={'13px'}>
              {data.status.name}
            </Typography>
          </TitleContent>
          {data.status.name !== 'DRAFT' && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                data.onDelete(id); // Pass the node ID instead of status ID
              }}
              title="Delete status"
              sx={{
                position: 'absolute',
                right: '10px',
                background: '#EEE',
              }}
            >
              <DeleteIcon
                fontSize="small"
                data-cy="remove-workflow-status-button"
              />
            </IconButton>
          )}
        </Title>
        <Description expanded={expanded}>
          {data.status.shortCode} {data.status.description}
        </Description>
      </Container>
      <StyledHandle type="source" position={Position.Bottom} />
    </div>
  );
};

export default StatusNode;
