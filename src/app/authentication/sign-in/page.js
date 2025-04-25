'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Image from 'next/image';
import { authService } from '@/services/authService';

export default function SignIn() {
  const [formData, setFormData] = useState({ nik: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState('/image.png');
  const [openForgotDialog, setOpenForgotDialog] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState(null);
  const [forgotError, setForgotError] = useState(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { nik, password } = formData;

    if (!nik) {
      setError('NIK harus diisi.');
      setLoading(false);
      return;
    }

    if (!password) {
      setError('Password harus diisi.');
      setLoading(false);
      return;
    }

    const result = await login(nik, password);
    if (!result.success) {
      setError(result.error || 'Login gagal');
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setForgotLoading(true);
    setForgotError(null);
    setForgotMessage(null);

    if (!forgotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setForgotError('Masukkan email yang valid.');
      setForgotLoading(false);
      return;
    }

    const response = await authService.forgotPassword(forgotEmail);
    if (response.success) {
      setForgotMessage(response.message);
      setForgotEmail('');
    } else {
      setForgotError(response.error);
    }
    setForgotLoading(false);
  };

  const handleOpenForgotDialog = () => {
    setOpenForgotDialog(true);
    setForgotEmail('');
    setForgotError(null);
    setForgotMessage(null);
  };

  const handleCloseForgotDialog = () => {
    setOpenForgotDialog(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, marginBottom: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: '16px', backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Image
              src={logoUrl}
              alt="Logo"
              width={80}
              height={80}
              style={{ marginBottom: '16px', borderRadius: '50%' }}
              priority
              onError={() => setLogoUrl('/image.png')}
            />
            <Typography component="h1" variant="h5" sx={{ fontWeight: 600, color: '#1a237e', textAlign: 'center' }}>
              Masuk
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1, textAlign: 'center' }}>
              Masukkan NIK dan kata sandi Anda
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              name="nik"
              label="NIK"
              type="text"
              value={formData.nik}
              onChange={handleChange}
              disabled={loading}
              error={!!error}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Kata Sandi"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              error={!!error}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1 }}
            />
            <Typography
              variant="body2"
              color="primary"
              sx={{ textAlign: 'right', cursor: 'pointer', mb: 2 }}
              onClick={handleOpenForgotDialog}
            >
              Lupa Password?
            </Typography>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 2, mb: 2, py: 1.5, backgroundColor: '#1a237e', '&:hover': { backgroundColor: '#0d47a1' } }}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                  Memproses...
                </>
              ) : (
                'Masuk'
              )}
            </Button>
          </Box>
        </Paper>
      </Box>

      <Dialog open={openForgotDialog} onClose={handleCloseForgotDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Lupa Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Masukkan alamat email Anda untuk menerima instruksi reset password.
          </Typography>
          {forgotMessage && <Alert severity="success" sx={{ mb: 2 }}>{forgotMessage}</Alert>}
          {forgotError && <Alert severity="error" sx={{ mb: 2 }}>{forgotError}</Alert>}
          <TextField
            margin="normal"
            required
            fullWidth
            name="email"
            label="Email"
            type="email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value.trim())}
            disabled={forgotLoading}
            error={!!forgotError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForgotDialog} disabled={forgotLoading}>
            Batal
          </Button>
          <Button
            onClick={handleForgotPassword}
            disabled={forgotLoading || !forgotEmail}
            variant="contained"
            sx={{ backgroundColor: '#1a237e', '&:hover': { backgroundColor: '#0d47a1' } }}
          >
            {forgotLoading ? <CircularProgress size="24" color="inherit" /> : 'Kirim'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}