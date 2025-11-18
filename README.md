# LogiGreen – Decarbonization KPI Cockpit

LogiGreen adalah dashboard Next.js & Node.js yang dirancang untuk memantau kemajuan dekarbonisasi menuju **Net Zero Emissions GHG 2025** dan target **Reduce Emission < 29 mtCO₂e 2030**. Aplikasi ini menampilkan pandangan eksekutif dan operasional yang intuitif, kaya visual, serta mudah dieksplorasi oleh pemangku kepentingan bisnis.

## Fitur Utama

- **Cockpit View (Eksekutif)** – scorecard KPI, status pencapaian target 2025/2030, dan notifikasi batas atas jejak karbon.
- **Trend Realized Decarbonization Effect** – visualisasi garis dengan marker inisiatif penting (fleet electrification, sustainable fuel, renewable PPAs).
- **Fleet Electrification & Sustainable Fuel Modules** – pemantauan rasio adopsi EV, bauran bahan bakar berkelanjutan, dan dampak penurunan emisi.
- **Reporting View (Detail ESG)** – modul carbon accounting, breakdown Scope 1/2/3, tabel drill-down, serta rekomendasi aksi 30 hari.
- **Integrasi Data** – indikator status pembaruan data dari Carbon Data Integrations Platform (CDIP) dan Energy & Fuel Consumption Data.

## Teknologi

- [Next.js 16 (App Router)](https://nextjs.org/)
- [React 19](https://react.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Recharts](https://recharts.org/en-US/) untuk visualisasi data
- [lucide-react](https://lucide.dev/) untuk ikon

## Menjalankan Secara Lokal

Pastikan Node.js 18+ telah terpasang.

```bash
cd logigreen-dashboard
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) untuk melihat dashboard.

## Struktur Navigasi

- **Cockpit** – fokus pada ringkasan KPI, status target, dan tindakan cepat eksekutif.
- **Reporting** – detail ESG & operasi (carbon accounting, Scope breakdown, go green reporting).

## Penyesuaian Data

Seluruh data pada `src/app/page.tsx` masih berupa data contoh. Integrasikan dengan sumber data nyata (CDIP, data energi & bahan bakar, dsb.) dengan mengganti objek konstanta yang tersedia atau memindahkan logika ke layanan API Anda.

## Lisensi

Distribusi mengikuti lisensi MIT yang terdapat pada repositori ini.
