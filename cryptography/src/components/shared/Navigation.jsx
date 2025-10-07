import React, { useState } from 'react';
import {
  Paper,
  Tabs,
  Tab,
  Box,
  IconButton,
  Drawer,
  AppBar,
  Toolbar,
  Typography
} from '@mui/material';
import {
  VpnKey,
  Security,
  Menu as MenuIcon,
  Fingerprint,
  Code,
  Https,
  Assignment,
  VpnLock,
  Image,
  Lock,
  Close
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleMenuClick = (newValue) => {
    navigate(newValue);
    setDrawerOpen(false);
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const menuItems = [
    { icon: <VpnKey />, label: "ГОСТ 28147-89", value: "/lab1" },
    { icon: <Security />, label: "СТБ 34.101.31-2011", value: "/lab2" },
    { icon: <Fingerprint />, label: "Криптосистема Рабина", value: "/lab3" },
    { icon: <Code />, label: "Алгоритм Мак-Элиса", value: "/lab4" },
    { icon: <Https />, label: "Хеш-функции", value: "/lab5" },
    { icon: <Assignment />, label: "Цифровая подпись", value: "/lab6" },
    { icon: <VpnLock />, label: "Эллиптические кривые", value: "/lab7" },
    { icon: <Image />, label: "Стенографические методы", value: "/lab8" }
  ];
    const gradient = 'grey';

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: gradient
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open menu"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Криптографические алгоритмы
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 300,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box
          sx={{
            padding: 2,
            background: gradient,
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant="h6">
            Лабораторные работы
          </Typography>
          <IconButton
            color="inherit"
            onClick={toggleDrawer(false)}
            sx={{ color: 'white' }}
          >
            <Close />
          </IconButton>
        </Box>

        <Tabs
          orientation="vertical"
          value={location.pathname}
          sx={{
            width: '100%',
            '& .MuiTab-root': {
              minHeight: 64,
              justifyContent: 'flex-start',
              alignItems: 'center',
              padding: '12px 16px',
              fontSize: '0.875rem',
            },
            '& .Mui-selected': {
              background: gradient,
              color: 'primary.contrastText',
              fontWeight: 'bold'
            },
            '& .MuiTabs-indicator': {
              display: 'none'
            }
          }}
        >
          {menuItems.map((item) => (
            <Tab
              key={item.value}
              icon={item.icon}
              iconPosition="start"
              label={item.label}
              value={item.value}
              onClick={() => handleMenuClick(item.value)}
              sx={{
                '&.Mui-selected': {
                  background: gradient,
                  color: 'white'
                }
              }}
            />
          ))}
        </Tabs>
      </Drawer>
    </>
  );
};

export default Navigation;
