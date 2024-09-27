import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Menu,
  MenuItem,
} from '@mui/material';
import React, { useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

type TableActionsDropdownMenuProps = {
  event: null | HTMLElement;
  handleClose: (option: string) => void;
};

export enum DownloadMenuOption {
  PROPOSAL = 'Proposal(s)',
  ATTACHMENT = 'Attachment(s)',
}

export enum PdfDownloadMenuOption {
  PDF = 'Download as single file',
  ZIP = 'Download as multiple files',
}

type MenuData = {
  data: {
    key: string;
    subMenu: {
      key: string;
    }[];
  };
  handleClose: (option: string) => void;
};

const getMenuItems = (allowMultipleFileDownload = true) => {
  const initialItems = [
    {
      key: DownloadMenuOption.PROPOSAL,
      subMenu: [{ key: PdfDownloadMenuOption.PDF }],
    },
    { key: DownloadMenuOption.ATTACHMENT, subMenu: [] },
  ];

  if (allowMultipleFileDownload) {
    initialItems[0].subMenu.push({ key: PdfDownloadMenuOption.ZIP });
  }

  return initialItems;
};

const MenuItemWithSubMenuAccordion = ({ data, handleClose }: MenuData) => {
  const { key, subMenu } = data || {};

  return (
    <>
      <MenuItem
        id={key}
        onClick={() => {
          if (subMenu.length === 0) {
            handleClose(key);
          }
        }}
      >
        {subMenu.length === 0 ? (
          key
        ) : (
          <Accordion
            elevation={0}
            disableGutters
            sx={{
              backgroundColor: 'transparent',
            }}
          >
            <AccordionSummary
              sx={{
                padding: 0,
                minHeight: 0,
              }}
              classes={{
                content: 'custom-accordion',
              }}
              expandIcon={<ExpandMoreIcon />}
            >
              <span>{key}</span>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                padding: 0,
                margin: 0,
                marginTop: 0,
              }}
            >
              {subMenu.map((subMenuItem) => (
                <MenuItem
                  key={subMenuItem.key}
                  onClick={() => {
                    handleClose(subMenuItem.key);
                  }}
                >
                  {subMenuItem.key}
                </MenuItem>
              ))}
            </AccordionDetails>
          </Accordion>
        )}
      </MenuItem>
    </>
  );
};

const TableActionsDropdownMenu = ({
  event,
  handleClose,
}: TableActionsDropdownMenuProps) => {
  const [anchorElement, setAnchorElement] = React.useState<null | HTMLElement>(
    null
  );
  const [open, setOpen] = React.useState<boolean>(false);
  const [menuItems, setMenuItems] = React.useState(getMenuItems());
  const [searchParams] = useSearchParams();
  const { search } = useLocation();

  useEffect(() => {
    if (searchParams.getAll('selection').length <= 1) {
      setMenuItems(getMenuItems(false));
    } else {
      setMenuItems(getMenuItems());
    }
  }, [search, searchParams]);

  useEffect(() => {
    if (event) {
      setAnchorElement(event);
    }
    setOpen(!!event);
  }, [anchorElement, event, open]);

  return (
    <Menu
      id="basic-menu"
      anchorEl={anchorElement}
      open={open}
      onClose={() => handleClose('close')}
      MenuListProps={{
        'aria-labelledby': 'basic-button',
      }}
      PaperProps={{
        elevation: 0,
        sx: {
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
          mt: 1.5,
          '& .MuiAvatar-root': {
            width: 32,
            height: 32,
            ml: -0.5,
            mr: 1,
          },
          '&:before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            bgcolor: 'background.paper',
            transform: 'translateY(-50%) rotate(45deg)',
            zIndex: 0,
          },
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      {menuItems.map((data, i) => (
        <MenuItemWithSubMenuAccordion
          key={i}
          data={data}
          handleClose={handleClose}
        />
      ))}
    </Menu>
  );
};

export default TableActionsDropdownMenu;
