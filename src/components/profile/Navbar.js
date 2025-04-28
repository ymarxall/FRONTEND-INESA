'use client'

import React, { useState, useEffect } from 'react';
import { AppBar, Box, Button, Container, IconButton, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import './navbar-styles.css';

const Navbar = () => {
  const pages = [
    { name: 'Home', id: 'home' },
    { name: 'About', id: 'about' },
    { name: 'Gallery', id: 'gallery' },
    { name: 'Contact', id: 'contact' },
  ];
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleNavClick = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    handleCloseNavMenu();
  };

  const handleLogin = () => {
    router.push('/authentication/sign-in');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AppBar
        position="sticky"
        sx={{
          background: 'rgba(2, 132, 199, 0.9)',
          backdropFilter: 'blur(10px)',
          boxShadow: scrolled ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
          height: 56,
          transition: 'box-shadow 0.3s ease',
          zIndex: 1000,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: '56px !important' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img
                src="/image.png"
                alt="Desa Kalukuang Logo"
                style={{ width: 24, height: 24, marginRight: 6 }}
              />
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: 'white', fontSize: '1.25rem' }}
              >
                Desa Kalukuang
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }, justifyContent: 'flex-end' }}>
              <IconButton
                size="medium"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon fontSize="medium" />
              </IconButton>
              <Menu
                anchorEl={anchorElNav}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{ display: { xs: 'block', md: 'none' } }}
              >
                {pages.map((page) => (
                  <MenuItem key={page.name} onClick={() => handleNavClick(page.id)}>
                    <Typography textAlign="center" sx={{ fontSize: '0.875rem' }}>{page.name}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', gap: 1.5 }}>
              {pages.map((page) => (
                <Button
                  key={page.name}
                  onClick={() => handleNavClick(page.id)}
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    borderRadius: '16px',
                    px: 2,
                    py: 0.5,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: '#38bdf8',
                      color: 'white',
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  {page.name}
                </Button>
              ))}
            </Box>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              <Button
                variant="outlined"
                onClick={handleLogin}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  borderRadius: '16px',
                  px: 2,
                  py: 0.5,
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  '&:hover': {
                    bgcolor: '#38bdf8',
                    color: 'white',
                    borderColor: '#38bdf8',
                    transform: 'scale(1.1)',
                  },
                }}
              >
                Login
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </motion.div>
  );
};

export default Navbar;