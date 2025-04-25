import { NextResponse } from 'next/server';

export function middleware(request) {
  // Izinkan semua rute tanpa pemeriksaan autentikasi
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};