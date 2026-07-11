# 🛠️ Panduan Instalasi dan Menjalankan Aplikasi KMP Mart

Dokumen ini menjelaskan langkah-langkah detail untuk menyiapkan lingkungan pengembangan (environment setup), memasang dependensi, menjalankan dev server Metro, serta memecahkan masalah (troubleshooting) saat menjalankan KMP Mart (SIMKOPDES).

> [!IMPORTANT]
> **📲 Download Langsung Aplikasi Android (APK)**:
> Apabila Anda hanya ingin mencoba aplikasi di HP Android tanpa perlu meng-compile kode sumber, silakan unduh berkas instalasi APK di sini:
> **[Download KMP Mart APK (Versi EAS Build)](https://expo.dev/artifacts/eas/SBdQpb-DEns_EafZ27rzw2WiIIHeEnaZHTYVwL96CwE.apk)**

---

## 📋 1. Prasyarat Sistem

Sebelum memulai, pastikan perangkat komputer Anda memenuhi prasyarat berikut:

* **Node.js**: Versi `18.x` atau lebih tinggi (disarankan versi LTS terbaru seperti v20). Cek versi Anda dengan perintah:
  ```bash
  node -v
  ```
* **Pengelola Paket (npm/yarn)**: Bawaan Node.js. npm versi `9.x` atau lebih tinggi.
* **Expo CLI**: Dijalankan secara otomatis lewat `npx expo`.
* **Platform Emulator/Simulator (Opsional)**:
  * **Android**: Android Studio dengan Virtual Device (AVD) terkonfigurasi.
  * **iOS (Hanya macOS)**: Xcode dengan Simulator terpasang, beserta Command Line Tools.
* **Perangkat HP Fisik (Opsional)**: Aplikasi **Expo Go** terpasang dari Google Play Store atau Apple App Store.

---

## 🚀 2. Langkah-Langkah Instalasi

Ikuti urutan perintah di bawah ini pada terminal atau shell sistem Anda:

### Langkah 1: Clone Repositori
Clone projek KMP Mart ke direktori lokal Anda:
```bash
git clone <repository-url>
cd kopmart
```

### Langkah 2: Pemasangan Dependensi
Pasang seluruh paket modul Node.js yang dideklarasikan di `package.json`:
```bash
npm install
```
*Proses ini akan mengunduh React Native, Expo, NativeWind, wa-sqlite, dan pustaka UI pendukung ke dalam folder `node_modules`.*

### Langkah 3: Verifikasi Instalasi TypeScript
Pastikan tidak ada kesalahan kompilasi awal dengan menjalankan compiler check:
```bash
npx tsc --noEmit
```

---

## 💻 3. Menjalankan Server Metro Bundler

Jalankan perintah berikut di folder root projek untuk memulai server pengembangan Metro:
```bash
npx expo start
```

Setelah server Metro berjalan, Anda akan melihat kode QR besar di terminal dan beberapa opsi interaktif. Tekan tombol berikut pada keyboard Anda untuk membuka aplikasi:

### A. Menjalankan di Browser (Platform Web)
Tekan tombol **`w`** di terminal. 
* Metro akan mengompilasi bundel web dan membuka peramban default ke alamat `http://localhost:8081`.
* Versi web menggunakan **Local Storage Fallback** (sistem basis data buatan dalam memori) yang meniru SQLite native agar aplikasi berjalan lancar di browser biasa tanpa kendala driver.

### B. Menjalankan di Simulator iOS (macOS)
Tekan tombol **`i`** di terminal.
* Pastikan Simulator Xcode sudah terbuka sebelumnya. Aplikasi akan terpasang di simulator dan berjalan menggunakan Expo Go.

### C. Menjalankan di Simulator Android
Tekan tombol **`a`** di terminal.
* Pastikan Emulator Android Studio (AVD) sudah aktif dan online. Projek akan terinstal di perangkat virtual.

### D. Menjalankan di Handphone Fisik (Android/iOS)
1. Sambungkan HP fisik Anda ke jaringan Wi-Fi yang **sama** dengan komputer Anda.
2. Buka kamera HP (untuk iOS) atau aplikasi **Expo Go** (untuk Android).
3. Pindai kode QR yang ada di layar terminal atau halaman Metro DevTools.
4. Aplikasi akan di-load secara nirkabel ke HP Anda.

---

## 🗄️ 4. Cara Kerja Database Lokal (SQLite)

Aplikasi KMP Mart dirancang dengan pendekatan **Offline-First**. 
* **Pada Native (Android & iOS)**: Aplikasi menggunakan engine `expo-sqlite` untuk membuat file database `.db` asli secara langsung di penyimpanan privat perangkat.
* **Pada Web (Google Chrome/Safari/Firefox)**: Karena browser tidak memiliki akses file sistem langsung, backend database kami secara otomatis beralih ke simulasi SQLite menggunakan `localStorage`. Seluruh struktur skema, relasi JOIN, dan operasi query SQL (SELECT, INSERT, UPDATE) berjalan persis seperti di database aslinya.

### Seed Data Otomatis
Pada saat aplikasi pertama kali dijalankan (baik di web maupun simulator), fungsi inisialisasi di `src/utils/db.ts` akan mendeteksi apakah database kosong. Jika kosong, script akan melakukan **seeding** otomatis untuk mengisi:
* 6 Cabang Koperasi Merah Putih (Tenants)
* Akun demo warga, RT agent, kurir desa, pemasok, dan admin
* Katalog sembako eceran dan grosir
* Log transaksi awal untuk melengkapi dashboard keuangan

---

## 🔧 5. Troubleshooting (Penyelesaian Masalah)

### 1. Masalah: Peta Google Maps Blank/Kosong di Android Native
* **Penyebab**: Perangkat Android native membutuhkan Google Maps API Key terdaftar untuk memetakan koordinat.
* **Solusi**: Pada dashboard kurir atau pelacak pengiriman, Anda dapat menekan opsi **"OpenStreetMap"** di bagian atas peta. Pilihan ini akan merender peta gratis menggunakan OpenStreetMap (OSM) di dalam WebView, yang tidak memerlukan API Key apa pun.

### 2. Masalah: Port 8081 Sudah Digunakan
* **Penyebab**: Server pembangunan lain sedang berjalan di latar belakang.
* **Solusi**: Jalankan expo dengan port yang berbeda secara otomatis:
  ```bash
  npx expo start --port 8082
  ```

### 3. Masalah: Layar Putih saat Memuat Aplikasi di Browser
* **Penyebab**: Caching bundel metro yang korup.
* **Solusi**: Bersihkan cache pembangunan dan jalankan ulang server:
  ```bash
  npx expo start -c
  ```

### 4. Masalah: Gagal Memasang Dependensi (`npm install` error)
* **Penyebab**: Konflik versi dependensi lama pada Node.js modern.
* **Solusi**: Paksa instalasi menggunakan opsi `--legacy-peer-deps`:
  ```bash
  npm install --legacy-peer-deps
  ```
