# GreenTour.Id - Wisata Berkelanjutan Indonesia

Aplikasi web untuk wisata berkelanjutan di Indonesia.

## Struktur Proyek

```
├── frontend/       # React + Vite (UI)
│   ├── src/        # Source code React
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── backend/        # Laravel 10 (API)
│   ├── app/
│   ├── routes/
│   ├── database/
│   └── composer.json
│
└── README.md
```

## Menjalankan Aplikasi

### 1. Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
php artisan migrate
php artisan serve
```

Backend akan berjalan di `http://localhost:8000`

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

> **Catatan:** Frontend sudah dikonfigurasi dengan proxy ke `http://127.0.0.1:8000` untuk API requests melalui `/api`.