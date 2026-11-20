<!DOCTYPE html>
<html lang="id" data-theme="light">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
    <title>Daftar Referensi — DermLogic</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/dermlogic.css') }}">
</head>
<body>
<header class="hero hero-sm"><div class="w"><a class="back" href="{{ route('home') }}">← Kembali ke konsultasi</a><span class="badge">📚 Sumber ilmiah sistem</span>
<h1>Referensi yang kami pakai</h1><p>Semua rekomendasi bahan dan aturan inferensi bersumber dari jurnal ilmiah dan buku metodologi berikut.</p></div></header>
<div class="w page">
<div class="card search"><h2>Cari referensi</h2><p class="hint">Ketik nomor, penulis, kata kunci, atau topik untuk mempersempit daftar.</p><input type="search" id="cari" placeholder="Contoh: niacinamide, barrier, 2005" autocomplete="off"><p class="hint" id="info" style="margin-top:8px"></p></div>
<div id="daftar"></div>
<div class="note">Detail sitasi seperti volume, halaman, dan DOI sebaiknya diverifikasi ulang melalui PubMed atau Google Scholar sebelum dipakai dalam laporan akademik. Lihat juga <a href="{{ route('pengetahuan') }}">perpustakaan pengetahuan kulit ↗</a>.</div>
<p class="hint" style="margin:20px 0;text-align:center">© 2026 DermLogic. Alat edukasi, bukan pengganti pemeriksaan dokter kulit.</p>
</div>
<script src="{{ asset('js/dermlogic/data.js') }}"></script>
<script>
const $=s=>document.querySelector(s),q=$("#cari"),box=$("#daftar"),info=$("#info");
function row(n,t){return `<li id="r${n}"><span class="refno">${n}</span><span>${t}</span></li>`}
function paint(s=""){s=s.trim().toLowerCase();let total=0,html="";
REF_TOPICS.forEach(g=>{const topic=g[0].replace(/&amp;/g,"&"),items=g[2].map(n=>({n,t:REFS[n]})).filter(x=>!s||(x.n+" "+x.t+" "+topic).toLowerCase().includes(s));
if(!items.length)return;total+=items.length;html+=`<section class="card ref"><h2>${topic}</h2><p class="hint">${g[1]}</p><ol class="reflist">${items.map(x=>row(x.n,x.t)).join("")}</ol></section>`});
box.innerHTML=html||`<div class="card"><p>Tidak ada referensi yang cocok dengan “${s}”.</p></div>`;
info.textContent=total+" dari "+Object.keys(REFS).length+" referensi ditampilkan."}
q.addEventListener("input",()=>paint(q.value));paint();
</script>
</body>
</html>
