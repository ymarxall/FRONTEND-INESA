'use client';
import { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Typography, Card, CardContent, IconButton,
  CircularProgress, TablePagination, Chip, Box, styled,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS, getHeaders } from '@/config/api';

// Styled components
const StyledCard = styled(Card)({
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
  overflow: 'hidden'
});

const HeaderBox = styled(Box)({
  background: 'linear-gradient(135deg, #c62828 0%, #b71c1c 100%)',
  padding: '24px',
  color: 'white',
  borderRadius: '16px 16px 0 0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
});

// Template Surat
const suratTemplates = {
  'Surat Keterangan Domisili': {
    title: 'Surat Keterangan Domisili',
    template: (data) => `
      <div style="font-family: 'Times New Roman', serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="display: flex; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
          <img src="/image.png" alt="Logo Desa" style="height: 80px; margin-right: 20px;" />
          <div>
            <h2 style="margin: 0;">PEMERINTAH DESA BONTO UJUNG</h2>
            <h3 style="margin: 5px 0;">KECAMATAN TAROWANG - KABUPATEN JENEPONTO</h3>
            <p style="margin: 0;">Jl. Poros Tarowang No. 10, Kode Pos 92351</p>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <p style="text-align: right;">Bonto Ujung, ${new Date().toLocaleDateString('id-ID')}</p>
          <p>Nomor: ${data.no_surat || '.../PD-BU/VI/2023'}</p>
          <p>Lampiran: ${data.lampiran || '-'}</p>
          <p>Perihal: Keterangan Domisili</p>
        </div>

        <div style="margin: 30px 0;">
          <p>Kepada Yth.</p>
          <p>${data.tujuan || '...........................'}</p>
          <p>di Tempat</p>
        </div>

        <div style="margin: 30px 0; text-align: justify;">
          <p>Yang bertanda tangan di bawah ini Kepala Desa Bonto Ujung menerangkan bahwa:</p>
          
          <table style="margin-left: 40px; margin-bottom: 20px;">
            <tr>
              <td>Nama</td>
              <td>: ${data.nama || '...........................'}</td>
            </tr>
            <tr>
              <td>NIK</td>
              <td>: ${data.nik || '...........................'}</td>
            </tr>
            <tr>
              <td>Tempat/Tgl Lahir</td>
              <td>: ${data.tempat_tgl_lahir || '...........................'}</td>
            </tr>
            <tr>
              <td>Alamat</td>
              <td>: ${data.alamat || '...........................'}</td>
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
          <p>Kepala Desa Bonto Ujung,</p>
          <div style="margin-top: 80px;">
            <p><strong><u>${data.ttd_nama || '...........................'}</u></strong></p>
            <p>NIP. ${data.nip || '...........................'}</p>
          </div>
        </div>
      </div>
    `,
    formFields: [
      { name: 'no_surat', label: 'Nomor Surat', type: 'text', placeholder: 'Masukkan Nomor Surat' },
      { name: 'nama', label: 'Nama', type: 'text', placeholder: 'Masukkan Nama' },
      { name: 'nik', label: 'NIK', type: 'text', placeholder: 'Masukkan NIK' },
      { name: 'tempat_tgl_lahir', label: 'Tempat/Tanggal Lahir', type: 'text', placeholder: 'Contoh: Makassar/01-01-1990' },
      { name: 'alamat', label: 'Alamat', type: 'text', placeholder: 'Masukkan Alamat Lengkap' },
      { name: 'tujuan', label: 'Tujuan', type: 'text', placeholder: 'Masukkan Tujuan Surat' },
      { name: 'ttd_nama', label: 'Nama Penandatangan', type: 'text', placeholder: 'Masukkan Nama Penandatangan' },
      { name: 'nip', label: 'NIP', type: 'text', placeholder: 'Masukkan NIP' },
      { name: 'lampiran', label: 'Lampiran', type: 'text', placeholder: 'Masukkan Deskripsi Lampiran' }
    ]
  },
  'Surat Keterangan Tidak Mampu': {
    title: 'Surat Keterangan Tidak Mampu',
    template: (data) => `
      <div style="font-family: 'Times New Roman', serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="display: flex; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
          <img src="/images/logo.png" alt="Logo Desa" style="height: 80px; margin-right: 20px;" />
          <div>
            <h2 style="margin: 0;">PEMERINTAH DESA BONTO UJUNG</h2>
            <h3 style="margin: 5px 0;">KECAMATAN TAROWANG - KABUPATEN JENEPONTO</h3>
            <p style="margin: 0;">Jl. Poros Tarowang No. 10, Kode Pos 92351</p>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <p style="text-align: right;">Bonto Ujung, ${new Date().toLocaleDateString('id-ID')}</p>
          <p>Nomor: ${data.no_surat || '.../PD-BU/VI/2023'}</p>
          <p>Lampiran: ${data.lampiran || '-'}</p>
          <p>Perihal: Keterangan Tidak Mampu</p>
        </div>

        <div style="margin: 30px 0;">
          <p>Kepada Yth.</p>
          <p>${data.tujuan || '...........................'}</p>
          <p>di Tempat</p>
        </div>

        <div style="margin: 30px 0; text-align: justify;">
          <p>Yang bertanda tangan di bawah ini Kepala Desa Bonto Ujung menerangkan bahwa:</p>
          
          <table style="margin-left: 40px; margin-bottom: 20px;">
            <tr>
              <td>Nama</td>
              <td>: ${data.nama || '...........................'}</td>
            </tr>
            <tr>
              <td>NIK</td>
              <td>: ${data.nik || '...........................'}</td>
            </tr>
            <tr>
              <td>Tempat/Tgl Lahir</td>
              <td>: ${data.tempat_tgl_lahir || '...........................'}</td>
            </tr>
            <tr>
              <td>Alamat</td>
              <td>: ${data.alamat || '...........................'}</td>
            </tr>
            <tr>
              <td>Pekerjaan</td>
              <td>: ${data.pekerjaan || '...........................'}</td>
            </tr>
          </table>

          <p style="text-indent: 40px;">
            Adalah benar warga Desa Bonto Ujung dan berdasarkan pengamatan termasuk dalam kategori tidak mampu untuk keperluan ${data.keperluan || '...........................'}.
          </p>

          <p style="text-indent: 40px; margin-top: 20px;">
            Demikian surat keterangan ini dibuat dengan sebenar-benarnya untuk dapat dipergunakan sebagaimana mestinya.
          </p>
        </div>

        <div style="margin-top: 60px; text-align: right;">
          <p>Kepala Desa Bonto Ujung,</p>
          <div style="margin-top: 80px;">
            <p><strong><u>${data.ttd_nama || '...........................'}</u></strong></p>
            <p>NIP. ${data.nip || '...........................'}</p>
          </div>
        </div>
      </div>
    `,
    formFields: [
      { name: 'no_surat', label: 'Nomor Surat', type: 'text', placeholder: 'Masukkan Nomor Surat' },
      { name: 'nama', label: 'Nama', type: 'text', placeholder: 'Masukkan Nama' },
      { name: 'nik', label: 'NIK', type: 'text', placeholder: 'Masukkan NIK' },
      { name: 'tempat_tgl_lahir', label: 'Tempat/Tanggal Lahir', type: 'text', placeholder: 'Contoh: Makassar/01-01-1990' },
      { name: 'alamat', label: 'Alamat', type: 'text', placeholder: 'Masukkan Alamat Lengkap' },
      { name: 'pekerjaan', label: 'Pekerjaan', type: 'text', placeholder: 'Masukkan Pekerjaan' },
      { name: 'keperluan', label: 'Keperluan', type: 'text', placeholder: 'Masukkan Keperluan' },
      { name: 'tujuan', label: 'Tujuan', type: 'text', placeholder: 'Masukkan Tujuan Surat' },
      { name: 'ttd_nama', label: 'Nama Penandatangan', type: 'text', placeholder: 'Masukkan Nama Penandatangan' },
      { name: 'nip', label: 'NIP', type: 'text', placeholder: 'Masukkan NIP' },
      { name: 'lampiran', label: 'Lampiran', type: 'text', placeholder: 'Masukkan Deskripsi Lampiran' }
    ]
  },
  'Surat Keterangan Usaha': {
    title: 'Surat Keterangan Usaha',
    template: (data) => `
      <div style="font-family: 'Times New Roman', serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="display: flex; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
          <img src="/images/logo.png" alt="Logo Desa" style="height: 80px; margin-right: 20px;" />
          <div>
            <h2 style="margin: 0;">PEMERINTAH DESA BONTO UJUNG</h2>
            <h3 style="margin: 5px 0;">KECAMATAN TAROWANG - KABUPATEN JENEPONTO</h3>
            <p style="margin: 0;">Jl. Poros Tarowang No. 10, Kode Pos 92351</p>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <p style="text-align: right;">Bonto Ujung, ${new Date().toLocaleDateString('id-ID')}</p>
          <p>Nomor: ${data.no_surat || '.../PD-BU/VI/2023'}</p>
          <p>Lampiran: ${data.lampiran || '-'}</p>
          <p>Perihal: Keterangan Usaha</p>
        </div>

        <div style="margin: 30px 0;">
          <p>Kepada Yth.</p>
          <p>${data.tujuan || '...........................'}</p>
          <p>di Tempat</p>
        </div>

        <div style="margin: 30px 0; text-align: justify;">
          <p>Yang bertanda tangan di bawah ini Kepala Desa Bonto Ujung menerangkan bahwa:</p>
          
          <table style="margin-left: 40px; margin-bottom: 20px;">
            <tr>
              <td>Nama</td>
              <td>: ${data.nama || '...........................'}</td>
            </tr>
            <tr>
              <td>NIK</td>
              <td>: ${data.nik || '...........................'}</td>
            </tr>
            <tr>
              <td>Tempat/Tgl Lahir</td>
              <td>: ${data.tempat_tgl_lahir || '...........................'}</td>
            </tr>
            <tr>
              <td>Alamat</td>
              <td>: ${data.alamat || '...........................'}</td>
            </tr>
            <tr>
              <td>Nama Usaha</td>
              <td>: ${data.nama_usaha || '...........................'}</td>
            </tr>
            <tr>
              <td>Jenis Usaha</td>
              <td>: ${data.jenis_usaha || '...........................'}</td>
            </tr>
            <tr>
              <td>Alamat Usaha</td>
              <td>: ${data.alamat_usaha || '...........................'}</td>
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
          <p>Kepala Desa Bonto Ujung,</p>
          <div style="margin-top: 80px;">
            <p><strong><u>${data.ttd_nama || '...........................'}</u></strong></p>
            <p>NIP. ${data.nip || '...........................'}</p>
          </div>
        </div>
      </div>
    `,
    formFields: [
      { name: 'no_surat', label: 'Nomor Surat', type: 'text', placeholder: 'Masukkan Nomor Surat' },
      { name: 'nama', label: 'Nama', type: 'text', placeholder: 'Masukkan Nama' },
      { name: 'nik', label: 'NIK', type: 'text', placeholder: 'Masukkan NIK' },
      { name: 'tempat_tgl_lahir', label: 'Tempat/Tanggal Lahir', type: 'text', placeholder: 'Contoh: Makassar/01-01-1990' },
      { name: 'alamat', label: 'Alamat', type: 'text', placeholder: 'Masukkan Alamat Lengkap' },
      { name: 'nama_usaha', label: 'Nama Usaha', type: 'text', placeholder: 'Masukkan Nama Usaha' },
      { name: 'jenis_usaha', label: 'Jenis Usaha', type: 'text', placeholder: 'Masukkan Jenis Usaha' },
      { name: 'alamat_usaha', label: 'Alamat Usaha', type: 'text', placeholder: 'Masukkan Alamat Usaha' },
      { name: 'tujuan', label: 'Tujuan', type: 'text', placeholder: 'Masukkan Tujuan Surat' },
      { name: 'ttd_nama', label: 'Nama Penandatangan', type: 'text', placeholder: 'Masukkan Nama Penandatangan' },
      { name: 'nip', label: 'NIP', type: 'text', placeholder: 'Masukkan NIP' },
      { name: 'lampiran', label: 'Lampiran', type: 'text', placeholder: 'Masukkan Deskripsi Lampiran' }
    ]
  },
  'Surat Keterangan Pindah': {
    title: 'Surat Keterangan Pindah',
    template: (data) => `
      <div style="font-family: 'Times New Roman', serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="display: flex; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
          <img src="/images/logo.png" alt="Logo Desa" style="height: 80px; margin-right: 20px;" />
          <div>
            <h2 style="margin: 0;">PEMERINTAH DESA BONTO UJUNG</h2>
            <h3 style="margin: 5px 0;">KECAMATAN TAROWANG - KABUPATEN JENEPONTO</h3>
            <p style="margin: 0;">Jl. Poros Tarowang No. 10, Kode Pos 92351</p>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <p style="text-align: right;">Bonto Ujung, ${new Date().toLocaleDateString('id-ID')}</p>
          <p>Nomor: ${data.no_surat || '.../PD-BU/VI/2023'}</p>
          <p>Lampiran: ${data.lampiran || '-'}</p>
          <p>Perihal: Keterangan Pindah</p>
        </div>

        <div style="margin: 30px 0;">
          <p>Kepada Yth.</p>
          <p>${data.tujuan || '...........................'}</p>
          <p>di Tempat</p>
        </div>

        <div style="margin: 30px 0; text-align: justify;">
          <p>Yang bertanda tangan di bawah ini Kepala Desa Bonto Ujung menerangkan bahwa:</p>
          
          <table style="margin-left: 40px; margin-bottom: 20px;">
            <tr>
              <td>Nama</td>
              <td>: ${data.nama || '...........................'}</td>
            </tr>
            <tr>
              <td>NIK</td>
              <td>: ${data.nik || '...........................'}</td>
            </tr>
            <tr>
              <td>Tempat/Tgl Lahir</td>
              <td>: ${data.tempat_tgl_lahir || '...........................'}</td>
            </tr>
            <tr>
              <td>Alamat Asal</td>
              <td>: ${data.alamat_asal || '...........................'}</td>
            </tr>
            <tr>
              <td>Alamat Tujuan</td>
              <td>: ${data.alamat_tujuan || '...........................'}</td>
            </tr>
            <tr>
              <td>Alasan Pindah</td>
              <td>: ${data.alasan_pindah || '...........................'}</td>
            </tr>
          </table>

          <p style="text-indent: 40px;">
            Adalah benar warga Desa Bonto Ujung yang akan pindah ke alamat tujuan tersebut di atas untuk keperluan ${data.keperluan || '...........................'}.
          </p>

          <p style="text-indent: 40px; margin-top: 20px;">
            Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.
          </p>
        </div>

        <div style="margin-top: 60px; text-align: right;">
          <p>Kepala Desa Bonto Ujung,</p>
          <div style="margin-top: 80px;">
            <p><strong><u>${data.ttd_nama || '...........................'}</u></strong></p>
            <p>NIP. ${data.nip || '...........................'}</p>
          </div>
        </div>
      </div>
    `,
    formFields: [
      { name: 'no_surat', label: 'Nomor Surat', type: 'text', placeholder: 'Masukkan Nomor Surat' },
      { name: 'nama', label: 'Nama', type: 'text', placeholder: 'Masukkan Nama' },
      { name: 'nik', label: 'NIK', type: 'text', placeholder: 'Masukkan NIK' },
      { name: 'tempat_tgl_lahir', label: 'Tempat/Tanggal Lahir', type: 'text', placeholder: 'Contoh: Makassar/01-01-1990' },
      { name: 'alamat_asal', label: 'Alamat Asal', type: 'text', placeholder: 'Masukkan Alamat Asal' },
      { name: 'alamat_tujuan', label: 'Alamat Tujuan', type: 'text', placeholder: 'Masukkan Alamat Tujuan' },
      { name: 'alasan_pindah', label: 'Alasan Pindah', type: 'text', placeholder: 'Masukkan Alasan Pindah' },
      { name: 'keperluan', label: 'Keperluan', type: 'text', placeholder: 'Masukkan Keperluan' },
      { name: 'tujuan', label: 'Tujuan', type: 'text', placeholder: 'Masukkan Tujuan Surat' },
      { name: 'ttd_nama', label: 'Nama Penandatangan', type: 'text', placeholder: 'Masukkan Nama Penandatangan' },
      { name: 'nip', label: 'NIP', type: 'text', placeholder: 'Masukkan NIP' },
      { name: 'lampiran', label: 'Lampiran', type: 'text', placeholder: 'Masukkan Deskripsi Lampiran' }
    ]
  },
  'Surat Pengantar': {
    title: 'Surat Pengantar',
    template: (data) => `
      <div style="font-family: 'Times New Roman', serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="display: flex; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
          <img src="/images/logo.png" alt="Logo Desa" style="height: 80px; margin-right: 20px;" />
          <div>
            <h2 style="margin: 0;">PEMERINTAH DESA BONTO UJUNG</h2>
            <h3 style="margin: 5px 0;">KECAMATAN TAROWANG - KABUPATEN JENEPONTO</h3>
            <p style="margin: 0;">Jl. Poros Tarowang No. 10, Kode Pos 92351</p>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <p style="text-align: center; font-weight: bold; font-size: 18px;">SURAT PENGANTAR</p>
          <p style="text-align: center;">Nomor: ${data.no_surat || '.../PD-BU/VI/2023'}</p>
          <p style="text-align: center;">Lampiran: ${data.lampiran || '-'}</p>
        </div>

        <div style="margin: 30px 0; text-align: justify;">
          <p>Yang bertanda tangan di bawah ini Kepala Desa Bonto Ujung menerangkan bahwa:</p>
          
          <table style="margin-left: 40px; margin-bottom: 20px;">
            <tr>
              <td>Nama</td>
              <td>: ${data.nama || '...........................'}</td>
            </tr>
            <tr>
              <td>NIK</td>
              <td>: ${data.nik || '...........................'}</td>
            </tr>
            <tr>
              <td>Tempat/Tgl Lahir</td>
              <td>: ${data.tempat_tgl_lahir || '...........................'}</td>
            </tr>
            <tr>
              <td>Alamat</td>
              <td>: ${data.alamat || '...........................'}</td>
            </tr>
          </table>

          <p style="text-indent: 40px;">
            Adalah benar warga Desa Bonto Ujung dan memerlukan surat pengantar ini untuk keperluan ${data.keperluan || '...........................'}.
          </p>

          <p style="text-indent: 40px; margin-top: 20px;">
            Demikian surat pengantar ini dibuat untuk dapat dipergunakan sebagaimana mestinya.
          </p>
        </div>

        <div style="margin-top: 60px; text-align: right;">
          <p>Bonto Ujung, ${new Date().toLocaleDateString('id-ID')}</p>
          <p>Kepala Desa Bonto Ujung,</p>
          <div style="margin-top: 80px;">
            <p><strong><u>${data.ttd_nama || '...........................'}</u></strong></p>
            <p>NIP. ${data.nip || '...........................'}</p>
          </div>
        </div>
      </div>
    `,
    formFields: [
      { name: 'no_surat', label: 'Nomor Surat', type: 'text', placeholder: 'Masukkan Nomor Surat' },
      { name: 'nama', label: 'Nama', type: 'text', placeholder: 'Masukkan Nama' },
      { name: 'nik', label: 'NIK', type: 'text', placeholder: 'Masukkan NIK' },
      { name: 'tempat_tgl_lahir', label: 'Tempat/Tanggal Lahir', type: 'text', placeholder: 'Contoh: Makassar/01-01-1990' },
      { name: 'alamat', label: 'Alamat', type: 'text', placeholder: 'Masukkan Alamat Lengkap' },
      { name: 'keperluan', label: 'Keperluan', type: 'text', placeholder: 'Masukkan Keperluan' },
      { name: 'tujuan', label: 'Tujuan', type: 'text', placeholder: 'Masukkan Tujuan Surat' },
      { name: 'ttd_nama', label: 'Nama Penandatangan', type: 'text', placeholder: 'Masukkan Nama Penandatangan' },
      { name: 'nip', label: 'NIP', type: 'text', placeholder: 'Masukkan NIP' },
      { name: 'lampiran', label: 'Lampiran', type: 'text', placeholder: 'Masukkan Deskripsi Lampiran' }
    ]
  },
  'Surat Keterangan Kelahiran': {
    title: 'Surat Keterangan Kelahiran',
    template: (data) => `
      <div style="font-family: 'Times New Roman', serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="display: flex; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
          <img src="/images/logo.png" alt="Logo Desa" style="height: 80px; margin-right: 20px;" />
          <div>
            <h2 style="margin: 0;">PEMERINTAH DESA BONTO UJUNG</h2>
            <h3 style="margin: 5px 0;">KECAMATAN TAROWANG - KABUPATEN JENEPONTO</h3>
            <p style="margin: 0;">Jl. Poros Tarowang No. 10, Kode Pos 92351</p>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <p style="text-align: right;">Bonto Ujung, ${new Date().toLocaleDateString('id-ID')}</p>
          <p>Nomor: ${data.no_surat || '.../PD-BU/VI/2023'}</p>
          <p>Lampiran: ${data.lampiran || '-'}</p>
          <p>Perihal: Keterangan Kelahiran</p>
        </div>

        <div style="margin: 30px 0;">
          <p>Kepada Yth.</p>
          <p>${data.tujuan || '...........................'}</p>
          <p>di Tempat</p>
        </div>

        <div style="margin: 30px 0; text-align: justify;">
          <p>Yang bertanda tangan di bawah ini Kepala Desa Bonto Ujung menerangkan bahwa:</p>
          
          <table style="margin-left: 40px; margin-bottom: 20px;">
            <tr>
              <td>Nama Anak</td>
              <td>: ${data.nama_anak || '...........................'}</td>
            </tr>
            <tr>
              <td>Jenis Kelamin</td>
              <td>: ${data.jenis_kelamin || '...........................'}</td>
            </tr>
            <tr>
              <td>Tempat/Tgl Lahir</td>
              <td>: ${data.tempat_tgl_lahir_anak || '...........................'}</td>
            </tr>
            <tr>
              <td>Nama Ayah</td>
              <td>: ${data.nama_ayah || '...........................'}</td>
            </tr>
            <tr>
              <td>Nama Ibu</td>
              <td>: ${data.nama_ibu || '...........................'}</td>
            </tr>
            <tr>
              <td>Alamat Orang Tua</td>
              <td>: ${data.alamat || '...........................'}</td>
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
          <p>Kepala Desa Bonto Ujung,</p>
          <div style="margin-top: 80px;">
            <p><strong><u>${data.ttd_nama || '...........................'}</u></strong></p>
            <p>NIP. ${data.nip || '...........................'}</p>
          </div>
        </div>
      </div>
    `,
    formFields: [
      { name: 'no_surat', label: 'Nomor Surat', type: 'text', placeholder: 'Masukkan Nomor Surat' },
      { name: 'nama_anak', label: 'Nama Anak', type: 'text', placeholder: 'Masukkan Nama Anak' },
      { name: 'jenis_kelamin', label: 'Jenis Kelamin', type: 'text', placeholder: 'Masukkan Jenis Kelamin' },
      { name: 'tempat_tgl_lahir_anak', label: 'Tempat/Tanggal Lahir Anak', type: 'text', placeholder: 'Contoh: Makassar/01-01-1990' },
      { name: 'nama_ayah', label: 'Nama Ayah', type: 'text', placeholder: 'Masukkan Nama Ayah' },
      { name: 'nama_ibu', label: 'Nama Ibu', type: 'text', placeholder: 'Masukkan Nama Ibu' },
      { name: 'alamat', label: 'Alamat Orang Tua', type: 'text', placeholder: 'Masukkan Alamat Orang Tua' },
      { name: 'tujuan', label: 'Tujuan', type: 'text', placeholder: 'Masukkan Tujuan Surat' },
      { name: 'ttd_nama', label: 'Nama Penandatangan', type: 'text', placeholder: 'Masukkan Nama Penandatangan' },
      { name: 'nip', label: 'NIP', type: 'text', placeholder: 'Masukkan NIP' },
      { name: 'lampiran', label: 'Lampiran', type: 'text', placeholder: 'Masukkan Deskripsi Lampiran' }
    ]
  },
  'Surat Keterangan Kematian': {
    title: 'Surat Keterangan Kematian',
    template: (data) => `
      <div style="font-family: 'Times New Roman', serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="display: flex; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
          <img src="/images/logo.png" alt="Logo Desa" style="height: 80px; margin-right: 20px;" />
          <div>
            <h2 style="margin: 0;">PEMERINTAH DESA BONTO UJUNG</h2>
            <h3 style="margin: 5px 0;">KECAMATAN TAROWANG - KABUPATEN JENEPONTO</h3>
            <p style="margin: 0;">Jl. Poros Tarowang No. 10, Kode Pos 92351</p>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <p style="text-align: right;">Bonto Ujung, ${new Date().toLocaleDateString('id-ID')}</p>
          <p>Nomor: ${data.no_surat || '.../PD-BU/VI/2023'}</p>
          <p>Lampiran: ${data.lampiran || '-'}</p>
          <p>Perihal: Keterangan Kematian</p>
        </div>

        <div style="margin: 30px 0;">
          <p>Kepada Yth.</p>
          <p>${data.tujuan || '...........................'}</p>
          <p>di Tempat</p>
        </div>

        <div style="margin: 30px 0; text-align: justify;">
          <p>Yang bertanda tangan di bawah ini Kepala Desa Bonto Ujung menerangkan bahwa:</p>
          
          <table style="margin-left: 40px; margin-bottom: 20px;">
            <tr>
              <td>Nama</td>
              <td>: ${data.nama || '...........................'}</td>
            </tr>
            <tr>
              <td>NIK</td>
              <td>: ${data.nik || '...........................'}</td>
            </tr>
            <tr>
              <td>Tempat/Tgl Lahir</td>
              <td>: ${data.tempat_tgl_lahir || '...........................'}</td>
            </tr>
            <tr>
              <td>Alamat</td>
              <td>: ${data.alamat || '...........................'}</td>
            </tr>
            <tr>
              <td>Tanggal Kematian</td>
              <td>: ${data.tgl_kematian || '...........................'}</td>
            </tr>
            <tr>
              <td>Penyebab Kematian</td>
              <td>: ${data.penyebab_kematian || '...........................'}</td>
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
          <p>Kepala Desa Bonto Ujung,</p>
          <div style="margin-top: 80px;">
            <p><strong><u>${data.ttd_nama || '...........................'}</u></strong></p>
            <p>NIP. ${data.nip || '...........................'}</p>
          </div>
        </div>
      </div>
    `,
    formFields: [
      { name: 'no_surat', label: 'Nomor Surat', type: 'text', placeholder: 'Masukkan Nomor Surat' },
      { name: 'nama', label: 'Nama', type: 'text', placeholder: 'Masukkan Nama' },
      { name: 'nik', label: 'NIK', type: 'text', placeholder: 'Masukkan NIK' },
      { name: 'tempat_tgl_lahir', label: 'Tempat/Tanggal Lahir', type: 'text', placeholder: 'Contoh: Makassar/01-01-1990' },
      { name: 'alamat', label: 'Alamat', type: 'text', placeholder: 'Masukkan Alamat Lengkap' },
      { name: 'tgl_kematian', label: 'Tanggal Kematian', type: 'text', placeholder: 'Contoh: 01-01-2023' },
      { name: 'penyebab_kematian', label: 'Penyebab Kematian', type: 'text', placeholder: 'Masukkan Penyebab Kematian' },
      { name: 'tujuan', label: 'Tujuan', type: 'text', placeholder: 'Masukkan Tujuan Surat' },
      { name: 'ttd_nama', label: 'Nama Penandatangan', type: 'text', placeholder: 'Masukkan Nama Penandatangan' },
      { name: 'nip', label: 'NIP', type: 'text', placeholder: 'Masukkan NIP' },
      { name: 'lampiran', label: 'Lampiran', type: 'text', placeholder: 'Masukkan Deskripsi Lampiran' }
    ]
  }
};

export default function CetakLayananSurat() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [previewContent, setPreviewContent] = useState('');
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [attachmentData, setAttachmentData] = useState({});
  const router = useRouter();

  useEffect(() => {
    // Simulate API fetch
    setLoading(true);
    setTimeout(() => {
      setTemplates([
        { id: 1, nama: 'Surat Keterangan Domisili', kategori: 'Administrasi Kependudukan', lampiran: '' },
        { id: 2, nama: 'Surat Keterangan Tidak Mampu', kategori: 'Administrasi Kependudukan', lampiran: '' },
        { id: 3, nama: 'Surat Keterangan Usaha', kategori: 'Administrasi Kependudukan', lampiran: '' },
        { id: 4, nama: 'Surat Keterangan Pindah', kategori: 'Administrasi Kependudukan', lampiran: '' },
        { id: 5, nama: 'Surat Pengantar', kategori: 'Administrasi Kependudukan', lampiran: '' },
        { id: 6, nama: 'Surat Keterangan Kelahiran', kategori: 'Administrasi Kependudukan', lampiran: '' },
        { id: 7, nama: 'Surat Keterangan Kematian', kategori: 'Administrasi Kependudukan', lampiran: '' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleOpenForm = (templateName) => {
    setSelectedTemplate(templateName);
    setFormData({});
  };

  const handleCloseForm = () => {
    setSelectedTemplate(null);
    setFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGeneratePreview = () => {
    if (selectedTemplate && suratTemplates[selectedTemplate]) {
      const templateFunction = suratTemplates[selectedTemplate].template;
      setPreviewContent(templateFunction(formData));
    }
  };

  const handlePrint = async () => {
    if (!selectedTemplate || !previewContent) {
      alert('Silakan generate preview surat terlebih dahulu.');
      return;
    }

    try {
      // Send data to /api/suratkeluar
      const response = await fetch(API_ENDPOINTS.SURAT_KELUAR_ADD, {
        method: 'POST',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template: selectedTemplate,
          formData,
          content: previewContent,
          createdAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan surat ke server');
      }

      // Proceed with printing
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Cetak ${selectedTemplate}</title>
            <style>
              body { font-family: 'Times New Roman', serif; line-height: 1.5; }
            </style>
          </head>
          <body>
            ${previewContent}
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 200);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      console.error('Error saving surat:', error);
      alert(`Gagal menyimpan surat: ${error.message}`);
    }
  };

  const handleOpenAttachmentDialog = (templateId) => {
    setSelectedTemplateId(templateId);
    setAttachmentDialogOpen(true);
  };

  const handleCloseAttachmentDialog = () => {
    setAttachmentDialogOpen(false);
    setSelectedTemplateId(null);
  };

  const handleAttachmentSubmit = (e) => {
    e.preventDefault();
    const description = e.target.attachmentDescription.value;
    setAttachmentData(prev => ({ ...prev, [selectedTemplateId]: description }));
    setTemplates(prev =>
      prev.map(template =>
        template.id === selectedTemplateId
          ? { ...template, lampiran: description }
          : template
      )
    );
    handleCloseAttachmentDialog();
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <StyledCard>
      <HeaderBox>
        <Typography variant="h6">Cetak Layanan Surat</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body1">Templates: {templates.length}</Typography>
          <Chip label="test" color="secondary" />
        </Box>
      </HeaderBox>

      <CardContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>NO</strong></TableCell>
                  <TableCell><strong>NAMA SURAT</strong></TableCell>
                  <TableCell><strong>LAMPIRAN</strong></TableCell>
                  <TableCell><strong>AKSI</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templates.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((template, index) => (
                  <TableRow key={template.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{template.nama}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenAttachmentDialog(template.id)}>
                        <DescriptionIcon />
                      </IconButton>
                      {template.lampiran && (
                        <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                          {template.lampiran}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<PrintIcon />}
                        onClick={() => handleOpenForm(template.nama)}
                        size="small"
                      >
                        Buat Surat
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={templates.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </TableContainer>
        )}
      </CardContent>

      {/* Dialog Form Surat */}
      <Dialog
        open={!!selectedTemplate}
        onClose={handleCloseForm}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: '#ffffff',
            boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
          },
        }}
      >
        <DialogTitle sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
          {selectedTemplate && suratTemplates[selectedTemplate]?.title}
          <IconButton
            aria-label="close"
            onClick={handleCloseForm}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ backgroundColor: '#ffffff' }}>
          {selectedTemplate && suratTemplates[selectedTemplate] && (
            <Box component="form" sx={{ mt: 2 }}>
              {suratTemplates[selectedTemplate].formFields.map((field) => (
                <Box key={field.name} sx={{ mb: 2 }}>
                  <Typography component="label" htmlFor={field.name} sx={{ display: 'block', mb: 1, fontWeight: 500, color: '#333' }}>
                    {field.label}
                  </Typography>
                  <TextField
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    multiline={field.type === 'textarea'}
                    rows={field.type === 'textarea' ? 4 : 1}
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      style: {
                        backgroundColor: '#fff',
                        borderColor: '#ccc',
                        color: '#333',
                        fontFamily: 'inherit',
                        fontSize: '16px',
                      },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#ccc' },
                        '&:hover fieldset': { borderColor: '#999' },
                        '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#f5f5f5' }}>
          <Button onClick={handleCloseForm} color="inherit">Batal</Button>
          <Button
            onClick={handleGeneratePreview}
            variant="contained"
            color="primary"
          >
            Preview Surat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Attachment */}
      <Dialog
        open={attachmentDialogOpen}
        onClose={handleCloseAttachmentDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Tambah Lampiran
          <IconButton
            aria-label="close"
            onClick={handleCloseAttachmentDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" id="attachmentForm" onSubmit={handleAttachmentSubmit}>
            <TextField
              name="attachmentDescription"
              label="Deskripsi Lampiran"
              placeholder="Masukkan deskripsi atau nama file lampiran"
              fullWidth
              variant="outlined"
              sx={{ mt: 2 }}
            />
            <input
              type="file"
              name="attachmentFile"
              accept=".pdf,.doc,.docx,.jpg,.png"
              style={{ marginTop: '16px', display: 'block' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAttachmentDialog}>Batal</Button>
          <Button type="submit" form="attachmentForm" variant="contained" color="primary">
            Simpan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Preview Surat */}
      <Dialog
        open={!!previewContent}
        onClose={() => setPreviewContent('')}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Preview Surat.
          <IconButton
            aria-label="close"
            onClick={() => setPreviewContent('')}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <div dangerouslySetInnerHTML={{ __html: previewContent }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewContent('')}>Kembali</Button>
          <Button
            onClick={handlePrint}
            variant="contained"
            color="primary"
            startIcon={<PrintIcon />}
          >
            Cetak Surat
          </Button>
        </DialogActions>
      </Dialog>
    </StyledCard>
  );
}