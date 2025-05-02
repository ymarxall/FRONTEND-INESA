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
  CircularProgress,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { Description as DescriptionIcon, Send as SendIcon, Close as CloseIcon } from '@mui/icons-material';
import './styles.css';
import { API_ENDPOINTS, getHeaders } from '@/config/api';

const Notification = ({ pesan, tipe, onTutup }) => {
  useEffect(() => {
    const timer = setTimeout(onTutup, 3000);
    return () => clearTimeout(timer);
  }, [onTutup]);

  const getBackgroundColor = () => {
    switch (tipe) {
      case 'sukses': return '#10b981'; // Hijau sukses
      case 'error': return '#ef4444'; // Merah error
      case 'peringatan': return '#f59e0b'; // Kuning peringatan
      default: return '#10b981';
    }
  };

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        backgroundColor: getBackgroundColor(),
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '400px',
        width: '90%',
      }}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 120 }}
      role="alert"
    >
      <Typography variant="body1" fontWeight="medium">{pesan}</Typography>
      <IconButton onClick={onTutup} sx={{ color: 'white', '&:hover': { color: '#d1d5db' } }}>
        <CloseIcon fontSize="medium" />
      </IconButton>
    </motion.div>
  );
};

const Home = () => {
  const initialFormData = {
    nik: '',
    nama_lengkap: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    agama: '',
    pekerjaan: '',
    alamat: '',
    pendidikan: '',
    kewarganegaraan: 'WNI',
    jenis_surat: '',
    penghasilan: '',
    status_pernikahan: '',
    lama_tinggal: '',
    nama_usaha: '',
    jenis_usaha: '',
    alamat_usaha: '',
    alamat_tujuan: '',
    alasan_pindah: '',
    keperluan_pindah: '',
    tujuan_pindah: '',
    nama_ayah: '',
    nama_ibu: '',
    nomor_hp: '',
    tujuan_surat: '',
    tgl_kematian: '',
    penyebab_kematian: '',
  };

  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [sedangMencariNIK, setSedangMencariNIK] = useState(false);
  const [notifikasi, setNotifikasi] = useState(null);
  const [nikTerdaftar, setNikTerdaftar] = useState(undefined);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData(initialFormData);
    setNikTerdaftar(undefined);
    setNotifikasi(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateNIK = (nik) => /^\d{16}$/.test(nik);

  const validateForm = (data) => {
    if (!data.jenis_surat) return 'Jenis surat harus dipilih';
    if (data.jenis_surat === 'Kelahiran') {
      const requiredFields = ['nama_ayah', 'nama_ibu', 'tujuan_surat'];
      for (const field of requiredFields) {
        if (!data[field]) return `Kolom ${field.replace('_', ' ')} harus diisi`;
      }
      return null;
    }
    const requiredFields = [
      'nik', 'nama_lengkap', 'tempat_lahir', 'tanggal_lahir', 'jenis_kelamin',
      'agama', 'pekerjaan', 'alamat', 'jenis_surat'
    ];
    if (data.jenis_surat === 'Domisili') {
      requiredFields.push('status_pernikahan', 'lama_tinggal');
    } else if (data.jenis_surat === 'SKTM') {
      requiredFields.push('penghasilan');
    } else if (data.jenis_surat === 'Usaha') {
      requiredFields.push('nama_usaha', 'jenis_usaha', 'alamat_usaha');
    } else if (data.jenis_surat === 'Pindah') {
      requiredFields.push('alamat_tujuan', 'alasan_pindah', 'keperluan_pindah', 'tujuan_pindah');
    } else if (data.jenis_surat === 'Kematian') {
      requiredFields.push('tgl_kematian', 'penyebab_kematian', 'tujuan_surat');
    }
    for (const field of requiredFields) {
      if (!data[field]) return `Kolom ${field.replace('_', ' ')} harus diisi`;
    }
    if (data.nik && !validateNIK(data.nik)) return 'NIK harus 16 digit angka';
    if (data.lama_tinggal && Number(data.lama_tinggal) < 6) return 'Lama tinggal minimal 6 bulan';
    if (data.penghasilan && Number(data.penghasilan) < 0) return 'Penghasilan tidak boleh negatif';
    if (data.tanggal_lahir) {
      const today = new Date();
      const birthDate = new Date(data.tanggal_lahir);
      if (birthDate > today) return 'Tanggal lahir tidak boleh di masa depan';
    }
    if (data.tgl_kematian) {
      const today = new Date();
      const deathDate = new Date(data.tgl_kematian);
      if (deathDate > today) return 'Tanggal kematian tidak boleh di masa depan';
    }
    return null;
  };

  const searchDataByNIK = async (nik) => {
    if (!nik || !validateNIK(nik)) {
      setNotifikasi({ pesan: 'NIK harus 16 digit angka', tipe: 'error' });
      setNikTerdaftar(false);
      return;
    }
    setSedangMencariNIK(true);
    try {
      const response = await fetch(`http://192.168.1.85:8080/api/request/warga/${nik}`);
      const responseText = await response.text();
      if (!response.ok) {
        if (response.status === 404) {
          setNikTerdaftar(false);
          setNotifikasi({
            pesan: 'Data warga tidak ditemukan, silakan isi manual',
            tipe: 'peringatan'
          });
          return;
        }
        let errorMessage = `Gagal mengambil data: ${response.statusText}`;
        try {
          const errorData = JSON.parse(responseText);
          if (errorData?.message) errorMessage = errorData.message;
        } catch {
          if (responseText) errorMessage += ` - ${responseText}`;
        }
        throw new Error(errorMessage);
      }
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (error) {
        console.error('Failed to parse response:', responseText);
        throw new Error('Format data dari server tidak valid');
      }
      setFormData((prev) => ({
        ...prev,
        nik: result.nik || prev.nik,
        nama_lengkap: result.nama_lengkap || prev.nama_lengkap,
        tempat_lahir: result.tempat_lahir || prev.tempat_lahir,
        tanggal_lahir: result.tanggal_lahir || prev.tanggal_lahir,
        jenis_kelamin: result.jenis_kelamin || prev.jenis_kelamin,
        agama: result.agama || prev.agama,
        pekerjaan: result.pekerjaan || prev.pekerjaan,
        alamat: result.alamat || prev.alamat,
        pendidikan: result.pendidikan || prev.pendidikan,
        kewarganegaraan: result.kewarganegaraan || prev.kewarganegaraan,
        penghasilan: result.penghasilan ? String(result.penghasilan) : prev.penghasilan,
        lama_tinggal: result.lama_tinggal ? String(result.lama_tinggal) : prev.lama_tinggal,
        status_pernikahan: result.status_pernikahan || prev.status_pernikahan,
        nama_usaha: result.nama_usaha || prev.nama_usaha,
        jenis_usaha: result.jenis_usaha || prev.jenis_usaha,
        alamat_usaha: result.alamat_usaha || prev.alamat_usaha,
        alamat_tujuan: result.alamat_tujuan || prev.alamat_tujuan,
        alasan_pindah: result.alasan_pindah || prev.alasan_pindah,
        keperluan_pindah: result.keperluan_pindah || prev.keperluan_pindah,
        tujuan_pindah: result.tujuan_pindah || prev.tujuan_pindah,
        nama_ayah: result.nama_ayah || prev.nama_ayah,
        nama_ibu: result.nama_ibu || prev.nama_ibu,
        nomor_hp: result.nomor_hp || prev.nomor_hp,
        tujuan_surat: result.tujuan_surat || prev.tujuan_surat,
        tgl_kematian: result.tanggal_kematian || prev.tgl_kematian,
        penyebab_kematian: result.penyebab_kematian || prev.penyebab_kematian,
      }));
      setNikTerdaftar(true);
      setNotifikasi({
        pesan: 'Data warga ditemukan. Silakan lengkapi data yang belum terisi',
        tipe: 'sukses'
      });
    } catch (error) {
      setNikTerdaftar(false);
      setNotifikasi({
        pesan: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil data',
        tipe: 'error'
      });
    } finally {
      setSedangMencariNIK(false);
    }
  };

  useEffect(() => {
    if (formData.jenis_surat === 'Kelahiran') {
      setFormData((prev) => ({
        ...initialFormData,
        jenis_surat: prev.jenis_surat,
        nama_ayah: prev.nama_ayah,
        nama_ibu: prev.nama_ibu,
        nomor_hp: prev.nomor_hp,
        tujuan_surat: prev.tujuan_surat,
      }));
      setNikTerdaftar(undefined);
      return;
    }
    const timer = setTimeout(() => {
      if (formData.nik && formData.nik.length === 16 && validateNIK(formData.nik)) {
        searchDataByNIK(formData.nik);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.nik, formData.jenis_surat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSedangMemuat(true);
    try {
      const validationError = validateForm(formData);
      if (validationError) {
        throw new Error(validationError);
      }
      const dataToSend = {
        nik: formData.jenis_surat === 'Kelahiran' ? undefined : formData.nik,
        nama_lengkap: formData.jenis_surat === 'Kelahiran' ? undefined : formData.nama_lengkap,
        tempat_lahir: formData.jenis_surat === 'Kelahiran' ? undefined : formData.tempat_lahir,
        tanggal_lahir: formData.jenis_surat === 'Kelahiran' ? undefined : formData.tanggal_lahir,
        jenis_kelamin: formData.jenis_surat === 'Kelahiran' ? undefined : formData.jenis_kelamin,
        agama: formData.jenis_surat === 'Kelahiran' ? undefined : formData.agama,
        pekerjaan: formData.jenis_surat === 'Kelahiran' ? undefined : formData.pekerjaan,
        alamat: formData.jenis_surat === 'Kelahiran' ? undefined : formData.alamat,
        pendidikan: formData.jenis_surat === 'Kelahiran' ? undefined : formData.pendidikan,
        kewarganegaraan: formData.jenis_surat === 'Kelahiran' ? undefined : formData.kewarganegaraan,
        jenis_surat: formData.jenis_surat,
        penghasilan: formData.penghasilan || undefined,
        status_pernikahan: formData.status_pernikahan || undefined,
        lama_tinggal: formData.lama_tinggal || undefined,
        nama_usaha: formData.nama_usaha || undefined,
        jenis_usaha: formData.jenis_usaha || undefined,
        alamat_usaha: formData.alamat_usaha || undefined,
        alamat_tujuan: formData.alamat_tujuan || undefined,
        alasan_pindah: formData.alasan_pindah || undefined,
        keperluan_pindah: formData.keperluan_pindah || undefined,
        tujuan_pindah: formData.tujuan_pindah || undefined,
        nama_ayah: formData.nama_ayah || undefined,
        nama_ibu: formData.nama_ibu || undefined,
        nomor_hp: formData.nomor_hp || undefined,
        tujuan_surat: formData.tujuan_surat || undefined,
        tanggal_kematian: formData.tgl_kematian || undefined,
        penyebab_kematian: formData.penyebab_kematian || undefined,
      };
      const response = await fetch(API_ENDPOINTS.SEKRETARIS.PERMOHONAN_SURAT_ADD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      const responseText = await response.text();
      if (!response.ok) {
        let errorMessage = `Gagal mengajukan surat (${response.status}): ${response.statusText}`;
        try {
          const errorData = JSON.parse(responseText);
          if (errorData?.message) errorMessage = errorData.message;
        } catch {
          if (responseText) errorMessage += ` - ${responseText}`;
        }
        throw new Error(errorMessage);
      }
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (error) {
        console.error('Failed to parse response:', responseText);
        throw new Error('Format data dari server tidak valid');
      }
      if (!result || typeof result !== 'object') {
        throw new Error('Struktur data dari server tidak valid');
      }
      setNotifikasi({
        pesan: result.message || 'Pengajuan surat berhasil dikirim!',
        tipe: 'sukses'
      });
      setFormData({
        ...initialFormData,
        nik: formData.jenis_surat === 'Kelahiran' ? '' : formData.nik,
      });
      setNikTerdaftar(undefined);
      handleCloseDialog();
    } catch (error) {
      setNotifikasi({
        pesan: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengirim data',
        tipe: 'error'
      });
    } finally {
      setSedangMemuat(false);
    }
  };

  const renderAdditionalFields = () => {
    switch (formData.jenis_surat) {
      case 'SKTM':
        return (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <TextField
                label="Penghasilan Per Bulan (Rp)"
                name="penghasilan"
                type="number"
                value={formData.penghasilan}
                onChange={handleInputChange}
                required
                variant="outlined"
                size="small"
                InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                InputProps={{ style: { fontSize: '0.875rem' } }}
                inputProps={{ min: 0 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                Contoh: 1000000
              </Typography>
            </FormControl>
          </Grid>
        );
      case 'Domisili':
        return (
          <>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel sx={{ fontSize: '0.875rem' }}>Status Pernikahan</InputLabel>
                <Select
                  name="status_pernikahan"
                  value={formData.status_pernikahan}
                  onChange={handleInputChange}
                  label="Status Pernikahan"
                  required
                  size="small"
                  sx={{ fontSize: '0.875rem' }}
                >
                  <MenuItem value="">Pilih status</MenuItem>
                  <MenuItem value="Belum Menikah">Belum Menikah</MenuItem>
                  <MenuItem value="Menikah">Menikah</MenuItem>
                  <MenuItem value="Cerai Mati">Cerai Mati</MenuItem>
                  <MenuItem value="Cerai Hidup">Cerai Hidup</MenuItem>
                </Select>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                  Contoh: Menikah
                </Typography>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Lama Tinggal (bulan)"
                  name="lama_tinggal"
                  type="number"
                  value={formData.lama_tinggal}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                  InputProps={{ style: { fontSize: '0.875rem' } }}
                  inputProps={{ min: 6 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                  Minimum 6 bulan
                </Typography>
              </FormControl>
            </Grid>
          </>
        );
      case 'Usaha':
        return (
          <>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Nama Usaha"
                  name="nama_usaha"
                  value={formData.nama_usaha}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                  InputProps={{ style: { fontSize: '0.875rem' } }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                  Contoh: Toko Sembako Jaya
                </Typography>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel sx={{ fontSize: '0.875rem' }}>Jenis Usaha</InputLabel>
                <Select
                  name="jenis_usaha"
                  value={formData.jenis_usaha}
                  onChange={handleInputChange}
                  label="Jenis Usaha"
                  required
                  size="small"
                  sx={{ fontSize: '0.875rem' }}
                >
                  <MenuItem value="">Pilih jenis usaha</MenuItem>
                  <MenuItem value="Perdagangan">Perdagangan</MenuItem>
                  <MenuItem value="Jasa">Jasa</MenuItem>
                  <MenuItem value="Kuliner">Kuliner</MenuItem>
                  <MenuItem value="Manufaktur">Manufaktur</MenuItem>
                  <MenuItem value="Pertanian">Pertanian</MenuItem>
                  <MenuItem value="Lainnya">Lainnya</MenuItem>
                </Select>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                  Contoh: Kuliner
                </Typography>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Alamat Usaha"
                  name="alamat_usaha"
                  value={formData.alamat_usaha}
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
                  Contoh: Jl. Pasar Baru No. 10
                </Typography>
              </FormControl>
            </Grid>
          </>
        );
      case 'Pindah':
        return (
          <>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Alamat Tujuan"
                  name="alamat_tujuan"
                  value={formData.alamat_tujuan}
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
                  Contoh: Jl. Merdeka No. 5, Kota Baru
                </Typography>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel sx={{ fontSize: '0.875rem' }}>Alasan Pindah</InputLabel>
                <Select
                  name="alasan_pindah"
                  value={formData.alasan_pindah}
                  onChange={handleInputChange}
                  label="Alasan Pindah"
                  required
                  size="small"
                  sx={{ fontSize: '0.875rem' }}
                >
                  <MenuItem value="">Pilih alasan pindah</MenuItem>
                  <MenuItem value="Pekerjaan">Pekerjaan</MenuItem>
                  <MenuItem value="Pendidikan">Pendidikan</MenuItem>
                  <MenuItem value="Keluarga">Keluarga</MenuItem>
                  <MenuItem value="Kesehatan">Kesehatan</MenuItem>
                  <MenuItem value="Lainnya">Lainnya</MenuItem>
                </Select>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                  Contoh: Pekerjaan
                </Typography>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Keperluan Pindah"
                  name="keperluan_pindah"
                  value={formData.keperluan_pindah}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                  InputProps={{ style: { fontSize: '0.875rem' } }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                  Contoh: Pindah rumah
                </Typography>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Tujuan Pindah"
                  name="tujuan_pindah"
                  value={formData.tujuan_pindah}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                  InputProps={{ style: { fontSize: '0.875rem' } }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                  Contoh: Kota Surabaya
                </Typography>
              </FormControl>
            </Grid>
          </>
        );
      case 'Kelahiran':
        return (
          <>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Nama Ayah"
                  name="nama_ayah"
                  value={formData.nama_ayah}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                  InputProps={{ style: { fontSize: '0.875rem' } }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                  Contoh: Budi Santoso
                </Typography>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <TextField
                  label61="Nama Ibu"
                  name="nama_ibu"
                  value={formData.nama_ibu}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                  InputProps={{ style: { fontSize: '0.875rem' } }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                  Contoh: Ani Wijaya
                </Typography>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Nomor HP"
                  name="nomor_hp"
                  value={formData.nomor_hp}
                  onChange={handleInputChange}
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
                <TextField
                  label="Tujuan Surat"
                  name="tujuan_surat"
                  value={formData.tujuan_surat}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                  InputProps={{ style: { fontSize: '0.875rem' } }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                  Contoh: Pengurusan akta kelahiran
                </Typography>
              </FormControl>
            </Grid>
          </>
        );
      case 'Kematian':
        return (
          <>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Tanggal Kematian"
                  name="tgl_kematian"
                  type="date"
                  value={formData.tgl_kematian}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ shrink: true, style: { fontSize: '0.875rem' } }}
                  InputProps={{ style: { fontSize: '0.875rem' } }}
                  inputProps={{ max: new Date().toISOString().split('T')[0] }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                  Contoh: 2025-04-28
                </Typography>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Penyebab Kematian"
                  name="penyebab_kematian"
                  value={formData.penyebab_kematian}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                  InputProps={{ style: { fontSize: '0.875rem' } }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                  Contoh: Sakit jantungan
                </Typography>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Nomor HP"
                  name="nomor_hp"
                  value={formData.nomor_hp}
                  onChange={handleInputChange}
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
                <TextField
                  label="Tujuan Surat"
                  name="tujuan_surat"
                  value={formData.tujuan_surat}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                  InputProps={{ style: { fontSize: '0.875rem' } }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                  Contoh: Pengurusan administrasi kematian
                </Typography>
              </FormControl>
            </Grid>
          </>
        );
      default:
        return null;
    }
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
                    'Selamat Datang di Website Profil Desa Bontomanai',
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
        <DialogContent sx={{ bgcolor: 'background.paper', pt: 3, pb: 3, position: 'relative' }}>
          <AnimatePresence>
            {notifikasi && (
              <Notification
                pesan={notifikasi.pesan}
                tipe={notifikasi.tipe}
                onTutup={() => setNotifikasi(null)}
              />
            )}
          </AnimatePresence>
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
                      <InputLabel sx={{ fontSize: '0.875rem' }}>Jenis Surat</InputLabel>
                      <Select
                        name="jenis_surat"
                        value={formData.jenis_surat}
                        onChange={handleInputChange}
                        label="Jenis Surat"
                        required
                        size="small"
                        sx={{ fontSize: '0.875rem' }}
                      >
                        <MenuItem value="">Pilih jenis surat</MenuItem>
                        <MenuItem value="SKTM">SKTM (Tidak Mampu)</MenuItem>
                        <MenuItem value="Domisili">Domisili</MenuItem>
                        <MenuItem value="Usaha">Keterangan Usaha</MenuItem>
                        <MenuItem value="Pindah">Keterangan Pindah</MenuItem>
                        <MenuItem value="Pengantar">Surat Pengantar</MenuItem>
                        <MenuItem value="Kelahiran">Surat Keterangan Kelahiran</MenuItem>
                        <MenuItem value="Kematian">Surat Keterangan Kematian</MenuItem>
                      </Select>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                        Contoh: SKTM (Tidak Mampu)
                      </Typography>
                    </FormControl> 
                  </Grid>
                  {formData.jenis_surat !== 'Kelahiran' && (
                    <>
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
                            InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                            InputProps={{
                              style: { fontSize: '0.875rem' },
                              endAdornment: sedangMencariNIK ? <CircularProgress size={20} /> : null,
                            }}
                            inputProps={{ maxLength: 16, pattern: '\\d*' }}
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
                            name="nama_lengkap"
                            value={formData.nama_lengkap}
                            onChange={handleInputChange}
                            required
                            variant="outlined"
                            size="small"
                            InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                            InputProps={{ style: { fontSize: '0.875rem' } }}
                            disabled={nikTerdaftar}
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                            Contoh: John Doe
                          </Typography>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth margin="normal">
                          <TextField
                            label="Tempat Lahir"
                            name="tempat_lahir"
                            value={formData.tempat_lahir}
                            onChange={handleInputChange}
                            required
                            variant="outlined"
                            size="small"
                            InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                            InputProps={{ style: { fontSize: '0.875rem' } }}
                            disabled={nikTerdaftar}
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                            Contoh: Jakarta
                          </Typography>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth margin="normal">
                          <TextField
                            label="Tanggal Lahir"
                            name="tanggal_lahir"
                            type="date"
                            value={formData.tanggal_lahir}
                            onChange={handleInputChange}
                            required
                            variant="outlined"
                            size="small"
                            InputLabelProps={{ shrink: true, style: { fontSize: '0.875rem' } }}
                            InputProps={{ style: { fontSize: '0.875rem' } }}
                            inputProps={{ max: new Date().toISOString().split('T')[0] }}
                            disabled={nikTerdaftar}
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
                            name="jenis_kelamin"
                            value={formData.jenis_kelamin}
                            onChange={handleInputChange}
                            label="Jenis Kelamin"
                            required
                            size="small"
                            sx={{ fontSize: '0.875rem' }}
                            disabled={nikTerdaftar}
                          >
                            <MenuItem value="">Pilih jenis kelamin</MenuItem>
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
                          <InputLabel sx={{ fontSize: '0.875rem' }}>Agama</InputLabel>
                          <Select
                            name="agama"
                            value={formData.agama}
                            onChange={handleInputChange}
                            label="Agama"
                            required
                            size="small"
                            sx={{ fontSize: '0.875rem' }}
                            disabled={nikTerdaftar}
                          >
                            <MenuItem value="">Pilih agama</MenuItem>
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
                          <TextField
                            label="Pekerjaan"
                            name="pekerjaan"
                            value={formData.pekerjaan}
                            onChange={handleInputChange}
                            required
                            variant="outlined"
                            size="small"
                            InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                            InputProps={{ style: { fontSize: '0.875rem' } }}
                            disabled={nikTerdaftar}
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                            Contoh: Petani
                          </Typography>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth margin="normal">
                          <InputLabel sx={{ fontSize: '0.875rem' }}>Pendidikan</InputLabel>
                          <Select
                            name="pendidikan"
                            value={formData.pendidikan}
                            onChange={handleInputChange}
                            label="Pendidikan"
                            size="small"
                            sx={{ fontSize: '0.875rem' }}
                            disabled={nikTerdaftar}
                          >
                            <MenuItem value="">Pilih pendidikan</MenuItem>
                            <MenuItem value="SD">SD</MenuItem>
                            <MenuItem value="SMP">SMP</MenuItem>
                            <MenuItem value="SMA">SMA</MenuItem>
                            <MenuItem value="D3">D3</MenuItem>
                            <MenuItem value="S1">S1</MenuItem>
                            <MenuItem value="S2">S2</MenuItem>
                            <MenuItem value="S3">S3</MenuItem>
                            <MenuItem value="Lainnya">Lainnya</MenuItem>
                          </Select>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                            Contoh: SMA
                          </Typography>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth margin="normal">
                          <InputLabel sx={{ fontSize: '0.875rem' }}>Kewarganegaraan</InputLabel>
                          <Select
                            name="kewarganegaraan"
                            value={formData.kewarganegaraan}
                            onChange={handleInputChange}
                            label="Kewarganegaraan"
                            size="small"
                            sx={{ fontSize: '0.875rem' }}
                            disabled={nikTerdaftar}
                          >
                            <MenuItem value="WNI">WNI</MenuItem>
                            <MenuItem value="WNA">WNA</MenuItem>
                          </Select>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                            Contoh: WNI
                          </Typography>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth margin="normal">
                          <TextField
                            label="Alamat Lengkap"
                            name="alamat"
                            value={formData.alamat}
                            onChange={handleInputChange}
                            required
                            variant="outlined"
                            multiline
                            rows={2}
                            size="small"
                            InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                            InputProps={{ style: { fontSize: '0.875rem' } }}
                            disabled={nikTerdaftar}
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                            Contoh: Jl. Raya Kalukuang No. 12, Kec. Bangkala
                          </Typography>
                        </FormControl>
                      </Grid>
                    </>
                  )}
                  {renderAdditionalFields()}
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
                  <Button
                    onClick={handleCloseDialog}
                    variant="outlined"
                    sx={{ borderRadius: '8px', padding: '8px 16px', fontSize: '0.875rem' }}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    variant="contained"
                    disabled={sedangMemuat}
                    endIcon={sedangMemuat ? <CircularProgress size={20} /> : <SendIcon fontSize="small" />}
                    sx={{ borderRadius: '8px', padding: '8px 16px', fontSize: '0.875rem' }}
                  >
                    {sedangMemuat ? 'Mengirim...' : 'Kirim Pengajuan'}
                  </Button>
                </Box>
              </form>
            </Card>
          </motion.div>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Home;