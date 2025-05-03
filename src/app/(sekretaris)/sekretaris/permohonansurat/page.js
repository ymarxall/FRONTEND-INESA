'use client';
import { API_ENDPOINTS, getHeaders } from '@/config/api';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import SaveIcon from '@mui/icons-material/Save';
import {
  Box,
  Button,
  Card, CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  styled
} from '@mui/material';
// import html2pdf from 'html2pdf.js';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';


// const html2pdf = typeof window !== 'undefined' 
//   ? dynamic(() => import('html2pdf.js').then((mod) => mod.default), { ssr: false })
//   : null;

const Html2Pdf = dynamic(
  () => import('html2pdf.js').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => <p>Menyiapkan generator PDF...</p>
  }
);


// Styled components
const StyledCard = styled(Card)({
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
  overflow: 'hidden'
});

const HeaderBox = styled(Box)({
  background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
  padding: '24px',
  color: 'white',
  borderRadius: '16px 16px 0 0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
});

const AddButton = styled(Button)({
  backgroundColor: '#ffffff',
  color: '#2e7d32',
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  padding: '12px 24px',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.9)',
    boxShadow: '0 8px 16px 0 rgba(0,0,0,0.1)',
  },
});

// Status colors mapping
const statusColors = {
  'Diproses': 'primary',
  'Selesai': 'success',
  'Ditolak': 'error'
};

// Daftar opsi penandatangan, NIP, dan nama lengkap
const penandatanganOptions = {
  'Kepala Desa': { nip: '19651231 200001 1 001', namaLengkap: 'H. Muhammad Saleh, S.Sos' },
  'Sekretaris Desa': { nip: '19701231 200112 2 002', namaLengkap: 'Dra. Hj. Sitti Rahma' }
};

// Fungsi untuk memformat tanggal ke format Indonesia (contoh: 20 Mei 1990)
const formatTanggalIndonesia = (tanggal) => {
  if (!tanggal) return '...........................';
  const date = new Date(tanggal);
  if (isNaN(date.getTime())) return '...........................';
  const bulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
};

// Fungsi untuk menangani nilai null, undefined, atau objek
const safeString = (value) => {
  if (value == null) return '...........................';
  if (typeof value === 'object') {
    // Jika value adalah objek, coba ambil properti 'name' atau konversi ke string
    return value.name ? String(value.name) : '...........................';
  }
  return String(value);
};

// Fungsi untuk menangani nilai form (khususnya untuk inisialisasi formData)
const safeFormString = (value) => {
  if (value == null) return '';
  if (typeof value === 'object') {
    // Jika value adalah objek, coba ambil properti 'name' atau kembalikan string kosong
    return value.name ? String(value.name) : '';
  }
  return String(value);
};

// Template Surat
const suratTemplates = {
  'Surat Keterangan Domisili': {
    title: 'Surat Keterangan Domisili',
    template: (data) => {
      const tanggalPembuatan = formatTanggalIndonesia(new Date());
      return `
        <div style="font-family: 'Times New Roman', serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
            <div style="display: inline-flex; align-items: center;">
              <img src="/image.png" alt="Logo Desa" style="height: 80px; margin-right: 20px;" />
              <div>
                <h2 style="margin: 0;">PEMERINTAH DESA BONTO UJUNG</h2>
                <h3 style="margin: 5px 0;">KECAMATAN TAROWANG - KABUPATEN JENEPONTO</h3>
                <p style="margin: 0;">Jl. Poros Tarowang No. 10, Kode Pos 92351</p>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <table style="width: 100%;">
              <tr>
                <td style="width: 100px;">Nomor</td>
                <td style="width: 20px;">:</td>
                <td>${safeString(data.no_surat)}</td>
                <td style="text-align: right;">Bonto Ujung, ${tanggalPembuatan}</td>
              </tr>
              <tr>
                <td>Lampiran</td>
                <td>:</td>
                <td>${data.dokumen_url ? 'Ada' : '-'}</td>
                <td></td>
              </tr>
              <tr>
                <td>Perihal</td>
                <td>:</td>
                <td>Keterangan Domisili</td>
                <td></td>
              </tr>
            </table>
          </div>

          <div style="margin: 30px 0;">
            <p>Kepada Yth.</p>
            <p>${safeString(data.ditujukan)}</p>
            <p>di Tempat</p>
          </div>

          <div style="margin: 30px 0; text-align: justify;">
            <p>Yang bertanda tangan di bawah ini ${data.ttd_nama || 'Kepala Desa'} Bonto Ujung menerangkan bahwa:</p>
            <br>
            <table style="margin-left: 40px; margin-bottom: 20px;">
              <tr>
                <td>Nama</td>
                <td>: ${safeString(data.nama_lengkap)}</td>
              </tr>
              <tr>
                <td>NIK</td>
                <td>: ${safeString(data.nik)}</td>
              </tr>
              <tr>
                <td>Tempat/Tgl Lahir</td>
                <td>: ${safeString(data.tempat_lahir)}/${data.tanggal_lahir ? formatTanggalIndonesia(data.tanggal_lahir) : '...........................'}</td>
              </tr>
              <tr>
                <td>Alamat</td>
                <td>: ${safeString(data.alamat_lengkap)}</td>
              </tr>
            </table>

            <p style="text-indent: 40px;">
              Adalah benar warga Desa Bonto Ujung dan berdomisili di alamat tersebut di atas.
            </p>

            <p style="text-indent: 40px; margin-top: 20px;">
              Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.
            </p>
          </div>

          <div style="margin-top: 60px; text-align: right;">
            <p>${data.ttd_nama || 'Kepala Desa'} Bonto Ujung,</p>
            <div style="margin-top: 80px;">
              <p><strong><u>${safeString(data.ttd_nama_lengkap)}</u></strong></p>
              <p>NIP. ${safeString(data.nip)}</p>
            </div>
          </div>
        </div>
      `;
    },
    formFields: [
      { name: 'no_surat', label: 'Nomor Surat', type: 'text', placeholder: 'Masukkan Nomor Surat' },
      { name: 'nik', label: 'NIK', type: 'text', placeholder: 'Masukkan NIK', disabled: true },
      { name: 'nama_lengkap', label: 'Nama Lengkap', type: 'text', placeholder: 'Masukkan Nama Lengkap', disabled: true },
      { name: 'tempat_lahir', label: 'Tempat Lahir', type: 'text', placeholder: 'Masukkan Tempat Lahir', disabled: true },
      { name: 'tanggal_lahir', label: 'Tanggal Lahir', type: 'date', placeholder: 'Pilih Tanggal Lahir', disabled: true },
      { name: 'alamat_lengkap', label: 'Alamat Lengkap', type: 'text', placeholder: 'Masukkan Alamat Lengkap', disabled: true },
      { name: 'nomor_hp', label: 'Nomor HP', type: 'text', placeholder: 'Masukkan Nomor HP' },
      { name: 'dokumen_url', label: 'Lampiran Dokumen', type: 'file', accept: '.pdf,.jpg,.png' },
      { name: 'ditujukan', label: 'Ditujukan Ke -', type: 'text', placeholder: 'Penerima Surat' },
      { name: 'ttd_nama', label: 'Yang Bertandatangan', type: 'select', options: ['Kepala Desa', 'Sekretaris Desa'] },
      { name: 'nip', label: 'NIP', type: 'text', placeholder: 'NIP akan terisi otomatis', disabled: true }
    ]
  },
  'Surat Keterangan Tidak Mampu': {
    title: 'Surat Keterangan Tidak Mampu',
    template: (data) => {
      const tanggalPembuatan = formatTanggalIndonesia(new Date());
      return `
        <div style="font-family: 'Times New Roman', serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
            <div style="display: inline-flex; align-items: center;">
              <img src="/image.png" alt="Logo Desa" style="height: 80px; margin-right: 20px;" />
              <div>
                <h2 style="margin: 0;">PEMERINTAH DESA BONTO UJUNG</h2>
                <h3 style="margin: 5px 0;">KECAMATAN TAROWANG - KABUPATEN JENEPONTO</h3>
                <p style="margin: 0;">Jl. Poros Tarowang No. 10, Kode Pos 92351</p>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <table style="width: 100%;">
              <tr>
                <td style="width: 100px;">Nomor</td>
                <td style="width: 20px;">:</td>
                <td>${safeString(data.no_surat)}</td>
                <td style="text-align: right;">Bonto Ujung, ${tanggalPembuatan}</td>
              </tr>
              <tr>
                <td>Lampiran</td>
                <td>:</td>
                <td>${data.dokumen_url ? 'Ada' : '-'}</td>
                <td></td>
              </tr>
              <tr>
                <td>Perihal</td>
                <td>:</td>
                <td>Keterangan Tidak Mampu</td>
                <td></td>
              </tr>
            </table>
          </div>

          <div style="margin: 30px 0;">
            <p>Kepada Yth.</p>
            <p>${safeString(data.ditujukan)}</p>
            <p>di Tempat</p>
          </div>

          <div style="margin: 30px 0; text-align: justify;">
            <p>Yang bertanda tangan di bawah ini ${data.ttd_nama || 'Kepala Desa'} Bonto Ujung menerangkan bahwa:</p>
            <br>
            <table style="margin-left: 40px; margin-bottom: 20px;">
              <tr>
                <td>Nama</td>
                <td>: ${safeString(data.nama_lengkap)}</td>
              </tr>
              <tr>
                <td>NIK</td>
                <td>: ${safeString(data.nik)}</td>
              </tr>
              <tr>
                <td>Tempat/Tgl Lahir</td>
                <td>: ${safeString(data.tempat_lahir)}/${data.tanggal_lahir ? formatTanggalIndonesia(data.tanggal_lahir) : '...........................'}</td>
              </tr>
              <tr>
                <td>Pekerjaan</td>
                <td>: ${safeString(data.pekerjaan)}</td>
              </tr>
              <tr>
                <td>Alamat</td>
                <td>: ${safeString(data.alamat_lengkap)}</td>
              </tr>
            </table>

            <p style="text-indent: 40px;">
              Adalah benar warga Desa Bonto Ujung dan berdasarkan pengamatan termasuk dalam kategori tidak mampu untuk keperluan ${safeString(data.keperluan)}.
            </p>

            <p style="text-indent: 40px; margin-top: 20px;">
              Demikian surat keterangan ini dibuat dengan sebenar-benarnya untuk dapat dipergunakan sebagaimana mestinya.
            </p>
          </div>

          <div style="margin-top: 60px; text-align: right;">
            <p>${data.ttd_nama || 'Kepala Desa'} Bonto Ujung,</p>
            <div style="margin-top: 80px;">
              <p><strong><u>${safeString(data.ttd_nama_lengkap)}</u></strong></p>
              <p>NIP. ${safeString(data.nip)}</p>
            </div>
          </div>
        </div>
      `;
    },
    formFields: [
      { name: 'no_surat', label: 'Nomor Surat', type: 'text', placeholder: 'Masukkan Nomor Surat' },
      { name: 'nik', label: 'NIK', type: 'text', placeholder: 'Masukkan NIK', disabled: true },
      { name: 'nama_lengkap', label: 'Nama Lengkap', type: 'text', placeholder: 'Masukkan Nama Lengkap', disabled: true },
      { name: 'tempat_lahir', label: 'Tempat Lahir', type: 'text', placeholder: 'Masukkan Tempat Lahir', disabled: true },
      { name: 'tanggal_lahir', label: 'Tanggal Lahir', type: 'date', placeholder: 'Pilih Tanggal Lahir', disabled: true },
      { name: 'pekerjaan', label: 'Pekerjaan', type: 'text', placeholder: 'Masukkan Pekerjaan' },
      { name: 'alamat_lengkap', label: 'Alamat Lengkap', type: 'text', placeholder: 'Masukkan Alamat Lengkap', disabled: true },
      { name: 'keperluan', label: 'Keperluan', type: 'text', placeholder: 'Masukkan Keperluan' },
      { name: 'nomor_hp', label: 'Nomor HP', type: 'text', placeholder: 'Masukkan Nomor HP' },
      { name: 'dokumen_url', label: 'Lampiran Dokumen', type: 'file', accept: '.pdf,.jpg,.png' },
      { name: 'ditujukan', label: 'Ditujukan Ke -', type: 'text', placeholder: 'Penerima Surat' },
      { name: 'ttd_nama', label: 'Yang Bertandatangan', type: 'select', options: ['Kepala Desa', 'Sekretaris Desa'] },
      { name: 'nip', label: 'NIP', type: 'text', placeholder: 'NIP akan terisi otomatis', disabled: true }
    ]
  },
  'Surat Keterangan Usaha': {
    title: 'Surat Keterangan Usaha',
    template: (data) => {
      const tanggalPembuatan = formatTanggalIndonesia(new Date());
      return `
        <div style="font-family: 'Times New Roman', serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
            <div style="display: inline-flex; align-items: center;">
              <img src="/image.png" alt="Logo Desa" style="height: 80px; margin-right: 20px;" />
              <div>
                <h2 style="margin: 0;">PEMERINTAH DESA BONTO UJUNG</h2>
                <h3 style="margin: 5px 0;">KECAMATAN TAROWANG - KABUPATEN JENEPONTO</h3>
                <p style="margin: 0;">Jl. Poros Tarowang No. 10, Kode Pos 92351</p>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <table style="width: 100%;">
              <tr>
                <td style="width: 100px;">Nomor</td>
                <td style="width: 20px;">:</td>
                <td>${safeString(data.no_surat)}</td>
                <td style="text-align: right;">Bonto Ujung, ${tanggalPembuatan}</td>
              </tr>
              <tr>
                <td>Lampiran</td>
                <td>:</td>
                <td>${data.dokumen_url ? 'Ada' : '-'}</td>
                <td></td>
              </tr>
              <tr>
                <td>Perihal</td>
                <td>:</td>
                <td>Keterangan Usaha</td>
                <td></td>
              </tr>
            </table>
          </div>

          <div style="margin: 30px 0;">
            <p>Kepada Yth.</p>
            <p>${safeString(data.ditujukan)}</p>
            <p>di Tempat</p>
          </div>

          <div style="margin: 30px 0; text-align: justify;">
            <p>Yang bertanda tangan di bawah ini ${data.ttd_nama || 'Kepala Desa'} Bonto Ujung menerangkan bahwa:</p>
            <br>
            <table style="margin-left: 40px; margin-bottom: 20px;">
              <tr>
                <td>Nama</td>
                <td>: ${safeString(data.nama_lengkap)}</td>
              </tr>
              <tr>
                <td>NIK</td>
                <td>: ${safeString(data.nik)}</td>
              </tr>
              <tr>
                <td>Tempat/Tgl Lahir</td>
                <td>: ${safeString(data.tempat_lahir)}/${data.tanggal_lahir ? formatTanggalIndonesia(data.tanggal_lahir) : '...........................'}</td>
              </tr>
              <tr>
                <td>Alamat</td>
                <td>: ${safeString(data.alamat_lengkap)}</td>
              </tr>
              <tr>
                <td>Nama Usaha</td>
                <td>: ${safeString(data.nama_usaha)}</td>
              </tr>
              <tr>
                <td>Jenis Usaha</td>
                <td>: ${safeString(data.jenis_usaha)}</td>
              </tr>
              <tr>
                <td>Alamat Usaha</td>
                <td>: ${safeString(data.alamat_usaha)}</td>
              </tr>
            </table>

            <p style="text-indent: 40px;">
              Adalah benar warga Desa Bonto Ujung dan memiliki usaha sebagaimana tersebut di atas yang masih aktif hingga saat ini.
            </p>

            <p style="text-indent: 40px; margin-top: 20px;">
              Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.
            </p>
          </div>

          <div style="margin-top: 60px; text-align: right;">
            <p>${data.ttd_nama || 'Kepala Desa'} Bonto Ujung,</p>
            <div style="margin-top: 80px;">
              <p><strong><u>${safeString(data.ttd_nama_lengkap)}</u></strong></p>
              <p>NIP. ${safeString(data.nip)}</p>
            </div>
          </div>
        </div>
      `;
    },
    formFields: [
      { name: 'no_surat', label: 'Nomor Surat', type: 'text', placeholder: 'Masukkan Nomor Surat' },
      { name: 'nik', label: 'NIK', type: 'text', placeholder: 'Masukkan NIK', disabled: true },
      { name: 'nama_lengkap', label: 'Nama Lengkap', type: 'text', placeholder: 'Masukkan Nama Lengkap', disabled: true },
      { name: 'tempat_lahir', label: 'Tempat Lahir', type: 'text', placeholder: 'Masukkan Tempat Lahir', disabled: true },
      { name: 'tanggal_lahir', label: 'Tanggal Lahir', type: 'date', placeholder: 'Pilih Tanggal Lahir', disabled: true },
      { name: 'alamat_lengkap', label: 'Alamat Lengkap', type: 'text', placeholder: 'Masukkan Alamat Lengkap', disabled: true },
      { name: 'nama_usaha', label: 'Nama Usaha', type: 'text', placeholder: 'Masukkan Nama Usaha' },
      { name: 'jenis_usaha', label: 'Jenis Usaha', type: 'text', placeholder: 'Masukkan Jenis Usaha' },
      { name: 'alamat_usaha', label: 'Alamat Usaha', type: 'text', placeholder: 'Masukkan Alamat Usaha' },
      { name: 'nomor_hp', label: 'Nomor HP', type: 'text', placeholder: 'Masukkan Nomor HP' },
      { name: 'dokumen_url', label: 'Lampiran Dokumen', type: 'file', accept: '.pdf,.jpg,.png' },
      { name: 'ditujukan', label: 'Ditujukan Ke -', type: 'text', placeholder: 'Penerima Surat' },
      { name: 'ttd_nama', label: 'Yang Bertandatangan', type: 'select', options: ['Kepala Desa', 'Sekretaris Desa'] },
      { name: 'nip', label: 'NIP', type: 'text', placeholder: 'NIP akan terisi otomatis', disabled: true }
    ]
  },
  'Surat Keterangan Pindah': {
    title: 'Surat Keterangan Pindah',
    template: (data) => {
      const tanggalPembuatan = formatTanggalIndonesia(new Date());
      return `
        <div style="font-family: 'Times New Roman', serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
            <div style="display: inline-flex; align-items: center;">
              <img src="/image.png" alt="Logo Desa" style="height: 80px; margin-right: 20px;" />
              <div>
                <h2 style="margin: 0;">PEMERINTAH DESA BONTO UJUNG</h2>
                <h3 style="margin: 5px 0;">KECAMATAN TAROWANG - KABUPATEN JENEPONTO</h3>
                <p style="margin: 0;">Jl. Poros Tarowang No. 10, Kode Pos 92351</p>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <table style="width: 100%;">
              <tr>
                <td style="width: 100px;">Nomor</td>
                <td style="width: 20px;">:</td>
                <td>${safeString(data.no_surat)}</td>
                <td style="text-align: right;">Bonto Ujung, ${tanggalPembuatan}</td>
              </tr>
              <tr>
                <td>Lampiran</td>
                <td>:</td>
                <td>${data.dokumen_url ? 'Ada' : '-'}</td>
                <td></td>
              </tr>
              <tr>
                <td>Perihal</td>
                <td>:</td>
                <td>Keterangan Pindah</td>
                <td></td>
              </tr>
            </table>
          </div>

          <div style="margin: 30px 0;">
            <p>Kepada Yth.</p>
            <p>${safeString(data.ditujukan)}</p>
            <p>di Tempat</p>
          </div>

          <div style="margin: 30px 0; text-align: justify;">
            <p>Yang bertanda tangan di bawah ini ${data.ttd_nama || 'Kepala Desa'} Bonto Ujung menerangkan bahwa:</p>
            <br>
            <table style="margin-left: 40px; margin-bottom: 20px;">
              <tr>
                <td>Nama</td>
                <td>: ${safeString(data.nama_lengkap)}</td>
              </tr>
              <tr>
                <td>NIK</td>
                <td>: ${safeString(data.nik)}</td>
              </tr>
              <tr>
                <td>Tempat/Tgl Lahir</td>
                <td>: ${safeString(data.tempat_lahir)}/${data.tanggal_lahir ? formatTanggalIndonesia(data.tanggal_lahir) : '...........................'}</td>
              </tr>
              <tr>
                <td>Alamat Asal</td>
                <td>: ${safeString(data.alamat_lengkap)}</td>
              </tr>
              <tr>
                <td>Alamat Tujuan</td>
                <td>: ${safeString(data.alamat_tujuan)}</td>
              </tr>
              <tr>
                <td>Alasan Pindah</td>
                <td>: ${safeString(data.alasan_pindah)}</td>
              </tr>
            </table>

            <p style="text-indent: 40px;">
              Adalah benar warga Desa Bonto Ujung yang akan pindah ke alamat tujuan tersebut di atas untuk keperluan ${safeString(data.keperluan)}.
            </p>

            <p style="text-indent: 40px; margin-top: 20px;">
              Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.
            </p>
          </div>

          <div style="margin-top: 60px; text-align: right;">
            <p>${data.ttd_nama || 'Kepala Desa'} Bonto Ujung,</p>
            <div style="margin-top: 80px;">
              <p><strong><u>${safeString(data.ttd_nama_lengkap)}</u></strong></p>
              <p>NIP. ${safeString(data.nip)}</p>
            </div>
          </div>
        </div>
      `;
    },
    formFields: [
      { name: 'no_surat', label: 'Nomor Surat', type: 'text', placeholder: 'Masukkan Nomor Surat' },
      { name: 'nik', label: 'NIK', type: 'text', placeholder: 'Masukkan NIK', disabled: true },
      { name: 'nama_lengkap', label: 'Nama Lengkap', type: 'text', placeholder: 'Masukkan Nama Lengkap', disabled: true },
      { name: 'tempat_lahir', label: 'Tempat Lahir', type: 'text', placeholder: 'Masukkan Tempat Lahir', disabled: true },
      { name: 'tanggal_lahir', label: 'Tanggal Lahir', type: 'date', placeholder: 'Pilih Tanggal Lahir', disabled: true },
      { name: 'alamat_lengkap', label: 'Alamat Asal', type: 'text', placeholder: 'Masukkan Alamat Asal', disabled: true },
      { name: 'alamat_tujuan', label: 'Alamat Tujuan', type: 'text', placeholder: 'Masukkan Alamat Tujuan' },
      { name: 'alasan_pindah', label: 'Alasan Pindah', type: 'text', placeholder: 'Masukkan Alasan Pindah' },
      { name: 'keperluan', label: 'Keperluan', type: 'text', placeholder: 'Masukkan Keperluan' },
      { name: 'nomor_hp', label: 'Nomor HP', type: 'text', placeholder: 'Masukkan Nomor HP' },
      { name: 'dokumen_url', label: 'Lampiran Dokumen', type: 'file', accept: '.pdf,.jpg,.png' },
      { name: 'ditujukan', label: 'Ditujukan Ke -', type: 'text', placeholder: 'Penerima Surat' },
      { name: 'ttd_nama', label: 'Yang Bertandatangan', type: 'select', options: ['Kepala Desa', 'Sekretaris Desa'] },
      { name: 'nip', label: 'NIP', type: 'text', placeholder: 'NIP akan terisi otomatis', disabled: true }
    ]
  },
  'Surat Pengantar': {
    title: 'Surat Pengantar',
    template: (data) => {
      const tanggalPembuatan = formatTanggalIndonesia(new Date());
      return `
        <div style="font-family: 'Times New Roman', serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
            <div style="display: inline-flex; align-items: center;">
              <img src="/image.png" alt="Logo Desa" style="height: 80px; margin-right: 20px;" />
              <div>
                <h2 style="margin: 0;">PEMERINTAH DESA BONTO UJUNG</h2>
                <h3 style="margin: 5px 0;">KECAMATAN TAROWANG - KABUPATEN JENEPONTO</h3>
                <p style="margin: 0;">Jl. Poros Tarowang No. 10, Kode Pos 92351</p>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 20px; text-align: center;">
            <p style="font-weight: bold; font-size: 18px;">SURAT PENGANTAR</p>
            <table style="width: 100%;">
              <tr>
                <td style="width: 100px;">Nomor</td>
                <td style="width: 20px;">:</td>
                <td>${safeString(data.no_surat)}</td>
              </tr>
              <tr>
                <td>Lampiran</td>
                <td>:</td>
                <td>${data.dokumen_url ? 'Ada' : '-'}</td>
              </tr>
            </table>
          </div>

          <div style="margin: 30px 0; text-align: justify;">
            <p>Yang bertanda tangan di bawah ini ${data.ttd_nama || 'Kepala Desa'} Bonto Ujung menerangkan bahwa:</p>
            <br>
            <table style="margin-left: 40px; margin-bottom: 20px;">
              <tr>
                <td>Nama</td>
                <td>: ${safeString(data.nama_lengkap)}</td>
              </tr>
              <tr>
                <td>NIK</td>
                <td>: ${safeString(data.nik)}</td>
              </tr>
              <tr>
                <td>Tempat/Tgl Lahir</td>
                <td>: ${safeString(data.tempat_lahir)}/${data.tanggal_lahir ? formatTanggalIndonesia(data.tanggal_lahir) : '...........................'}</td>
              </tr>
              <tr>
                <td>Alamat</td>
                <td>: ${safeString(data.alamat_lengkap)}</td>
              </tr>
            </table>

            <p style="text-indent: 40px;">
              Adalah benar warga Desa Bonto Ujung dan memerlukan surat pengantar ini untuk keperluan ${safeString(data.keperluan)}.
            </p>

            <p style="text-indent: 40px; margin-top: 20px;">
              Demikian surat pengantar ini dibuat untuk dapat dipergunakan sebagaimana mestinya.
            </p>
          </div>

          <div style="margin-top: 60px; text-align: right;">
            <p>Bonto Ujung, ${tanggalPembuatan}</p>
            <p>${data.ttd_nama || 'Kepala Desa'} Bonto Ujung,</p>
            <div style="margin-top: 80px;">
              <p><strong><u>${safeString(data.ttd_nama_lengkap)}</u></strong></p>
              <p>NIP. ${safeString(data.nip)}</p>
            </div>
          </div>
        </div>
      `;
    },
    formFields: [
      { name: 'no_surat', label: 'Nomor Surat', type: 'text', placeholder: 'Masukkan Nomor Surat' },
      { name: 'nik', label: 'NIK', type: 'text', placeholder: 'Masukkan NIK', disabled: true },
      { name: 'nama_lengkap', label: 'Nama Lengkap', type: 'text', placeholder: 'Masukkan Nama Lengkap', disabled: true },
      { name: 'tempat_lahir', label: 'Tempat Lahir', type: 'text', placeholder: 'Masukkan Tempat Lahir', disabled: true },
      { name: 'tanggal_lahir', label: 'Tanggal Lahir', type: 'date', placeholder: 'Pilih Tanggal Lahir', disabled: true },
      { name: 'alamat_lengkap', label: 'Alamat Lengkap', type: 'text', placeholder: 'Masukkan Alamat Lengkap', disabled: true },
      { name: 'keperluan', label: 'Keperluan', type: 'text', placeholder: 'Masukkan Keperluan' },
      { name: 'nomor_hp', label: 'Nomor HP', type: 'text', placeholder: 'Masukkan Nomor HP' },
      { name: 'dokumen_url', label: 'Lampiran Dokumen', type: 'file', accept: '.pdf,.jpg,.png' },
      { name: 'ditujukan', label: 'Ditujukan Ke -', type: 'text', placeholder: 'Penerima Surat' },
      { name: 'ttd_nama', label: 'Yang Bertandatangan', type: 'select', options: ['Kepala Desa', 'Sekretaris Desa'] },
      { name: 'nip', label: 'NIP', type: 'text', placeholder: 'NIP akan terisi otomatis', disabled: true }
    ]
  },
  'Surat Keterangan Kelahiran': {
    title: 'Surat Keterangan Kelahiran',
    template: (data) => {
      const tanggalPembuatan = formatTanggalIndonesia(new Date());
      return `
        <div style="font-family: 'Times New Roman', serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
            <div style="display: inline-flex; align-items: center;">
              <img src="/image.png" alt="Logo Desa" style="height: 80px; margin-right: 20px;" />
              <div>
                <h2 style="margin: 0;">PEMERINTAH DESA BONTO UJUNG</h2>
                <h3 style="margin: 5px 0;">KECAMATAN TAROWANG - KABUPATEN JENEPONTO</h3>
                <p style="margin: 0;">Jl. Poros Tarowang No. 10, Kode Pos 92351</p>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <table style="width: 100%;">
              <tr>
                <td style="width: 100px;">Nomor</td>
                <td style="width: 20px;">:</td>
                <td>${safeString(data.no_surat)}</td>
                <td style="text-align: right;">Bonto Ujung, ${tanggalPembuatan}</td>
              </tr>
              <tr>
                <td>Lampiran</td>
                <td>:</td>
                <td>${data.dokumen_url ? 'Ada' : '-'}</td>
                <td></td>
              </tr>
              <tr>
                <td>Perihal</td>
                <td>:</td>
                <td>Keterangan Kelahiran</td>
                <td></td>
              </tr>
            </table>
          </div>

          <div style="margin: 30px 0;">
            <p>Kepada Yth.</p>
            <p>${safeString(data.ditujukan)}</p>
            <p>di Tempat</p>
          </div>

          <div style="margin: 30px 0; text-align: justify;">
            <p>Yang bertanda tangan di bawah ini ${data.ttd_nama || 'Kepala Desa'} Bonto Ujung menerangkan bahwa:</p>
            <br>
            <table style="margin-left: 40px; margin-bottom: 20px;">
              <tr>
                <td>Nama Anak</td>
                <td>: ${safeString(data.nama_lengkap)}</td>
              </tr>
              <tr>
                <td>Jenis Kelamin</td>
                <td>: ${safeString(data.jenis_kelamin)}</td>
              </tr>
              <tr>
                <td>Tempat/Tgl Lahir</td>
                <td>: ${safeString(data.tempat_lahir)}/${data.tanggal_lahir ? formatTanggalIndonesia(data.tanggal_lahir) : '...........................'}</td>
              </tr>
              <tr>
                <td>Nama Ayah</td>
                <td>: ${safeString(data.nama_ayah)}</td>
              </tr>
              <tr>
                <td>Nama Ibu</td>
                <td>: ${safeString(data.nama_ibu)}</td>
              </tr>
              <tr>
                <td>Alamat Orang Tua</td>
                <td>: ${safeString(data.alamat_lengkap)}</td>
              </tr>
            </table>

            <p style="text-indent: 40px;">
              Adalah benar anak tersebut lahir di Desa Bonto Ujung sebagaimana keterangan di atas.
            </p>

            <p style="text-indent: 40px; margin-top: 20px;">
              Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.
            </p>
          </div>

          <div style="margin-top: 60px; text-align: right;">
            <p>${data.ttd_nama || 'Kepala Desa'} Bonto Ujung,</p>
            <div style="margin-top: 80px;">
              <p><strong><u>${safeString(data.ttd_nama_lengkap)}</u></strong></p>
              <p>NIP. ${safeString(data.nip)}</p>
            </div>
          </div>
        </div>
      `;
    },
    formFields: [
      { name: 'no_surat', label: 'Nomor Surat', type: 'text', placeholder: 'Masukkan Nomor Surat' },
      { name: 'nama_lengkap', label: 'Nama Anak', type: 'text', placeholder: 'Masukkan Nama Anak', disabled: true },
      { name: 'jenis_kelamin', label: 'Jenis Kelamin', type: 'text', placeholder: 'Masukkan Jenis Kelamin' },
      { name: 'tempat_lahir', label: 'Tempat Lahir Anak', type: 'text', placeholder: 'Masukkan Tempat Lahir', disabled: true },
      { name: 'tanggal_lahir', label: 'Tanggal Lahir Anak', type: 'date', placeholder: 'Pilih Tanggal Lahir', disabled: true },
      { name: 'nama_ayah', label: 'Nama Ayah', type: 'text', placeholder: 'Masukkan Nama Ayah' },
      { name: 'nama_ibu', label: 'Nama Ibu', type: 'text', placeholder: 'Masukkan Nama Ibu' },
      { name: 'alamat_lengkap', label: 'Alamat Orang Tua', type: 'text', placeholder: 'Masukkan Alamat Orang Tua', disabled: true },
      { name: 'nomor_hp', label: 'Nomor HP', type: 'text', placeholder: 'Masukkan Nomor HP' },
      { name: 'dokumen_url', label: 'Lampiran Dokumen', type: 'file', accept: '.pdf,.jpg,.png' },
      { name: 'ditujukan', label: 'Ditujukan Ke -', type: 'text', placeholder: 'Penerima Surat' },
      { name: 'ttd_nama', label: 'Yang Bertandatangan', type: 'select', options: ['Kepala Desa', 'Sekretaris Desa'] },
      { name: 'nip', label: 'NIP', type: 'text', placeholder: 'NIP akan terisi otomatis', disabled: true }
    ]
  },
  'Surat Keterangan Kematian': {
    title: 'Surat Keterangan Kematian',
    template: (data) => {
      const tanggalPembuatan = formatTanggalIndonesia(new Date());
      return `
        <div style="font-family: 'Times New Roman', serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
            <div style="display: inline-flex; align-items: center;">
              <img src="/image.png" alt="Logo Desa" style="height: 80px; margin-right: 20px;" />
              <div>
                <h2 style="margin: 0;">PEMERINTAH DESA BONTO UJUNG</h2>
                <h3 style="margin: 5px 0;">KECAMATAN TAROWANG - KABUPATEN JENEPONTO</h3>
                <p style="margin: 0;">Jl. Poros Tarowang No. 10, Kode Pos 92351</p>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <table style="width: 100%;">
              <tr>
                <td style="width: 100px;">Nomor</td>
                <td style="width: 20px;">:</td>
                <td>${safeString(data.no_surat)}</td>
                <td style="text-align: right;">Bonto Ujung, ${tanggalPembuatan}</td>
              </tr>
              <tr>
                <td>Lampiran</td>
                <td>:</td>
                <td>${data.dokumen_url ? 'Ada' : '-'}</td>
                <td></td>
              </tr>
              <tr>
                <td>Perihal</td>
                <td>:</td>
                <td>Keterangan Kematian</td>
                <td></td>
              </tr>
            </table>
          </div>

          <div style="margin: 30px 0;">
            <p>Kepada Yth.</p>
            <p>${safeString(data.ditujukan)}</p>
            <p>di Tempat</p>
          </div>

          <div style="margin: 30px 0; text-align: justify;">
            <p>Yang bertanda tangan di bawah ini ${data.ttd_nama || 'Kepala Desa'} Bonto Ujung menerangkan bahwa:</p>
            <br>
            <table style="margin-left: 40px; margin-bottom: 20px;">
              <tr>
                <td>Nama</td>
                <td>: ${safeString(data.nama_lengkap)}</td>
              </tr>
              <tr>
                <td>NIK</td>
                <td>: ${safeString(data.nik)}</td>
              </tr>
              <tr>
                <td>Tempat/Tgl Lahir</td>
                <td>: ${safeString(data.tempat_lahir)}/${data.tanggal_lahir ? formatTanggalIndonesia(data.tanggal_lahir) : '...........................'}</td>
              </tr>
              <tr>
                <td>Alamat</td>
                <td>: ${safeString(data.alamat_lengkap)}</td>
              </tr>
              <tr>
                <td>Tanggal Kematian</td>
                <td>: ${data.tgl_kematian ? formatTanggalIndonesia(data.tgl_kematian) : '...........................'}</td>
              </tr>
              <tr>
                <td>Penyebab Kematian</td>
                <td>: ${safeString(data.penyebab_kematian)}</td>
              </tr>
            </table>

            <p style="text-indent: 40px;">
              Adalah benar warga Desa Bonto Ujung yang telah meninggal dunia sebagaimana keterangan di atas.
            </p>

            <p style="text-indent: 40px; margin-top: 20px;">
              Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.
            </p>
          </div>

          <div style="margin-top: 60px; text-align: right;">
            <p>${data.ttd_nama || 'Kepala Desa'} Bonto Ujung,</p>
            <div style="margin-top: 80px;">
              <p><strong><u>${safeString(data.ttd_nama_lengkap)}</u></strong></p>
              <p>NIP. ${safeString(data.nip)}</p>
            </div>
          </div>
        </div>
      `;
    },
    formFields: [
      { name: 'no_surat', label: 'Nomor Surat', type: 'text', placeholder: 'Masukkan Nomor Surat' },
      { name: 'nik', label: 'NIK', type: 'text', placeholder: 'Masukkan NIK', disabled: true },
      { name: 'nama_lengkap', label: 'Nama Lengkap', type: 'text', placeholder: 'Masukkan Nama Lengkap', disabled: true },
      { name: 'tempat_lahir', label: 'Tempat Lahir', type: 'text', placeholder: 'Masukkan Tempat Lahir', disabled: true },
      { name: 'tanggal_lahir', label: 'Tanggal Lahir', type: 'date', placeholder: 'Pilih Tanggal Lahir', disabled: true },
      { name: 'alamat_lengkap', label: 'Alamat Lengkap', type: 'text', placeholder: 'Masukkan Alamat Lengkap', disabled: true },
      { name: 'tgl_kematian', label: 'Tanggal Kematian', type: 'date', placeholder: 'Pilih Tanggal Kematian' },
      { name: 'penyebab_kematian', label: 'Penyebab Kematian', type: 'text', placeholder: 'Masukkan Penyebab Kematian' },
      { name: 'nomor_hp', label: 'Nomor HP', type: 'text', placeholder: 'Masukkan Nomor HP' },
      { name: 'dokumen_url', label: 'Lampiran Dokumen', type: 'file', accept: '.pdf,.jpg,.png' },
      { name: 'ditujukan', label: 'Ditujukan Ke -', type: 'text', placeholder: 'Penerima Surat' },
      { name: 'ttd_nama', label: 'Yang Bertandatangan', type: 'select', options: ['Kepala Desa', 'Sekretaris Desa'] },
      { name: 'nip', label: 'NIP', type: 'text', placeholder: 'NIP akan terisi otomatis', disabled: true }
    ]
  }
};

export default function PermohonanSurat() {
  const [permohonanList, setPermohonanList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedPermohonan, setSelectedPermohonan] = useState(null);
  const [formData, setFormData] = useState({});
  const [previewContent, setPreviewContent] = useState('');
  const router = useRouter();

  const pdfRef = useRef(null);
  const [html2pdf, setHtml2pdf] = useState(null);


  useEffect(() => {
    const loadHtml2Pdf = async () => {
      try {
        const module = await import('html2pdf.js');
        setHtml2pdf(() => module.default);
      } catch (err) {
        console.error('Gagal memuat html2pdf:', err);
        setError('Gagal memuat generator PDF');
      }
    };
    
    loadHtml2Pdf();
  }, []);

  // Fetch daftar permohonan saat komponen dimuat
  useEffect(() => {
    const fetchPermohonan = async () => {
      setLoading(true);
      try {
        const response = await fetch(API_ENDPOINTS.SEKRETARIS.PERMOHONAN_SURAT_GET_ALL, {
          method: 'GET',
          headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Gagal memuat permohonan');
        const data = await response.json();
        // Pastikan data.data adalah array, fallback ke [] jika tidak valid
        setPermohonanList(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        setError('Gagal memuat data: ' + err.message);
        setPermohonanList([]); // Fallback ke array kosong
      } finally {
        setLoading(false);
      }
    };
    fetchPermohonan();
  }, []);

  // Buka form untuk memproses permohonan
  const handleOpenForm = (permohonan) => {
    console.log('Data permohonan:', permohonan); // Debugging
    setSelectedPermohonan(permohonan);
    const template = suratTemplates[permohonan.jenis_surat];
    if (!template) {
      setError(`Template untuk ${permohonan.jenis_surat} tidak ditemukan`);
      return;
    }

    // Format tanggal untuk input date (YYYY-MM-DD)
    const formatDateSafely = (dateValue) => {
      if (!dateValue) return '';
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    };

    const formData = {
      nama_lengkap: safeFormString(permohonan.nama_lengkap),
      nik: safeFormString(permohonan.nik),
      alamat_lengkap: safeFormString(permohonan.alamat_lengkap),
      jenis_surat: safeFormString(permohonan.jenis_surat),
      keterangan: safeFormString(permohonan.keterangan),
      status: safeFormString(permohonan.status) || 'Diproses',
      tempat_lahir: safeFormString(permohonan.tempat_lahir),
      tanggal_lahir: formatDateSafely(permohonan.tanggal_lahir),
      dokumen_url: safeFormString(permohonan.dokumen_url),
      no_surat: '',
      ditujukan: safeFormString(permohonan.ditujukan),
      ttd_nama: '',
      ttd_nama_lengkap: '', // Inisialisasi untuk nama lengkap penandatangan
      nip: '',
      pekerjaan: safeFormString(permohonan.pekerjaan),
      keperluan: safeFormString(permohonan.keperluan),
      nama_usaha: safeFormString(permohonan.nama_usaha),
      jenis_usaha: safeFormString(permohonan.jenis_usaha),
      alamat_usaha: safeFormString(permohonan.alamat_usaha),
      alamat_tujuan: safeFormString(permohonan.alamat_tujuan),
      alasan_pindah: safeFormString(permohonan.alasan_pindah),
      jenis_kelamin: safeFormString(permohonan.jenis_kelamin),
      nama_ayah: safeFormString(permohonan.nama_ayah),
      nama_ibu: safeFormString(permohonan.nama_ibu),
      tgl_kematian: formatDateSafely(permohonan.tgl_kematian),
      penyebab_kematian: safeFormString(permohonan.penyebab_kematian),
      nomor_hp: safeFormString(permohonan.nomor_hp),
    };

    console.log('Form data:', formData); // Debugging
    setFormData(formData);
  };

  // Tutup form
  const handleCloseForm = () => {
    setSelectedPermohonan(null);
    setFormData({});
    setPreviewContent('');
    setError(null);
  };

  // Tangani perubahan input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedFormData = { ...formData, [name]: value };

    // Jika ttd_nama berubah, perbarui nip dan ttd_nama_lengkap secara otomatis
    if (name === 'ttd_nama') {
      updatedFormData.nip = penandatanganOptions[value]?.nip || '';
      updatedFormData.ttd_nama_lengkap = penandatanganOptions[value]?.namaLengkap || '';
    }

    setFormData(updatedFormData);
  };

  // Tangani upload file
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  // Generate preview surat
  const handlePreview = () => {
    if (!selectedPermohonan) {
      setError('Pilih permohonan terlebih dahulu.');
      return null;
    }
    const selectedTemplate = selectedPermohonan.jenis_surat;
    if (!suratTemplates[selectedTemplate]) {
      setError(`Template untuk ${selectedTemplate} tidak ditemukan.`);
      return null;
    }
    if (!Object.keys(formData).length) {
      setError('Isi formulir terlebih dahulu.');
      return null;
    }
    // Validasi ttd_nama
    if (!formData.ttd_nama) {
      setError('Silakan pilih "Yang Bertandatangan".');
      return null;
    }
    // Validasi ttd_nama_lengkap
    if (!formData.ttd_nama_lengkap) {
      setError('Nama Yang Bertandatangan tidak tersedia.');
      return null;
    }
    const content = suratTemplates[selectedTemplate].template(formData);
    return content;
  };

  // Tombol Generate Surat
  const handleGenerateSurat = () => {
    if (!selectedPermohonan) {
      setError('Pilih permohonan terlebih dahulu.');
      return;
    }
    try {
      setLoading(true);
      const content = handlePreview();
      if (!content) {
        throw new Error('Gagal menghasilkan preview surat.');
      }
      setPreviewContent(content);
    } catch (err) {
      setError('Gagal generate preview surat: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Simpan surat ke server
  const handleSaveSurat = async () => {
    if (!html2pdf) {
      setError('Generator PDF belum siap');
      return;
    }

    if (!pdfRef.current || !previewContent) {
      setError('Konten preview tidak tersedia');
      return;
    }

    try {
      setLoading(true);

      // Clone node untuk menghindari masalah dengan DOM
      const contentClone = pdfRef.current.cloneNode(true);
      document.body.appendChild(contentClone);

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${selectedPermohonan.jenis_surat}_${formData.no_surat || 'surat'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          logging: false,
          allowTaint: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' 
        },
      };

      // Generate PDF blob
      const pdfBlob = await html2pdf()
        .set(opt)
        .from(contentClone)
        .output('blob');

      // Bersihkan clone
      document.body.removeChild(contentClone);

      // Siapkan FormData untuk upload
      const formDataToSend = new FormData();
      formDataToSend.append('id', selectedPermohonan.id);
      formDataToSend.append('nomor', formData.no_surat || '');
      formDataToSend.append('tanggal', new Date().toISOString().split('T')[0]);
      formDataToSend.append('perihal', formData.keterangan || selectedPermohonan.jenis_surat);
      formDataToSend.append('ditujukan', formData.ditujukan || '');
      formDataToSend.append('title', selectedPermohonan.jenis_surat);
      formDataToSend.append('file', pdfBlob, opt.filename);

      // Kirim ke server
      const response = await fetch(API_ENDPOINTS.SEKRETARIS.SURAT_KELUAR_ADD, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan surat');
      }

      // Update status permohonan
      await updatePermohonanStatus(selectedPermohonan.id);

      // Reset state dan tampilkan notifikasi
      setPreviewContent('');
      handleCloseForm();
      alert('Surat berhasil disimpan dan status diperbarui.');

    } catch (err) {
      setError('Gagal menyimpan surat: ' + err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi helper untuk update status permohonan
  const updatePermohonanStatus = async (id) => {
    const response = await fetch(
      API_ENDPOINTS.SEKRETARIS.PERMOHONAN_SURAT_UPDATE_STATUS(id),
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Selesai' }),
      }
    );

    if (!response.ok) {
      throw new Error('Gagal memperbarui status permohonan');
    }

    // Update local state
    setPermohonanList(prevList =>
      prevList.map(item => 
        item.id === id ? { ...item, status: 'Selesai' } : item
      )
    );
  };

  // Cetak surat
  const handlePrint = () => {
    if (!previewContent) {
      alert('Silakan generate preview surat terlebih dahulu.');
      return;
    }

    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'absolute';
    printFrame.style.left = '-9999px';
    document.body.appendChild(printFrame);

    printFrame.contentDocument.write(`
      <html>
        <head>
          <title>Cetak ${selectedPermohonan?.jenis_surat || 'Surat'}</title>
          <style>
            body { 
              font-family: 'Times New Roman', serif; 
              line-height: 1.5; 
              margin: 20px;
            }
            @page { margin: 0; }
          </style>
        </head>
        <body>
          ${previewContent}
        </body>
      </html>
    `);
    printFrame.contentDocument.close();

    printFrame.contentWindow.focus();
    printFrame.contentWindow.print();

    setTimeout(() => {
      document.body.removeChild(printFrame);
    }, 1000);
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Render error state
  if (error) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <StyledCard>
          <HeaderBox>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Permohonan Surat
            </Typography>
          </HeaderBox>
          <CardContent>
            <Typography color="error" p={3}>
              {error}
            </Typography>
          </CardContent>
        </StyledCard>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <StyledCard>
        <HeaderBox>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Permohonan Surat
          </Typography>
        </HeaderBox>

        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : permohonanList.length === 0 ? (
            <Typography align="center" p={4}>
              Tidak ada permohonan surat.
            </Typography>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>No</strong></TableCell>
                      <TableCell><strong>NIK</strong></TableCell>
                      <TableCell><strong>Nama</strong></TableCell>
                      <TableCell><strong>Jenis Surat</strong></TableCell>
                      <TableCell><strong>Keterangan</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Tanggal</strong></TableCell>
                      <TableCell><strong>Aksi</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {permohonanList
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((permohonan, index) => (
                        <TableRow key={permohonan.id}>
                          <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                          <TableCell>{permohonan.nik}</TableCell>
                          <TableCell>{permohonan.nama_lengkap}</TableCell>
                          <TableCell>{permohonan.jenis_surat}</TableCell>
                          <TableCell>{permohonan.keterangan}</TableCell>
                          <TableCell>
                            <Chip
                              label={permohonan.status}
                              color={statusColors[permohonan.status] || 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(permohonan.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleOpenForm(permohonan)}
                              disabled={permohonan.status === 'Selesai'}
                            >
                              Proses
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={permohonanList.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </CardContent>

        {/* Dialog Form Processing */}
        <Dialog open={!!selectedPermohonan} onClose={handleCloseForm} maxWidth="md" fullWidth>
          <DialogTitle>
            Proses Permohonan Surat: {selectedPermohonan?.jenis_surat}
            <IconButton
              aria-label="close"
              onClick={handleCloseForm}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Box component="form" sx={{ mt: 2 }}>
              {selectedPermohonan && suratTemplates[selectedPermohonan.jenis_surat]?.formFields.map((field) => (
                <Box key={field.name} sx={{ mb: 2 }}>
                  {field.type === 'select' ? (
                    <>
                      <Typography sx={{ display: 'block', mb: 1, fontWeight: 500 }}>
                        {field.label}
                      </Typography>
                      <FormControl fullWidth>
                        <Select
                          id={field.name}
                          name={field.name}
                          value={formData[field.name] || ''}
                          onChange={handleInputChange}
                          disabled={field.disabled}
                        >
                          <MenuItem value="">
                            <em>Pilih</em>
                          </MenuItem>
                          {field.options.map((option) => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {field.name === 'ttd_nama' && formData.ttd_nama && (
                        <Box sx={{ mt: 2 }}>
                          <Typography sx={{ display: 'block', mb: 1, fontWeight: 500 }}>
                            Nama Yang Bertandatangan
                          </Typography>
                          <TextField
                            value={formData.ttd_nama_lengkap || ''}
                            fullWidth
                            disabled
                            variant="outlined"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: '#ccc' },
                                '&:hover fieldset': { borderColor: '#999' },
                                '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                              },
                            }}
                          />
                        </Box>
                      )}
                    </>
                  ) : field.type === 'file' ? (
                    <>
                      <Typography sx={{ display: 'block', mb: 1, fontWeight: 500 }}>
                        {field.label}
                      </Typography>
                      <input
                        id={field.name}
                        name={field.name}
                        type="file"
                        accept={field.accept}
                        onChange={handleFileChange}
                        style={{ marginTop: '8px', display: 'block' }}
                      />
                    </>
                  ) : (
                    <>
                      <Typography sx={{ display: 'block', mb: 1, fontWeight: 500 }}>
                        {field.label}
                      </Typography>
                      <TextField
                        id={field.name}
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleInputChange}
                        placeholder={field.placeholder}
                        type={field.type === 'date' ? 'date' : 'text'}
                        multiline={field.type === 'textarea'}
                        rows={field.type === 'textarea' ? 4 : 1}
                        fullWidth
                        variant="outlined"
                        disabled={field.disabled}
                        InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: '#ccc' },
                            '&:hover fieldset': { borderColor: '#999' },
                            '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                          },
                        }}
                      />
                    </>
                  )}
                </Box>
              ))}
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ display: 'block', mb: 1, fontWeight: 500 }}>
                  Keterangan
                </Typography>
                <TextField
                  name="keterangan"
                  value={formData.keterangan || ''}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseForm}>Batal</Button>
            <Button
              onClick={handleGenerateSurat}
              variant="contained"
              disabled={loading}
            >
              Preview Surat
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Preview Surat */}
        <Dialog open={!!previewContent} onClose={() => setPreviewContent('')} maxWidth="lg" fullWidth>
          <DialogTitle>
            Preview Surat
            <IconButton
              aria-label="close"
              onClick={() => setPreviewContent('')}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>

          {/* <div 
          ref={pdfRef} // Pasang ref di sini
          dangerouslySetInnerHTML={{ __html: previewContent }} 
          style={{ 
            padding: '20px',
            fontFamily: "'Times New Roman', serif",
            lineHeight: 1.5 
          }}/> */}

<div ref={pdfRef} dangerouslySetInnerHTML={{ __html: previewContent }} />
           
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewContent('')}>Kembali</Button>
            <Button
              onClick={handleSaveSurat}
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading}
            >  
              Simpan
            </Button>
            <Button
              onClick={handlePrint}
              variant="contained"
              startIcon={<PrintIcon />}
              disabled={loading}
            >
              Cetak
            </Button>
          </DialogActions>
        </Dialog>
      </StyledCard>
    </Box>
  );
}