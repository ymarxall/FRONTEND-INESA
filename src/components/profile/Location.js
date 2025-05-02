import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  Link,
  Alert
} from "@mui/material";
import {
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const ContactInfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  '& svg': {
    marginRight: theme.spacing(2),
    color: theme.palette.primary.main,
  },
}));

const Location = () => {
  // State untuk formulir dan alert
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [alert, setAlert] = useState({ type: null, message: null });

  // Handler untuk perubahan input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler untuk submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi sederhana
    if (!formData.name || !formData.email || !formData.message) {
      setAlert({ type: "error", message: "Semua kolom harus diisi!" });
      return;
    }

    try {
      const response = await fetch("http://192.168.1.85:8085/api/contact/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setAlert({ type: "success", message: "Pesan berhasil dikirim!" });
        // Reset form setelah sukses
        setFormData({ name: "", email: "", message: "" });
      } else {
        const errorData = await response.json();
        setAlert({ type: "error", message: errorData.message || "Gagal mengirim pesan!" });
      }
    } catch (error) {
      setAlert({ type: "error", message: "Terjadi kesalahan pada server!" });
    }
  };

  return (
    <Box sx={{ py: 8, backgroundColor: '#f9f9f9' }} id="contact">
      <Container maxWidth="lg">
        <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center' }}>
          Lebih dekat dengan kami
        </Typography>

        <Typography variant="body1" paragraph sx={{ textAlign: 'center', maxWidth: '700px', mx: 'auto', mb: 6 }}>
          Jika Anda memiliki pertanyaan, saran, atau ingin mengetahui lebih lanjut tentang Desa Bontomanai,
          silakan hubungi kami melalui informasi di bawah ini.
        </Typography>

        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
              Alamat
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ mb: 4, boxShadow: 2, padding: 2, borderRadius: 1 }}>
              <ContactInfoItem>
                <LocationIcon />
                <Typography>Jl. Pendidikan, Desa Bontomanai, Kec. Rumbia, Kab. Jeneponto, Sulawesi Selatan</Typography>
              </ContactInfoItem>

              <ContactInfoItem>
                <EmailIcon />
                <Typography>
                  <Link href="mailto:kontak@desabontomanai.go.id" color="inherit">
                    kontak@desabontomanai.go.id
                  </Link>
                </Typography>
              </ContactInfoItem>

              <ContactInfoItem>
                <PhoneIcon />
                <Typography>
                  <Link href="tel:+6281234567890" color="inherit">
                    +62 812-3456-7890
                  </Link>
                </Typography>
              </ContactInfoItem>
            </Box>

            <Box>
              <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                Kirim Pesan
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {/* Tampilkan alert jika ada */}
              {alert.message && (
                <Alert
                  severity={alert.type}
                  onClose={() => setAlert({ type: null, message: null })}
                  sx={{ mb: 2 }}
                >
                  {alert.message}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, boxShadow: 2, padding: 2, borderRadius: 1 }}>
                <TextField
                  fullWidth
                  label="Nama Anda"
                  variant="outlined"
                  margin="normal"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  label="Email Anda"
                  variant="outlined"
                  margin="normal"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  label="Pesan Anda"
                  variant="outlined"
                  margin="normal"
                  multiline
                  rows={4}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                />
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  endIcon={<SendIcon />}
                  type="submit"
                  sx={{ mt: 2 }}
                >
                  Kirim Pesan
                </Button>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
              Lokasi Desa
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ mb: 3, borderRadius: 1, boxShadow: 2, padding: 2 }}>
              <Typography variant="h4" gutterBottom>Bontomanai</Typography>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d960.4794164864701!2d119.85046174130524!3d-5.501687762084736!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dbeb51821cd97fb%3A0x2409452f58fb86e0!2sKantor%20desa%20rumbia!5e0!3m2!1sid!2sid!4v1746189286748!5m2!1sid!2sid"
                width="100%"
                height="500"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen=""
                aria-label="Lokasi Desa Bontomanai"
              ></iframe>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Location;