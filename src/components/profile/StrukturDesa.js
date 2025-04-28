import React from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Avatar,
    Grid,
    Container,
    Divider,
    Chip,
    Paper
} from '@mui/material';
import {
    Person as PersonIcon,
    Groups as TeamIcon,
    Home as VillageIcon,
    Star as LeaderIcon
} from '@mui/icons-material';

const strukturDesa = {
    periode: "2021-2026",
    kepengurusan: [
        {
            jabatan: "Kepala Desa",
            nama: "SUDIRMAN TATU, S.Pd",
            foto: "/pengurus/kades.png",
            deskripsi: "Memimpin penyelenggaraan pemerintahan desa"
        },
        {
            jabatan: "Sekretaris Desa",
            nama: "BAHTIAR, S.KOM. S.Pd",
            foto: "/pengurus/sekretaris.jpg",
            deskripsi: "Mengelola administrasi dan dokumen desa"
        },
        {
            jabatan: "Bendahara Desa",
            nama: "YUYUN ULFIAH ASDIAN",
            foto: "/pengurus/bendahara.jpg",
            deskripsi: "Mengelola keuangan dan aset desa"
        },
        {
            jabatan: "Kasi Pemerintahan",
            nama: "SUPARDI GASA",
            foto: "/pengurus/kasi.jpg",
            deskripsi: "Menangani urusan pemerintahan"
        },
        {
            jabatan: "Kasi Pembangunan",
            nama: "HADALIA DG. CAYA",
            foto: "/pengurus/kasi2.jpg",
            deskripsi: "Mengawasi pembangunan infrastruktur"
        },
        {
            jabatan: "Kasi Kemasyarakatan",
            nama: "JUMIATI",
            foto: "/pengurus/kasi3.jpg",
            deskripsi: "Menangani program masyarakat"
        }
    ]
};

const StrukturDesaCard = () => {
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Paper elevation={0} sx={{
                p: 3,
                mb: 4,
                textAlign: 'center',
                bgcolor: 'primary.light',
                color: 'primary.contrastText'
            }}>
                <TeamIcon sx={{ fontSize: 50, mb: 2 }} />
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Struktur Organisasi Desa
                </Typography>
                <Typography variant="h6">
                    Pemerintah Desa Kalukuang Periode {strukturDesa.periode}
                </Typography>
            </Paper>

            {/* Kartu Kepengurusan */}
            <Grid container spacing={3}>
                {strukturDesa.kepengurusan.map((petugas, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'transform 0.3s',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: 3
                            }
                        }}>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                pt: 3,
                                pb: 1,
                                bgcolor: index === 0 ? 'primary.main' : 'background.paper',
                                color: index === 0 ? 'primary.contrastText' : 'text.primary'
                            }}>
                                <Avatar
                                    alt={petugas.nama}
                                    src={petugas.foto}
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        border: `3px solid ${index === 0 ? '#fff' : '#1976d2'}`,
                                        mb: 2
                                    }}
                                />
                            </Box>

                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography
                                    variant="h6"
                                    component="div"
                                    align="center"
                                    sx={{
                                        fontWeight: 'bold',
                                        mb: 1
                                    }}
                                >
                                    {petugas.nama}
                                </Typography>

                                <Chip
                                    label={petugas.jabatan}
                                    color={index === 0 ? 'primary' : 'default'}
                                    variant={index === 0 ? 'filled' : 'outlined'}
                                    sx={{
                                        mb: 2,
                                        mx: 'auto',
                                        display: 'flex'
                                    }}
                                />

                                <Divider sx={{ my: 2 }} />

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    align="center"
                                >
                                    {petugas.deskripsi}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Catatan */}
            <Paper elevation={0} sx={{
                p: 2,
                mt: 4,
                bgcolor: 'background.default',
                borderLeft: '4px solid',
                borderColor: 'primary.main'
            }}>
                <Typography variant="body2" fontStyle="italic">
                    * Struktur organisasi ini diperbarui terakhir pada Januari 2024
                </Typography>
            </Paper>
        </Container>
    );
};

export default StrukturDesaCard;