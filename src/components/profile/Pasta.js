'use client'

import React from 'react';
import { Box, Container, Grid, Typography, Card } from '@mui/material';
import { motion } from 'framer-motion';
import './styles.css';

const Pasta = () => {
  return (
    <Box className="page-background" id="vision" sx={{ py: 6 }}>
      <Container maxWidth="lg">
        <Card sx={{ p: 3, bgcolor: 'background.card', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 4, color: 'text.primary', fontSize: '2.25rem' }}
          >
            Visi dan Misi Desa Kalukuang
          </Typography>
          <Grid container spacing={3} alignItems="flex-start">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
              >
                <Box
                  sx={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '12px',
                    height: '400px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                />
                <Typography variant="body2" className="image-credit" sx={{ mt: 1, fontSize: '0.75rem' }}>
                  Image source: <a href="https://unsplash.com/" target="_blank">Unsplash</a>.
                </Typography>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                <Box sx={{ px: 2 }}>
                  <Typography variant="h5" align="left" gutterBottom sx={{ color: 'text.primary', fontSize: '1.5rem' }}>
                    Visi:
                  </Typography>
                  <Typography variant="body1" align="left" paragraph sx={{ color: 'text.primary', fontSize: '0.875rem' }}>
                    Menjadikan Desa Kalukuang sebagai desa mandiri, inovatif, dan berdaya saing berbasis kearifan lokal serta teknologi.
                  </Typography>
                  <Typography variant="h5" align="left" gutterBottom sx={{ mt: 2, color: 'text.primary', fontSize: '1.5rem' }}>
                    Misi:
                  </Typography>
                  <ul>
                    <li>
                      <Typography variant="body1" align="left" paragraph sx={{ color: 'text.primary', fontSize: '0.875rem' }}>
                        Meningkatkan infrastruktur dan fasilitas umum untuk kesejahteraan masyarakat.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" align="left" paragraph sx={{ color: 'text.primary', fontSize: '0.875rem' }}>
                        Mendorong ekonomi berbasis pertanian, UMKM, dan pariwisata.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" align="left" paragraph sx={{ color: 'text.primary', fontSize: '0.875rem' }}>
                        Memanfaatkan teknologi untuk pelayanan administrasi yang efisien.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" align="left" paragraph sx={{ color: 'text.primary', fontSize: '0.875rem' }}>
                        Mengembangkan program sosial dan pendidikan untuk SDM berkualitas.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" align="left" paragraph sx={{ color: 'text.primary', fontSize: '0.875rem' }}>
                        Melestarikan budaya dan tradisi lokal sebagai identitas desa.
                      </Typography>
                    </li>
                  </ul>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Card>
      </Container>
    </Box>
  );
};

export default Pasta;