# Metodologi Ilmiah

Situs mata kuliah Metodologi Ilmiah (23C03112802), Program Studi Kedokteran Hewan, Fakultas Kedokteran, Universitas Hasanuddin.

Alamat situs: https://rianhs.github.io/metodologi-ilmiah/

## Tentang mata kuliah

| Komponen | Keterangan |
|---|---|
| Bobot | 2 sks |
| Semester | IV (genap) |
| Sifat | Wajib |
| Prasyarat | Biostatistika |
| Koordinator | drh. Rian Hari Suharto, M.Sc. |

Mahasiswa belajar menelaah karya ilmiah secara sistematis, menyusun proposal riset, lalu mengomunikasikannya melalui poster dan presentasi lisan. Perkuliahan memakai pembelajaran berbasis kasus dan berbasis proyek.

## Isi situs

| Halaman | Fungsi |
|---|---|
| [`index.html`](index.html) | Portal mata kuliah: informasi umum, tim pengajar, dan tautan perangkat pembelajaran |
| [`rps.html`](rps.html) | Rencana Pembelajaran Semester (RPS) |
| [`sap.html`](sap.html) | Satuan Acara Perkuliahan (SAP) pekan 1 sampai 16 |
| [`lembar-kerja.html`](lembar-kerja.html) | Lembar kerja dan asesmen diri Tugas 1 sampai 5 |
| [`rubrik-proposal.html`](rubrik-proposal.html) | Rubrik penilaian presentasi proposal riset |

## Alur tugas

| Tugas | Judul | Pekan | Asesmen |
|---|---|---|---|
| 1 | Calon topik riset | 3–5 | Formatif |
| 2 | Topik final dan kesenjangan riset | 6 | Formatif |
| 3 | Draf pendahuluan proposal | 7 | Formatif |
| 4 | Draf metode proposal | 8–10 | Formatif |
| 5 | Rencana penyajian data | 11–12 | Formatif |
| 6 | Poster artikel ilmiah | 13–14 | Sumatif (10%) |
| 7 | Naskah dan presentasi proposal | 15–16 | Sumatif (70%) |

Sisa bobot nilai berasal dari kuis di LMS Sikola.

## Petunjuk untuk mahasiswa

1. Buka lembar kerja dan isi Tugas 1 sampai 5 secara bertahap.
2. Unduh file simpanan (`.json`) setiap selesai bekerja. Isian tersimpan di peramban dan dapat hilang jika data peramban dihapus.
3. Muat file simpanan tersebut saat berganti perangkat.
4. Gunakan fitur ekspor ke Word untuk melanjutkan penulisan naskah.

## Pemeliharaan

Setiap halaman berupa satu file HTML tanpa proses *build*. Font dan ikon dimuat dari layanan daring (Google Fonts dan unpkg).

- Data portal berada di objek `MI` dalam `index.html`.
- Data RPS berada di objek `RPS` dalam `rps.html`. Setelah mengubahnya, salin seluruh blok `const RPS` ke `sap.html`.
- Data khusus SAP berada di objek `SAP` dalam `sap.html`.
- Perubahan jadwal, judul tugas, atau tim pengajar perlu disamakan di semua halaman terkait.
- Foto dosen disimpan di `img/dosen/` dengan rasio 4:5.
- Tambahkan `?periksa` di akhir alamat SAP untuk memeriksa total menit pembelajaran.

Untuk melihat situs di komputer, unduh repositori lalu buka `index.html` di peramban.

## Penyusun

drh. Rian Hari Suharto, M.Sc.  
Program Studi Kedokteran Hewan, Fakultas Kedokteran, Universitas Hasanuddin

## Lisensi

Ketentuan lisensi tercantum dalam file [`LICENSE`](LICENSE). Logo Universitas Hasanuddin dan foto dosen tetap menjadi milik pemegang haknya.
