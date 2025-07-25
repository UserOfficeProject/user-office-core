import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, Paper, Typography } from '@mui/material';
import { styled } from '@mui/system';
import React from 'react';
import { Handle, Position } from 'reactflow';

import { Status } from 'generated/sdk';

const Container = styled(Paper)({
  borderRadius: '15px',
  overflow: 'hidden',
  maxWidth: '200px',
});

const Title = styled('div')(({ theme }) => ({
  background: theme.palette.grey[200],
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '2px 10px 0 10px',
  lineHeight: '1',
}));

const Description = styled('div')({
  display: 'flex',
  alignItems: 'top',
  padding: '10px',
  lineHeight: '1',
  fontSize: '12px',
});

const StyledHandle = styled(Handle)({
  borderRadius: '50%',
  background: '#333',
});

interface StatusNodeProps {
  data: {
    label: string;
    status: Status;
    onDelete: (statusId: string) => void;
  };
  selected: boolean;
}

const StatusNode: React.FC<StatusNodeProps> = ({ data }) => {
  return (
    <>
      <StyledHandle type="target" position={Position.Top} />
      <Container>
        <Title>
          <Typography variant="subtitle2">
            {data.status.name} (id: {data.status.id})
          </Typography>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              data.onDelete(data.status.id.toString());
            }}
            title="Delete status"
          >
            <DeleteIcon fontSize="small" sx={{ color: 'grey' }} />
          </IconButton>
        </Title>
        <Description>
          {data.status.shortCode} {data.status.description}
        </Description>
      </Container>
      <StyledHandle type="source" position={Position.Bottom} />
    </>
  );
};

export default StatusNode;
