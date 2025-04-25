'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material'
import { styled } from '@mui/material/styles'

const FormContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
  padding: '24px',
}))

const FormBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  padding: '32px',
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
  width: '100%',
  maxWidth: '400px',
}))

const SubmitButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#1a237e',
  color: 'white',
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  padding: '12px 24px',
  marginTop: '16px',
  '&:hover': {
    backgroundColor: '#0d47a1',
  },
}))

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validasi input
    if (!password || !confirmPassword) {
      setError('Semua field wajib diisi')
      return
    }
    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok')
      return
    }
    // Tidak ada batasan panjang password (sesuai memori 13 April 2025)

    try {
      setLoading(true)
      const res = await fetch("http://localhost:8080/api/user/reset-password", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ token, newPassword: password }),
      })

      const text = await res.text()
      let data
      try {
        data = text ? JSON.parse(text) : {}
      } catch {
        throw new Error(`Respons bukan JSON: ${text}`)
      }

      if (!res.ok) {
        throw new Error(data.message || 'Gagal mengganti password')
      }

      setSuccess(data.message || 'Password berhasil diganti')
      setTimeout(() => {
        router.push('/authentication/sign-in')
      }, 2000)
    } catch (err) {
      let errorMessage = err.message
      if (err.name === 'AbortError') {
        errorMessage = 'Permintaan timeout, silakan coba lagi'
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Gagal terhubung ke server, periksa backend atau koneksi'
      } else if (err.message.includes('401')) {
        errorMessage = 'Token tidak valid atau kadaluarsa'
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormContainer>
      <FormBox>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
          Ganti Password
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Password Baru"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            margin="normal"
            disabled={loading}
          />
          <TextField
            label="Konfirmasi Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            required
            margin="normal"
            disabled={loading}
          />
          <SubmitButton type="submit" disabled={loading} fullWidth>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Simpan Password'}
          </SubmitButton>
        </form>
      </FormBox>
    </FormContainer>
  )
}