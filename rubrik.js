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
    <div><h3>${a.no}. ${esc(a.judul)}</h3><small>Bobot ${a.bobot}%</small>${a.ket ? `<small class="ket">${esc(a.ket)}</small>` : ""}</div>
    ${a.d.map((t, j) => `<button type="button" class="skor" data-a="${i}" data-s="${j + 1}" aria-pressed="false"><b>${j + 1}</b><span>${teks(t)}</span></button>`).join("")}
  </div>`;
}

function bangun() {
  const kelompok = R.bagian.map((b, bi) => {
    const isi = `<div class="daftar-aspek">${ASPEK.map((a, i) => a.bi === bi ? htmlAspek(a, i) : "").join("")}</div>`;
    return b.judul ? `<details class="bagian" data-b="${bi}"><summary>${esc(b.kode)}. ${esc(b.judul)}<span></span></summary>${isi}</details>`
      : `<div class="label-bagian">Aspek asesmen<span>Bobot total 100%</span></div>${isi}`;
  }).join("");
  const langkah = [
    "Isi identitas. Nama dan NIM bisa dipilih dari daftar mahasiswa.",
    "Ketuk satu skor (1 sampai 4) pada setiap aspek.",
    R.draf ? "Tekan <b>Simpan nilai</b>. Jika belum lengkap, tekan <b>Simpan draf</b> lalu lanjutkan dari rekap."
      : "Tekan <b>Simpan nilai</b>. Hasilnya masuk ke rekap dan formulir siap untuk mahasiswa berikutnya."
  ];
  const judulLangkah = (n, t) => `<h2 class="langkah"><span>${n}</span>${t}</h2>`;
  const isianNama = (id, label, contoh) => `<div class="combo"><label for="${id}">${label} <em>wajib</em></label>
      <input id="${id}" placeholder="${contoh}" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="menu-${id}" aria-autocomplete="list"${id === "nim" ? ' inputmode="text" autocapitalize="characters"' : ""}>
      <div class="menu" id="menu-${id}" role="listbox" aria-label="Daftar mahasiswa" hidden></div></div>`;
  document.body.innerHTML = `<main>
  ${kop()}
  <section class="petunjuk"><b>Petunjuk untuk ${esc(R.penilai.toLowerCase())}</b><ol>${langkah.map(x => `<li>${x}</li>`).join("")}</ol></section>
  <details class="kartu lipat" id="panel-daftar">
    <summary>Daftar mahasiswa (opsional)<span id="info-ringkas"></span></summary>
    <div class="isi-lipat">
      <p id="bantuan-daftar">Tulis NIM dan nama mahasiswa pada kotak di bawah ini (NIM dan nama dipisahkan tanda koma). Jika berhasil, pada kartu identitas, Anda dapat memilih Nama atau NIM mahasiswa dengan menu dropdown.</p>
      <p class="redup">Catatan: Anda bisa langsung melakukan salin-tempel kolom NIM dan Nama mahasiswa dari Excel.</p>
      <textarea id="daftar" aria-describedby="bantuan-daftar" placeholder="C031231001, Nama Mahasiswa Pertama&#10;C031231002, Nama Mahasiswa Kedua"></textarea>
      <div id="info-daftar" role="status"></div>
    </div>
  </details>
  <div class="form">
    <div class="spanduk" id="spanduk" hidden><span></span><button type="button" id="batal">Batal ubah</button></div>
    <section class="kartu">
      ${judulLangkah(1, "Identitas")}
      <div class="identitas">
        <div><label for="penilai">${esc(R.penilai)} <em>wajib</em></label><input id="penilai" placeholder="Nama dosen" autocomplete="name"></div>
        ${isianNama("nama", "Nama mahasiswa", "Ketik atau pilih nama")}
        ${isianNama("nim", "NIM", "Ketik atau pilih NIM")}
        <div class="lebar"><label for="judul">${esc(R.labelJudul)}</label><input id="judul" placeholder="Tulis judul" autocomplete="off"></div>
        <div class="tanggal"><label for="tanggal">Tempat dan tanggal ujian</label>
          <div class="tempat-tanggal"><span>${TEMPAT},</span><input id="tanggal" placeholder="dd/mm/yyyy" inputmode="numeric" maxlength="10" autocomplete="off">
          <button type="button" id="buka-kalender" aria-label="Buka kalender" aria-expanded="false" aria-controls="kalender"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg></button></div>
          <div class="kalender" id="kalender" role="dialog" aria-label="Pilih tanggal ujian" hidden></div></div>
      </div>
    </section>
    <section class="penilaian">
      <div class="kartu">${judulLangkah(2, "Penilaian")}</div>
      ${kelompok}
    </section>
    <section class="kartu">
      ${judulLangkah(3, "Catatan dan simpan")}
      <label for="catatan">Catatan untuk mahasiswa</label><textarea id="catatan" placeholder="Tulis catatan atau komentar"></textarea>
      <div class="kaki"><button type="button" id="kosongkan" class="teks">Kosongkan formulir</button></div>
    </section>
    <section class="bilah" aria-label="Nilai dan simpan">
      <div class="progres" aria-hidden="true"><i></i></div>
      <div class="nilai-kotak"><div class="nilai" id="nilai">–</div><button type="button" id="status" class="teks"></button></div>
      <div class="kanan">
        <button type="button" id="cetak-form">Cetak/PDF</button>
        <button type="button" id="selesai" class="utama">Simpan nilai</button>
      </div>
    </section>
  </div>
  <section class="kartu" id="rekap">
    <h2 id="judul-rekap">Rekap nilai</h2>
    <p class="redup">Nilai tersimpan di peramban pada perangkat ini. Unduh data setiap selesai satu sesi ujian.</p>
    <div class="alat">
      <input id="cari" type="search" placeholder="Cari nama atau NIM" aria-label="Cari nama atau NIM">
      <button type="button" id="csv" class="utama">Ekspor CSV</button>
      <button type="button" id="cetak-semua">Cetak semua</button>
      <button type="button" id="cadang">Unduh data</button>
    </div>
    <div class="gulir"><table><thead><tr id="kepala"></tr></thead><tbody id="isi"></tbody></table></div>
    <details class="lanjutan">
      <summary>Gabung nilai antardosen dan kelola data</summary>
      <ol><li>Setiap dosen menekan <b>Unduh data</b> di perangkatnya.</li>
        <li>Di satu perangkat, tekan <b>Muat data</b> untuk tiap berkas.</li>
        <li>Tekan <b>Ekspor rata-rata</b>. Draf tidak ikut dihitung.</li></ol>
      <div class="alat">
        <button type="button" id="muat">Muat data</button>
        <button type="button" id="rata">Ekspor rata-rata</button>
        <button type="button" id="hapus-semua" class="bahaya">Hapus semua nilai</button>
        <input type="file" id="file" accept=".json,application/json" hidden>
      </div>
    </details>
  </section>
</main>
<div class="roti" id="roti" role="status" aria-live="polite" hidden><span></span><button type="button" hidden></button></div>
<dialog id="dialog"><form method="dialog"><p></p><div><button value="tidak">Batal</button><button value="ya" class="utama"></button></div></form></dialog>
<div id="cetak"></div>`;
}

/* Penyimpanan */
let jeda;
function pesan(t, galat, aksi) {
  const el = $("roti"), tombol = el.querySelector("button");
  clearTimeout(jeda);
  el.hidden = !t;
  el.className = "roti" + (galat ? " galat" : "");
  el.querySelector("span").textContent = t;
  tombol.hidden = !aksi;
  if (aksi) { tombol.textContent = aksi.label; tombol.onclick = () => { pesan(""); aksi.jalan(); }; }
  if (t) jeda = setTimeout(() => el.hidden = true, aksi || galat ? 8000 : 4500);
}
const hapusGalat = () => { if ($("roti").classList.contains("galat")) pesan(""); };
function tanya(teksTanya, labelYa) {
  const d = $("dialog");
  d.querySelector("p").textContent = teksTanya;
  d.querySelector('[value="ya"]').textContent = labelYa;
  d.returnValue = "";
  d.showModal();
  return new Promise(ok => d.addEventListener("close", () => ok(d.returnValue === "ya"), { once: true }));
}
/* Tanggal: disimpan sebagai yyyy-mm-dd, ditampilkan sebagai dd/mm/yyyy */
const dua = n => String(n).padStart(2, "0");
const keIso = d => `${d.getFullYear()}-${dua(d.getMonth() + 1)}-${dua(d.getDate())}`;
const keTampil = iso => /^\d{4}-\d{2}-\d{2}$/.test(iso || "") ? iso.split("-").reverse().join("/") : "";
function dariTampil(t) {
  const m = String(t).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return "";
  const d = new Date(+m[3], m[2] - 1, +m[1]);
  return +m[3] >= 2000 && d.getDate() === +m[1] && d.getMonth() === m[2] - 1 ? keIso(d) : "";
}
function isiKolom(k, v) { $(k).value = k === "tanggal" ? keTampil(v) : v; }
const sah = r => r && typeof r.nim === "string" && typeof r.nama === "string" && typeof r.penilai === "string" &&
  Array.isArray(r.skor) && r.skor.length === N && r.skor.every(s => [1, 2, 3, 4].includes(s) || (R.draf && s === 0)) &&
  typeof r.waktu === "string";
function baca() {
  if (gagalTulis) return;   // jangan menimpa data di layar dengan simpanan lama
  try {
    const o = JSON.parse(localStorage.getItem(KUNCI));
    if (o && Array.isArray(o.baris)) data = { baris: o.baris.filter(sah), daftar: o.daftar || "", penilai: o.penilai || "" };
  } catch (e) { pesan("Penyimpanan peramban tidak bisa dibaca. Gunakan Unduh data.", true); }
}
function tulis() {
  try { localStorage.setItem(KUNCI, JSON.stringify(data)); gagalTulis = false; return true; }
  catch (e) { gagalTulis = true; pesan("Gagal menyimpan di peramban. Segera unduh data.", true); return false; }
}
function formulir() {
  const r = { skor: skor.slice() };
  ISIAN.forEach(k => r[k] = k === "catatan" ? $(k).value.trim() : rapi($(k).value));
  r.tanggal = dariTampil(r.tanggal);
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
    ISIAN.forEach(k => { if (typeof o[k] === "string") isiKolom(k, o[k]); });
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
  document.querySelectorAll(".aspek").forEach((el, i) => el.classList.toggle("terisi", !!skor[i]));
  const n = skor.filter(Boolean).length;
  $("status").textContent = n === N ? "Semua aspek terisi" : `${n}/${N} · ke yang kosong`;
  $("status").disabled = n === N;
  $("nilai").textContent = n === N ? hitung(skor).toFixed(2) : "–";
  document.querySelector(".progres i").style.width = `${n / N * 100}%`;
  $("selesai").textContent = n < N && R.draf ? "Simpan draf" : "Simpan nilai";
  const lama = data.baris.find(x => idBaris(x) === ubah);
  $("spanduk").hidden = !lama;
  if (lama) $("spanduk").querySelector("span").textContent = `Sedang mengubah nilai ${lama.nama}`;
  areaCetak([formulir()]);
}
function bukaBagian() {
  const i = Math.max(skor.indexOf(0), 0);
  document.querySelectorAll(".bagian").forEach(el => el.open = +el.dataset.b === ASPEK[i].bi);
}
function keAspek(i) {
  const el = $("aspek-" + i), bagian = el.closest("details");
  if (bagian) bagian.open = true;
  el.scrollIntoView({ block: "start", behavior: "smooth" });
  el.querySelector(".skor").focus({ preventScroll: true });
}
function salah(id, teksSalah) {
  $(id).setAttribute("aria-invalid", "true");
  $(id).scrollIntoView({ block: "center" });
  $(id).focus({ preventScroll: true });
  pesan(teksSalah, true);
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
  document.querySelectorAll("[aria-invalid]").forEach(el => el.removeAttribute("aria-invalid"));
  segarkan(); bukaBagian(); simpanKerja();
}
async function simpan() {
  const r = { ...formulir(), waktu: new Date().toISOString() };
  const kosong = [["penilai", `Isi nama ${R.penilai.toLowerCase()}.`], ["nama", "Isi nama mahasiswa."], ["nim", "Isi NIM."]].find(([k]) => !r[k]);
  if (kosong) return salah(...kosong);
  if (rapi($("tanggal").value) && !r.tanggal) return salah("tanggal", "Tanggal belum benar. Gunakan format dd/mm/yyyy.");
  if (!R.draf && !lengkap(r)) { pesan(`Masih ada ${N - terisi(r)} aspek yang kosong.`, true); return keAspek(r.skor.indexOf(0)); }
  baca();
  const k = idBaris(r);
  const ada = data.baris.find(x => idBaris(x) === k);
  if (ada && k !== ubah && !await tanya(`NIM ${r.nim} sudah dinilai (${ada.nama}). Ganti nilai yang tersimpan?`, "Ganti nilai")) return;
  baca();
  data.baris = data.baris.filter(x => idBaris(x) !== k && idBaris(x) !== ubah);
  data.baris.push(r);
  data.penilai = r.penilai;
  const berhasil = tulis();
  if (!berhasil) { ubah = k; tabel(); return; }   // pertahankan isian
  bersihkan(); tabel(); isiDaftar();
  pesan(lengkap(r) ? `Tersimpan: ${r.nama}, nilai ${hitung(r.skor).toFixed(2)}.` : `Draf tersimpan: ${r.nama}, ${terisi(r)}/${N} aspek.`);
  window.scrollTo({ top: 0 });
}
function tabel() {
  $("kepala").innerHTML = "<th>No</th><th>NIM</th><th>Nama</th>" +
    ASPEK.map(a => `<th class="kol-a" title="${esc(a.judul)}">${a.kode}</th>`).join("") + "<th>Nilai</th><th>Aksi</th><th>Penilai</th>";
  const q = $("cari").value.trim().toLowerCase();
  const baris = data.baris.map((r, i) => ({ r, no: i + 1 })).reverse()
    .filter(x => !q || (x.r.nim + " " + x.r.nama).toLowerCase().includes(q));
  $("isi").innerHTML = baris.map(({ r, no }) => {
    const tombol = (aksi, label) => `<button type="button" data-aksi="${aksi}" data-id="${esc(idBaris(r))}">${label}</button>`;
    return `<tr><td class="k-no">${no}</td><td class="k-nim">${esc(r.nim)}</td><td class="k-nama">${esc(r.nama)}</td>
    ${r.skor.map(s => `<td class="kol-a">${s || "–"}</td>`).join("")}
    <td class="k-nilai">${lengkap(r) ? `<b>${hitung(r.skor).toFixed(2)}</b>` : `<mark>Draf ${terisi(r)}/${N}</mark>`}</td>
    <td class="k-aksi">${tombol("ubah", lengkap(r) ? "Ubah" : "Lanjutkan")}${tombol("cetak", "Cetak")}${tombol("hapus", "Hapus")}</td>
    <td class="k-penilai">${esc(r.penilai)}</td></tr>`;
  }).join("")
    || `<tr class="hampa"><td colspan="${N + 6}">${q ? "Tidak ada yang cocok dengan pencarian." : "Belum ada nilai tersimpan. Nilai muncul di sini setelah tombol Simpan ditekan."}</td></tr>`;
  const unik = new Set(data.baris.map(r => r.nim.toLowerCase())).size;
  const draf = data.baris.filter(r => !lengkap(r)).length;
  $("judul-rekap").textContent = `Rekap nilai: ${data.baris.length} baris, ${unik} mahasiswa${draf ? `, ${draf} draf` : ""}`;
}

/* Cetak */
function lembar(r) {
  const penuh = lengkap(r), isi = (v, ganti = "") => esc(v || ganti);
  const barisAspek = (a, i) => `<tr><td class="tengah">${a.no}</td><td><b>${esc(a.judul)}</b>${a.ket ? `<div class="ket">${esc(a.ket)}</div>` : ""}</td><td class="tengah">${a.bobot}</td>
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
  const m = mahasiswa(), baris = data.daftar.split(/\r?\n/).filter(l => l.trim()).length;
  $("info-ringkas").textContent = m.length ? `${m.length} mahasiswa siap dipilih` : "Isi agar nama dan NIM bisa dipilih dari menu";
  $("info-daftar").textContent = !baris ? "" : `${m.length} mahasiswa terbaca.` +
    (baris > m.length ? ` ${baris - m.length} baris dilewati. Pisahkan NIM dan nama dengan koma atau tab.` : "");
  $("info-daftar").className = baris > m.length ? "galat" : "";
}
function pasangkan(dari, ke) {
  const v = rapi($(dari).value).toLowerCase();
  const cocok = mahasiswa().filter(x => x[dari].toLowerCase() === v);
  if (cocok.length === 1) { $(ke).value = cocok[0][ke]; segarkan(); simpanKerja(); }
}
function pasangDropdown(id) {
  const input = $(id), menu = $("menu-" + id);
  let hasil = [], sorot = -1;
  const tutup = () => { menu.hidden = true; input.setAttribute("aria-expanded", "false"); input.removeAttribute("aria-activedescendant"); sorot = -1; };
  function buka() {
    const semua = mahasiswa();
    if (!semua.length) return tutup();
    if (input.getAttribute("aria-invalid") !== "true") hapusGalat();
    const v = rapi(input.value).toLowerCase();
    const pas = semua.some(x => x[id].toLowerCase() === v);   // sudah terpilih: tampilkan semua
    hasil = semua.filter(x => !v || pas || (x.nama + " " + x.nim).toLowerCase().includes(v));
    const saya = rapi($("penilai").value).toLowerCase();
    menu.innerHTML = hasil.map((x, i) => {
      const r = data.baris.find(b => b.nim.toLowerCase() === x.nim.toLowerCase() && b.penilai.toLowerCase() === saya);
      return `<div class="opsi" role="option" id="${id}-opsi-${i}" data-i="${i}" aria-selected="false"><span><b>${esc(x[id])}</b><small>${esc(x[id === "nama" ? "nim" : "nama"])}</small></span>${r ? `<mark>${lengkap(r) ? "Sudah dinilai" : "Draf"}</mark>` : ""}</div>`;
    }).join("") || `<div class="kosong">Tidak ada di daftar. Isian manual tetap bisa disimpan.</div>`;
    menu.hidden = false; sorot = -1; input.setAttribute("aria-expanded", "true");
  }
  function pilih(i) {
    const x = hasil[i];
    if (!x) return;
    ["nama", "nim"].forEach(k => { $(k).value = x[k]; $(k).removeAttribute("aria-invalid"); });
    tutup(); segarkan(); simpanKerja();
  }
  input.addEventListener("focus", buka);
  input.addEventListener("click", buka);
  input.addEventListener("input", buka);
  input.addEventListener("keydown", e => {
    if (e.key === "Escape" || e.key === "Tab") return tutup();
    if (menu.hidden) { if (e.key === "ArrowDown") buka(); return; }
    if ((e.key === "ArrowDown" || e.key === "ArrowUp") && hasil.length) {
      e.preventDefault();
      sorot = (sorot + (e.key === "ArrowDown" ? 1 : sorot < 0 ? 0 : -1) + hasil.length) % hasil.length;
      menu.querySelectorAll(".opsi").forEach((el, i) => el.setAttribute("aria-selected", String(i === sorot)));
      input.setAttribute("aria-activedescendant", `${id}-opsi-${sorot}`);
      $(`${id}-opsi-${sorot}`).scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter" && sorot >= 0) { e.preventDefault(); pilih(sorot); }
  });
  menu.addEventListener("mousedown", e => e.preventDefault());
  menu.addEventListener("click", e => { const o = e.target.closest(".opsi"); if (o) { pilih(+o.dataset.i); input.blur(); } });
  document.addEventListener("pointerdown", e => { if (!input.parentElement.contains(e.target)) tutup(); });
}

/* Kalender dd/mm/yyyy, pekan dimulai hari Senin */
function pasangKalender() {
  const kal = $("kalender"), pemicu = $("buka-kalender"), input = $("tanggal");
  let fokus = new Date();
  const tutup = () => { kal.hidden = true; pemicu.setAttribute("aria-expanded", "false"); };
  function gambar(arahkan) {
    const th = fokus.getFullYear(), bl = fokus.getMonth(), awal = (new Date(th, bl, 1).getDay() + 6) % 7;
    const pilihan = dariTampil(input.value), kini = keIso(new Date());
    let sel = "<span></span>".repeat(awal);
    for (let h = 1; h <= new Date(th, bl + 1, 0).getDate(); h++) {
      const iso = keIso(new Date(th, bl, h));
      sel += `<button type="button" data-tgl="${iso}" aria-label="${tanggalPanjang(iso)}" aria-pressed="${iso === pilihan}" class="${iso === kini ? "kini" : ""}" tabindex="${h === fokus.getDate() ? 0 : -1}">${h}</button>`;
    }
    kal.innerHTML = `<div class="kal-kepala"><button type="button" data-geser="-1" aria-label="Bulan sebelumnya">◀</button>
      <b aria-live="polite">${fokus.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</b>
      <button type="button" data-geser="1" aria-label="Bulan berikutnya">▶</button></div>
      <div class="kal-grid">${["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map(h => `<i>${h}</i>`).join("")}${sel}</div>
      <div class="kal-kaki"><button type="button" data-hapus>Kosongkan</button><button type="button" data-tgl="${kini}" class="utama">Hari ini</button></div>`;
    if (arahkan) kal.querySelector('.kal-grid [tabindex="0"]').focus({ preventScroll: true });
  }
  function atur(v) { input.value = keTampil(v); input.removeAttribute("aria-invalid"); tutup(); segarkan(); simpanKerja(); pemicu.focus({ preventScroll: true }); }
  pemicu.onclick = () => {
    if (!kal.hidden) return tutup();
    hapusGalat();
    const v = dariTampil(input.value);
    fokus = v ? new Date(v + "T00:00:00") : new Date();
    kal.hidden = false; pemicu.setAttribute("aria-expanded", "true"); gambar(true);
    kal.scrollIntoView({ block: "nearest" });
  };
  kal.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b) return;
    e.stopPropagation();
    if (b.dataset.tgl) return atur(b.dataset.tgl);
    if ("hapus" in b.dataset) return atur("");
    const g = +b.dataset.geser;
    fokus = new Date(fokus.getFullYear(), fokus.getMonth() + g, 1); gambar(false);
    kal.querySelector(`[data-geser="${g}"]`).focus({ preventScroll: true });
  });
  kal.addEventListener("keydown", e => {
    if (e.key === "Escape") { tutup(); return pemicu.focus(); }
    const langkah = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (!langkah || !e.target.closest(".kal-grid")) return;
    e.preventDefault();
    fokus = new Date(fokus.getFullYear(), fokus.getMonth(), fokus.getDate() + langkah); gambar(true);
  });
  /* Garis miring ditambahkan otomatis saat tanggal diketik */
  input.addEventListener("input", e => {
    if (e.inputType && e.inputType.startsWith("delete")) return;
    if (/^\d{2}$|^\d{2}\/\d{2}$/.test(input.value)) input.value += "/";
    else if (/^\d{8}$/.test(input.value)) input.value = input.value.replace(/(\d{2})(\d{2})(\d{4})/, "$1/$2/$3");
    segarkan(); simpanKerja();
  });
  input.addEventListener("change", () => { if (input.value && !dariTampil(input.value)) { input.setAttribute("aria-invalid", "true"); pesan("Tanggal belum benar. Gunakan format dd/mm/yyyy.", true); } });
  document.addEventListener("pointerdown", e => { if (!input.closest(".tanggal").contains(e.target)) tutup(); });
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

pasangDropdown("nama"); pasangDropdown("nim"); pasangKalender();

document.querySelector(".form").addEventListener("click", e => {
  const b = e.target.closest(".skor");
  if (!b) return;
  const a = +b.dataset.a, bi = ASPEK[a].bi, baru = !skor[a];
  skor[a] = +b.dataset.s;
  pesan(""); segarkan(); simpanKerja();
  /* Bagian selesai diisi: buka bagian berikutnya yang masih kosong */
  const lanjut = skor.indexOf(0);
  if (baru && R.bagian[bi].judul && lanjut >= 0 && ASPEK.every((x, i) => x.bi !== bi || skor[i])) {
    document.querySelectorAll(".bagian").forEach(el => el.open = +el.dataset.b === ASPEK[lanjut].bi);
    document.querySelector(`.bagian[data-b="${ASPEK[lanjut].bi}"]`).scrollIntoView({ block: "start", behavior: "smooth" });
  }
});
ISIAN.forEach(k => $(k).addEventListener("input", () => { $(k).removeAttribute("aria-invalid"); hapusGalat(); segarkan(); simpanKerja(); }));
$("selesai").onclick = simpan;
$("status").onclick = () => keAspek(skor.indexOf(0));
$("kosongkan").onclick = async () => {
  if (belumTersimpan() && !await tanya("Kosongkan isian yang belum disimpan?", "Kosongkan")) return;
  bersihkan(); pesan(""); window.scrollTo({ top: 0 });
};
$("batal").onclick = $("kosongkan").onclick;
$("nama").addEventListener("change", () => pasangkan("nama", "nim"));
$("nim").addEventListener("change", () => pasangkan("nim", "nama"));
$("penilai").addEventListener("change", () => { baca(); data.penilai = rapi($("penilai").value); tulis(); });
$("daftar").addEventListener("input", () => { const v = $("daftar").value; baca(); data.daftar = v; tulis(); isiDaftar(); });
$("cari").addEventListener("input", tabel);
$("isi").addEventListener("click", async e => {
  const { aksi, id } = e.target.dataset;
  const r = data.baris.find(x => idBaris(x) === id);
  if (!r) return;
  if (aksi === "cetak") return cetak([r]);
  if (aksi === "ubah") {
    if (belumTersimpan() && !await tanya("Isian yang belum disimpan akan diganti.", "Lanjutkan")) return;
    ubah = id; skor = r.skor.slice();
    ISIAN.forEach(k => isiKolom(k, r[k] || ""));
    segarkan(); bukaBagian(); simpanKerja();
    window.scrollTo({ top: 0 });
  } else {
    baca();
    data.baris = data.baris.filter(x => idBaris(x) !== id);
    tulis();
    if (ubah === id) { ubah = null; segarkan(); simpanKerja(); }
    tabel();
    pesan(`Nilai ${r.nama} dihapus.`, false, { label: "Urungkan", jalan: () => {
      baca();
      if (!data.baris.some(x => idBaris(x) === id)) data.baris.push(r);
      data.baris.sort((a, b) => a.waktu.localeCompare(b.waktu));
      tulis(); tabel();
    } });
  }
});
$("cetak-form").onclick = () => cetak([formulir()]);
$("cetak-semua").onclick = () => {
  baca();
  const d = data.baris.filter(lengkap);   // draf tidak ikut dicetak
  if (!d.length) return pesan("Belum ada nilai lengkap untuk dicetak.", true);
  cetak(d);
};
/* Setelah mencetak dari rekap, interaksi berikutnya mengembalikan area cetak ke isian aktif */
["pointerdown", "keydown"].forEach(t => document.addEventListener(t, () => { if (cetakLain) areaCetak([formulir()]); }, true));
$("csv").onclick = eksporCsv;
$("rata").onclick = eksporRata;
$("cadang").onclick = () => unduh(`data-${R.jenis}-${cap()}.json`, JSON.stringify({ app: KUNCI, baris: data.baris, daftar: data.daftar }, null, 2), "application/json");
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
    if (berhasil) pesan(`Data dimuat. Total ${data.baris.length} baris.`);
  } catch (e) { pesan(`File tidak dikenali. Pilih file data (.json) dari rubrik ${R.jenis}.`, true); }
  $("file").value = "";
});
$("hapus-semua").onclick = async () => {
  if (!data.baris.length) return pesan("Belum ada nilai tersimpan.", true);
  if (!await tanya(`Hapus semua ${data.baris.length} baris nilai? Tindakan ini tidak bisa dibatalkan. Pastikan data sudah diunduh.`, "Hapus semua")) return;
  data.baris = []; tulis(); bersihkan(); tabel(); pesan("Semua nilai dihapus.");
};
window.addEventListener("storage", e => { if (e.key === KUNCI) { baca(); tabel(); } });
})();
