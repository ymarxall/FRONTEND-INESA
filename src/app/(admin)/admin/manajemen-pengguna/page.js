'use client';

import { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box,
  Typography, Card, CardContent, IconButton, Tooltip, Alert, Fade,
  CircularProgress, MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
  overflow: 'hidden'
}));

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
}));

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
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: 'none',
  '& .MuiTableCell-head': {
    backgroundColor: '#f8f9fa',
    fontWeight: 600,
    color: '#1a237e'
  }
}));

export default function ManajemenPengguna() {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nikadmin: '',
    email: '',
    password: '',
    namalengkap: '',
    role_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');

  useEffect(() => {
    fetchUsers();
  }, []);

  const getCookie = (name) => {
    try {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    } catch (err) {
      console.error('Gagal parsing cookie:', err);
      return null;
    }
  };

  const fetchUsers = async () => {
    try {
      const token = getCookie('token');
      if (!token) {
        showAlertMessage('Token tidak ditemukan, silakan login kembali', 'error');
        return;
      }

      setLoading(true);
      console.log('[FETCH] Mengambil data pengguna dengan token:', token);
      const res = await fetch('http://localhost:8080/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('[FETCH] Status:', res.status);
      const text = await res.text();
      console.log('[FETCH] Respons teks:', text);

      let data;
      try {
        data = JSON.parse(text);
        console.log('[FETCH] Respons JSON:', data);
      } catch (jsonError) {
        console.error('[FETCH] Gagal parsing JSON:', jsonError);
        throw new Error(`Respons bukan JSON: ${text}`);
      }

      if (!res.ok) {
        throw new Error(data.message || 'Gagal mengambil data pengguna');
      }

      const userList = Array.isArray(data.data) ? data.data.map(user => ({
        id: user.Id,
        nikadmin: user.Nikadmin,
        email: user.Email,
        password: user.Password,
        namalengkap: user.NamaLengkap,
        role_id: user.RoleID
      })) : [];
      setUsers(userList);
      if (userList.length === 0) {
        showAlertMessage('Tidak ada data pengguna di database', 'info');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      showAlertMessage(err.message || 'Gagal memuat data pengguna', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setEditingId(null);
    setFormData({
      nikadmin: '',
      email: '',
      password: '',
      namalengkap: '',
      role_id: ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      nikadmin: '',
      email: '',
      password: '',
      namalengkap: '',
      role_id: ''
    });
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setShowAlert(false);

    const { nikadmin, email, password, namalengkap, role_id } = formData;

    // Validasi NIK
    if (!/^\d{16}$/.test(nikadmin)) {
      showAlertMessage('NIK harus terdiri dari 16 angka', 'error');
      setLoading(false);
      return;
    }

    // Validasi field wajib
    if (!email || !namalengkap || !role_id || (!editingId && !password)) {
      showAlertMessage('Semua field harus diisi', 'error');
      setLoading(false);
      return;
    }

    // Validasi peran
    const validRoles = ['ROLE000', 'ROLE001', 'ROLE002'];
    if (!validRoles.includes(role_id)) {
      showAlertMessage('Peran tidak valid', 'error');
      setLoading(false);
      return;
    }

    const signupPayload = { nikadmin, email, namalengkap, role_id };
    if (password && !editingId) {
      signupPayload.pass = password; // Hanya kirim password saat tambah
    }

    try {
      const token = getCookie('token');
      if (!token) {
        showAlertMessage('Token tidak ditemukan, silakan login kembali', 'error');
        setLoading(false);
        return;
      }

      const endpoint = editingId
        ? `http://localhost:8080/api/user/${editingId}`
        : 'http://localhost:8080/api/user/sign-up';
      const method = editingId ? 'PUT' : 'POST';

      console.log('[SUBMIT] Mengirim data:', signupPayload, 'ke endpoint:', endpoint);
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(signupPayload),
      });

      console.log('[SUBMIT] Status:', response.status);
      const text = await response.text();
      console.log('[SUBMIT] Respons teks:', text);

      let responseData;
      try {
        responseData = JSON.parse(text);
        console.log('[SUBMIT] Respons JSON:', responseData);
      } catch (jsonError) {
        console.error('[SUBMIT] Gagal parsing JSON:', jsonError);
        throw new Error(`Respons bukan JSON: ${text}`);
      }

      if (!response.ok) {
        console.error('[SUBMIT] Respons tidak OK:', response.status, responseData);
        throw new Error(responseData.message || (editingId ? 'Gagal memperbarui pengguna' : 'Registrasi gagal'));
      }

      showAlertMessage(editingId ? 'Pengguna berhasil diperbarui' : 'Pengguna berhasil ditambahkan', 'success');
      handleCloseDialog();
      fetchUsers();
    } catch (err) {
      console.error('Submit error:', err);
      showAlertMessage(err.message || 'Gagal memproses permintaan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({
      nikadmin: user.nikadmin,
      email: user.email,
      password: '',
      namalengkap: user.namalengkap,
      role_id: user.role_id
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus pengguna dengan ID ${id}?`)) {
      return;
    }

    try {
      const token = getCookie('token');
      if (!token) {
        showAlertMessage('Token tidak ditemukan, silakan login kembali', 'error');
        return;
      }

      setLoading(true);
      console.log('[DELETE] Menghapus pengguna dengan ID:', id);
      const res = await fetch(`http://localhost:8080/api/deleteusers/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('[DELETE] Status:', res.status);
      const text = await res.text();
      console.log('[DELETE] Respons teks:', text);

      let data;
      try {
        data = JSON.parse(text);
        console.log('[DELETE] Respons JSON:', data);
      } catch (jsonError) {
        console.error('[DELETE] Gagal parsing JSON:', jsonError);
        throw new Error(`Respons bukan JSON: ${text}`);
      }

      if (!res.ok) {
        throw new Error(data.message || 'Gagal menghapus pengguna');
      }

      showAlertMessage('Pengguna berhasil dihapus', 'success');
      fetchUsers();
    } catch (err) {
      console.error('Delete error:', err);
      showAlertMessage(err.message || 'Gagal menghapus pengguna', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlertMessage = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  return (
    <Box sx={{ padding: '24px', mt: '-20px' }}>
      <Fade in={showAlert}>
        <Alert severity={alertType} sx={{ position: 'fixed', top: 24, right: 24, zIndex: 9999 }}>
          {alertMessage}
        </Alert>
      </Fade>

      <HeaderBox>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Manajemen Pengguna
        </Typography>
        <AddButton variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}>
          Tambah Pengguna
        </AddButton>
      </HeaderBox>

      <StyledCard>
        <CardContent>
          <StyledTableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>NIK Admin</TableCell>
                  <TableCell>Nama Lengkap</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Peran</TableCell>
                  <TableCell align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <PeopleIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                      <Typography variant="body1" color="textSecondary">
                        Belum ada data pengguna
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.nikadmin}</TableCell>
                      <TableCell>{user.namalengkap}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.role_id === 'ROLE000' ? 'Superadmin' : 
                         user.role_id === 'ROLE001' ? 'Bendahara' : 
                         user.role_id === 'ROLE002' ? 'Sekretaris' : user.role_id}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleEdit(user)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Hapus">
                          <IconButton onClick={() => handleDelete(user.id)}>
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Pengguna' : 'Tambah Pengguna'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="nikadmin"
              label="NIK Admin"
              value={formData.nikadmin}
              onChange={handleChange}
              inputProps={{ maxLength: 16, pattern: '[0-9]*' }}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="namalengkap"
              label="Nama Lengkap"
              value={formData.namalengkap}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="role_id"
              label="Pilih Peran"
              select
              value={formData.role_id}
              onChange={handleChange}
              disabled={loading}
            >
              <MenuItem value="">Pilih peran...</MenuItem>
              <MenuItem value="ROLE000">Superadmin</MenuItem>
              <MenuItem value="ROLE001">Bendahara</MenuItem>
              <MenuItem value="ROLE002">Sekretaris</MenuItem>
            </TextField>
            <TextField
              margin="normal"
              required={!editingId}
              fullWidth
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : editingId ? 'Simpan' : 'Tambah'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}