# LogiGreen — Decarbonization KPI Cockpit

LogiGreen adalah dashboard interaktif bertema glassmorphism yang membantu pemangku kepentingan memantau, menganalisis, dan melaporkan kemajuan dekarbonisasi menuju target Net Zero Emissions GHG 2025 dan Reduce Emission &lt; 29 mtCO<sub>2</sub>e pada 2030. Dashboard menyatukan kebutuhan eksekutif, manajer ESG, dan operasional dalam satu pengalaman intuitif dengan navigasi multi-view (Cockpit, Reporting, Data Integrations, dan Notifications).

## Fitur Utama

- **Cockpit View** — Ringkasan KPI utama, status target 2025/2030, tren emisi, dan pipeline inisiatif dekarbonisasi.
- **Reporting Layer** — Modul Carbon Accounting dengan filter per layer (Building, Energy, Fleet, Customer, Product), breakdown Scope 1/2/3, Fleet Electrification Management, dan peta lokasi aset.
- **Data Integrations** — Health check dan timeline integrasi CDIP, energi & bahan bakar, serta customer/product carbon data.
- **Notifications** — Peringatan otomatis saat emisi mendekati atau melampaui batas serta insight operasional penting.
- **Visual & UX** — Desain glassmorphic iOS 16+ menggunakan warna hijau-putih, chart interaktif (Chart.js), dan peta Leaflet.
- **Dummy Dataset** — Ribuan data sintetis untuk simulasi realistis (emission trend harian, ribuan catatan carbon accounting, dsb.).

## Teknologi

- **Vanilla HTML, CSS, JavaScript** (tanpa framework)
- **Chart.js** untuk visualisasi data (line, bar, doughnut/gauge)
- **Leaflet** + basemap Carto untuk peta interaktif
- **Google Fonts (Poppins)** untuk tipografi modern

## Getting Started

1. **Klon repo (jika diperlukan)**
   ```bash
   git clone <repo-url>
   cd project
   ```

2. **Instalasi dependensi**
   Tidak diperlukan, seluruh proyek berbasis file statis.

3. **Menjalankan server lokal**
   Jalankan server HTTP sederhana dari direktori proyek.
   ```bash
   python3 -m http.server 8000
   # atau dengan Node.js
   npx serve .
   ```

4. **Akses aplikasi**
   Buka browser dan kunjungi `http://localhost:8000` kemudian pilih `index.html` bila server tidak menyajikannya secara otomatis.

## Struktur Proyek

```
project/
├── app.js         # Logika aplikasi: generate data dummy, render chart & tabel, event handling
├── index.html     # Struktur halaman & navigasi utama LogiGreen
├── styles.css     # Styling glassmorphic, layout dashboard, dan responsivitas
├── README.md      # Dokumentasi proyek (file ini)
└── .gitignore     # Konfigurasi git untuk mengabaikan arsip build/deps umum
```

## Pengembangan & Kontribusi

- Sesuaikan warna, metrik, atau logika notifikasi langsung pada `styles.css` dan `app.js`.
- Tambahkan data/integrasi baru dengan memodifikasi helper di `app.js` (misalnya `generateCarbonRecords`, `renderIntegrationOverview`).
- Jalankan linting/formatting manual sesuai kebutuhan; proyek ini tidak menyertakan konfigurasi build.

## Lisensi

Proyek ini belum memiliki lisensi resmi. Silakan hubungi pengelola sebelum mendistribusikan ulang.
