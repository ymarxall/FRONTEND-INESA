'use client'

import React from 'react';
import { Box, Container, Grid, Typography, Card } from '@mui/material';
import { motion } from 'framer-motion';
import './styles.css';

const Pizza = () => {
  return (
    <Box className="page-background" id="profile" sx={{ py: 6 }}>
      <Container maxWidth="lg">
        <Card sx={{ p: 3, bgcolor: 'background.card', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 4, color: 'text.primary', fontSize: '2.25rem' }}
          >
            Profil Desa
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
                    backgroundImage: 'url(https://unsplash.com/photos/man-in-orange-shirt-riding-red-and-black-mountain-bike-on-green-grass-field-during-daytime-n9AUNCuGy6A)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '12px',
                    height: '400px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                />
                <Typography variant="body2" className="image-credit" sx={{ mt: 1, fontSize: '0.75rem' }}>
                   <a href="https://unsplash.com/" target="_blank"></a>.
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
                  <Typography variant="h4" align="left" gutterBottom sx={{ color: 'text.primary', fontSize: '1.75rem' }}>
                    Desa Kalukuang
                  </Typography>
                  <Typography variant="body1" align="left" paragraph sx={{ color: 'text.primary', fontSize: '0.875rem' }}>
                    <strong>Desa Kalukuang</strong> merupakan salah satu desa yang terletak di Kecamatan Bangkala, Kabupaten Jeneponto, Sulawesi Selatan. Desa ini dikenal dengan suasana pedesaan yang asri, dihiasi hamparan sawah dan kebun yang membentang luas. Masyarakat di Kalukuang hidup dengan budaya gotong royong yang masih sangat kental, menjadikan desa ini tidak hanya kaya secara alamiah, tetapi juga dalam nilai-nilai sosialnya. Selain itu, posisi geografis Kalukuang yang cukup strategis memudahkan akses ke berbagai wilayah sekitar di Jeneponto.
                  </Typography>
                  <Typography variant="body1" align="left" paragraph sx={{ color: 'text.primary', fontSize: '0.875rem' }}>
                    Mayoritas penduduk Desa Kalukuang bermata pencaharian sebagai petani dan peternak. Komoditas utama yang dihasilkan dari desa ini antara lain padi, jagung, dan berbagai hasil perkebunan seperti pisang dan kelapa. Di bidang peternakan, sapi dan kambing menjadi hewan ternak yang cukup banyak dipelihara. Selain bertani dan beternak, beberapa warga juga mengembangkan usaha kecil seperti kerajinan tangan dan perdagangan hasil bumi, yang membantu meningkatkan perekonomian desa.
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Card>
      </Container>
    </Box>
  );
};

export default Pizza;