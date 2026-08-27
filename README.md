# Panyeppen Cloud ☁️

Panyeppen Cloud adalah aplikasi penyimpanan cloud mandiri (*self-hosted cloud storage*) yang ringan, cepat, dan aman. Dibangun dengan **React 19**, **Tailwind CSS v4**, **Node.js (Express)**, dan **SQLite**.

## Fitur Utama
*   **📂 Manajemen File & Folder:** Unggah, unduh, hapus, ganti nama, dan pindahkan file layaknya *file explorer* asli dengan dukungan *Drag and Drop*.
*   **🔗 Berbagi Aman (Secure Sharing):** Bagikan file Anda ke publik melalui tautan yang dapat diproteksi menggunakan **Kata Sandi** dan **Batas Kedaluwarsa (Expiration Date)**.
*   **🗑️ Tempat Sampah (Trash Bin):** Mencegah kehilangan data. File yang dihapus akan dipindah ke tempat sampah terlebih dahulu dan bisa dipulihkan kapan saja.
*   **⚡ Mode Multi-Select & Zip Download:** Pilih banyak file sekaligus dan unduh sebagai arsip `.zip` secara langsung.
*   **🔍 Pencarian Cepat:** Mencari file dan folder di seluruh tingkatan direktori secara instan.

---

## Memulai Cepat (Local Development)

### 1. Kloning Repositori & Instalasi
```bash
git clone https://github.com/Mustofa12312/panyeppen-cloud.git
cd "panyeppen-cloud"
npm install
```

### 2. Inisialisasi Database
Jalankan skrip *seeder* untuk membuat tabel database dan akun admin awal:
```bash
node seed.js
```
*(Catatan: Akun bawaan adalah Username: `admin`, Password: `password123`)*

### 3. Menjalankan Server & Frontend
Jalankan perintah ini untuk menjalankan API backend dan Vite frontend secara bersamaan (mode dev):
```bash
npm run dev
```

Buka aplikasi di `http://localhost:5173`

---

## Deployment (Docker Production)

Cara termudah dan paling direkomendasikan untuk menjalankan aplikasi ini di server VPS adalah menggunakan **Docker Compose**.

### Menjalankan dengan Docker
1. Pastikan Docker dan Docker Compose telah terinstal di server Anda.
2. Edit nilai `JWT_SECRET` pada file `docker-compose.yml` agar lebih aman.
3. Jalankan perintah berikut:
```bash
docker compose up -d --build
```
Aplikasi kini berjalan di *background* pada port `3001`. Anda bisa mengatur Reverse Proxy (seperti Nginx atau Traefik) agar mengarah ke `http://localhost:3001`.

*Data database dan file pengguna disimpan dalam Docker Volumes (`panyeppen_data` dan `panyeppen_storage`), sehingga data tidak akan hilang saat container dimulai ulang.*
