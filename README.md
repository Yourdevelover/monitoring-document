# Monitoring — Sistem Berkas Tim

Aplikasi monitoring berkas tim berbasis web dengan 3 peran: **Admin**, **Manajer**, dan **Karyawan**. Manajer membagikan berkas ke tim, karyawan mengunggah dan mengirim berkas harian (daily/chat/payment), menyimpan data penting, mengajukan perubahan profil, dan memantau target. Semua file disajikan lewat API dengan kontrol akses per tim.

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 16.3.4 (App Router, Turbopack) |
| UI | React 19.2.8, Tailwind CSS 4.3.3 |
| DB | PostgreSQL + Prisma 5.22 (`@prisma/client`) |
| Auth | JWT (`jose` HS256, cookie `monitoring_admin_session`, 7 hari) + `bcryptjs` |
| File | Upload lokal `public/uploads/teams/...`, ZIP via `archiver` |
| Lainnya | `emoji-picker-react` |

## Persyaratan

- Node.js 20+
- PostgreSQL 15+ (database `Data_monitoring`)
- Nginx (opsional, untuk akses LAN/produksi)

## Instalasi

```bash
npm install
```

Buat file `.env`:

```env
DATABASE_URL="postgresql://postgres:admin@localhost:5432/Data_monitoring?schema=public"
JWT_SECRET="ganti-dengan-secret-acak-minimal-32-karakter"
```

Sinkronisasi database dan seed admin:

```bash
npx prisma db push
npx prisma generate
npm run db:seed
```

Jalankan:

```bash
npm run dev    # development (HMR, Turbopack)
npm run build  # build produksi
npm start      # jalankan hasil build
```

Buka `http://localhost:3000`. Login default: `admin@monitoring.local` / `admin`.

## Struktur Direktori

```
monitoring-web/
├── app/
│   ├── page.tsx                    # Landing + redirect berdasar role
│   ├── layout.tsx                  # Root layout + Toaster global
│   ├── login-form.tsx              # Form login (client)
│   ├── globals.css
│   ├── daftar-manajer/page.tsx     # Registrasi manajer publik
│   ├── components/                 # Komponen bersama
│   │   ├── toast.tsx               # Sistem toast (?toast= query)
│   │   ├── pagination-controls.tsx
│   │   ├── back-to-previous-button.tsx
│   │   ├── confirm-action-form.tsx
│   │   ├── notes-widget.tsx
│   │   ├── sidebar-icons.tsx
│   │   ├── logo.tsx / logo-footer.tsx
│   ├── api/
│   │   ├── login/route.ts          # Login, set cookie JWT
│   │   ├── logout/route.ts         # Logout, hapus cookie
│   │   ├── profile/route.ts        # Update profil langsung
│   │   ├── notes/route.ts          # Catatan pribadi
│   │   ├── files/[...path]/route.ts # Penyaji file dengan ACL tim
│   │   ├── admin/
│   │   │   ├── create/route.ts     # Buat admin
│   │   │   ├── delete/route.ts     # Hapus admin
│   │   │   ├── update/route.ts     # Update admin
│   │   │   ├── activities/delete/route.ts
│   │   │   ├── karyawan/action/route.ts  # Aktif/nonaktif/hapus karyawan
│   │   │   ├── karyawan/create/route.ts
│   │   │   ├── managers/action/route.ts
│   │   │   ├── managers/create/route.ts
│   │   │   └── managers/update/route.ts
│   │   ├── karyawan/
│   │   │   ├── upload/route.ts         # Upload/submit/hapus, data penting
│   │   │   ├── target/route.ts         # CRUD target karyawan
│   │   │   ├── profile-request/route.ts # Ajukan perubahan profil
│   │   │   └── cleanup-expired/route.ts # Bersihkan file kadaluarsa
│   │   ├── manager/
│   │   │   ├── register/route.ts
│   │   │   ├── employee/action/route.ts # Kelola karyawan oleh manajer
│   │   │   ├── employee/create/route.ts
│   │   │   └── announcement/create|delete|pin/route.ts
│   │   └── manajer/
│   │       ├── berkas/upload/route.ts   # Upload berkas oleh manajer
│   │       ├── berkas/download/route.ts # Unduh ZIP berkas tim
│   │       └── profile-request/route.ts # Setujui/tolak pengajuan profil
│   ├── dashboard/
│   │   ├── admin/                  # Kelola user, tim, aktivitas
│   │   │   ├── page.tsx            # Ringkasan admin
│   │   │   ├── activities/         # Log aktivitas + hapus per tanggal
│   │   │   ├── karyawan/           # Daftar, detail, tambah karyawan
│   │   │   ├── managers/           # Daftar, detail, tambah manajer
│   │   │   ├── users/              # Kelola admin
│   │   │   └── profil/
│   │   ├── karyawan/               # Area karyawan
│   │   │   ├── page.tsx            # Dashboard karyawan
│   │   │   ├── berkas/             # Upload, kirim, simpan penting
│   │   │   ├── data-penting/       # Penyimpanan permanen
│   │   │   ├── histori-berkas/     # Riwayat kiriman 12 jam
│   │   │   ├── pengajuan-profil/   # Status pengajuan profil
│   │   │   ├── pengumuman/         # Pengumuman tim
│   │   │   ├── target/             # Target & progres
│   │   │   └── profil/             # Profil + ajukan edit
│   │   └── manajer/                # Area manajer
│   │       ├── page.tsx            # Dashboard manajer
│   │       ├── berkas/             # Berkas tim + upload + unduh ZIP
│   │       ├── histori-berkas/
│   │       ├── karyawan/           # Kelola karyawan tim
│   │       ├── pengajuan-profil/   # Persetujuan profil
│   │       ├── pengumuman/         # Kelola pengumuman
│   │       ├── target/             # Pantau target tim
│   │       └── profil/
├── lib/
│   ├── auth.ts          # getSessionUser, requireAdmin/Manager/Employee, JWT
│   ├── prisma.ts        # Singleton PrismaClient
│   ├── redirect.ts      # getBaseUrl() — redirect aman di balik proxy
│   ├── upload-queue.ts  # Antrean serial operasi file
│   └── upload-time.ts   # Helper zona Asia/Jakarta
├── middleware.ts        # Rewrite /uploads/* → /api/files/*
├── prisma/schema.prisma # Skema database
├── scripts/
│   ├── seed-admin.mjs   # Seed akun admin
│   └── seed-qa.mjs      # Seed data QA
└── public/
    ├── logo/
    └── uploads/teams/{teamId}/{employees|managers}/{userId}/
```

## Peran & Alur

| Peran | Akses | Fitur utama |
|-------|-------|-------------|
| ADMIN | `/dashboard/admin` | Kelola admin, manajer, karyawan, tim, log aktivitas |
| MANAGER | `/dashboard/manajer` | Kelola karyawan tim, upload berkas, pengumuman, setujui profil, pantau target |
| KARYAWAN | `/dashboard/karyawan` | Upload/kirim berkas (DAILY/CHAT/PAYMENT), data penting, histori 12 jam, ajukan profil, target |

**Alur berkas karyawan:** upload → submit (berlaku 12 jam) → histori → opsional simpan ke Data Penting (permanen).
**Alur profil:** karyawan ajukan edit → `profileRequest` PENDING → manajer setujui/tolak → data user diperbarui.
**Alur pengumuman:** manajer buat/pin/hapus → tampil di bar pengumuman tim (12 jam terakhir + pinned).

## Database (Prisma)

Model utama di `prisma/schema.prisma`:

- `User` — akun (role ADMIN/MANAGER/KARYAWAN, `teamId`, `isActive`)
- `Team` — tim (`managerId` unik, relasi anggota)
- `Upload` — berkas (`category` DAILY/CHAT/PAYMENT, `isSubmitted`, `expiresAt` +12 jam)
- `UploadHistory` — riwayat kiriman per `sourceUploadId`
- `ImportantFile` — salinan permanen data penting
- `Announcement` — pengumuman tim (`isPinned`)
- `ProfileRequest` — pengajuan profil (PENDING/APPROVED/REJECTED)
- `ActivityLog` — log aksi (login, upload, CRUD)
- `Message`, `PersonalNote`, `Target` — pesan, catatan, target kerja

Perintah Prisma:

```bash
npx prisma db push
npx prisma generate
npx prisma studio
npm run db:seed
```

## API Ringkas

| Method | Endpoint | Aksi |
|--------|----------|------|
| POST | `/api/login` | Login, set cookie |
| POST | `/api/logout` | Logout, hapus cookie |
| POST | `/api/profile` | Update profil langsung |
| GET/POST | `/api/notes` | Catatan pribadi |
| GET | `/api/files/[...path]` | Sajikan file (cek tim) |
| POST | `/api/karyawan/upload` | `upload/submit/delete/add-important/delete-important` |
| POST | `/api/karyawan/target` | Buat/update/hapus target |
| POST | `/api/karyawan/profile-request` | Buat pengajuan profil |
| POST | `/api/karyawan/cleanup-expired` | Hapus file kadaluarsa |
| POST | `/api/manajer/berkas/upload` | Upload berkas manajer |
| GET | `/api/manajer/berkas/download` | Unduh ZIP berkas tim |
| POST | `/api/manajer/profile-request` | `approve/reject` pengajuan |
| POST | `/api/manager/announcement/create\|delete\|pin` | Kelola pengumuman |
| POST | `/api/manager/employee/create\|action` | Kelola karyawan |
| POST | `/api/manager/register` | Registrasi manajer |
| POST | `/api/admin/*` | Kelola admin, karyawan, manajer, aktivitas |

Semua redirect API memakai `getBaseUrl(request)` dari `lib/redirect.ts` agar host benar saat di balik Nginx/proxy.

## File & Middleware

- File tersimpan di `public/uploads/teams/{teamId}/{employees|managers}/{userId}/[{important/}]{timestamp}-{namaAman}`.
- `middleware.ts` me-rewrite `/uploads/*` → `/api/files/uploads/*` agar file tetap bisa diakses pada `next start` (produksi) dengan pengecekan akses tim.
- Operasi file diserialkan via `enqueueFileTask()` (`lib/upload-queue.ts`) untuk mencegah race condition.
- Batas waktu memakai zona `Asia/Jakarta` (`lib/upload-time.ts`).

## Deploy LAN dengan Nginx

Contoh `nginx.conf`:

```nginx
server {
  listen 80;
  client_max_body_size 50M;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Lalu:

```bash
npm run build
npm start
```

Pindah server: salin source + `.env` baru + `public/uploads/` + jalankan `npx prisma db push` di database baru.

## Scripts

| Script | Fungsi |
|--------|--------|
| `npm run dev` | Dev server + HMR |
| `npm run build` | Build produksi |
| `npm start` | Jalankan produksi (`next start`) |
| `npm run lint` | ESLint |
| `npm run db:push` | Push skema ke DB |
| `npm run db:seed` | Seed admin |
| `npm run db:generate` | Generate Prisma Client |

