'use client'

import { useState, useEffect } from 'react'
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box,
  Typography, Card, CardContent, IconButton, Tooltip, Alert, Fade,
  CircularProgress, MenuItem, Select, FormControl, InputLabel, Avatar
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import PeopleIcon from '@mui/icons-material/People'
import { styled } from '@mui/material/styles'
import Cookies from 'js-cookie'

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
  overflow: 'hidden'
}))

const HeaderBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
  padding: '24px',
  color: 'white',
  borderRadius: '16px',
  marginBottom: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)'
}))

const AddButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'white',
  color: '#1a237e',
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  padding: '12px 24px',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.9)',
    boxShadow: '0 8px 16px 0 rgba(0,0,0,0.1)'
  }
}))

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: 'none',
  '& .MuiTableCell-head': {
    backgroundColor: '#f8f9fa',
    fontWeight: 600,
    color: '#1a237e'
  }
}))

const pendidikanOptions = [
  'Tidak Sekolah',
  'SD/Sederajat',
  'SMP/Sederajat',
  'SMA/Sederajat',
  'Diploma (D1/D2/D3)',
  'Sarjana (S1)',
  'Magister (S2)',
  'Doktor (S3)'
]

const pekerjaanOptions = [
  'Belum/Tidak Bekerja',
  'Pelajar/Mahasiswa',
  'Ibu Rumah Tangga',
  'Petani/Peternak',
  'Nelayan',
  'Buruh Harian Lepas',
  'PNS/TNI/Polri',
  'Karyawan Swasta',
  'Wirausaha',
  'Pensiunan',
  'Lainnya'
]

const kewarganegaraanOptions = [
  'WNI',
  'WNA'
]

export default function DataPenduduk() {
  const [rows, setRows] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    nik: '',
    nama_lengkap: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    pendidikan: '',
    pekerjaan: '',
    agama: '',
    status_pernikahan: '',
    kewarganegaraan: '',
    no_telp: '',
    photo: null,
    photo_url: ''
  })
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState('success')
  const [loading, setLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchWithTimeout = async (url, options, timeout = 15000) => {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)
    try {
      console.log(`[FETCH] Mengirim permintaan ke: ${url}`)
      const response = await fetch(url, { ...options, signal: controller.signal })
      console.log(`[FETCH] Status: ${response.status}, Content-Type: ${response.headers.get('Content-Type')}`)
      clearTimeout(id)
      return response
    } catch (error) {
      clearTimeout(id)
      console.error(`[FETCH] Error ke ${url}:`, error)
      throw error
    }
  }

  const fetchUserData = async (retryCount = 3) => {
    try {
      setLoading(true)
      const token = Cookies.get('token')
      if (!token) {
        console.error('[FETCH] Token tidak ditemukan')
        showAlertMessage('Token tidak ditemukan, silakan login kembali', 'error')
        return
      }
      console.log('[FETCH] Mengambil data warga dengan token:', token)
      const res = await fetchWithTimeout('http://localhost:8080/api/warga', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        credentials: 'include'
      }, 15000)

      if (!res.ok) {
        const text = await res.text()
        let data
        try {
          data = text ? JSON.parse(text) : { message: 'Unknown error' }
        } catch (jsonError) {
          console.error('[FETCH] Gagal parsing JSON:', jsonError)
          throw new Error(`Respons bukan JSON: ${text}`)
        }
        throw new Error(data.message || `Gagal memuat data warga: ${res.status}`)
      }

      const text = await res.text()
      let data
      try {
        data = text ? JSON.parse(text) : { data: [] }
      } catch (jsonError) {
        console.error('[FETCH] Gagal parsing JSON:', jsonError)
        throw new Error(`Respons bukan JSON: ${text}`)
      }

      const wargaData = Array.isArray(data.data) ? data.data :
                        Array.isArray(data.result) ? data.result :
                        Array.isArray(data) ? data : []

      const normalizedData = wargaData.map(item => ({
        id: item.id || item.ID || '',
        nik: item.nik || item.Nik || '-',
        nama_lengkap: item.nama_lengkap || item.NamaLengkap || '-',
        tempat_lahir: item.tempat_lahir || item.TempatLahir || '-',
        tanggal_lahir: item.tanggal_lahir || item.TanggalLahir || '-',
        jenis_kelamin: item.jenis_kelamin || item.JenisKelamin || '-',
        pendidikan: item.pendidikan || item.Pendidikan || '-',
        pekerjaan: item.pekerjaan || item.Pekerjaan || '-',
        agama: item.agama || item.Agama || '-',
        status_pernikahan: item.status_pernikahan || item.StatusPernikahan || '-',
        kewarganegaraan: item.kewarganegaraan || item.Kewarganegaraan || '-',
        no_telp: item.no_telp || item.NoTelp || '-',
        photo_url: item.photo_url || ''
      }))

      setRows(normalizedData)
      if (normalizedData.length === 0) {
        showAlertMessage('Tidak ada data penduduk di database', 'info')
      }
    } catch (err) {
      console.error('[FETCH] Error saat fetch data:', err)
      if (retryCount > 0) {
        console.log(`[FETCH] Mencoba lagi, sisa percobaan: ${retryCount}`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return fetchUserData(retryCount - 1)
      }
      let errorMessage = err.message
      if (err.name === 'AbortError') {
        errorMessage = 'Permintaan timeout, silakan coba lagi'
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Gagal terhubung ke server, periksa backend atau koneksi'
      } else if (err.message.includes('401')) {
        errorMessage = 'Token tidak valid, silakan login kembali'
      }
      showAlertMessage(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value.trim() }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setFormData(prev => ({ ...prev, photo: file }))
    if (file) {
      setPhotoPreview(URL.createObjectURL(file))
    } else {
      setPhotoPreview(null)
    }
  }

  const handleAdd = () => {
    setEditingId(null)
    setFormData({
      nik: '',
      nama_lengkap: '',
      tempat_lahir: '',
      tanggal_lahir: '',
      jenis_kelamin: '',
      pendidikan: '',
      pekerjaan: '',
      agama: '',
      status_pernikahan: '',
      kewarganegaraan: '',
      no_telp: '',
      photo: null,
      photo_url: ''
    })
    setPhotoPreview(null)
    setShowModal(true)
  }

  const handleEdit = (row) => {
    console.log('[EDIT] Mengedit data:', row)
    setEditingId(row.id)
    setFormData({
      nik: row.nik || '',
      nama_lengkap: row.nama_lengkap || '',
      tempat_lahir: row.tempat_lahir || '',
      tanggal_lahir: row.tanggal_lahir || '',
      jenis_kelamin: row.jenis_kelamin || '',
      pendidikan: row.pendidikan || '',
      pekerjaan: row.pekerjaan || '',
      agama: row.agama || '',
      status_pernikahan: row.status_pernikahan || '',
      kewarganegaraan: row.kewarganegaraan || '',
      no_telp: row.no_telp || '',
      photo: null,
      photo_url: row.photo_url || ''
    })
    setPhotoPreview(row.photo_url || null)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus data ini?')) return
    try {
      setLoading(true)
      const token = Cookies.get('token')
      if (!token) {
        console.error('[DELETE] Token tidak ditemukan')
        showAlertMessage('Token tidak ditemukan, silakan login kembali', 'error')
        return
      }
      console.log('[DELETE] Menghapus data dengan ID:', id)
      const res = await fetchWithTimeout(`http://localhost:8080/api/warga/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        credentials: 'include'
      }, 15000)

      const text = await res.text()
      console.log('[DELETE] Respons teks:', text)
      let data
      try {
        data = text ? JSON.parse(text) : {}
      } catch (jsonError) {
        console.error('[DELETE] Gagal parsing JSON:', jsonError)
        throw new Error(`Respons bukan JSON: ${text}`)
      }

      if (!res.ok) {
        throw new Error(data.message || 'Gagal menghapus data')
      }
      showAlertMessage(data.message || 'Data berhasil dihapus', 'success')
      setRows(prev => prev.filter(row => row.id !== id))
      await fetchUserData()
    } catch (err) {
      console.error('[DELETE] Error:', err)
      let errorMessage = err.message
      if (err.name === 'AbortError') {
        errorMessage = 'Permintaan timeout, silakan coba lagi'
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Gagal terhubung ke server, periksa backend atau koneksi'
      } else if (err.message.includes('401')) {
        errorMessage = 'Token tidak valid, silakan login kembali'
      }
      showAlertMessage(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    const { nik, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, pendidikan, pekerjaan, agama, status_pernikahan, kewarganegaraan, no_telp, photo } = formData

    // Validasi
    if (!nik || !nama_lengkap || !tempat_lahir || !tanggal_lahir || !jenis_kelamin || !pendidikan || !pekerjaan || !agama || !status_pernikahan || !kewarganegaraan) {
      showAlertMessage('Semua field wajib diisi kecuali nomor telepon dan foto', 'error')
      return
    }

    if (!/^\d{16}$/.test(nik)) {
      showAlertMessage('NIK harus 16 digit angka', 'error')
      return
    }

    if (no_telp && !/^\d{9,12}$/.test(no_telp)) {
      showAlertMessage('Nomor telepon harus 9-12 digit angka', 'error')
      return
    }

    const validAgama = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu']
    if (!validAgama.includes(agama)) {
      showAlertMessage('Pilih agama yang valid', 'error')
      return
    }

    const validStatus = ['Belum Menikah', 'Menikah', 'Cerai', 'Janda/Duda']
    if (!validStatus.includes(status_pernikahan)) {
      showAlertMessage('Pilih status pernikahan yang valid', 'error')
      return
    }

    const validJenisKelamin = ['Laki-laki', 'Perempuan']
    if (!validJenisKelamin.includes(jenis_kelamin)) {
      showAlertMessage('Pilih jenis kelamin yang valid', 'error')
      return
    }

    if (isNaN(Date.parse(tanggal_lahir))) {
      showAlertMessage('Format tanggal lahir tidak valid', 'error')
      return
    }

    if (!pendidikanOptions.includes(pendidikan)) {
      showAlertMessage('Pilih pendidikan yang valid', 'error')
      return
    }

    if (!pekerjaanOptions.includes(pekerjaan)) {
      showAlertMessage('Pilih pekerjaan yang valid', 'error')
      return
    }

    if (!kewarganegaraanOptions.includes(kewarganegaraan)) {
      showAlertMessage('Pilih kewarganegaraan yang valid', 'error')
      return
    }

    try {
      setLoading(true)
      const token = Cookies.get('token')
      if (!token) {
        showAlertMessage('Token tidak ditemukan, silakan login kembali', 'error')
        return
      }

      let photoUrl = formData.photo_url
      if (photo) {
        const formDataUpload = new FormData()
        formDataUpload.append('file', photo)
        const uploadResponse = await fetchWithTimeout('http://localhost:8080/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
          },
          body: formDataUpload,
          credentials: 'include'
        }, 15000)

        if (!uploadResponse.ok) {
          const text = await uploadResponse.text()
          throw new Error(`Gagal mengunggah foto: ${text}`)
        }
        const uploadData = await uploadResponse.json()
        photoUrl = uploadData.url || ''
      }

      const endpoint = editingId ? `http://localhost:8080/api/warga/${editingId}` : 'http://localhost:8080/api/warga'
      const method = editingId ? 'PUT' : 'POST'
      const payload = {
        nik,
        nama_lengkap,
        tempat_lahir,
        tanggal_lahir,
        jenis_kelamin,
        pendidikan,
        pekerjaan,
        agama,
        status_pernikahan,
        kewarganegaraan,
        no_telp: no_telp || null,
        photo_url: photoUrl || null
      }

      const res = await fetchWithTimeout(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(payload),
        credentials: 'include'
      }, 15000)

      const text = await res.text()
      let data
      try {
        data = text ? JSON.parse(text) : {}
      } catch (jsonError) {
        console.error('[SAVE] Gagal parsing JSON:', jsonError)
        throw new Error(`Respons bukan JSON: ${text}`)
      }

      if (!res.ok) {
        throw new Error(data.message || `Gagal menyimpan data: ${res.status}`)
      }

      if (!editingId) {
        setRows(prev => [...prev, { id: data.data?.id || Date.now(), ...payload }])
      } else {
        setRows(prev => prev.map(row => row.id === editingId ? { id: editingId, ...payload } : row))
      }

      showAlertMessage(data.message || 'Data berhasil disimpan', 'success')
      setShowModal(false)
      setEditingId(null)
      setFormData({
        nik: '',
        nama_lengkap: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        jenis_kelamin: '',
        pendidikan: '',
        pekerjaan: '',
        agama: '',
        status_pernikahan: '',
        kewarganegaraan: '',
        no_telp: '',
        photo: null,
        photo_url: ''
      })
      setPhotoPreview(null)
      await fetchUserData()
    } catch (err) {
      console.error('[SAVE] Error:', err)
      let errorMessage = err.message
      if (err.name === 'AbortError') {
        errorMessage = 'Permintaan timeout, silakan coba lagi'
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Gagal terhubung ke server, periksa backend atau koneksi'
      } else if (err.message.includes('401')) {
        errorMessage = 'Token tidak valid, silakan login kembali'
      } else if (err.message.includes('400')) {
        errorMessage = data?.message || 'Data tidak valid, periksa input Anda'
      }
      showAlertMessage(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const showAlertMessage = (message, type) => {
    setAlertMessage(message)
    setAlertType(type)
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  const calculateAge = (tanggal) => {
    if (!tanggal) return '-'
    const birth = new Date(tanggal)
    const now = new Date()
    let age = now.getFullYear() - birth.getFullYear()
    const m = now.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
    return age >= 0 ? age : '-'
  }

  return (
    <Box sx={{ padding: '24px', mt: '-20px' }}>
      <Fade in={showAlert}>
        <Alert severity={alertType} sx={{ position: 'fixed', top: 24, right: 24, zIndex: 9999 }}>
          {alertMessage}
        </Alert>
      </Fade>

      <HeaderBox>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Data Penduduk
        </Typography>
        <AddButton variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Tambah Data Penduduk
        </AddButton>
      </HeaderBox>

      <StyledCard>
        <CardContent>
          <StyledTableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Foto</TableCell>
                  <TableCell>NIK</TableCell>
                  <TableCell>Nama</TableCell>
                  <TableCell>Tempat Lahir</TableCell>
                  <TableCell>Tanggal Lahir (Umur)</TableCell>
                  <TableCell>Jenis Kelamin</TableCell>
                  <TableCell>Pendidikan</TableCell>
                  <TableCell>Pekerjaan</TableCell>
                  <TableCell>Agama</TableCell>
                  <TableCell>Status Pernikahan</TableCell>
                  <TableCell>Kewarganegaraan</TableCell>
                  <TableCell>No. Telepon</TableCell>
                  <TableCell align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={13} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} align="center">
                      <PeopleIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                      <Typography variant="body1" color="textSecondary">
                        Belum ada data penduduk
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id || row.nik}>
                      <TableCell>
                        {row.photo_url ? (
                          <Avatar src={row.photo_url} sx={{ width: 40, height: 40 }} />
                        ) : (
                          <Avatar sx={{ width: 40, height: 40 }}>{row.nama_lengkap?.[0]}</Avatar>
                        )}
                      </TableCell>
                      <TableCell>{row.nik}</TableCell>
                      <TableCell>{row.nama_lengkap}</TableCell>
                      <TableCell>{row.tempat_lahir}</TableCell>
                      <TableCell>{row.tanggal_lahir} ({calculateAge(row.tanggal_lahir)})</TableCell>
                      <TableCell>{row.jenis_kelamin}</TableCell>
                      <TableCell>{row.pendidikan}</TableCell>
                      <TableCell>{row.pekerjaan}</TableCell>
                      <TableCell>{row.agama}</TableCell>
                      <TableCell>{row.status_pernikahan}</TableCell>
                      <TableCell>{row.kewarganegaraan}</TableCell>
                      <TableCell>{row.no_telp || '-'}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleEdit(row)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Hapus">
                          <IconButton onClick={() => handleDelete(row.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </StyledTableContainer>
        </CardContent>
      </StyledCard>

      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Data Penduduk' : 'Tambah Data Penduduk'}</DialogTitle>
        <DialogContent>
          <TextField
            label="NIK"
            name="nik"
            value={formData.nik}
            onChange={handleInputChange}
            fullWidth
            required
            margin="normal"
            inputProps={{ maxLength: 16, pattern: '[0-9]*' }}
            disabled={loading || editingId}
            error={showAlert && !formData.nik}
            helperText={showAlert && !formData.nik ? 'NIK wajib diisi' : ''}
          />
          <TextField
            label="Nama Lengkap"
            name="nama_lengkap"
            value={formData.nama_lengkap}
            onChange={handleInputChange}
            fullWidth
            required
            margin="normal"
            disabled={loading}
            error={showAlert && !formData.nama_lengkap}
            helperText={showAlert && !formData.nama_lengkap ? 'Nama wajib diisi' : ''}
          />
          <TextField
            label="Tempat Lahir"
            name="tempat_lahir"
            value={formData.tempat_lahir}
            onChange={handleInputChange}
            fullWidth
            required
            margin="normal"
            disabled={loading}
            error={showAlert && !formData.tempat_lahir}
            helperText={showAlert && !formData.tempat_lahir ? 'Tempat lahir wajib diisi' : ''}
          />
          <TextField
            label="Tanggal Lahir"
            name="tanggal_lahir"
            type="date"
            value={formData.tanggal_lahir}
            onChange={handleInputChange}
            fullWidth
            required
            margin="normal"
            InputLabelProps={{ shrink: true }}
            disabled={loading}
            error={showAlert && !formData.tanggal_lahir}
            helperText={showAlert && !formData.tanggal_lahir ? 'Tanggal lahir wajib diisi' : ''}
          />
          <FormControl fullWidth required margin="normal">
            <InputLabel
              sx={{
                '&.MuiInputLabel-shrink': {
                  transform: 'translate(14px, -9px) scale(0.75)'
                }
              }}
            >
              Jenis Kelamin
            </InputLabel>
            <Select
              name="jenis_kelamin"
              value={formData.jenis_kelamin}
              onChange={handleInputChange}
              disabled={loading}
              error={showAlert && !formData.jenis_kelamin}
            >
              <MenuItem value=""><em>Pilih Jenis Kelamin</em></MenuItem>
              <MenuItem value="Laki-laki">Laki-laki</MenuItem>
              <MenuItem value="Perempuan">Perempuan</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth required margin="normal">
            <InputLabel
              sx={{
                '&.MuiInputLabel-shrink': {
                  transform: 'translate(14px, -9px) scale(0.75)'
                }
              }}
            >
              Pendidikan
            </InputLabel>
            <Select
              name="pendidikan"
              value={formData.pendidikan}
              onChange={handleInputChange}
              disabled={loading}
              error={showAlert && !formData.pendidikan}
            >
              <MenuItem value=""><em>Pilih Pendidikan</em></MenuItem>
              {pendidikanOptions.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth required margin="normal">
            <InputLabel
              sx={{
                '&.MuiInputLabel-shrink': {
                  transform: 'translate(14px, -9px) scale(0.75)'
                }
              }}
            >
              Pekerjaan
            </InputLabel>
            <Select
              name="pekerjaan"
              value={formData.pekerjaan}
              onChange={handleInputChange}
              disabled={loading}
              error={showAlert && !formData.pekerjaan}
            >
              <MenuItem value=""><em>Pilih Pekerjaan</em></MenuItem>
              {pekerjaanOptions.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth required margin="normal">
            <InputLabel
              sx={{
                '&.MuiInputLabel-shrink': {
                  transform: 'translate(14px, -9px) scale(0.75)'
                }
              }}
            >
              Agama
            </InputLabel>
            <Select
              name="agama"
              value={formData.agama}
              onChange={handleInputChange}
              disabled={loading}
              error={showAlert && !formData.agama}
            >
              <MenuItem value=""><em>Pilih Agama</em></MenuItem>
              <MenuItem value="Islam">Islam</MenuItem>
              <MenuItem value="Kristen">Kristen</MenuItem>
              <MenuItem value="Katolik">Katolik</MenuItem>
              <MenuItem value="Hindu">Hindu</MenuItem>
              <MenuItem value="Buddha">Buddha</MenuItem>
              <MenuItem value="Konghucu">Konghucu</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth required margin="normal">
            <InputLabel
              sx={{
                '&.MuiInputLabel-shrink': {
                  transform: 'translate(14px, -9px) scale(0.75)'
                }
              }}
            >
              Status Pernikahan
            </InputLabel>
            <Select
              name="status_pernikahan"
              value={formData.status_pernikahan}
              onChange={handleInputChange}
              disabled={loading}
              error={showAlert && !formData.status_pernikahan}
            >
              <MenuItem value=""><em>Pilih Status Pernikahan</em></MenuItem>
              <MenuItem value="Belum Menikah">Belum Menikah</MenuItem>
              <MenuItem value="Menikah">Menikah</MenuItem>
              <MenuItem value="Cerai">Cerai</MenuItem>
              <MenuItem value="Janda/Duda">Janda/Duda</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth required margin="normal">
            <InputLabel
              sx={{
                '&.MuiInputLabel-shrink': {
                  transform: 'translate(14px, -9px) scale(0.75)'
                }
              }}
            >
              Kewarganegaraan
            </InputLabel>
            <Select
              name="kewarganegaraan"
              value={formData.kewarganegaraan}
              onChange={handleInputChange}
              disabled={loading}
              error={showAlert && !formData.kewarganegaraan}
            >
              <MenuItem value=""><em>Pilih Kewarganegaraan</em></MenuItem>
              {kewarganegaraanOptions.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="No. Telepon (Opsional)"
            name="no_telp"
            value={formData.no_telp}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            disabled={loading}
            error={showAlert && formData.no_telp && !/^\d{9,12}$/.test(formData.no_telp)}
            helperText={showAlert && formData.no_telp && !/^\d{9,12}$/.test(formData.no_telp) ? 'Nomor telepon harus 9-12 digit' : ''}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">Upload Foto (Opsional)</Typography>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
              style={{ marginTop: '8px' }}
            />
            {photoPreview && (
              <Box sx={{ mt: 2 }}>
                <img src={photoPreview} alt="Preview" style={{ maxWidth: '100px', maxHeight: '100px' }} />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)} disabled={loading}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Simpan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}