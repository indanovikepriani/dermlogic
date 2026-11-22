const KB_VARIABLES = [
  {
    code: 'L',
    title: 'Variabel Lingkungan',
    rows: [
      ['L1', 'Pegunungan Dingin', 'Suhu dan kelembapan rendah, angin → TEWL tinggi'],
      ['L2', 'Pesisir Laut', 'UV intens, garam laut, dan angin'],
      ['L3', 'Perkotaan Polusi', 'Debu, asap, dan PM2.5'],
      ['L4', 'Ruangan Ber-AC', 'Udara kering buatan'],
      ['L5', 'Tropis Lembap', 'Panas, lembap, mudah berkeringat'],
      ['L6', 'Panas Kering Ekstrem', 'Terik tanpa kelembapan'],
    ],
  },
  {
    code: 'K/B',
    title: 'Variabel Jenis Kulit & Barrier',
    rows: [
      ['K1', 'Kering', 'Sebum rendah, kasar, mudah ketarik'],
      ['K2', 'Berminyak', 'Sebum berlebih, pori tampak besar'],
      ['K3', 'Kombinasi', 'T-zone berminyak, pipi kering'],
      ['K4', 'Sensitif', 'Mudah merah, perih, reaktif'],
      ['K5', 'Berjerawat', 'Komedo, papula, inflamasi'],
      ['B1', 'Normal / Barrier Stabil', 'Seimbang, tidak ada risiko barrier aktif'],
    ],
  },
  {
    code: 'U/T',
    title: 'Variabel Usia & Jam Tidur',
    rows: [
      ['U1', 'Remaja', '14–19 tahun, sebum aktif'],
      ['U2', 'Dewasa Muda', '20–29 tahun, regenerasi optimum'],
      ['U3', 'Dewasa', '30–44 tahun, kolagen mulai melambat'],
      ['U4', 'Usia Matang', '≥45 tahun, lipid barrier menipis'],
      ['T1', '< 5 Jam', 'Sangat kurang; pemulihan sawar lambat'],
      ['T2', '5–6 Jam', 'Kurang; perlu dukungan niacinamide'],
      ['T3', '7–8 Jam', 'Cukup; pola tidur konsisten'],
      ['T4', 'Shift / Tidak Teratur', 'Jadwal bergeser; kortisol mudah naik'],
    ],
  },
  {
    code: 'A/M',
    title: 'Variabel Aktivitas & Makeup',
    rows: [
      ['A1', 'Outdoor Ekstrem', 'Lebih dari 4 jam di luar, UV tinggi'],
      ['A2', 'Komuter', 'Debu dan polusi jalan raya'],
      ['A3', 'Indoor AC', 'Lebih dari 6 jam di ruang ber-AC'],
      ['A4', 'Olahraga', 'Keringat dan sebum berlebih'],
      ['A5', 'Rumah / Non-AC', 'Ventilasi alami'],
      ['M1', 'Tanpa Makeup', 'Skincare dan tabir surya saja'],
      ['M2', 'Makeup Ringan', 'Skin tint, lip tint'],
      ['M3', 'Full Coverage', 'Foundation dan concealer'],
      ['M4', 'Tahan Air / Keringat', 'Untuk aktivitas luar ruang'],
    ],
  },
];

const KB_CORE_REFS = {
  rafi: 'Rafi, R. A., Purnamasari, I., & Maulana, I. (2026), Jurnal Ilmiah Wahana Pendidikan',
  sulindawaty: 'Sulindawaty, et al. (2022), JIKOMSI',
  sasmita: 'Sasmita, G. (2020), Jurnal Informatika Kaputama (JIK)',
  putri: 'Putri, A. D., & Rahman, F. (2021), Jurnal Teknologi Informasi dan Sistem Cerdas',
};

const KB_RULE_META = {
  R1: { category: 'Lingkungan', sub: 'Lingkungan', title: 'Pegunungan dingin → TEWL', rationale: 'Suhu dan kelembapan rendah mempercepat penguapan air trans epidermal, sehingga sawar kulit perlu lipid dan humektan.', cites: ['sulindawaty', 'sasmita'] },
  R2: { category: 'Lingkungan', sub: 'Lingkungan', title: 'AC / indoor → TEWL', rationale: 'Udara kering buatan menurunkan hidrasi lapisan terluar kulit dan memicu rasa ketarik.', cites: ['sulindawaty'] },
  R3: { category: 'Lingkungan', sub: 'Lingkungan', title: 'Pesisir → UV + garam', rationale: 'UV tinggi dan garam laut meningkatkan stres oksidatif sekaligus iritasi osmotik pada kulit.', cites: ['sulindawaty', 'rafi'] },
  R4: { category: 'Lingkungan', sub: 'Lingkungan', title: 'Panas kering → UV + TEWL', rationale: 'Terik dan udara kering menggabungkan beban UV dengan kehilangan air berlebih.', cites: ['sulindawaty'] },
  R5: { category: 'Lingkungan', sub: 'Lingkungan', title: 'Polusi → stres oksidatif', rationale: 'Partikulat PM2.5 menempel pada sebum dan memicu radikal bebas yang mempercepat penuaan kulit.', cites: ['sulindawaty', 'sasmita'] },
  R6: { category: 'Lingkungan', sub: 'Lingkungan & Aktivitas', title: 'Tropis lembap → sebum', rationale: 'Panas dan lembap meningkatkan produksi sebum serta keringat, sehingga tekstur ringan lebih sesuai.', cites: ['sulindawaty'] },
  R7: { category: 'Jam Tidur', sub: 'Jam Tidur', title: 'Tidur buruk → sawar lemah', rationale: 'Kurang tidur dan jadwal shift memperlambat pemulihan sawar kulit serta memengaruhi kortisol.', cites: ['putri'] },
  R8: { category: 'Lingkungan', sub: 'Lingkungan & Aktivitas', title: 'Outdoor → beban UV', rationale: 'Paparan luar ruang lebih dari empat jam menaikkan akumulasi UV harian.', cites: ['rafi'] },
  R9: { category: 'Lingkungan', sub: 'Lingkungan & Aktivitas', title: 'Olahraga → keringat', rationale: 'Keringat yang dibiarkan mengering bersama sebum dapat menyumbat saluran kelenjar dan mengiritasi.', cites: ['rafi', 'sulindawaty'] },
  R10: { category: 'Jenis Kulit', sub: 'Barrier', title: 'TEWL berulang → barrier lemah', rationale: 'Kehilangan air yang berulang melemahkan lapisan lipid sehingga iritan lebih mudah masuk.', cites: ['sasmita', 'sulindawaty'] },
  R11: { category: 'Jenis Kulit', sub: 'Jenis Kulit', title: 'Kulit kering → emolien', rationale: 'Sebum rendah memerlukan humektan dan emolien agar air tidak terus menguap.', cites: ['rafi'] },
  R12: { category: 'Jenis Kulit', sub: 'Jenis Kulit', title: 'Berminyak → formula ringan', rationale: 'Sebum tinggi tetap membutuhkan pelembap, tetapi tekstur gel bebas minyak lebih sesuai.', cites: ['rafi'] },
  R13: { category: 'Jenis Kulit', sub: 'Jenis Kulit', title: 'Kombinasi → keseimbangan', rationale: 'T-zone berminyak dan pipi kering memerlukan niacinamide serta humektan ringan.', cites: ['rafi', 'sasmita'] },
  R14: { category: 'Jenis Kulit', sub: 'Barrier', title: 'Sensitif / barrier → hindari iritan', rationale: 'Kulit sensitif dan sawar rentan lebih reaktif terhadap parfum, alkohol, dan eksfoliasi keras.', cites: ['sulindawaty'] },
  R15: { category: 'Jenis Kulit', sub: 'Jenis Kulit', title: 'Berjerawat → terapi topikal', rationale: 'Hiperkeratinisasi, sebum, C. acnes, dan inflamasi memerlukan agen anti-komedo serta anti-inflamasi.', cites: ['rafi', 'putri'] },
  A1: { category: 'Usia & Makeup', sub: 'Usia', title: 'Remaja → sebum aktif', rationale: 'Fluktuasi hormon remaja meningkatkan sebum; retinoid anti-aging keras sebaiknya dihindari.', cites: ['rafi', 'putri'] },
  A2: { category: 'Usia & Makeup', sub: 'Usia', title: 'Dewasa/matang → kolagen', rationale: 'Sintesis kolagen, elastin, dan lipid menurun sehingga peptide, bakuchiol, dan ceramide relevan.', cites: ['rafi', 'sasmita'] },
  A3: { category: 'Usia & Makeup', sub: 'Usia', title: 'Usia matang → lipid tambahan', rationale: 'Penipisan lipid barrier meningkatkan TEWL sehingga emolien tambahan diperlukan.', cites: ['rafi', 'sulindawaty'] },
  R34: { category: 'Usia & Makeup', sub: 'Makeup', title: 'Makeup → bersih tuntas', rationale: 'Makeup yang tidak diangkat dapat memicu sumbatan pori dan iritasi; aplikator perlu higienis.', cites: ['sulindawaty'] },
  R35: { category: 'Usia & Makeup', sub: 'Makeup', title: 'Kulit berminyak → base oil-free', rationale: 'Base non-komedogenik mengurangi risiko sumbatan pori pada kulit berminyak atau berjerawat.', cites: ['rafi'] },
  R36: { category: 'Usia & Makeup', sub: 'Makeup', title: 'Kulit kering → base hydrating', rationale: 'Base dengan kandungan melembapkan membantu mencegah riasan tampak pecah pada kulit kering.', cites: ['rafi'] },
  R37: { category: 'Usia & Makeup', sub: 'Makeup', title: 'Outdoor → waterproof', rationale: 'Aktivitas luar ruang memerlukan formula tahan keringat dan perlindungan UV berulang.', cites: ['rafi', 'sulindawaty'] },
  R38: { category: 'Usia & Makeup', sub: 'Makeup', title: 'Tanpa makeup → tinted SPF', rationale: 'Tabir surya bertint dapat meratakan warna kulit sekaligus memberi fotoprotection.', cites: ['rafi'] },
};

const KB_FACT_LABELS = {
  'env:gunung': 'L = Pegunungan Dingin (TEWL tinggi)',
  'env:pesisir': 'L = Pesisir Laut (UV intens & air asin)',
  'env:perkotaan': 'L = Perkotaan Polusi (PM2.5)',
  'env:ac': 'L = Ruangan Ber-AC',
  'env:tropis': 'L = Tropis Lembap',
  'env:panas_kering': 'L = Panas Kering Ekstrem',
  'kulit:kering': 'K = Kering',
  'kulit:berminyak': 'K = Berminyak',
  'kulit:kombinasi': 'K = Kombinasi',
  'kulit:sensitif': 'K = Sensitif / B = Barrier rentan',
  'kulit:berjerawat': 'K = Berjerawat',
  'kulit:normal': 'K = Normal',
  'keluhan:barrier': 'B = Sawar kulit rentan',
  'tidur:sangat_kurang': 'T = < 5 Jam',
  'tidur:kurang': 'T = 5–6 Jam',
  'tidur:cukup': 'T = 7–8 Jam',
  'tidur:tidak_teratur': 'T = Shift / Tidak Teratur',
  'usia:remaja': 'U = Remaja (14–19 tahun)',
  'usia:muda': 'U = Dewasa Muda (20–29 tahun)',
  'usia:dewasa': 'U = Dewasa (30–44 tahun)',
  'usia:matang': 'U = Usia Matang (≥45 tahun)',
  'akt:outdoor': 'A = Outdoor Ekstrem',
  'akt:komuter': 'A = Komuter',
  'akt:indoor_ac': 'A = Indoor AC',
  'akt:olahraga': 'A = Olahraga',
  'akt:rumah': 'A = Rumah / Non-AC',
  'makeup:tanpa': 'M = Tanpa Makeup',
  'makeup:ringan': 'M = Makeup Ringan',
  'makeup:full': 'M = Full Coverage',
  'makeup:outdoor': 'M = Tahan Air / Keringat',
};

const kbEsc = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[char]));

const kbClean = (value) => String(value == null ? '' : value).replace(/&amp;/g, '&');

const kbFactLabel = (code) => {
  const negated = code.startsWith('!');
  const base = negated ? code.slice(1) : code;
  let label = KB_FACT_LABELS[base];

  if (!label && ST[base]) label = `Fakta = ${ST[base]}`;
  if (!label && C[base]) label = `${base.startsWith('REC:') ? 'Bahan aktif' : base.startsWith('AVOID:') ? 'Dihindari' : base.startsWith('TX:') ? 'Formulasi' : 'Tindakan'} = ${kbClean(C[base][0])}`;
  if (!label) label = code;

  return `${negated ? 'NOT ' : ''}${label}`;
};

const kbCondition = (condition) => condition.split('|').map((part) => kbFactLabel(part.trim())).join(' OR ');

const kbThen = (rule) => {
  const outputs = rule[2] || [];
  const active = outputs.filter((item) => item.startsWith('REC:')).map(kbFactLabel);
  const avoid = outputs.filter((item) => item.startsWith('AVOID:')).map(kbFactLabel);
  const form = outputs.filter((item) => item.startsWith('TX:') || item.startsWith('MK:')).map(kbFactLabel);
  const action = outputs.filter((item) => item.startsWith('HABIT:')).map(kbFactLabel);
  const facts = outputs.filter((item) => !/^(REC:|AVOID:|TX:|MK:|HABIT:)/.test(item)).map(kbFactLabel);
  const groups = [
    ['Fakta turunan', facts],
    ['Bahan aktif', active],
    ['Formulasi', form],
    ['Dihindari', avoid],
    ['Tindakan', action],
  ].filter((group) => group[1].length);

  if (!groups.length) return '<p class="hint">Tidak ada konklusi tambahan.</p>';

  return groups.map(([label, items]) => `<p><b>${kbEsc(label)}:</b> ${kbEsc(items.join(', '))}</p>`).join('');
};

const kbCitations = (keys) => keys.map((key) => `<span class="rule-cite">${kbEsc(KB_CORE_REFS[key])}</span>`).join(' · ');

const kbRuleCard = (rule, meta) => {
  const logic = `IF ${(rule[1] || []).map(kbCondition).join(' AND ')} THEN ${(rule[2] || []).map(kbFactLabel).join(' + ')}`;
  const search = `${rule[0]} ${meta.title} ${meta.category} ${meta.sub} ${meta.rationale} ${logic} ${kbThen(rule).replace(/<[^>]+>/g, ' ')}`;
  return `<details class="know-card rule-card" data-category="${kbEsc(meta.category)}" data-search="${kbEsc(search.toLowerCase())}">
  <summary><span class="tag rule-code">${kbEsc(rule[0])}</span><b>${kbEsc(meta.title)}</b><small>${kbEsc(meta.category)} · ${kbEsc(meta.sub)}</small></summary>
  <div class="know-body rule-body">
    <div class="know-col"><h4>Pernyataan logika (IF–THEN)</h4><p class="rule-logic"><b>IF</b> ${kbEsc((rule[1] || []).map(kbCondition).join(' AND '))} <b>THEN</b> ${kbEsc((rule[2] || []).map(kbFactLabel).join(' + '))}</p>${rule[4] && rule[4].length ? `<p class="know-ref">Rujukan topik: ${rule[4].map((n) => `<a href="./referensi#r${n}">[${n}]</a>`).join(' ')}</p>` : ''}</div>
    <div class="know-col ok"><h4>Konklusi (bahan / formulasi / tindakan)</h4>${kbThen(rule)}</div>
    <div class="know-col warn"><h4>Rasional ilmiah & sitasi</h4><p>${kbEsc(meta.rationale)}</p><p class="rule-refs">${kbCitations(meta.cites)}</p></div>
  </div>
  <template class="rule-search">${kbEsc(search.toLowerCase())}</template>
</details>`;
};

const kbVariableTable = () => KB_VARIABLES.map((group) => `<section class="var-group">
  <h3><span class="rule-code">${kbEsc(group.code)}</span> ${kbEsc(group.title)}</h3>
  <table class="var-table"><thead><tr><th>Kode</th><th>Nilai variabel</th><th>Makna / kondisi</th></tr></thead><tbody>
  ${group.rows.map((row) => `<tr><td><b>${kbEsc(row[0])}</b></td><td>${kbEsc(row[1])}</td><td>${kbEsc(row[2])}</td></tr>`).join('')}
  </tbody></table>
</section>`).join('');

const kbCoreRules = () => RULES
  .filter((rule) => /^R\d+$/.test(rule[0]))
  .filter((rule) => Number(rule[0].slice(1)) >= 1 && Number(rule[0].slice(1)) <= 15)
  .sort((a, b) => Number(a[0].slice(1)) - Number(b[0].slice(1)));

const kbExtraRules = () => ['A1', 'A2', 'A3', 'R34', 'R35', 'R36', 'R37', 'R38']
  .map((id) => RULES.find((rule) => rule[0] === id))
  .filter(Boolean);

const renderKbRules = () => {
  const root = document.querySelector('#ruleList');
  const variableRoot = document.querySelector('#varGroups');
  const count = document.querySelector('#ruleCount');
  if (!root || !variableRoot) return;

  variableRoot.innerHTML = kbVariableTable();

  const catalog = [...kbCoreRules(), ...kbExtraRules()].filter((rule) => KB_RULE_META[rule[0]]);
  root.innerHTML = catalog.map((rule) => kbRuleCard(rule, KB_RULE_META[rule[0]])).join('');

  const input = document.querySelector('#ruleQ');
  const buttons = [...document.querySelectorAll('#ruleFilters .kb-cat')];
  let active = 'Semua Rule';

  const draw = () => {
    const term = input.value.trim().toLowerCase();
    let visible = 0;

    root.querySelectorAll('.rule-card').forEach((card) => {
      const category = card.dataset.category;
      const haystack = card.dataset.search || '';
      const show = (active === 'Semua Rule' || category === active) && (!term || haystack.includes(term));
      card.hidden = !show;
      if (show) visible += 1;
    });

    buttons.forEach((button) => button.classList.toggle('on', button.dataset.filter === active));
    if (count) count.textContent = `Menampilkan ${visible} dari ${catalog.length} kaidah · ${kbCoreRules().length} kaidah inti R1–R15`;
  };

  buttons.forEach((button) => {
    button.onclick = () => {
      active = button.dataset.filter;
      draw();
    };
  });

  input.oninput = draw;
  draw();
};

renderKbRules();
