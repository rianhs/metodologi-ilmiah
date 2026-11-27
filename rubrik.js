/* Mesin bersama rubrik asesmen. Isi tiap rubrik didefinisikan di window.RUBRIK pada berkas HTML. */
(() => {
const R = window.RUBRIK;
const ASPEK = R.bagian.flatMap((b, bi) => b.aspek.map((a, ai) =>
  ({ ...a, bi, no: ai + 1, kode: (b.kode || "A") + (ai + 1) })));
const N = ASPEK.length;
const TEMPAT = "Makassar";
const KUNCI = R.kunci, KUNCI_KERJA = R.kunci + "-kerja";
const ISIAN = ["penilai", "nama", "nim", "judul", "tanggal", "catatan"];
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const rapi = s => String(s || "").trim().replace(/\s+/g, " ");
const idBaris = r => (r.nim + "|" + r.penilai).toLowerCase();
const lengkap = r => r.skor.every(Boolean);
const terisi = r => r.skor.filter(Boolean).length;
const hitung = skor => skor.reduce((a, s, i) => a + s / 4 * ASPEK[i].bobot, 0);
const tanggalPanjang = t => /^\d{4}-\d{2}-\d{2}$/.test(t || "")
  ? new Date(t + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "";
const teks = d => Array.isArray(d)
  ? (d.length > 1 ? `<ul>${d.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : esc(d[0]))
  : esc(d);

let data = { baris: [], daftar: "", penilai: "" };
let skor = ASPEK.map(() => 0);
let ubah = null;          // kunci baris yang sedang diubah
let gagalTulis = false;
let cetakLain = false;    // area cetak sedang berisi data dari rekap

function kop() {
  const d = R.dokumen;
  return `<header class="kop">
    <div class="kop-logo"><img src="img/Logo-Unhas-200px.png" alt="Logo Unhas"></div>
    <div class="kop-judul">
      <div class="kop-inst"><b>Program Studi Kedokteran Hewan</b>Fakultas Kedokteran • Universitas Hasanuddin
        <small>Jl. Perintis Kemerdekaan km. 10 Tamalanrea, Makassar, Sulawesi Selatan</small></div>
      <h1>${esc(d.judul)}</h1>
      <div class="kop-sub">${esc(d.sub)}</div>
    </div>
    <dl><dt>No.</dt><dd>${esc(d.no)}</dd><dt>Versi</dt><dd>${esc(d.versi)}</dd>
      <dt>Tgl. Terbit</dt><dd>${esc(d.terbit)}</dd><dt>Tgl. Revisi</dt><dd>${esc(d.revisi)}</dd></dl>
  </header>`;
}

function htmlAspek(a, i) {
  return `<div class="aspek" id="aspek-${i}" role="group" aria-label="${esc(a.judul)}">
    <div><h3>${a.no}. ${esc(a.judul)}</h3><small>Bobot ${a.bobot}%</small></div>
    ${a.d.map((t, j) => `<button type="button" class="skor" data-a="${i}" data-s="${j + 1}" aria-pressed="false"><b>${j + 1}</b><span>${teks(t)}</span></button>`).join("")}
  </div>`;
}

function bangun() {
  const kelompok = R.bagian.map((b, bi) => {
    const isi = `<div class="daftar-aspek">${ASPEK.map((a, i) => a.bi === bi ? htmlAspek(a, i) : "").join("")}</div>`;
    const label = `<div class="label-bagian">Aspek asesmen<span>Bobot total 100%</span></div>`;
    return b.judul ? `<details class="bagian" data-b="${bi}"><summary>${esc(b.kode)}. ${esc(b.judul)}<span></span></summary>${isi}</details>` : label + isi;
  }).join("");
  const aturan = R.draf
    ? "Penilaian yang belum lengkap dapat disimpan sebagai draf, lalu dilanjutkan lewat tombol Ubah pada rekap. Draf tidak ikut dalam rata-rata."
    : "Tombol Selesai aktif setelah semua aspek terisi.";
  const petunjuk = "Isi identitas, lalu pilih satu skor (1 sampai 4) pada setiap aspek. Nilai akhir muncul di bagian bawah setelah semua aspek terisi. " +
    (R.draf ? "Tekan <b>Simpan draf</b> jika penilaian belum lengkap atau <b>Selesai</b> jika sudah lengkap. " : "Tekan <b>Selesai</b> untuk menyimpan nilai. ") +
    "Untuk mencetak nilai tersimpan, tekan <b>Cetak</b> pada rekap. Gunakan kertas A4 lanskap.";
  document.body.innerHTML = `<main>
  ${kop()}
  <div class="form">
    <section class="petunjuk"><b>Petunjuk:</b> ${petunjuk}</section>
    <section class="box identitas">
      <div><label for="penilai">${esc(R.penilai)}</label><input id="penilai" placeholder="Nama dosen" autocomplete="off"></div>
      <div><label for="nama">Nama mahasiswa</label><input id="nama" list="daftar-nama" placeholder="Ketik nama" autocomplete="off"><datalist id="daftar-nama"></datalist></div>
      <div><label for="nim">NIM</label><input id="nim" list="daftar-nim" placeholder="Ketik NIM" autocomplete="off"><datalist id="daftar-nim"></datalist></div>
      <div class="lebar"><label for="judul">${esc(R.labelJudul)}</label><input id="judul" placeholder="Tulis judul" autocomplete="off"></div>
      <div><label for="tanggal">Tempat dan tanggal ujian</label><div class="tempat-tanggal"><span>${TEMPAT},</span><input id="tanggal" type="date"></div></div>
    </section>
    ${kelompok}
    <section class="box"><label for="catatan">Catatan untuk mahasiswa</label><textarea id="catatan" placeholder="Tulis catatan atau komentar"></textarea></section>
    <section class="box bilah">
      <div class="nilai-kotak"><div class="nilai" id="nilai">–</div><small id="status"></small></div>
      <div class="kanan">
        <button type="button" id="kosongkan">Kosongkan</button>
        <button type="button" id="cetak-form">Cetak/PDF</button>
        <button type="button" id="selesai" class="utama">Selesai</button>
      </div>
      <div id="pesan" role="status" aria-live="polite"></div>
    </section>
  </div>
  <section class="box">
    <h2 id="judul-rekap">Rekap nilai</h2>
    <div class="alat">
      <input id="cari" type="search" placeholder="Cari nama atau NIM">
      <button type="button" id="csv" class="utama">Ekspor CSV</button>
      <button type="button" id="rata" title="Satu baris per mahasiswa, berisi rata-rata nilai lengkap dari semua dosen yang datanya ada di halaman ini.">Ekspor rata-rata</button>
      <button type="button" id="cetak-semua" title="Mencetak semua penilaian yang sudah lengkap, satu mahasiswa per lembar.">Cetak semua</button>
      <button type="button" id="cadang">Unduh cadangan</button>
      <button type="button" id="muat" title="Memuat file cadangan. Data digabung dengan data yang sudah ada.">Muat cadangan</button>
      <input type="file" id="file" accept=".json,application/json" hidden>
      <button type="button" id="hapus-semua">Hapus semua</button>
    </div>
    <div class="gulir"><table><thead><tr id="kepala"></tr></thead><tbody id="isi"></tbody></table></div>
  </section>
  <details class="box">
    <summary>Daftar mahasiswa (opsional)</summary>
    <textarea id="daftar" placeholder="Satu mahasiswa per baris: NIM, Nama. Bisa ditempel langsung dari dua kolom Excel."></textarea>
    <div id="info-daftar"></div>
  </details>
  <details class="box">
    <summary>Catatan metode</summary>
    <p>Nilai = Σ (skor ÷ 4 × bobot). Rentang nilai 25 sampai 100.</p>
    <p>Isian yang sedang dikerjakan tersimpan otomatis. Rekap bertambah setelah tombol simpan ditekan. ${aturan}</p>
    <p>Data tersimpan di peramban pada perangkat ini. Data dapat hilang jika data peramban dihapus atau memakai mode penyamaran. Unduh cadangan setiap selesai satu sesi.</p>
    <p>Penggabungan antardosen: muat file cadangan tiap dosen pada satu perangkat, lalu pilih Ekspor rata-rata. Data dibedakan menurut NIM dan nama dosen.</p>
    <p>Hasil cetak memakai kertas A4 lanskap.</p>
  </details>
</main><div id="cetak"></div>`;
}

/* Penyimpanan */
function pesan(t, galat) { $("pesan").textContent = t; $("pesan").className = galat ? "galat" : ""; }
const sah = r => r && typeof r.nim === "string" && typeof r.nama === "string" && typeof r.penilai === "string" &&
  Array.isArray(r.skor) && r.skor.length === N && r.skor.every(s => [1, 2, 3, 4].includes(s) || (R.draf && s === 0)) &&
  typeof r.waktu === "string";
function baca() {
  if (gagalTulis) return;   // jangan menimpa data di layar dengan simpanan lama
  try {
    const o = JSON.parse(localStorage.getItem(KUNCI));
    if (o && Array.isArray(o.baris)) data = { baris: o.baris.filter(sah), daftar: o.daftar || "", penilai: o.penilai || "" };
  } catch (e) { pesan("Penyimpanan peramban tidak bisa dibaca. Gunakan Unduh cadangan.", true); }
}
function tulis() {
  try { localStorage.setItem(KUNCI, JSON.stringify(data)); gagalTulis = false; return true; }
  catch (e) { gagalTulis = true; pesan("Gagal menyimpan di peramban. Segera unduh cadangan.", true); return false; }
}
function formulir() {
  const r = { skor: skor.slice() };
  ISIAN.forEach(k => r[k] = k === "catatan" ? $(k).value.trim() : rapi($(k).value));
  return r;
}
function simpanKerja() {
  try { localStorage.setItem(KUNCI_KERJA, JSON.stringify({ ...formulir(), ubah })); }
  catch (e) { pesan("Isian tidak bisa disimpan otomatis di peramban ini.", true); }
}
function muatKerja() {
  try {
    const o = JSON.parse(localStorage.getItem(KUNCI_KERJA));
    if (!o) return;
    ISIAN.forEach(k => { if (typeof o[k] === "string") $(k).value = o[k]; });
    if (Array.isArray(o.skor) && o.skor.length === N) skor = o.skor.map(s => [1, 2, 3, 4].includes(s) ? s : 0);
    ubah = typeof o.ubah === "string" ? o.ubah : null;
  } catch (e) { /* isian lama diabaikan */ }
}

/* Tampilan */
function segarkan() {
  document.querySelectorAll(".skor").forEach(b => b.setAttribute("aria-pressed", String(skor[b.dataset.a] === +b.dataset.s)));
  document.querySelectorAll(".bagian").forEach(el => {
    const idx = ASPEK.map((a, i) => a.bi === +el.dataset.b ? i : -1).filter(i => i >= 0);
    const bobot = idx.reduce((t, i) => t + ASPEK[i].bobot, 0);
    el.querySelector("summary span").textContent = `Bobot ${bobot}% · ${idx.filter(i => skor[i]).length} dari ${idx.length} aspek terisi`;
  });
  const n = skor.filter(Boolean).length;
  $("status").textContent = `${n}/${N} aspek`;
  $("nilai").textContent = n === N ? hitung(skor).toFixed(2) : "–";
  $("selesai").disabled = !R.draf && n !== N;
  $("selesai").textContent = n < N && R.draf ? "Simpan draf" : ubah ? "Simpan" : "Selesai";
  areaCetak([formulir()]);
}
function bukaBagian() {
  const i = Math.max(skor.indexOf(0), 0);
  document.querySelectorAll(".bagian").forEach(el => el.open = +el.dataset.b === ASPEK[i].bi);
}
const adaIsian = () => skor.some(Boolean) || ["nama", "nim", "judul", "catatan"].some(k => rapi($(k).value));
/* Isian dianggap aman bila sama dengan baris yang sudah tersimpan */
function belumTersimpan() {
  if (!adaIsian()) return false;
  const r = formulir(), lama = data.baris.find(x => idBaris(x) === ubah);
  return !lama || String(lama.skor) !== String(r.skor) || ISIAN.some(k => (lama[k] || "") !== r[k]);
}
function bersihkan() {
  skor = ASPEK.map(() => 0);
  ubah = null;
  ["nama", "nim", "judul", "catatan"].forEach(k => $(k).value = "");
  segarkan(); bukaBagian(); simpanKerja();
}
function simpan() {
  const r = { ...formulir(), waktu: new Date().toISOString() };
  const kosong = ["penilai", "nama", "nim"].find(k => !r[k]);
  if (kosong) { pesan("Isi nama dosen, nama mahasiswa, dan NIM.", true); $(kosong).focus(); return; }
  if (!R.draf && !lengkap(r)) return;
  baca();
  const k = idBaris(r);
  const ada = data.baris.find(x => idBaris(x) === k);
  if (ada && k !== ubah && !confirm(`NIM ${r.nim} sudah dinilai (${ada.nama}). Ganti nilainya?`)) return;
  data.baris = data.baris.filter(x => idBaris(x) !== k && idBaris(x) !== ubah);
  data.baris.push(r);
  data.penilai = r.penilai;
  const berhasil = tulis();
  if (!berhasil) { ubah = k; tabel(); return; }   // pertahankan isian
  bersihkan(); tabel();
  pesan(lengkap(r) ? `Tersimpan: ${r.nama}, nilai ${hitung(r.skor).toFixed(2)}.` : `Draf tersimpan: ${r.nama}, ${terisi(r)}/${N} aspek.`);
  window.scrollTo({ top: 0 });
}
function tabel() {
  $("kepala").innerHTML = "<th>No</th><th>NIM</th><th>Nama</th>" +
    ASPEK.map(a => `<th class="kol-a" title="${esc(a.judul)}">${a.kode}</th>`).join("") + "<th>Nilai</th><th>Aksi</th><th>Penilai</th>";
  const q = $("cari").value.trim().toLowerCase();
  const baris = data.baris.map((r, i) => ({ r, no: i + 1 })).reverse()
    .filter(x => !q || (x.r.nim + " " + x.r.nama).toLowerCase().includes(q));
  $("isi").innerHTML = baris.map(({ r, no }) => `<tr><td>${no}</td><td>${esc(r.nim)}</td><td>${esc(r.nama)}</td>
    ${r.skor.map(s => `<td class="kol-a">${s || "–"}</td>`).join("")}
    <td><b>${lengkap(r) ? hitung(r.skor).toFixed(2) : `Draf ${terisi(r)}/${N}`}</b></td>
    <td>${["ubah", "cetak", "hapus"].map(x => `<button type="button" data-aksi="${x}" data-id="${esc(idBaris(r))}">${x[0].toUpperCase() + x.slice(1)}</button>`).join(" ")}</td>
    <td>${esc(r.penilai)}</td></tr>`).join("")
    || `<tr><td colspan="${N + 6}">Belum ada data.</td></tr>`;
  const unik = new Set(data.baris.map(r => r.nim.toLowerCase())).size;
  const draf = data.baris.filter(r => !lengkap(r)).length;
  $("judul-rekap").textContent = `Rekap nilai: ${data.baris.length} baris, ${unik} mahasiswa${draf ? `, ${draf} draf` : ""}`;
}

/* Cetak */
function lembar(r) {
  const penuh = lengkap(r), isi = (v, ganti = "") => esc(v || ganti);
  const barisAspek = (a, i) => `<tr><td class="tengah">${a.no}</td><td><b>${esc(a.judul)}</b></td><td class="tengah">${a.bobot}</td>
      ${a.d.map((d, j) => `<td${r.skor[i] === j + 1 ? ' class="pilih"' : ""}>${teks(d)}</td>`).join("")}
      <td class="tengah"><b>${r.skor[i] || ""}</b></td></tr>`;
  /* Judul bagian disatukan dengan aspek pertamanya agar tidak tertinggal di bawah halaman */
  const baris = R.bagian.map((b, bi) => {
    const rows = ASPEK.map((a, i) => a.bi === bi ? barisAspek(a, i) : "").filter(Boolean);
    const judul = b.judul ? `<tr class="seksi"><td colspan="8">${esc(b.kode)}. ${esc(b.judul)} (bobot ${ASPEK.filter(a => a.bi === bi).reduce((t, a) => t + a.bobot, 0)}%)</td></tr>` : "";
    return `<tbody class="awal">${judul}${rows[0]}</tbody><tbody>${rows.slice(1).join("")}</tbody>`;
  }).join("");
  const total = r.skor.reduce((a, s) => a + s, 0);
  return `<section class="lembar">${kop()}
    <table class="data"><tr><th>Nama mahasiswa</th><td>${isi(r.nama)}</td><th>NIM</th><td>${isi(r.nim)}</td></tr>
      <tr><th>${esc(R.labelJudul)}</th><td colspan="3">${isi(r.judul)}</td></tr></table>
    <table><colgroup><col style="width:4%"><col style="width:16%"><col style="width:6%"><col span="4" style="width:17%"><col style="width:6%"></colgroup>
      <thead><tr><th rowspan="2">No</th><th rowspan="2">Aspek asesmen</th><th rowspan="2">Bobot (%)</th><th colspan="4">Kriteria skor</th><th rowspan="2">Skor</th></tr>
        <tr><th>1</th><th>2</th><th>3</th><th>4</th></tr></thead>
      ${baris}<tbody>
        <tr class="total"><td colspan="7">Total skor</td><td class="tengah">${penuh ? total : ""}</td></tr>
        <tr class="total"><td colspan="7">Nilai akhir mahasiswa${!penuh && terisi(r) ? " (draf, belum lengkap)" : ""}</td><td class="tengah">${penuh ? hitung(r.skor).toFixed(2) : ""}</td></tr>
      </tbody></table>
    <div class="penutup"><div class="kotak-catatan"><b>Catatan:</b> ${isi(r.catatan)}</div>
      <div class="ttd"><div>${TEMPAT}, ${tanggalPanjang(r.tanggal) || "...................................."}</div><div>${esc(R.penilai)},</div><div class="ruang"></div>
      <b>${isi(r.penilai, "(........................................)")}</b></div></div>
  </section>`;
}
function areaCetak(daftar) { $("cetak").innerHTML = daftar.map(lembar).join(""); cetakLain = false; }
function cetak(daftar) { areaCetak(daftar); cetakLain = true; window.print(); }

/* Daftar mahasiswa */
function mahasiswa() {
  return data.daftar.split(/\r?\n/).map(l => {
    const m = l.match(/^\s*([^\t,;]+)[\t,;]\s*(.+?)\s*$/);
    return m ? { nim: rapi(m[1]), nama: rapi(m[2]) } : null;
  }).filter(m => m && /\d/.test(m.nim));
}
function isiDaftar() {
  const m = mahasiswa();
  $("daftar-nama").innerHTML = m.map(x => `<option value="${esc(x.nama)}">${esc(x.nim)}</option>`).join("");
  $("daftar-nim").innerHTML = m.map(x => `<option value="${esc(x.nim)}">${esc(x.nama)}</option>`).join("");
  $("info-daftar").textContent = `${m.length} mahasiswa terbaca.`;
}
function pasangkan(dari, ke) {
  const v = rapi($(dari).value).toLowerCase();
  const cocok = mahasiswa().filter(x => x[dari].toLowerCase() === v);
  if (cocok.length === 1) { $(ke).value = cocok[0][ke]; segarkan(); simpanKerja(); }
}

/* Ekspor */
function unduh(nama, isi, jenis) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([isi], { type: jenis }));
  a.download = nama;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function cap() {
  const d = new Date(), p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}
/* Pemisah titik koma dan desimal koma, sesuai Excel berlokal Indonesia */
function sel(v) {
  let s = typeof v === "number" ? String(v).replace(".", ",") : String(v);
  if (typeof v !== "number" && /^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
}
const keCsv = tab => "﻿" + tab.map(r => r.map(sel).join(";")).join("\r\n");
function eksporCsv() {
  if (!data.baris.length) return pesan("Belum ada data untuk diekspor.", true);
  const tab = [["NIM", "Nama", R.labelJudul, ...ASPEK.map(a => `${a.kode} ${a.judul}`), "Status", "Nilai", "Catatan", "Penilai", "Tempat", "Tanggal ujian", "Waktu simpan"]];
  data.baris.forEach(r => tab.push([r.nim, r.nama, r.judul || "", ...r.skor.map(s => s || ""), lengkap(r) ? "Lengkap" : "Draf",
    lengkap(r) ? +hitung(r.skor).toFixed(2) : "", r.catatan || "", r.penilai, TEMPAT, tanggalPanjang(r.tanggal), new Date(r.waktu).toLocaleString("id-ID")]));
  unduh(`nilai-${R.jenis}-${cap()}.csv`, keCsv(tab), "text/csv;charset=utf-8");
}
function eksporRata() {
  const g = new Map();
  data.baris.filter(lengkap).forEach(r => { const k = r.nim.toLowerCase(); if (!g.has(k)) g.set(k, []); g.get(k).push(r); });
  if (!g.size) return pesan("Belum ada penilaian lengkap untuk dirata-ratakan.", true);
  const tab = [["NIM", "Nama", "Nilai rata-rata", "Jumlah penilai", "Selisih nilai tertinggi dan terendah", "Penilai"]];
  g.forEach(rs => {
    const n = rs.map(r => hitung(r.skor));
    tab.push([rs[0].nim, rs[0].nama, +(n.reduce((a, b) => a + b, 0) / n.length).toFixed(2), n.length,
      +(Math.max(...n) - Math.min(...n)).toFixed(2), rs.map(r => r.penilai).join(", ")]);
  });
  unduh(`rata-rata-${R.jenis}-${cap()}.csv`, keCsv(tab), "text/csv;charset=utf-8");
}

/* Mulai */
bangun();
baca();
$("penilai").value = data.penilai;
$("daftar").value = data.daftar;
muatKerja();
isiDaftar(); tabel(); segarkan(); bukaBagian();

document.querySelector(".form").addEventListener("click", e => {
  const b = e.target.closest(".skor");
  if (!b) return;
  const a = +b.dataset.a;
  skor[a] = +b.dataset.s;
  pesan(""); segarkan(); simpanKerja();
});
ISIAN.forEach(k => $(k).addEventListener("input", () => { segarkan(); simpanKerja(); }));
$("selesai").onclick = simpan;
$("kosongkan").onclick = () => {
  if (belumTersimpan() && !confirm("Kosongkan isian yang belum disimpan?")) return;
  bersihkan(); pesan("");
};
$("cetak-form").onclick = () => cetak([formulir()]);
$("cetak-semua").onclick = () => {
  const d = data.baris.filter(lengkap);
  if (d.length) cetak(d); else pesan("Belum ada penilaian lengkap untuk dicetak.", true);
};
/* Setelah mencetak dari rekap, interaksi berikutnya mengembalikan area cetak ke isian aktif */
["pointerdown", "keydown"].forEach(t => document.addEventListener(t, () => { if (cetakLain) areaCetak([formulir()]); }, true));
$("nama").addEventListener("change", () => pasangkan("nama", "nim"));
$("nim").addEventListener("change", () => pasangkan("nim", "nama"));
$("penilai").addEventListener("change", () => { baca(); data.penilai = rapi($("penilai").value); tulis(); });
$("daftar").addEventListener("input", () => { const v = $("daftar").value; baca(); data.daftar = v; tulis(); isiDaftar(); });
$("cari").addEventListener("input", tabel);
$("isi").addEventListener("click", e => {
  const { aksi, id } = e.target.dataset;
  const r = data.baris.find(x => idBaris(x) === id);
  if (!r) return;
  if (aksi === "cetak") return cetak([r]);
  if (aksi === "ubah") {
    if (belumTersimpan() && !confirm("Isian yang belum disimpan akan diganti. Lanjutkan?")) return;
    ubah = id; skor = r.skor.slice();
    ISIAN.forEach(k => $(k).value = r[k] || "");
    segarkan(); bukaBagian(); simpanKerja();
    pesan(`Mengubah nilai ${r.nama}.`); window.scrollTo({ top: 0 });
  } else if (confirm(`Hapus nilai ${r.nama}?`)) {
    baca();
    data.baris = data.baris.filter(x => idBaris(x) !== id);
    tulis();
    if (ubah === id) bersihkan();
    tabel();
  }
});
$("csv").onclick = eksporCsv;
$("rata").onclick = eksporRata;
$("cadang").onclick = () => unduh(`cadangan-${R.jenis}-${cap()}.json`, JSON.stringify({ app: KUNCI, baris: data.baris, daftar: data.daftar }, null, 2), "application/json");
$("muat").onclick = () => $("file").click();
$("file").addEventListener("change", async () => {
  const f = $("file").files[0];
  if (!f) return;
  try {
    const o = JSON.parse(await f.text());
    if (o.app !== KUNCI || !Array.isArray(o.baris)) throw 0;
    baca();
    const peta = new Map(data.baris.map(r => [idBaris(r), r]));
    o.baris.filter(sah).forEach(r => { const lama = peta.get(idBaris(r)); if (!lama || r.waktu > lama.waktu) peta.set(idBaris(r), r); });
    data.baris = [...peta.values()].sort((a, b) => a.waktu.localeCompare(b.waktu));
    if (!data.daftar && typeof o.daftar === "string") data.daftar = $("daftar").value = o.daftar;
    const berhasil = tulis(); tabel(); isiDaftar();
    if (berhasil) pesan(`Cadangan dimuat. Total ${data.baris.length} baris.`);
  } catch (e) { pesan(`File tidak dikenali. Pilih file cadangan dari rubrik ${R.jenis}.`, true); }
  $("file").value = "";
});
$("hapus-semua").onclick = () => {
  if (!data.baris.length || !confirm(`Hapus semua ${data.baris.length} baris nilai? Tindakan ini tidak bisa dibatalkan. Pastikan cadangan sudah diunduh.`)) return;
  data.baris = []; tulis(); bersihkan(); tabel(); pesan("Semua nilai dihapus.");
};
window.addEventListener("storage", e => { if (e.key === KUNCI) { baca(); tabel(); } });
})();
