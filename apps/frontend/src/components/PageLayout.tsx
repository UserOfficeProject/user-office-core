import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import BottomNavigation from '@mui/material/BottomNavigation';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import parse from 'html-react-parser';
import React, { Suspense, useContext, useEffect } from 'react';

import { UserContext } from 'context/UserContextProvider';
import { CallsFilter, PageName } from 'generated/sdk';
import { useGetPageContent } from 'hooks/admin/useGetPageContent';
import { useCallsData } from 'hooks/call/useCallsData';

import AppToolbar from './AppToolbar/AppToolbar';
import MenuItems from './menu/MenuItems';
import InformationModal from './pages/InformationModal';

type BottomNavItemProps = {
  /** Content of the information modal. */
  text?: string;
  /** Text of the button link in the information modal. */
  linkText?: string;
};

const BottomNavItem = ({ text, linkText }: BottomNavItemProps) => {
  return (
    <InformationModal
      text={text}
      linkText={linkText}
      linkStyle={{
        fontSize: '12px',
        minWidth: 'auto',
        padding: '10px',
      }}
    />
  );
};

const PageLayout = ({
  header,
  children,
}: {
  header: string;
  children: React.ReactNode;
}) => {
  const drawerWidth = 250;
  const theme = useTheme();
  const isTabletOrMobile = useMediaQuery('(max-width: 1224px)');
  const [open, setOpen] = React.useState(
    localStorage.drawerOpen
      ? localStorage.drawerOpen === '1'
      : !isTabletOrMobile
  );

  const { currentRole, isInternalUser } = useContext(UserContext);
  function getDashBoardCallFilter(): CallsFilter {
    return isInternalUser
      ? {
          isActive: true,
          isEnded: false,
          isActiveInternal: true,
        }
      : {
          isActive: true,
          isEnded: false,
        };
  }
  const { calls } = useCallsData(getDashBoardCallFilter());

  const drawer = {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    '.MuiDrawer-paper': {
      width: 'inherit',
    },
  };
  const drawerOpen = () => ({
    width: drawerWidth,
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  });
  const drawerClose = () => ({
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  });

  const handleDrawerOpen = () => {
    localStorage.setItem('drawerOpen', '1');
    setOpen(true);
  };
  const handleDrawerClose = () => {
    localStorage.setItem('drawerOpen', '0');
    setOpen(false);
  };

  useEffect(() => {
    if (isTabletOrMobile) {
      // NOTE: Closing drawer in the next event cycle fixes the bug where drawer cannot be re-opened when switching from desktop to mobile view.
      setTimeout(() => {
        handleDrawerClose();
      });
    } else if (localStorage.getItem('drawerOpen') === '1') {
      handleDrawerOpen();
    }
  }, [isTabletOrMobile]);

  const [, privacyPageContent] = useGetPageContent(PageName.PRIVACYPAGE);
  const [, faqPageContent] = useGetPageContent(PageName.HELPPAGE);
  const [, footerContent] = useGetPageContent(PageName.FOOTERCONTENT);

  return (
    <div className="App">
      <Box component="div" sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppToolbar
          open={open}
          handleDrawerOpen={handleDrawerOpen}
          header={header}
        />
        <Drawer
          variant={isTabletOrMobile ? 'temporary' : 'permanent'}
          sx={{
            ...drawer,
            ...(open && drawerOpen()),
            ...(!open && drawerClose()),
          }}
          open={open}
          onClose={handleDrawerClose}
        >
          <Box
            component="div"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(1),
              ...theme.mixins.toolbar,
              '& .closeDrawer': {
                marginLeft: 'auto',
              },
            }}
          >
            {isTabletOrMobile && (
              <Typography component="h1" variant="h6" color="inherit" noWrap>
                {header}
              </Typography>
            )}
            <IconButton
              aria-label="Close drawer"
              onClick={handleDrawerClose}
              className="closeDrawer"
              data-cy="close-drawer"
            >
              <ChevronLeftIcon />
            </IconButton>
          </Box>
          <Divider />
          <List disablePadding>
            <MenuItems callsData={calls} currentRole={currentRole} />
          </List>
          <Divider />
        </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            height: 'calc(100vh - 64px)',
            marginTop: '64px',
            width: `calc(100% - ${drawerWidth}px)`,
          }}
        >
          <Suspense
            fallback={
              <div
                data-cy="loading"
                style={{
                  display: 'flex',
                  width: '100%',
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                Loading...
              </div>
            }
          >
            {children}
          </Suspense>
          {parse(footerContent)}
          <BottomNavigation
            sx={{
              display: 'flex',
              marginTop: 'auto',
              marginBottom: theme.spacing(2),
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
            }}
          >
            <BottomNavItem
              text={privacyPageContent}
              linkText={'Privacy Statement'}
            />
            <BottomNavItem text={faqPageContent} linkText={'FAQ'} />
            <BottomNavItem />
          </BottomNavigation>
        </Box>
      </Box>
    </div>
  );
};

export default PageLayout;
