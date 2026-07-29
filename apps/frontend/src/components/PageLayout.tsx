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

import { SettingsContext } from 'context/SettingsContextProvider';
import { UserContext } from 'context/UserContextProvider';
import { PageName, SettingsId } from 'generated/sdk';
import { useGetPageContent } from 'hooks/admin/useGetPageContent';
import {
  DRAWER_WIDTH,
  TOOLBAR_HEIGHT_SM,
  TOOLBAR_HEIGHT_XS,
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
  const drawerWidth = DRAWER_WIDTH;
  const theme = useTheme();
  const isTabletOrMobile = useIsTabletOrMobile();
  const [open, setOpen] = React.useState(
    localStorage.drawerOpen
      ? localStorage.drawerOpen === '1'
      : !isTabletOrMobile
  );

  const { currentRole } = useContext(UserContext);
  const { settingsMap } = useContext(SettingsContext);

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
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  });
  const drawerClose = () => ({
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

  const displayPrivacyPageLink =
    settingsMap.get(SettingsId.DISPLAY_PRIVACY_STATEMENT_LINK)
      ?.settingsValue === 'true';
  const displayFAQLink =
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
            // The AppBar is 56px tall below `sm` and 64px from `sm` up, so the
            // previous hardcoded 64px offset left an 8px gap on phones.
            marginTop: {
              xs: `${TOOLBAR_HEIGHT_XS}px`,
              sm: `${TOOLBAR_HEIGHT_SM}px`,
            },
            height: {
              xs: `calc(100vh - ${TOOLBAR_HEIGHT_XS}px)`,
              sm: `calc(100vh - ${TOOLBAR_HEIGHT_SM}px)`,
            },
            // `flexGrow: 1` already claims the remaining row space. The previous
            // fixed `calc(100% - 250px)` assumed the drawer was always expanded,
            // so the collapsed drawer left dead space on the right. `minWidth: 0`
            // lets the flex item shrink instead of overflowing on narrow screens.
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
