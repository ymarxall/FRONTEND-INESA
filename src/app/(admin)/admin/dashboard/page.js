'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Box, Typography, Grid, Card, CardContent, CircularProgress, Fade, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Stack, Alert, TextField, TablePagination, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import PeopleIcon from '@mui/icons-material/People'
import MaleIcon from '@mui/icons-material/Male'
import FemaleIcon from '@mui/icons-material/Female'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import PaymentsIcon from '@mui/icons-material/Payments'
import MailIcon from '@mui/icons-material/Mail'
import SendIcon from '@mui/icons-material/Send'

// Styled Components
const DashboardCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  },
}))

const TotalPendudukCard = styled(DashboardCard)({
  height: '240px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
})

const FinancialCard = styled(DashboardCard)({
  height: '180px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
})

const HeaderBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
  padding: '20px',
  color: 'white',
  borderRadius: '20px',
  marginBottom: '20px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
    transform: 'rotate(30deg)',
  },
}))

const StatIcon = styled(Box)(({ theme }) => ({
  width: 60,
  height: 60,
  borderRadius: '50%',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '16px',
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

const TableCard = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
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

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPenduduk: 0,
    lakiLaki: 0,
    perempuan: 0,
    totalPemasukan: 0,
    totalPengeluaran: 0,
    suratMasuk: 0,
    suratKeluar: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [openDialog, setOpenDialog] = useState(false)
  const [dialogContent, setDialogContent] = useState(null)
  const router = useRouter()

  useEffect(() => {
    fetchStats(3)
  }, [])

  const fetchStats = async (retryCount = 3) => {
    try {
      setLoading(true)
      const token = Cookies.get('token')
      if (!token) {
        console.error('[FETCH] Token tidak ditemukan')
        setError('Token tidak ditemukan, silakan login kembali')
        return
      }
      console.log('[FETCH] Mengambil statistik dengan token:', token)

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      }

      // Fetch data penduduk
      const pendudukResponse = await fetchWithTimeout('http://localhost:8080/api/dashboard/stats', {
        headers,
        credentials: 'include',
      })
      if (!pendudukResponse.ok) {
        const text = await pendudukResponse.text()
        throw new Error(`Gagal mengambil data penduduk: ${pendudukResponse.status} ${text}`)
      }
      const pendudukData = await pendudukResponse.json()

      // Fetch data pemasukan
      const pemasukanResponse = await fetchWithTimeout('http://localhost:8080/api/pemasukan/total', {
        headers,
        credentials: 'include',
      })
      const pemasukanData = pemasukanResponse.ok ? await pemasukanResponse.json() : { total: 0 }

      // Fetch data pengeluaran
      const pengeluaranResponse = await fetchWithTimeout('http://localhost:8080/api/pengeluaran/total', {
        headers,
        credentials: 'include',
      })
      const pengeluaranData = pengeluaranResponse.ok ? await pengeluaranResponse.json() : { total: 0 }

      // Fetch data surat masuk
      const suratMasukResponse = await fetchWithTimeout('http://localhost:8080/api/surat/masuk/total', {
        headers,
        credentials: 'include',
      })
      const suratMasukData = suratMasukResponse.ok ? await suratMasukResponse.json() : { total: 0 }

      // Fetch data surat keluar
      const suratKeluarResponse = await fetchWithTimeout('http://localhost:8080/api/surat/keluar/total', {
        headers,
        credentials: 'include',
      })
      const suratKeluarData = suratKeluarResponse.ok ? await suratKeluarResponse.json() : { total: 0 }

      setStats({
        totalPenduduk: pendudukData.total || 0,
        lakiLaki: pendudukData.laki || 0,
        perempuan: pendudukData.perempuan || 0,
        totalPemasukan: pemasukanData.total || 0,
        totalPengeluaran: pengeluaranData.total || 0,
        suratMasuk: suratMasukData.total || 0,
        suratKeluar: suratKeluarData.total || 0,
      })
    } catch (error) {
      console.error('[FETCH] Gagal mengambil data statistik:', error)
      if (retryCount > 0) {
        console.log(`[FETCH] Mencoba lagi, sisa percobaan: ${retryCount}`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return fetchStats(retryCount - 1)
      }
      let errorMessage = error.message
      if (error.name === 'AbortError') {
        errorMessage = 'Permintaan timeout, silakan coba lagi'
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Gagal terhubung ke server, periksa backend atau koneksi'
      } else if (error.message.includes('401')) {
        errorMessage = 'Token tidak valid, silakan login kembali'
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Format angka ke format rupiah
  const formatRupiah = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  // Data surat untuk tabel
  const suratData = [
    { jenis: 'Surat Masuk', jumlah: stats.suratMasuk, path: '/surat/masuk' },
    { jenis: 'Surat Keluar', jumlah: stats.suratKeluar, path: '/surat/keluar' },
  ]

  // Filter dan paginasi
  const filteredSurat = useMemo(() => {
    return suratData.filter(item => item.jenis.toLowerCase().includes(search.toLowerCase()))
  }, [search])

  const paginatedSurat = useMemo(() => {
    const start = page * rowsPerPage
    return filteredSurat.slice(start, start + rowsPerPage)
  }, [filteredSurat, page, rowsPerPage])

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleViewDetails = (item) => {
    setDialogContent({
      jenis: item.jenis,
      jumlah: item.jumlah,
      path: item.path,
    })
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setDialogContent(null)
  }

  return (
    <Box sx={{ padding: '20px', mt: '-15px', bgcolor: '#f4f6f8', minHeight: 'calc(100vh - 30px)' }}>
      <Fade in={error !== null}>
        <Alert severity="error" sx={{ mb: 3, display: error ? 'flex' : 'none' }}>
          {error}
        </Alert>
      </Fade>

      <Fade in={!loading}>
        <Box>
          {/* Header */}
          <HeaderBox>
            <TextNoCursor variant="h3" sx={{ fontWeight: 700, mb: 1, zIndex: 1 }}>
              Dashboard Admin
            </TextNoCursor>
            <TextNoCursor variant="subtitle1" sx={{ opacity: 0.8, mb: 2, zIndex: 1 }}>
              Sistem Informasi Desa Bontomanai Kec. Rumbia, Kab. Jeneponto
            </TextNoCursor>
            <ActionButton
              startIcon={<AdminPanelSettingsIcon />}
              onClick={() => router.push('/data-penduduk')}
            >
              Kelola Data Penduduk
            </ActionButton>
          </HeaderBox>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
              <CircularProgress size={60} />
            </Box>
          ) : (
            <>
              {/* Baris Atas: Total Penduduk, Laki-laki, Perempuan */}
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <TotalPendudukCard>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <StatIcon>
                        <PeopleIcon sx={{ fontSize: 36, color: '#1a237e' }} />
                      </StatIcon>
                      <TextNoCursor variant="h6" color="textSecondary">
                        Total Penduduk
                      </TextNoCursor>
                      <TextNoCursor variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>
                        {stats.totalPenduduk}
                      </TextNoCursor>
                    </CardContent>
                  </TotalPendudukCard>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <DashboardCard>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <StatIcon>
                        <MaleIcon sx={{ fontSize: 36, color: '#1976d2' }} />
                      </StatIcon>
                      <TextNoCursor variant="h6" color="textSecondary">
                        Laki-laki
                      </TextNoCursor>
                      <TextNoCursor variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>
                        {stats.lakiLaki}
                      </TextNoCursor>
                      <Chip
                        label={`${((stats.lakiLaki / stats.totalPenduduk) * 100 || 0).toFixed(1)}%`}
                        color="primary"
                        sx={{ mt: 2 }}
                      />
                    </CardContent>
                  </DashboardCard>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <DashboardCard>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <StatIcon>
                        <FemaleIcon sx={{ fontSize: 36, color: '#f06292' }} />
                      </StatIcon>
                      <TextNoCursor variant="h6" color="textSecondary">
                        Perempuan
                      </TextNoCursor>
                      <TextNoCursor variant="h4" sx={{ fontWeight: 700, color: '#f06292' }}>
                        {stats.perempuan}
                      </TextNoCursor>
                      <Chip
                        label={`${((stats.perempuan / stats.totalPenduduk) * 100 || 0).toFixed(1)}%`}
                        sx={{ mt: 2, bgcolor: '#f06292', color: 'white' }}
                      />
                    </CardContent>
                  </DashboardCard>
                </Grid>
              </Grid>

              {/* Baris Tengah: Pemasukan dan Pengeluaran */}
              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6}>
                  <FinancialCard>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <StatIcon>
                        <AccountBalanceWalletIcon sx={{ fontSize: 36, color: '#22c55e' }} />
                      </StatIcon>
                      <TextNoCursor variant="h6" color="textSecondary">
                        Total Pemasukan
                      </TextNoCursor>
                      <TextNoCursor variant="h4" sx={{ fontWeight: 700, color: '#22c55e' }}>
                        {formatRupiah(stats.totalPemasukan)}
                      </TextNoCursor>
                    </CardContent>
                  </FinancialCard>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FinancialCard>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <StatIcon>
                        <PaymentsIcon sx={{ fontSize: 36, color: '#ef4444' }} />
                      </StatIcon>
                      <TextNoCursor variant="h6" color="textSecondary">
                        Total Pengeluaran
                      </TextNoCursor>
                      <TextNoCursor variant="h4" sx={{ fontWeight: 700, color: '#ef4444' }}>
                        {formatRupiah(stats.totalPengeluaran)}
                      </TextNoCursor>
                    </CardContent>
                  </FinancialCard>
                </Grid>
              </Grid>

              {/* Baris Bawah: Tabel Surat Masuk dan Keluar */}
              <Box sx={{ mt: 4 }}>
                <TextNoCursor variant="h6" sx={{ fontWeight: 600, color: '#1a237e', mb: 2 }}>
                  Statistik Surat
                </TextNoCursor>
                <TextField
                  label="Cari Jenis Surat"
                  variant="outlined"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{ mb: 2, width: '100%' }}
                />
                <TableCard sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Jenis Surat</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#1a237e' }} align="center">Jumlah</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#1a237e' }} align="center">Aksi</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedSurat.map((item) => (
                          <TableRow key={item.jenis}>
                            <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {item.jenis === 'Surat Masuk' ? (
                                <MailIcon sx={{ color: '#3b82f6' }} />
                              ) : (
                                <SendIcon sx={{ color: '#f59e0b' }} />
                              )}
                              {item.jenis}
                            </TableCell>
                            <TableCell align="center">{item.jumlah}</TableCell>
                            <TableCell align="center">
                              <ActionButton
                                size="small"
                                onClick={() => handleViewDetails(item)}
                              >
                                Lihat Detail
                              </ActionButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredSurat.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableCard>

                {/* Kartu untuk Mobile */}
                <Stack spacing={2} sx={{ display: { xs: 'block', sm: 'none' } }}>
                  {paginatedSurat.map((item) => (
                    <DashboardCard key={item.jenis}>
                      <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <StatIcon>
                            {item.jenis === 'Surat Masuk' ? (
                              <MailIcon sx={{ fontSize: 36, color: '#3b82f6' }} />
                            ) : (
                              <SendIcon sx={{ fontSize: 36, color: '#f59e0b' }} />
                            )}
                          </StatIcon>
                          <Box>
                            <TextNoCursor variant="h6" color="textSecondary">
                              {item.jenis}
                            </TextNoCursor>
                            <TextNoCursor variant="h4" sx={{ fontWeight: 700, color: item.jenis === 'Surat Masuk' ? '#3b82f6' : '#f59e0b' }}>
                              {item.jumlah}
                            </TextNoCursor>
                          </Box>
                        </Box>
                        <ActionButton
                          size="small"
                          onClick={() => handleViewDetails(item)}
                        >
                          Lihat Detail
                        </ActionButton>
                      </CardContent>
                    </DashboardCard>
                  ))}
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredSurat.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </Stack>
              </Box>
            </>
          )}
        </Box>
      </Fade>

      {/* Dialog untuk Detail Surat */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Detail {dialogContent?.jenis}</DialogTitle>
        <DialogContent>
          {dialogContent && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography><strong>Jenis Surat:</strong> {dialogContent.jenis}</Typography>
              <Typography><strong>Jumlah:</strong> {dialogContent.jumlah}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Tutup</Button>
          <Button
            onClick={() => {
              router.push(dialogContent?.path)
              handleCloseDialog()
            }}
            variant="contained"
            sx={{ backgroundColor: '#1a237e', '&:hover': { backgroundColor: '#0d47a1' } }}
          >
            Buka Halaman
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}