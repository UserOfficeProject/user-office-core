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
import parse from 'html-react-parser';
import React, { Suspense, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { SettingsContext } from 'context/SettingsContextProvider';
import { UserContext } from 'context/UserContextProvider';
import { PageName, SettingsId } from 'generated/sdk';
import { useGetPageContent } from 'hooks/admin/useGetPageContent';
import {
  drawerRailWidth,
  drawerWidth,
  toolbarHeight,
  useIsMobile,
  useIsTabletOrMobile,
} from 'hooks/common/useResponsive';

import AppToolbar from './AppToolbar/AppToolbar';
import MenuItems from './menu/MenuItems';
import InformationModal from './pages/InformationModal';

type BottomNavItemProps = {
  /** Content of the information modal. */
  linkText?: string;
  /** Page to load */
  pageName: PageName;
};

const BottomNavItem = ({ pageName, linkText }: BottomNavItemProps) => {
  return (
    <InformationModal
      pageName={pageName}
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
  const theme = useTheme();
  const isTabletOrMobile = useIsTabletOrMobile();
  const isMobile = useIsMobile();
  const location = useLocation();
  const [open, setOpen] = React.useState(
    localStorage.drawerOpen
      ? localStorage.drawerOpen === '1'
      : !isTabletOrMobile
  );

  const { currentRole } = useContext(UserContext);
  const { settingsMap } = useContext(SettingsContext);

  const toolbar = toolbarHeight(theme);
  const drawer = {
    flexShrink: 0,
    whiteSpace: 'nowrap',
  };
  const menuLabel = {
    transition: theme.transitions.create('opacity', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  };
  const paper = {
    overflowX: 'hidden',
    boxSizing: 'border-box',
    '.MuiListItemText-root': menuLabel,
  };
  const openWidth = {
    width: drawerWidth(theme),
  };
  const closedWidth = {
    width: drawerRailWidth(theme),
  };
  const widthTransition = (duration: number) =>
    theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration,
    });
  const drawerOpen = () => ({
    ...openWidth,
    transition: widthTransition(theme.transitions.duration.enteringScreen),
    '.MuiDrawer-paper': {
      ...paper,
      ...openWidth,
      transition: widthTransition(theme.transitions.duration.enteringScreen),
    },
  });
  const drawerClose = () => ({
    ...closedWidth,
    transition: widthTransition(theme.transitions.duration.leavingScreen),
    '.MuiDrawer-paper': {
      ...paper,
      ...closedWidth,
      transition: widthTransition(theme.transitions.duration.leavingScreen),
      '.MuiListItemText-root': {
        ...menuLabel,
        opacity: 0,
      },
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

  // TODO: these sit directly above the dashboard's sticky section nav on a phone
  // and are easy to hit by accident, so they are suppressed there for now. Where
  // they should live on mobile is still open.
  const showFooterLinks = !(isMobile && location.pathname === '/');
  const displayPrivacyPageLink =
    showFooterLinks &&
    settingsMap.get(SettingsId.DISPLAY_PRIVACY_STATEMENT_LINK)
      ?.settingsValue === 'true';
  const displayFAQLink =
    showFooterLinks &&
    settingsMap.get(SettingsId.DISPLAY_FAQ_LINK)?.settingsValue === 'true';
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
              <Typography
                component="h1"
                variant="h6"
                noWrap
                sx={{
                  color: 'inherit',
                }}
              >
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
          <List disablePadding sx={{ overflowX: 'hidden' }}>
            <MenuItems currentRole={currentRole} />
          </List>
          <Divider />
        </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            marginTop: toolbar,
            height: {
              xs: `calc(100vh - ${toolbar.xs})`,
              sm: `calc(100vh - ${toolbar.sm})`,
            },
            minWidth: 0,
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
            {displayPrivacyPageLink && (
              <BottomNavItem
                pageName={PageName.PRIVACYPAGE}
                linkText={'Privacy Statement'}
              />
            )}
            {displayFAQLink && (
              <BottomNavItem pageName={PageName.HELPPAGE} linkText={'FAQ'} />
            )}
          </BottomNavigation>
        </Box>
      </Box>
    </div>
  );
};

export default PageLayout;
