'use client';

import { useRouter } from 'next/navigation';
import { Box, Button, Typography } from '@mui/material';

export default function Home() {
  const router = useRouter();

  const handleNavigate = (path) => {
    console.log(`Navigating to: ${path}`);
    try {
      router.push(path);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 2 }}>
      <Typography variant="h4" gutterBottom>
        Selamat Datang di Sistem Informasi Desa
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Pilih dashboard untuk menguji tampilan:
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={() => handleNavigate('/admin/dashboard')}
          sx={{ backgroundColor: '#1a237e', '&:hover': { backgroundColor: '#0d47a1' } }}
        >
          Dashboard Admin
        </Button>
        <Button
          variant="contained"
          onClick={() => handleNavigate('/bendahara/dashboard')}
          sx={{ backgroundColor: '#1a237e', '&:hover': { backgroundColor: '#0d47a1' } }}
        >
          Dashboard Bendahara
        </Button>
        <Button
          variant="contained"
          onClick={() => handleNavigate('/sekretaris/dashboard')}
          sx={{ backgroundColor: '#1a237e', '&:hover': { backgroundColor: '#0d47a1' } }}
        >
          Dashboard Sekretaris
        </Button>
      </Box>
    </Box>
  );
}