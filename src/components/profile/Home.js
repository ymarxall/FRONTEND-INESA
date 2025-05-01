'use client'

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Card,
  Grid,
  Divider,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { Description as DescriptionIcon, Send as SendIcon, Close as CloseIcon } from '@mui/icons-material';
import './styles.css';

const Home = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    nik: '',
    fullName: '',
    birthDate: '',
    gender: '',
    nationality: '',
    phone: '',
    education: '',
    occupation: '',
    religion: '',
    maritalStatus: '',
    address: '',
    letterType: '',
    purpose: '',
    submissionDate: '',
    document: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success',
  });

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // Fetch data warga berdasarkan NIK
  const fetchWargaByNIK = async (nik) => {
    if (!nik || !validateNIK(nik)) return;
    try {
      const response = await fetch(`http://localhost:8080/api/warga/nik/${nik}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const result = await response.json();
      if (response.ok && result.data) {
        setFormData((prev) => ({
          ...prev,
          nik: result.data.nik || '',
          fullName: result.data.nama_lengkap || '',
          birthDate: result.data.tanggal_lahir || '',
          gender: result.data.jenis_kelamin || '',
          nationality: result.data.kewarganegaraan === 'WNI' || result.data.kewarganegaraan === 'WNA' 
            ? result.data.kewarganegaraan 
            : '',
          phone: result.data.no_hp || '',
          education: result.data.pendidikan || '',
          occupation: result.data.pekerjaan || '',
          religion: result.data.agama || '',
          maritalStatus: result.data.status_pernikahan || '',
          address: result.data.alamat || '',
        }));
        setNotification({
          open: true,
          message: 'Data warga ditemukan dan diisi otomatis',
          type: 'success',
        });
      } else {
        setNotification({
          open: true,
          message: result.message || 'Data warga tidak ditemukan',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error fetching warga:', error);
      setNotification({
        open: true,
        message: 'Terjadi kesalahan saat mengambil data warga',
        type: 'error',
      });
    } finally {
      setTimeout(() => setNotification({ open: false, message: '', type: 'success' }), 3000);
    }
  };

  // Trigger fetch saat NIK berubah
  useEffect(() => {
    if (formData.nik.length >= 16) {
      fetchWargaByNIK(formData.nik);
    }
  }, [formData.nik]);

  const validatePhoneNumber = (phone) => {
    return phone.startsWith('08') || phone.startsWith('+62');
  };

  const validateName = (name) => {
    return !/\d/.test(name);
  };

  const validateSpecialCharacters = (input) => {
    const regex = /^[a-zA-Z0-9\s-]*$/;
    return regex.test(input);
  };

  const validateNIK = (nik) => {
    const regex = /^\d+$/;
    return regex.test(nik);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setNotification({ open: false, message: '', type: 'success' });

    // Validasi NIK hanya boleh mengandung angka
    if (!validateNIK(formData.nik) || formData.nik.length !== 16) {
      setNotification({
        open: true,
        message: 'NIK hanya boleh mengandung angka dan harus 16 digit',
        type: 'error',
      });
      setIsLoading(false);
      return;
    }

    // Validasi NIK tidak boleh mengandung karakter khusus
    if (!validateSpecialCharacters(formData.nik)) {
      setNotification({
        open: true,
        message: 'NIK tidak boleh mengandung karakter khusus',
        type: 'error',
      });
      setIsLoading(false);
      return;
    }

    // Validasi nama tidak boleh mengandung angka atau karakter khusus
    if (!validateName(formData.fullName)) {
      setNotification({
        open: true,
        message: 'Nama tidak boleh mengandung angka',
        type: 'error',
      });
      setIsLoading(false);
      return;
    }

    if (!validateSpecialCharacters(formData.fullName)) {
      setNotification({
        open: true,
        message: 'Nama tidak boleh mengandung karakter khusus',
        type: 'error',
      });
      setIsLoading(false);
      return;
    }

    // Validasi nomor telepon
    if (!validatePhoneNumber(formData.phone)) {
      setNotification({
        open: true,
        message: 'Nomor telepon harus dimulai dengan 08 atau +62',
        type: 'error',
      });
      setIsLoading(false);
      return;
    }

    // Validasi file
    if (formData.document && formData.document.size > 10 * 1024 * 1024) {
      setNotification({
        open: true,
        message: 'Ukuran file tidak boleh lebih dari 10MB',
        type: 'error',
      });
      setIsLoading(false);
      return;
    }

    const allowedFileTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (formData.document && !allowedFileTypes.includes(formData.document.type)) {
      setNotification({
        open: true,
        message: 'Format file tidak didukung. Harap unggah file PDF, JPG, atau PNG.',
        type: 'error',
      });
      setIsLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('nik', formData.nik);
    formDataToSend.append('nama_lengkap', formData.fullName);
    formDataToSend.append('alamat', formData.address);
    formDataToSend.append('jenis_surat', formData.letterType);
    formDataToSend.append('keterangan', formData.purpose);
    formDataToSend.append('no_hp', formData.phone);
    if (formData.document) {
      formDataToSend.append('file_upload', formData.document);
    }

    try {
      const response = await fetch('http://localhost:8085/api/warga/register', {
        method: 'POST',
        body: formDataToSend,
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const textResponse = await response.text();
        console.error('Error response:', textResponse);

        let errorMessage = 'Terjadi kesalahan pada server';
        try {
          const errorResponse = JSON.parse(textResponse);
          errorMessage = errorResponse.message || errorMessage;
        } catch (jsonError) {
          errorMessage = textResponse || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Success:', result);
      setNotification({
        open: true,
        message: 'Pengajuan surat berhasil dikirim!',
        type: 'success',
      });
      handleCloseDialog();
      // Reset form setelah sukses
      setFormData({
        nik: '',
        fullName: '',
        birthDate: '',
        gender: '',
        nationality: '',
        phone: '',
        education: '',
        occupation: '',
        religion: '',
        maritalStatus: '',
        address: '',
        letterType: '',
        purpose: '',
        submissionDate: '',
        document: null,
      });
    } catch (error) {
      console.error('Error:', error);
      setNotification({
        open: true,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengirim pengajuan surat.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setNotification({ open: false, message: '', type: 'success' }), 3000);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ open: false, message: '', type: 'success' });
  };

  return (
    <Box className="page-background" id="home" sx={{ py: 6 }}>
      <Container maxWidth="lg">
        <Box
          className="content home-content"
          sx={{
            minHeight: '70vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box className="left-content" sx={{ textAlign: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <Typography
                variant="h3"
                sx={{ fontWeight: 'bold', color: 'white', mb: 3, textShadow: '2px 2px 4px rgba(0,0,0,0.5)', fontSize: '2.25rem' }}
              >
                <TypeAnimation
                  sequence={[
                    'Selamat Datang di ',
                    1000,
                    'Selamat Datang di Website Profil ',
                    1000,
                    'Selamat Datang di Website Profil Desa ',
                    1000,
                    'Selamat Datang di Website Profil Desa Kalukuang',
                    2000,
                  ]}
                  wrapper="span"
                  speed={50}
                  style={{
                    display: 'inline-block',
                    color: '#0284c7',
                  }}
                  repeat={Infinity}
                />
              </Typography>
              <Button
                variant="contained"
                size="medium"
                onClick={handleOpenDialog}
                sx={{
                  fontSize: '0.875rem',
                  px: 4,
                  py: 1,
                  bgcolor: 'primary.main',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  '&:hover': {
                    bgcolor: 'primary.light',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                Ajukan Surat
              </Button>
            </motion.div>
          </Box>
        </Box>
      </Container>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '12px', maxWidth: '800px', minHeight: '600px', border: '2px solid #0284c7' } }}
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DescriptionIcon sx={{ mr: 1, fontSize: 24 }} />
            <Typography variant="h5" component="div" sx={{ fontSize: '1.5rem' }}>
              Form Pengajuan Surat
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'background.paper', pt: 3, pb: 3 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ p: 3, bgcolor: 'background.card', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontSize: '0.875rem' }}>
                Silakan isi form berikut untuk mengajukan surat di kantor desa. Pastikan data yang diisi lengkap dan benar.
              </Typography>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <TextField
                        label="NIK (Nomor Induk Kependudukan)"
                        name="nik"
                        value={formData.nik}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        size="small"
                        inputProps={{ maxLength: 16 }}
                        InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                        InputProps={{ style: { fontSize: '0.875rem' } }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                        Contoh: 1234567890123456
                      </Typography>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <TextField
                        label="Nama Lengkap"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        size="small"
                        InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                        InputProps={{ style: { fontSize: '0.875rem' } }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                        Contoh: John Doe
                      </Typography>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <TextField
                        label="Tanggal Lahir"
                        name="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        size="small"
                        InputLabelProps={{ shrink: true, style: { fontSize: '0.875rem' } }}
                        InputProps={{ style: { fontSize: '0.875rem' } }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                        Contoh: 1990-01-01
                      </Typography>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel sx={{ fontSize: '0.875rem' }}>Jenis Kelamin</InputLabel>
                      <Select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        label="Jenis Kelamin"
                        required
                        size="small"
                        sx={{ fontSize: '0.875rem' }}
                      >
                        <MenuItem value="Laki-laki">Laki-laki</MenuItem>
                        <MenuItem value="Perempuan">Perempuan</MenuItem>
                      </Select>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                        Contoh: Laki-laki
                      </Typography>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel sx={{ fontSize: '0.875rem' }}>Kewarganegaraan</InputLabel>
                      <Select
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleInputChange}
                        label="Kewarganegaraan"
                        required
                        size="small"
                        sx={{ fontSize: '0.875rem' }}
                      >
                        <MenuItem value="WNI">WNI</MenuItem>
                        <MenuItem value="WNA">WNA</MenuItem>
                      </Select>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                        Contoh: WNI
                      </Typography>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <TextField
                        label="Nomor Telepon"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        type="tel"
                        size="small"
                        InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                        InputProps={{ style: { fontSize: '0.875rem' } }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                        Contoh: +6281234567890
                      </Typography>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel sx={{ fontSize: '0.875rem' }}>Pendidikan</InputLabel>
                      <Select
                        name="education"
                        value={formData.education}
                        onChange={handleInputChange}
                        label="Pendidikan"
                        required
                        size="small"
                        sx={{ fontSize: '0.875rem' }}
                      >
                        <MenuItem value="SD">SD</MenuItem>
                        <MenuItem value="SMP">SMP</MenuItem>
                        <MenuItem value="SMA">SMA/SMK</MenuItem>
                        <MenuItem value="D3">D3</MenuItem>
                        <MenuItem value="S1">S1</MenuItem>
                        <MenuItem value="S2">S2</MenuItem>
                        <MenuItem value="S3">S3</MenuItem>
                      </Select>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                        Contoh: SMA
                      </Typography>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <TextField
                        label="Pekerjaan"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        size="small"
                        InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                        InputProps={{ style: { fontSize: '0.875rem' } }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                        Contoh: Petani
                      </Typography>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel sx={{ fontSize: '0.875rem' }}>Agama</InputLabel>
                      <Select
                        name="religion"
                        value={formData.religion}
                        onChange={handleInputChange}
                        label="Agama"
                        required
                        size="small"
                        sx={{ fontSize: '0.875rem' }}
                      >
                        <MenuItem value="Islam">Islam</MenuItem>
                        <MenuItem value="Kristen">Kristen</MenuItem>
                        <MenuItem value="Katolik">Katolik</MenuItem>
                        <MenuItem value="Hindu">Hindu</MenuItem>
                        <MenuItem value="Buddha">Buddha</MenuItem>
                        <MenuItem value="Konghucu">Konghucu</MenuItem>
                      </Select>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                        Contoh: Islam
                      </Typography>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel sx={{ fontSize: '0.875rem' }}>Status Pernikahan</InputLabel>
                      <Select
                        name="maritalStatus"
                        value={formData.maritalStatus}
                        onChange={handleInputChange}
                        label="Status Pernikahan"
                        required
                        size="small"
                        sx={{ fontSize: '0.875rem' }}
                      >
                        <MenuItem value="Belum Menikah">Belum Menikah</MenuItem>
                        <MenuItem value="Menikah">Menikah</MenuItem>
                        <MenuItem value="Duda">Duda</MenuItem>
                        <MenuItem value="Janda">Janda</MenuItem>
                      </Select>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                        Contoh: Menikah
                      </Typography>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                      <TextField
                        label="Alamat Lengkap"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        multiline
                        rows={2}
                        size="small"
                        InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                        InputProps={{ style: { fontSize: '0.875rem' } }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                        Contoh: Jl. Raya Kalukuang No. 12, Kec. Bangkala
                      </Typography>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel sx={{ fontSize: '0.875rem' }}>Jenis Pengurusan Surat</InputLabel>
                      <Select
                        name="letterType"
                        value={formData.letterType}
                        onChange={handleInputChange}
                        label="Jenis Pengurusan Surat"
                        required
                        size="small"
                        sx={{ fontSize: '0.875rem' }}
                      >
                        <MenuItem value="Surat Keterangan Domisili">Surat Keterangan Domisili</MenuItem>
                        <MenuItem value="Surat Keterangan Tidak Mampu">Surat Keterangan Tidak Mampu</MenuItem>
                        <MenuItem value="Surat Keterangan Usaha">Surat Keterangan Usaha</MenuItem>
                        <MenuItem value="Surat Keterangan Kelahiran">Surat Keterangan Kelahiran</MenuItem>
                        <MenuItem value="Surat Keterangan Kematian">Surat Keterangan Kematian</MenuItem>
                        <MenuItem value="Surat Pengantar Nikah">Surat Pengantar Nikah</MenuItem>
                      </Select>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                        Contoh: Surat Keterangan Domisili
                      </Typography>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <TextField
                        label="Tanggal Pengajuan"
                        name="submissionDate"
                        type="date"
                        value={formData.submissionDate}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        size="small"
                        InputLabelProps={{ shrink: true, style: { fontSize: '0.875rem' } }}
                        InputProps={{ style: { fontSize: '0.875rem' } }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                        Contoh: 2025-04-28
                      </Typography>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                      <TextField
                        label="Upload Dokumen (KTP/KK)"
                        name="document"
                        type="file"
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                        InputLabelProps={{ shrink: true, style: { fontSize: '0.875rem' } }}
                        InputProps={{ style: { fontSize: '0.875rem' } }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                        Contoh: ktp_john_doe.pdf (maks. 10MB)
                      </Typography>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                      <TextField
                        label="Keterangan / Alasan Pengajuan Surat"
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        multiline
                        rows={3}
                        size="small"
                        InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                        InputProps={{ style: { fontSize: '0.875rem' } }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                        Contoh: Untuk keperluan administrasi domisili di kantor kecamatan
                      </Typography>
                    </FormControl>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
                  <Button
                    onClick={handleCloseDialog}
                    variant="outlined"
                    sx={{ borderRadius: '8px', padding: '8px 16px', fontSize: '0.875rem' }}
                    disabled={isLoading}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    variant="contained"
                    endIcon={<SendIcon fontSize="small" />}
                    sx={{ borderRadius: '8px', padding: '8px 16px', fontSize: '0.875rem' }}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Mengirim...' : 'Kirim Pengajuan'}
                  </Button>
                </Box>
              </form>
            </Card>
          </motion.div>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.type}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Home;