/*
╔══════════════════════════════════════════════════════════════════════╗
║  SATU-SATUNYA TEMPAT MENGEDIT ISI RPS                                 ║
║  Dipakai oleh rps.html (tampilan web) dan rps-baku.html (cetak PDF).  ║
║  Matriks, rekap bobot, tanggal pertemuan, dan daftar pekan per dosen  ║
║  dihitung otomatis.                                                   ║
║                                                                       ║
║  Tips:                                                                ║
║  - Tambahkan ?periksa di akhir URL rps.html untuk membuka panel       ║
║    pemeriksaan (bobot, kode dosen, hari libur, dll.).                 ║
║  - Tambahkan ?tanggal=2027-03-20 untuk mensimulasikan tanggal.        ║
║  - Format tanggal selalu TTTT-BB-HH, misalnya 2027-02-15.             ║
║  - Isian opsional per pertemuan untuk cetak baku:                     ║
║    daring: "...", terstruktur: ["..."], mandiri: ["..."]              ║
╚═══════════════════════════════════════════════════════════════════════╝
*/
const RPS = {

  meta: {
    namaMK: "Metodologi Ilmiah",
    kode: "23C03112802",
    kodeDokumen: "",
    rumpunMK: "",
    sksTeori: 2,
    sksPraktik: 0,
    semester: "IV",
    sifat: "Mata Kuliah Wajib",
    periode: "Semester Genap",
    tahunAkademik: "2026/2027",
    angkatan: "2025",
    prasyarat: ["Biostatistika"],
    tanggalPenyusunan: "2024-03-10",  // format TTTT-BB-HH
    tanggalRevisi: "2026-11-22",
    prodi: "Program Studi Kedokteran Hewan",
    fakultas: "Fakultas Kedokteran",
    universitas: "Universitas Hasanuddin",
    kota: "Makassar",
    otorisasi: {
      pengembang: "drh. Rian Hari Suharto, M.Sc.",
      koordinator: "drh. Rian Hari Suharto, M.Sc.",
      ketuaProdi: "drh. M. Fadhlullah Mursalim, M.Kes., Ph.D."
    }
  },

  /* Jadwal. Tanggal pertemuan pekan 1–16 dihitung dari tanggal mulai.
     lewatiPekanLibur: jika kelima hari kerja dalam satu pekan libur semua,
     pekan itu otomatis dilewati (menjadi pekan jeda).
     pekanJeda: tanggal mana saja di pekan yang ingin dilewati secara manual. */
  jadwal: {
    mulai: "2027-02-15",
    jamMulai: "07.30",
    jamSelesai: "09.10",
    zonaWaktu: "WITA",
    ruang: "",                        // contoh: "Student Center"
    lewatiPekanLibur: true,
    pekanJeda: []
  },

  /* Libur nasional dan cuti bersama di rentang semester.
     Sumber: SKB Menteri Agama, Menteri Ketenagakerjaan, dan Menteri PANRB
     Nomor 1205, 3, 2 Tahun 2026. Tanggal Idulfitri dan Iduladha
     mengikuti Keputusan Menteri Agama. */
  libur: [
    { tanggal: "2027-03-08", nama: "Hari Suci Nyepi", jenis: "Libur nasional" },
    { tanggal: "2027-03-09", nama: "Idulfitri 1448 H", jenis: "Cuti bersama" },
    { tanggal: "2027-03-10", nama: "Idulfitri 1448 H", jenis: "Libur nasional" },
    { tanggal: "2027-03-11", nama: "Idulfitri 1448 H", jenis: "Libur nasional" },
    { tanggal: "2027-03-12", nama: "Idulfitri 1448 H", jenis: "Cuti bersama" },
    { tanggal: "2027-03-15", nama: "Idulfitri 1448 H", jenis: "Cuti bersama" },
    { tanggal: "2027-03-25", nama: "Wafat Yesus Kristus", jenis: "Cuti bersama" },
    { tanggal: "2027-03-26", nama: "Wafat Yesus Kristus", jenis: "Libur nasional" },
    { tanggal: "2027-05-06", nama: "Kenaikan Yesus Kristus", jenis: "Libur nasional" },
    { tanggal: "2027-05-17", nama: "Iduladha 1448 H", jenis: "Libur nasional" },
    { tanggal: "2027-05-18", nama: "Iduladha 1448 H", jenis: "Cuti bersama" },
    { tanggal: "2027-05-19", nama: "Waisak 2571 BE", jenis: "Cuti bersama" },
    { tanggal: "2027-05-20", nama: "Waisak 2571 BE", jenis: "Libur nasional" },
    { tanggal: "2027-06-01", nama: "Hari Lahir Pancasila", jenis: "Libur nasional" }
  ],
  sumberLibur: "SKB Menteri Agama, Menteri Ketenagakerjaan, dan Menteri PANRB Nomor 1205, 3, 2 Tahun 2026. Tanggal Idulfitri dan Iduladha mengikuti Keputusan Menteri Agama.",

  /* Tim pengajar. Kode dipakai di jadwal per pekan. Nomor telepon sengaja tidak dicantumkan. */
  dosen: [
    { kode: "RHS", nama: "drh. Rian Hari Suharto, M.Sc.", peran: "Koordinator" },
    { kode: "DKS", nama: "Prof. Dr. drh. Dwi Kesuma Sari, APVet.", peran: "" },
    { kode: "FYP", nama: "Dr. drh. Fika Yuliza Purba, M.Sc.", peran: "" },
    { kode: "AWJ", nama: "Abdul Wahid Jamaluddin, S.Farm., M.Farm., Apt.", peran: "" },
    { kode: "BY",  nama: "drh. Baso Yusuf, M.Sc.", peran: "" },
    { kode: "KDK", nama: "drh. Kadek Dian Krisna Putri K., M.Sc.", peran: "" },
    { kode: "AMK", nama: "drh. Anjani Marisa Kartikasari, M.Si.", peran: "" }
  ],

  deskripsi: "Metodologi Ilmiah adalah mata kuliah wajib 2 sks pada semester IV Program Studi S1 Kedokteran Hewan. Mata kuliah ini melatih mahasiswa menelaah karya ilmiah kedokteran hewan secara sistematis, lalu menerapkan hasil telaah itu untuk menyusun dan mengomunikasikan proposal riset. Bahan kajian meliputi etika riset dan integritas akademik, termasuk penggunaan kecerdasan buatan generatif secara bertanggung jawab; penelusuran dan pengelolaan literatur; serta telaah bagian pendahuluan, metode, hasil, pembahasan, dan kesimpulan artikel riset. Pembelajaran memakai pendekatan berbasis kasus dan berbasis proyek. Proyek semester berupa proposal riset yang dikembangkan secara bertahap. Mahasiswa menetapkan topik, menyusun draf pendahuluan dan metode, lalu menyajikan artikel riset terpublikasi yang relevan dengan topiknya sebagai poster. Pada akhir semester, setiap mahasiswa mempertahankan proposal risetnya di hadapan dosen penguji yang ditetapkan sesuai bidang topik riset.",

  bahanKajian: [
    "Ilmu, riset, dan metodologi ilmiah",
    "Etika riset dan integritas akademik",
    "Kemajuan riset dalam ilmu kedokteran hewan",
    "Penelusuran dan pengelolaan literatur",
    "Perangkat lunak yang mendukung riset",
    "Telaah artikel riset dan teknik sitasi",
    "State-of-the-art, rumusan masalah, dan pertanyaan riset",
    "Desain riset, variabel, pengukuran, dan analisis data",
    "Penyajian data, hasil, pembahasan, dan penarikan kesimpulan",
    "Penyajian artikel riset melalui poster dan proposal riset melalui presentasi lisan"
  ],

  /* Teks CPL mengikuti dokumen kurikulum prodi. Jangan diubah di RPS. */
  cpl: [
    { kode: "CPL-1", teks: "Mampu menunjukkan sikap bertanggung jawab, mandiri, disiplin, kreatif, dan profesional berdasarkan nilai ketuhanan dan kemanusiaan yang memiliki semangat kolaboratif dan kewirausahaan di bidang keahliannya." },
    { kode: "CPL-5", teks: "Mampu mengelola, mengendalikan, dan mengembangkan sumber daya yang berkaitan dengan kesehatan hewan dan kesehatan masyarakat veteriner." },
    { kode: "CPL-7", teks: "Mampu mengambil keputusan secara tepat, mengembangkan jaringan kerja, bertanggung jawab atas pencapaian hasil kerja, dan melakukan proses evaluasi diri dalam konteks penyelesaian masalah di bidang keahliannya berdasarkan hasil analisis informasi dan data." },
    { kode: "CPL-9", teks: "Mampu menggali dan bertukar informasi secara verbal dan nonverbal mengenai kesehatan hewan dengan klien dan pasien, masyarakat, kolega, dan profesi lainnya, serta mampu mengembangkan penelitian di bidang kedokteran hewan dan pelayanan berbasis bukti melalui kolaborasi." }
  ],

  /* Setiap CPMK dan Sub-CPMK memakai satu kata kerja operasional. */
  cpmk: [
    { kode: "CPMK-1", cpl: "CPL-1", teks: "Mahasiswa mampu menerapkan prinsip etika riset dan integritas akademik dalam penyusunan proposal riset." },
    { kode: "CPMK-2", cpl: "CPL-5", teks: "Mahasiswa mampu menganalisis literatur ilmiah sebagai landasan riset kedokteran hewan." },
    { kode: "CPMK-3", cpl: "CPL-7", teks: "Mahasiswa mampu mengevaluasi komponen karya ilmiah kedokteran hewan secara sistematis sebagai dasar penyusunan proposal riset." },
    { kode: "CPMK-4", cpl: "CPL-9", teks: "Mahasiswa mampu mengomunikasikan karya ilmiah kedokteran hewan secara tertulis dan lisan sesuai kaidah akademik." }
  ],

  /* asesmen: "kasus" | "masalah" | "proyek" (lihat JENIS_ASESMEN di bawah)
     Urutan Sub-CPMK mengikuti urutan pekan; tidak ada Sub-CPMK yang lompat pekan. */
  subcpmk: [
    { kode: "Sub-CPMK-1", cpmk: "CPMK-1", bobot: 3,  asesmen: "kasus",   metode: ["SGD", "CBL"],
      teks: "Mahasiswa mampu menerapkan prinsip etika riset dan integritas akademik dalam penyusunan proposal riset.",
      indikator: "Ketepatan menjawab soal kasus tentang prinsip etika riset, integritas akademik, kelayakan etik riset yang menggunakan hewan, dan penggunaan kecerdasan buatan generatif secara bertanggung jawab.",
      teknik: "Tes tertulis (kuis di LMS Sikola)" },
    { kode: "Sub-CPMK-2", cpmk: "CPMK-2", bobot: 3,  asesmen: "kasus",   metode: ["SGD", "CBL", "PjBL"],
      teks: "Mahasiswa mampu menganalisis tren riset kedokteran hewan melalui penelusuran dan pengelolaan literatur ilmiah yang relevan dan mutakhir.",
      indikator: "Ketepatan menjawab soal tentang jenis riset dan tingkat buktinya, tren riset kedokteran hewan, strategi penelusuran literatur, pengelolaan referensi, gaya sitasi, dan interpretasi laporan kesamaan teks.",
      teknik: "Tes tertulis (kuis di LMS Sikola)" },
    { kode: "Sub-CPMK-3", cpmk: "CPMK-2", bobot: 3,  asesmen: "kasus",   metode: ["SGD", "CBL", "PjBL"],
      teks: "Mahasiswa mampu mengidentifikasi kesenjangan riset pada topik pilihannya berdasarkan analisis artikel riset kedokteran hewan.",
      indikator: "Ketepatan menjawab soal telaah artikel riset dengan kerangka PICO/PECO, daftar periksa CASP, dan pedoman pelaporan riset, serta identifikasi kesenjangan riset.",
      teknik: "Tes tertulis (kuis di LMS Sikola)" },
    { kode: "Sub-CPMK-4", cpmk: "CPMK-3", bobot: 4,  asesmen: "kasus",   metode: ["SGD", "CBL", "PjBL"],
      teks: "Mahasiswa mampu mengevaluasi pendahuluan artikel riset sebagai dasar penyusunan pendahuluan proposal riset.",
      indikator: "Ketepatan menilai state-of-the-art, rumusan masalah, pertanyaan riset, dan alur logis pendahuluan pada soal kasus artikel riset.",
      teknik: "Tes tertulis (kuis di LMS Sikola)" },
    { kode: "Sub-CPMK-5", cpmk: "CPMK-3", bobot: 5,  asesmen: "kasus",   metode: ["SGD", "CBL", "PjBL"],
      teks: "Mahasiswa mampu mengevaluasi metode riset yang mencakup desain, variabel, penarikan sampel, instrumen, dan analisis data sebagai dasar penyusunan metode proposal riset.",
      indikator: "Ketepatan menilai desain, variabel, perancu, teknik penarikan sampel, instrumen, dan kesesuaian uji statistik pada soal kasus artikel riset.",
      teknik: "Tes tertulis (kuis di LMS Sikola)" },
    { kode: "Sub-CPMK-6", cpmk: "CPMK-3", bobot: 2,  asesmen: "kasus",   metode: ["SGD", "CBL", "PjBL"],
      teks: "Mahasiswa mampu mengevaluasi penyajian data, hasil, pembahasan, dan kesimpulan artikel riset sebagai dasar perencanaan penyajian data proposal riset.",
      indikator: "Ketepatan menilai penyajian tabel dan grafik, hasil, pembahasan, dan keselarasan kesimpulan dengan tujuan pada soal kasus artikel riset.",
      teknik: "Tes tertulis (kuis di LMS Sikola)" },
    { kode: "Sub-CPMK-7", cpmk: "CPMK-4", bobot: 10, asesmen: "proyek",  metode: ["PjBL"],
      teks: "Mahasiswa mampu menyajikan artikel riset terpublikasi yang relevan dengan topik proposal dalam bentuk poster ilmiah sesuai standar akademik.",
      indikator: "Relevansi artikel dengan topik proposal, ketepatan merangkum latar belakang, tujuan, metode, hasil, dan kesimpulan, ketepatan menjelaskan manfaat artikel bagi proposal, kualitas gambar dan diagram, kelengkapan sitasi sumber, keterbacaan tata letak, serta ketepatan penjelasan saat sesi poster.",
      teknik: "Unjuk kerja" },
    { kode: "Sub-CPMK-8", cpmk: "CPMK-4", bobot: 70, asesmen: "proyek",  metode: ["PjBL"],
      teks: "Mahasiswa mampu mempertahankan proposal riset dalam presentasi lisan sesuai kaidah ilmiah.",
      indikator: "Kualitas naskah proposal, kelengkapan dan ketepatan unsur proposal riset, penyampaian presentasi, dan ketepatan jawaban atas pertanyaan penguji sesuai rubrik asesmen naskah dan presentasi proposal riset.",
      teknik: "Unjuk kerja" }
  ],

  /* Pengaturan bersama untuk setiap pertemuan (bisa ditimpa per pekan). */
  bawaanPertemuan: {
    bentuk: "Kuliah",
    formatif: ["Umpan balik", "kuis interaktif di kelas"],
    kriteria: "Skor kuis di LMS Sikola",
    waktu: { terbimbing: "2 × 50 menit", terstruktur: "2 × 60 menit", mandiri: "2 × 60 menit" }
  },

  /* Jadwal per pekan. Urutan pekan 1–16. dosen: daftar kode, atau "semua".
     sepekan: true berarti kegiatan berlangsung sepanjang pekan (misalnya presentasi).
     formatif: isi untuk menimpa bentuk asesmen formatif bawaan pada pekan tertentu.
     tanggalPengganti: isi jika pertemuan jatuh pada hari libur dan sudah ada jadwal pengganti. */
  pertemuan: [
    { pekan: 1,  sub: "Sub-CPMK-1", dosen: ["RHS"], topik: "Pengantar metodologi ilmiah",
      materi: ["Ilmu pengetahuan, riset, dan metodologi ilmiah", "Hakikat riset ilmiah di bidang kedokteran hewan", "Struktur umum proposal riset", "Proposal riset sebagai proyek semester", "Prinsip penggunaan kecerdasan buatan generatif dalam penulisan ilmiah"] },
    { pekan: 2,  sub: "Sub-CPMK-1", dosen: ["DKS"], topik: "Etika riset",
      materi: ["Prinsip dasar etika riset", "Integritas akademik dan plagiarisme", "Konflik kepentingan dalam riset", "Kelayakan etik (ethical clearance) dan etika riset yang menggunakan hewan"] },
    { pekan: 3,  sub: "Sub-CPMK-2", dosen: ["FYP"], topik: "Riset kedokteran hewan",
      formatif: ["Asesmen diri Tugas 1 dengan lembar kerja", "kuis interaktif di kelas"],
      materi: ["Kedokteran hewan berbasis bukti dan piramida bukti", "Jenis-jenis riset di bidang kedokteran hewan", "Tren riset terkini dalam ilmu kedokteran hewan", "Menu topik riset dari setiap bidang"] },
    { pekan: 4,  sub: "Sub-CPMK-2", dosen: ["FYP"], topik: "Penelusuran literatur",
      formatif: ["Asesmen diri Tugas 1 dengan lembar kerja", "kuis interaktif di kelas"],
      materi: ["Strategi penelusuran literatur ilmiah", "Pangkalan data ilmiah dan teknik penelusuran", "Identifikasi literatur yang relevan dan mutakhir", "Evaluasi kualitas penyedia sumber ilmiah"] },
    { pekan: 5,  sub: "Sub-CPMK-2", dosen: ["AWJ"], topik: "Manajemen sitasi dan deteksi kesamaan teks",
      formatif: ["Asesmen diri Tugas 1 dengan lembar kerja", "kuis interaktif di kelas"],
      materi: ["Penggunaan perangkat manajemen referensi", "Konsistensi gaya sitasi", "Perangkat deteksi kesamaan teks dan interpretasi laporan similarity index"] },
    { pekan: 6,  sub: "Sub-CPMK-3", dosen: ["KDK"], topik: "Telaah artikel dan kesenjangan riset",
      formatif: ["Asesmen diri Tugas 2 dengan lembar kerja", "kuis interaktif di kelas"],
      materi: ["Struktur artikel riset", "Telaah artikel riset dengan kerangka PICO/PECO dan daftar periksa CASP", "Pedoman pelaporan riset veteriner: ARRIVE 2.0, STROBE-Vet, dan REFLECT", "Identifikasi kesenjangan riset dan penetapan topik", "Teknik sitasi dan parafrase akademik"] },
    { pekan: 7,  sub: "Sub-CPMK-4", dosen: ["AWJ"], topik: "Pendahuluan",
      formatif: ["Asesmen diri Tugas 3 dengan lembar kerja", "kuis interaktif di kelas"],
      materi: ["Tema, topik, dan judul riset", "State-of-the-art dan relevansi riset", "Rumusan masalah dan pertanyaan riset", "Koherensi dan alur logis pendahuluan"] },
    { pekan: 8,  sub: "Sub-CPMK-5", dosen: ["BY"], topik: "Metode: desain dan variabel",
      formatif: ["Asesmen diri Tugas 4 dengan lembar kerja", "kuis interaktif di kelas"],
      materi: ["Jenis riset (deskriptif, observasional, eksperimental, kualitatif, dsb.)", "Desain riset (potong lintang, rancangan acak lengkap, uji acak terkendali, dsb.)", "Identifikasi dan definisi variabel", "Validitas dan reliabilitas pengukuran", "Pengendalian perancu"] },
    { pekan: 9,  sub: "Sub-CPMK-5", dosen: ["BY"], topik: "Metode: populasi, sampel, dan instrumen",
      formatif: ["Asesmen diri Tugas 4 dengan lembar kerja", "kuis interaktif di kelas"],
      materi: ["Populasi target dan sampel dalam riset veteriner", "Teknik penarikan sampel", "Instrumen pengumpulan data"] },
    { pekan: 10, sub: "Sub-CPMK-5", dosen: ["RHS"], topik: "Metode: analisis data",
      formatif: ["Asesmen diri Tugas 4 dengan lembar kerja", "kuis interaktif di kelas"],
      materi: ["Kesesuaian metode analisis dengan pertanyaan riset", "Kesesuaian uji statistik dengan jenis data", "Asumsi uji statistik dan interpretasi hasil", "Kesalahan umum dalam analisis data"] },
    { pekan: 11, sub: "Sub-CPMK-6", dosen: ["RHS"], topik: "Penyajian dan visualisasi data",
      formatif: ["Asesmen diri Tugas 5 dengan lembar kerja", "kuis interaktif di kelas"],
      materi: ["Prinsip penyajian data dalam tabel dan grafik", "Pemilihan bentuk visualisasi sesuai jenis data", "Kesalahan umum dalam visualisasi data ilmiah", "Kerangka tabel (dummy table) untuk proposal riset"] },
    { pekan: 12, sub: "Sub-CPMK-6", dosen: ["AMK"], topik: "Hasil, pembahasan, dan kesimpulan",
      formatif: ["Asesmen diri Tugas 5 dengan lembar kerja", "kuis interaktif di kelas"],
      materi: ["Perbedaan hasil dan pembahasan", "Struktur penulisan hasil", "Strategi pembahasan berbasis literatur", "Keselarasan tujuan dan kesimpulan riset", "Penarikan kesimpulan ilmiah"] },
    { pekan: 13, sub: "Sub-CPMK-7", dosen: ["KDK"], topik: "Poster artikel ilmiah", kriteria: "Unjuk kerja dinilai dengan rubrik",
      materi: ["Kriteria pemilihan artikel riset", "Struktur poster artikel riset", "Prinsip desain grafis akademik", "Penyajian metode dan hasil dalam diagram alur, tabel, dan grafik", "Sitasi sumber dan izin penggunaan gambar", "Standar presentasi poster ilmiah"] },
    { pekan: 14, sub: "Sub-CPMK-7", dosen: "semua", topik: "Presentasi poster artikel ilmiah", bentuk: "Seminar", kriteria: "Unjuk kerja dinilai dengan rubrik",
      formatif: ["Umpan balik dosen tim pengajar"],
      materi: ["Presentasi poster artikel riset di hadapan dosen tim pengajar", "Asesmen poster oleh dosen tim pengajar", "Umpan balik tentang keterkaitan artikel dengan proposal"] },
    { pekan: 15, sub: "Sub-CPMK-8", dosen: ["AMK"], topik: "Strategi presentasi ilmiah", kriteria: "Unjuk kerja dinilai dengan rubrik",
      materi: ["Struktur presentasi proposal", "Teknik komunikasi akademik", "Manajemen waktu presentasi", "Teknik menjawab pertanyaan ilmiah"] },
    { pekan: 16, sub: "Sub-CPMK-8", dosen: "semua", topik: "Presentasi proposal riset", bentuk: "Seminar", sepekan: true, kriteria: "Unjuk kerja dinilai dengan rubrik",
      formatif: ["Umpan balik dosen penguji"],
      materi: ["Presentasi proposal riset di hadapan dosen penguji sesuai bidang topik", "Tanya jawab dengan dosen penguji", "Penilaian naskah dan presentasi proposal dengan rubrik"] }
  ],

  /* Rencana penugasan terstruktur: tahapan proyek proposal riset sepanjang semester.
     Tugas pekan 3–12 bersifat formatif: mahasiswa menilai diri dengan lembar kerja (lembar-kerja.html),
     tanpa bobot, dan berkonsultasi dengan dosen sesuai kebutuhan. Nilai sumatif proyek
     diberikan pada poster artikel (Sub-CPMK-7) dan naskah serta presentasi proposal final (Sub-CPMK-8).
     sifat: "formatif" | "sumatif". Bobot tugas sumatif diambil otomatis dari bobot Sub-CPMK-nya. */
  penugasan: [
    { judul: "Calon topik riset", pekan: [3, 4, 5], sub: "Sub-CPMK-2", sifat: "formatif",
      luaran: "Dua atau tiga calon topik, masing-masing dengan minimal lima artikel acuan yang tersimpan di perangkat manajemen referensi.",
      deskripsi: "Mahasiswa memilih calon topik dari menu topik setiap bidang, lalu menelusuri literatur untuk setiap calon topik." },
    { judul: "Topik final dan kesenjangan riset", pekan: [6], sub: "Sub-CPMK-3", sifat: "formatif",
      luaran: "Lembar topik berisi judul sementara, bidang, rumusan kesenjangan riset, dan tiga artikel kunci.",
      deskripsi: "Mahasiswa menetapkan satu topik berdasarkan kesenjangan riset yang ditemukan. Mahasiswa memasukkan topik final melalui activity choice di LMS Sikola. Dosen koordinator menetapkan dosen penguji berdasarkan bidang topik." },
    { judul: "Draf pendahuluan proposal", pekan: [7], sub: "Sub-CPMK-4", sifat: "formatif",
      luaran: "Draf pendahuluan berisi state-of-the-art, rumusan masalah, pertanyaan riset, tujuan, dan manfaat riset.",
      deskripsi: "Mahasiswa menerapkan hasil telaah pendahuluan artikel pada topiknya sendiri." },
    { judul: "Draf metode proposal", pekan: [8, 9, 10], sub: "Sub-CPMK-5", sifat: "formatif",
      luaran: "Draf metode berisi desain, variabel, populasi dan sampel, instrumen, rencana analisis data, dan rencana kelayakan etik.",
      deskripsi: "Mahasiswa menyusun draf metode secara bertahap mengikuti materi pekan 8–10." },
    { judul: "Rencana penyajian data", pekan: [11, 12], sub: "Sub-CPMK-6", sifat: "formatif",
      luaran: "Kerangka tabel dan rancangan grafik untuk data yang akan dikumpulkan.",
      deskripsi: "Mahasiswa merancang cara data riset akan disajikan dan dihubungkan dengan tujuan riset." },
    { judul: "Poster artikel ilmiah", pekan: [13, 14], sub: "Sub-CPMK-7", sifat: "sumatif",
      luaran: "Poster artikel riset terpublikasi yang dipresentasikan pada pekan 14.",
      deskripsi: "Mahasiswa memilih artikel riset asli dari jurnal nasional terakreditasi SINTA atau jurnal internasional bereputasi yang terindeks Scopus atau Web of Science. Artikel memuat gambar atau diagram dan relevan dengan topik proposalnya. Mahasiswa menyusun poster yang memuat isi utama artikel dan manfaatnya bagi proposal, lalu mempresentasikannya pada pekan 14. Poster mencantumkan sumber dan DOI artikel. Gambar asli digunakan sesuai lisensinya (misalnya CC BY) atau dengan izin penerbit." },
    { judul: "Naskah dan presentasi proposal", pekan: [15, 16], sub: "Sub-CPMK-8", sifat: "sumatif",
      luaran: "Naskah proposal riset final yang dikumpulkan sebelum presentasi.",
      deskripsi: "Mahasiswa memperbaiki naskah proposal berdasarkan hasil asesmen diri dan konsultasi, lalu mempertahankannya dalam presentasi lisan yang dinilai dengan rubrik asesmen naskah dan presentasi proposal riset." }
  ],

  /* Pustaka. Gaya Harvard (Cite Them Right): Nama belakang, Inisial. (Tahun) *Judul buku*.
     Disunting oleh (jika ada editor). Edisi. Kota: Penerbit. ISBN. Semua penulis dibalik, dipisah koma, "dan" sebelum penulis terakhir.
     Artikel jurnal: Nama belakang, Inisial. (Tahun) 'Judul artikel', *Nama jurnal*, volume(nomor), halaman. doi.
     Judul memakai huruf kapital di awal judul dan nama diri saja.
     Teks di antara dua tanda bintang ditampilkan miring, misalnya *Judul buku*. */
  pustaka: {
    utama: [
      "Hardani, Andriani, H., Ustiawaty, J., Utami, E.F., Istiqomah, R.R., Fardani, R.A., Sukmana, D.J. dan Auliya, N.H. (2020) *Metode penelitian kualitatif & kuantitatif*. Disunting oleh H. Abadi. Yogyakarta: Pustaka Ilmu. ISBN 978-623-7066-33-0.",
      "Hikmawati, F. (2017) *Metodologi penelitian*. Depok: Rajawali Pers. ISBN 978-602-425-141-3.",
      "Kothari, C.R. (2004) *Research methodology: methods and techniques*. 2nd rev. edn. New Delhi: New Age International. ISBN 978-81-224-2488-1.",
      "Kumar, R. (2011) *Research methodology: a step-by-step guide for beginners*. 3rd edn. London: SAGE. ISBN 978-1-84920-300-5.",
      "Nurhayati, D.A.W. (2020) *Research methodology*. Tulungagung: Akademia Pustaka. ISBN 978-623-6704-42-4.",
      "Sembiring, T.B., Irmawati, Sabir, M. dan Tjahyadi, I. (2023) *Buku ajar metodologi penelitian (teori dan praktik)*. Karawang: Saba Jaya Publisher. ISBN 978-623-09-7074-0."
    ],
    pendukung: [
      "Direktorat Pembelajaran dan Kemahasiswaan (2024) *Panduan penggunaan generative artificial intelligence (GenAI) pada pembelajaran di perguruan tinggi*. Jakarta: Direktorat Jenderal Pendidikan Tinggi, Riset, dan Teknologi, Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi.",
      "Dohoo, I., Martin, W. dan Stryhn, H. (2009) *Veterinary epidemiologic research*. 2nd edn. Charlottetown: VER Inc. ISBN 978-0-919013-60-5.",
      "Percie du Sert, N. dkk. (2020) 'The ARRIVE guidelines 2.0: updated guidelines for reporting animal research', *PLoS Biology*, 18(7), e3000410. doi:10.1371/journal.pbio.3000410.",
      "Petrie, A. dan Watson, P. (2013) *Statistics for veterinary and animal science*. 3rd edn. Chichester: Wiley-Blackwell. ISBN 978-0-470-67075-0.",
      "Universitas Hasanuddin (2023) *Pedoman tugas akhir mahasiswa Universitas Hasanuddin*. Makassar: Universitas Hasanuddin."
    ]
  },

  visi: "Menjadi Program Studi Kedokteran Hewan bereputasi yang menghasilkan dokter hewan humanis dan berbasis benua maritim Indonesia (BMI) dan potensi lokal.",
  misi: [
    "Menyelenggarakan strata akademik dan profesi bidang kedokteran hewan yang mempunyai kompetensi sesuai dengan OIE Day 1 Graduate Competencies.",
    "Menyelenggarakan penelitian di bidang kedokteran hewan yang inovatif, kompetitif, implementatif, dan kolaboratif.",
    "Menyelenggarakan pengabdian masyarakat dalam bidang kedokteran hewan berbasis pemberdayaan masyarakat.",
    "Menyelenggarakan tridarma perguruan tinggi berbasis satu kesehatan (one health)."
  ],
  profilLulusan: [
    { nama: "Profesional", teks: "Seseorang yang mampu menguasai teori dalam studi kedokteran hewan, mampu mengoperasikan media teknologi bidang kedokteran hewan, serta mampu berinteraksi dan bekerja sama antar-institusi dan lintas profesi." },
    { nama: "Pengambil keputusan", teks: "Seseorang yang mampu mengaplikasikan konsep kesehatan hewan untuk melindungi, mengamankan, dan menjamin kesehatan dan kesejahteraan hewan, manusia, dan lingkungan melalui pengendalian dan penanggulangan penyakit hewan dan zoonosis secara tepat berdasarkan peraturan perundang-undangan di bidang penyelenggaraan kesehatan hewan; dan mampu melakukan pengambilan keputusan tentang kesehatan hewan yang didasarkan pada hasil kajian regulasi kondisi sosial budaya masyarakat sesuai prinsip kolaborasi." },
    { nama: "Peneliti", teks: "Seseorang yang mampu melakukan penelitian dan tahapan-tahapan penelitian kedokteran hewan; mampu menerapkan ilmu penelitian kedokteran hewan dan pelayanan berbasis bukti; dan mampu menerapkan metode dan teknik penelitian menggunakan teknologi terbaru melalui kolaborasi penelitian antarinstitusi dan lintas profesi." },
    { nama: "Manajer dan pemimpin", teks: "Seseorang yang memiliki jiwa kepemimpinan dan kewirausahaan, mampu berkomunikasi, gigih, tangguh, dan bertanggung jawab pada pekerjaan secara mandiri maupun berkelompok, menghormati klien dan tim kerja, serta memiliki spiritualitas dan komitmen yang tinggi; serta mampu mengelola, mengendalikan, dan mengembangkan sumber daya yang berkaitan dengan kesehatan hewan." },
    { nama: "Konsultan", teks: "Seseorang yang memiliki etika dan moral yang tinggi, berjiwa mandiri, unggul, dan bertanggung jawab; mampu berkomunikasi medis secara efektif; mampu menerapkan pemikiran logis, kritis, sistematis dan inovatif; dan menguasai ilmu-ilmu kedokteran hewan." }
  ],

  /* Catatan untuk penyusun. Tampil di panel ?periksa, tidak terlihat oleh pembaca biasa. */
  catatanPenyusun: [
    "Bank soal kuis LMS Sikola (Sub-CPMK-1 sampai Sub-CPMK-6) belum tersedia.",
    "Tentukan mekanisme penilaian poster pekan 14: semua dosen menilai semua poster, atau setiap dosen menilai poster mahasiswa yang juga diujinya pada pekan 16.",
    "Bagian penugasan di RPS memuat ringkasan. Tugas 1–5 dipandu lembar kerja asesmen diri (lembar-kerja.html); instruksi, kriteria, dan rubrik Tugas 6 dan 7 disusun di dokumen RTM.",
    "Teks CPL, visi, misi, dan profil lulusan sengaja tidak diubah karena mengikuti dokumen kurikulum prodi."
  ]
};

/* ═══ Bagian di bawah ini dipakai bersama kedua halaman. Jarang perlu diubah. ═══ */

const JENIS_ASESMEN = {
  kasus:   { id: "Asesmen berbasis kasus",   pendek: "Berbasis kasus",   warna: "var(--accent-3)", teks: "var(--on-accent-3)" },
  masalah: { id: "Asesmen berbasis masalah", pendek: "Berbasis masalah", warna: "var(--accent-2)", teks: "var(--on-accent-2)" },
  proyek:  { id: "Asesmen berbasis proyek",  pendek: "Berbasis proyek",  warna: "var(--accent)",   teks: "var(--on-accent)" }
};

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const BLN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const DAY = 864e5;
const D = {
  parse(s) { if (!s) return null; const [y, m, d] = s.split("-").map(Number); return Date.UTC(y, m - 1, d); },
  iso(t) { return new Date(t).toISOString().slice(0, 10); },
  add(t, n) { return t + n * DAY; },
  dow(t) { return new Date(t).getUTCDay(); },
  long(t) { const d = new Date(t); return `${HARI[d.getUTCDay()]}, ${d.getUTCDate()} ${BULAN[d.getUTCMonth()]} ${d.getUTCFullYear()}`; },
  mid(t) { const d = new Date(t); return `${d.getUTCDate()} ${BULAN[d.getUTCMonth()]} ${d.getUTCFullYear()}`; },
  short(t) { const d = new Date(t); return `${d.getUTCDate()} ${BLN[d.getUTCMonth()]}`; },
  shortDay(t) { const d = new Date(t); return `${HARI[d.getUTCDay()]}, ${d.getUTCDate()} ${BLN[d.getUTCMonth()]}`; },
  range(a, b) {
    const x = new Date(a), y = new Date(b);
    if (x.getUTCMonth() === y.getUTCMonth()) return `${x.getUTCDate()}–${y.getUTCDate()} ${BULAN[y.getUTCMonth()]} ${y.getUTCFullYear()}`;
    return `${x.getUTCDate()} ${BULAN[x.getUTCMonth()]} – ${y.getUTCDate()} ${BULAN[y.getUTCMonth()]} ${y.getUTCFullYear()}`;
  },
  today() {
    const q = new URLSearchParams(location.search).get("tanggal");
    if (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) return D.parse(q);
    const n = new Date(); return Date.UTC(n.getFullYear(), n.getMonth(), n.getDate());
  }
};

/* ── Data turunan ────────────────────────────────────────────────── */
const M = RPS.meta;
const dosenByKode = Object.fromEntries(RPS.dosen.map(d => [d.kode, d]));
const subByKode = Object.fromEntries(RPS.subcpmk.map(s => [s.kode, s]));
const cpmkByKode = Object.fromEntries(RPS.cpmk.map(c => [c.kode, c]));
const cplByKode = Object.fromEntries(RPS.cpl.map(c => [c.kode, c]));
const liburByIso = {};
RPS.libur.forEach(l => { (liburByIso[l.tanggal] ||= []).push(l); });

const pertemuan = [...RPS.pertemuan].sort((a, b) => a.pekan - b.pekan).map(p => ({
  ...RPS.bawaanPertemuan, ...p,
  dosenList: p.dosen === "semua" ? RPS.dosen.map(d => d.kode) : (p.dosen || [])
}));

const pekanOf = kode => pertemuan.filter(p => p.sub === kode).map(p => p.pekan);
const fmtPekan = arr => {
  if (!arr.length) return "–";
  return "Pekan " + [...new Set(arr)].sort((a, b) => a - b).join(", ");
};

/* Jadwal: hitung tanggal setiap pekan */
function buildSchedule() {
  const J = RPS.jadwal, start = D.parse(J.mulai);
  const offset = (D.dow(start) + 6) % 7; // 0 = Senin
  let monday = D.add(start, -offset);
  const manual = new Set((J.pekanJeda || []).map(s => { const t = D.parse(s); return D.iso(D.add(t, -((D.dow(t) + 6) % 7))); }));
  const sessions = [], gaps = [];
  for (const p of pertemuan) {
    for (let guard = 0; guard < 10; guard++) {
      const days = [0, 1, 2, 3, 4].map(i => D.add(monday, i));
      const allOff = days.every(d => liburByIso[D.iso(d)]);
      if ((J.lewatiPekanLibur && allOff) || manual.has(D.iso(monday))) {
        const names = [...new Set(days.flatMap(d => (liburByIso[D.iso(d)] || []).map(l => l.nama)))];
        gaps.push({ monday, reason: names.length ? names.join(", ") : "Pekan jeda", beforePekan: p.pekan });
        monday = D.add(monday, 7); continue;
      }
      break;
    }
    const days = [0, 1, 2, 3, 4].map(i => D.add(monday, i));
    const date = D.add(monday, offset);
    const s = { ...p, monday, date, libur: null, pengganti: D.parse(p.tanggalPengganti) };
    if (p.sepekan) {
      const open = days.filter(d => !liburByIso[D.iso(d)]);
      s.rangeStart = open[0]; s.rangeEnd = open[open.length - 1];
      s.liburDalamPekan = days.filter(d => liburByIso[D.iso(d)]);
    } else {
      s.libur = liburByIso[D.iso(date)] || null;
    }
    sessions.push(s);
    monday = D.add(monday, 7);
  }
  return { sessions, gaps };
}
const SCHED = buildSchedule();
const sessionByPekan = Object.fromEntries(SCHED.sessions.map(s => [s.pekan, s]));
const firstDate = SCHED.sessions[0]?.date;
const last = SCHED.sessions[SCHED.sessions.length - 1];
const lastDate = last ? (last.rangeEnd || last.date) : null;

const jam = `${RPS.jadwal.jamMulai}–${RPS.jadwal.jamSelesai} ${RPS.jadwal.zonaWaktu}`;
const hariKuliah = firstDate != null ? HARI[D.dow(firstDate)] : "";
const sessionDateLabel = (s, style = "long") => {
  if (s.sepekan) return D.range(s.rangeStart, s.rangeEnd);
  const t = s.pengganti || s.date;
  return style === "long" ? D.long(t) : D.shortDay(t);
};
