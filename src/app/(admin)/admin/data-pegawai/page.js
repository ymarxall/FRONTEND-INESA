'use client'

import { useState, useEffect } from 'react'
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, IconButton
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

// Styled Components
const DashboardCard = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
}))

const ActionButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#1a237e',
  color: 'white',
  borderRadius: '12px',
  padding: '10px 20px',
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': {
    backgroundColor: '#0d47a1',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
  },
}))

const TextNoCursor = styled(Typography)({
  cursor: 'default',
})

// Fungsi fetch dengan timeout dan retry
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

export default function DataPegawai() {
  const [pegawai, setPegawai] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [formData, setFormData] = useState({ id: '', nip: '', email: '', no_telp: '', jabatan: '' })
  const [isEdit, setIsEdit] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    fetchPegawai(3)
  }, [])

  const fetchPegawai = async (retryCount = 3) => {
    try {
      setLoading(true)
      const token = Cookies.get('token')
      if (!token) {
        console.error('[FETCH] Token tidak ditemukan')
        setError('Token tidak ditemukan, silakan login kembali')
        return
      }

      const response = await fetchWithTimeout('http://localhost:8080/api/pegawai/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Gagal mengambil data pegawai: ${response.status} ${text}`)
      }
      const data = await response.json()
      setPegawai(data.data || [])
    } catch (err) {
      console.error('[FETCH] Error:', err)
      if (retryCount > 0) {
        console.log(`[FETCH] Mencoba lagi, sisa percobaan: ${retryCount}`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return fetchPegawai(retryCount - 1)
      }
      let errorMessage = err.message
      if (err.name === 'AbortError') {
        errorMessage = 'Permintaan timeout, silakan coba lagi'
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Gagal terhubung ke server, periksa backend atau koneksi'
      } else if (err.message.includes('401')) {
        errorMessage = 'Token tidak valid, silakan login kembali'
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (pegawai = { id: '', nip: '', email: '', no_telp: '', jabatan: '' }) => {
    setFormData(pegawai)
    setIsEdit(!!pegawai.id)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setFormData({ id: '', nip: '', email: '', no_telp: '', jabatan: '' })
    setError(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value.trim() }))
    setError(null)
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const token = Cookies.get('token')
      if (!token) {
        setError('Token tidak ditemukan, silakan login kembali')
        return
      }

      if (!formData.nip || formData.nip.length < 8) {
        setError('NIP harus diisi dan minimal 8 karakter')
        return
      }
      if (!formData.no_telp) {
        setError('No. Telepon harus diisi')
        return
      }
      if (!formData.jabatan) {
        setError('Jabatan harus diisi')
        return
      }
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Email tidak valid')
        return
      }

      const url = isEdit
        ? `http://localhost:8080/api/pegawai/update/${formData.id}`
        : 'http://localhost:8080/api/pegawai/create'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetchWithTimeout(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        credentials: 'include',
        body: JSON.stringify({
          nip: formData.nip,
          email: formData.email || null,
          no_telp: formData.no_telp,
          jabatan: formData.jabatan,
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(isEdit ? `Gagal memperbarui pegawai: ${text}` : `Gagal menambah pegawai: ${text}`)
      }
      await fetchPegawai()
      handleCloseDialog()
    } catch (err) {
      console.error('[SUBMIT] Error:', err)
      let errorMessage = err.message
      if (err.name === 'AbortError') {
        errorMessage = 'Permintaan timeout, silakan coba lagi'
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Gagal terhubung ke server, periksa backend atau koneksi'
      } else if (err.message.includes('401')) {
        errorMessage = 'Token tidak valid, silakan login kembali'
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      setLoading(true)
      const token = Cookies.get('token')
      if (!token) {
        setError('Token tidak ditemukan, silakan login kembali')
        return
      }

      const response = await fetchWithTimeout(`http://localhost:8080/api/pegawai/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Gagal menghapus pegawai: ${text}`)
      }
      await fetchPegawai()
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
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ padding: '20px', mt: '-15px', bgcolor: '#f4f6f8', minHeight: 'calc(100vh - 30px)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <TextNoCursor variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>
          Data Pegawai
        </TextNoCursor>
        <ActionButton
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Tambah Daftar Pegawai
        </ActionButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <DashboardCard>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>NIP</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>No. Telepon</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Jabatan</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1a237e' }} align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pegawai.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Tidak ada data pegawai
                    </TableCell>
                  </TableRow>
                ) : (
                  pegawai.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.nip}</TableCell>
                      <TableCell>{item.email || '-'}</TableCell>
                      <TableCell>{item.no_telp}</TableCell>
                      <TableCell>{item.jabatan}</TableCell>
                      <TableCell align="center">
                        <IconButton onClick={() => handleOpenDialog(item)}>
                          <EditIcon color="primary" />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(item.id)}>
                          <DeleteIcon color="error" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DashboardCard>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? 'Edit Pegawai' : 'Tambah Pegawai'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            required
            fullWidth
            name="nip"
            label="NIP"
            value={formData.nip}
            onChange={handleChange}
            disabled={loading}
            error={!!error && formData.nip.length < 8}
          />
          <TextField
            margin="normal"
            fullWidth
            name="email"
            label="Email (Opsional)"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            error={!!error && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="no_telp"
            label="No. Telepon"
            value={formData.no_telp}
            onChange={handleChange}
            disabled={loading}
            error={!!error && !formData.no_telp}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="jabatan"
            label="Jabatan"
            value={formData.jabatan}
            onChange={handleChange}
            disabled={loading}
            error={!!error && !formData.jabatan}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            variant="contained"
            sx={{ backgroundColor: '#1a237e', '&:hover': { backgroundColor: '#0d47a1' } }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : isEdit ? 'Simpan' : 'Tambah'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}