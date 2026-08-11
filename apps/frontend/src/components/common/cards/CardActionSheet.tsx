import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import React from 'react';

export type CardActionSheetItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
};

type CardActionSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  items: CardActionSheetItem[];
};

export default function CardActionSheet({
  open,
  onClose,
  title,
  items,
}: CardActionSheetProps) {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      transitionDuration={reduceMotion ? 0 : undefined}
      slotProps={{
        paper: {
          elevation: 8,
          sx: {
            borderTopLeftRadius: 2,
            borderTopRightRadius: 2,
            paddingBottom: 1.5,
          },
        },
      }}
    >
      <Box
        aria-hidden
        sx={{
          width: 32,
          height: 4,
          borderRadius: 1,
          backgroundColor: 'action.disabled',
          margin: '10px auto',
        }}
      />
      <Typography
        variant="subtitle2"
        sx={{ paddingX: 2.5, paddingY: 1, color: 'text.primary' }}
      >
        {title}
      </Typography>
      <List disablePadding>
        {items.map((item) => (
          <ListItemButton
            key={item.key}
            onClick={() => {
              onClose();
              item.onClick();
            }}
            data-cy={`card-sheet-${item.key}`}
            sx={{
              minHeight: 52,
              paddingX: 2.5,
              color: item.destructive ? 'error.main' : 'text.primary',
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: item.destructive ? 'error.main' : 'action.active',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              slotProps={{ primary: { variant: 'body1' } }}
            />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
