const CITATIONS = [
  'Rafi, R. A., Purnamasari, I., & Maulana, I. (2026), Jurnal Ilmiah Wahana Pendidikan',
  'Sulindawaty, et al. (2022), JIKOMSI',
  'Sasmita, G. (2020), Jurnal Informatika Kaputama (JIK)',
  'Putri, A. D., & Rahman, F. (2021), Jurnal Teknologi Informasi dan Sistem Cerdas',
];

const CONTEXT_FIELDS = [
  ['Nama', ['nama']],
  ['Rentang usia', ['usia']],
  ['Fase fisiologis usia', ['fase_usia']],
  ['Gender', ['gender']],
  ['Lingkungan', ['detail.lingkungan', 'lingkungan', 'env']],
  ['Jenis kulit', ['jenis_kulit', 'profil.kulit']],
  ['Kondisi kulit', ['kondisi_kulit', 'profil.keluhan']],
  ['Kondisi barrier', ['kondisi_barrier']],
  ['Faktor penyebab', ['faktor_penyebab']],
  ['Pola jam tidur', ['detail.tidur', 'tidur']],
  ['Aktivitas harian', ['detail.aktivitas', 'aktivitas']],
  ['Preferensi makeup', ['detail.makeup', 'makeup']],
  ['Dugaan kondisi utama', ['dugaan_utama', 'hasil_diagnosis']],
  ['Kandungan skincare yang direkomendasikan', ['dianjurkan']],
  ['Kandungan yang perlu dihindari', ['dihindari']],
  ['Pertanyaan pengguna', ['pertanyaan']],
  ['Tanda bahaya', ['tanda_bahaya']],
];

const BANNED_BRANDS = [
  'skintific', 'somethinc', 'wardah', 'emina', 'nivea', 'garnier', 'olay',
  'cerave', 'cetaphil', 'la roche', 'bioderma', 'avene', 'neutrogena',
  'the ordinary', 'lancome', 'estee lauder', 'maybelline', 'loreal',
  "l'oreal", 'revlon', 'innisfree', 'etude house', 'laneige', 'erborian',
  'eyenlip', 'ozelle', 'la tulipe', 'make over', 'mirror', 'viva',
];

const JOURNALS = [
  'Jurnal Ilmiah Wahana Pendidikan',
  'JIKOMSI',
  'Jurnal Informatika Kaputama (JIK)',
  'Jurnal Teknologi Informasi dan Sistem Cerdas',
];

const dataGet = (object, path) => path.split('.').reduce(
  (value, key) => value && typeof value === 'object' ? value[key] : undefined,
  object,
);

const flatten = (value) => {
  if (value == null) return '';
  if (Array.isArray(value)) return value.map(flatten).join(' ');
  if (typeof value === 'object') return Object.values(value).map(flatten).join(' ');
  return String(value);
};

const contextLines = (context) => CONTEXT_FIELDS
  .map(([label, paths]) => {
    const raw = paths.map((path) => dataGet(context || {}, path)).find((value) => value !== undefined && value !== '');
    if (raw === undefined || raw === '') return null;
    const value = Array.isArray(raw) ? raw.join(', ') : flatten(raw);
    return value.trim() === '' ? null : `${label}: ${value}`;
  })
  .filter(Boolean);

const boldJournals = (text) => JOURNALS.reduce(
  (result, journal) => result.split(journal).join(`**${journal}**`),
  text,
);

const citationBlock = () => `**Sitasi jurnal pakar:**\n${CITATIONS.map((item) => `- ${boldJournals(item)}`).join('\n')}`;

const containsBrand = (answer) => {
  const lower = String(answer).toLowerCase();
  return BANNED_BRANDS.some((brand) => lower.includes(brand.toLowerCase()));
};

const withCitations = (answer) => {
  const text = String(answer).trimEnd();
  const complete = CITATIONS.every((citation) => text.includes(citation.split(' (')[0]));
  return complete ? text : `${text}\n\n${citationBlock()}`;
};

const localAnswer = (question, context) => {
  const haystack = `${question || ''} ${flatten(context)}`.toLowerCase();
  const has = (keywords) => keywords.some((keyword) => keyword.length <= 2
    ? new RegExp(`(^|[^a-z0-9])${keyword}([^a-z0-9]|$)`).test(haystack)
    : haystack.includes(keyword));
  const name = String(dataGet(context || {}, 'nama') || '').trim();
  const greeting = name ? `Halo ${name}, ` : '';
  let body = 'Untuk perawatan harian, sesuaikan tekstur dengan kondisi kulit: **water-based gel / oil-free** untuk kulit berminyak atau lembap, dan **rich cream hypoallergenic** untuk kulit kering atau dingin. **Ceramide NP**, **Squalane**, **Panthenol**, dan **Niacinamide** umumnya membantu menjaga hidrasi dan sawar kulit. Hindari **Alcohol Denat**, **SLS**, **Fragrance**, **Coconut Oil** komedogenik, dan **Photosensitizing Essential Oils** bila kulit mudah iritasi.';

  if (has(['garam', 'laut', 'pesisir', 'asin', 'salt', 'uv', 'matahari', 'tabir surya', 'sunscreen', 'spf', 'panas'])) {
    body = 'Untuk kulit terpapar **UV pesisir** dan **stres osmotik air asin**, bilas wajah dengan air tawar segera setelah terkena cipratan laut, lalu gunakan **Zinc Oxide SPF 50+ PA++++** dalam tekstur **water-based gel / oil-free**. Ulangi setiap 2 jam karena garam dan keringat menurunkan film pelindung. **Centella Asiatica** dan **Panthenol** membantu menenangkan kulit; hindari **Alcohol Denat** dan **Photosensitizing Essential Oils**.';
  } else if (has(['dingin', 'gunung', 'pegunungan', 'ac', 'tewl', 'kering', 'dehidrasi', 'ketarik', 'barrier', 'sawar'])) {
    body = 'Pada iklim dingin pegunungan atau ruang ber-AC, **TEWL** (transepidermal water loss) meningkat sehingga kulit terasa ketarik. Pilih **rich cream hypoallergenic** dengan **Ceramide NP**, **Squalane**, **Panthenol**, dan **Multi-Peptide** untuk memperbaiki lipid sawar. Hindari **SLS** dan **Alcohol Denat** karena menguras lipid permukaan; oleskan pelembap saat kulit masih lembap.';
  } else if (has(['polusi', 'debu', 'pm2.5', 'kota', 'komuter', 'pori', 'komedo', 'jerawat', 'sebum', 'berminyak'])) {
    body = 'Paparan **polusi PM2.5** bercampur sebum meningkatkan stres oksidatif dan risiko pori tersumbat. Gunakan pembersih lembut dua tahap pada malam hari, lalu **Niacinamide** dan **Salicylic Acid** secara bertahap untuk mengatur sebum dan melonggarkan sumbatan. Cuci wajah setiap 6 jam bila terpapar debu atau keringat, dan hindari **Coconut Oil** komedogenik pada area rawan jerawat.';
  } else if (has(['tidur', 'kortisol', 'lelah', 'kusam', 'jam', 'shift'])) {
    body = 'Kurang tidur dan jadwal bergeser dapat meningkatkan hormon **kortisol** serta memperlambat pemulihan sawar kulit, sehingga kulit tampak kusam. Tidur 7–9 jam dengan jadwal konsisten dibarengi **Niacinamide**, **Multi-Peptide**, dan **Ceramide NP** dalam tekstur **oil-free lotion**. Batasi eksfoliasi agresif sampai pola tidur membaik.';
  }

  const age = `${String(dataGet(context || {}, 'usia') || '')} ${String(dataGet(context || {}, 'fase_usia') || '')}`.toLowerCase();
  if (has(['remaja', '14', '19']) || age.includes('remaja')) {
    body += '\n\nKarena termasuk **Remaja (14–19 tahun)**, fokusnya adalah kontrol sebum ringan dengan **Niacinamide** dan **Salicylic Acid** konsentrasi rendah, serta **tabir surya** harian. Hindari **retinoid dosis tinggi** dan anti-aging keras kecuali atas anjuran dokter kulit.';
  } else if (age.includes('30') || age.includes('44') || age.includes('matang') || age.includes('45')) {
    body += '\n\nUntuk fase **Dewasa (30–44 tahun)** atau **Usia Matang (≥45 tahun)**, tambahkan **Multi-Peptide**, **Bakuchiol/Retinaldehyde**, dan **Ceramide NP** pada rutinitas malam untuk mendukung sintesis kolagen dan memperbaiki lipid sawar.';
  }

  body += '\n\nIni adalah dugaan edukatif berbasis penalaran sistem pakar dan literatur dermatologi lingkungan, bukan diagnosis medis. Jika muncul nyeri hebat, bengkak, nanah, atau keluhan menetap lebih dari 4 minggu, periksakan diri ke dokter kulit.';

  return `${greeting}${body}\n\n${citationBlock()}`;
};

const systemPrompt = (context) => {
  const lines = [
    'Anda adalah "Tanya Pakar AI", asisten konsultasi berbasis jurnal pada aplikasi DermLogic.',
    'Jawab dalam bahasa Indonesia yang natural, ringkas, maksimal 5 poin atau 4 paragraf.',
    'Jadikan KONTEKS PENGGUNA sebagai acuan utama bila tersedia. Jika tidak ada, jawab pertanyaan umum seputar skincare dengan pengetahuan dermatologi lingkungan.',
    'Sesuaikan penjelasan dengan fisiologi rentang usia: remaja 14–19 (sebum aktif, hindari retinoid anti-aging keras, utamakan Niacinamide, Salicylic Acid lembut, dan tabir surya); dewasa 20–29 (regenerasi optimal, fokus proteksi preventif); dewasa 30–44 dan matang ≥45 (dukung kolagen dan lipid dengan Peptide, Bakuchiol/Retinaldehyde, dan Ceramide pada rutinitas malam).',
    '',
    'ATURAN MUTLAK:',
    '- DILARANG KERAS menyebut nama merek atau brand komersial skincare maupun makeup apa pun, termasuk contoh produk. Hanya sebutkan nama senyawa aktif, bahan formulasi, dan jenis tekstur (misalnya water-based gel, oil-free lotion, rich cream hypoallergenic).',
    '- WAJIB menyertakan sitasi jurnal para pakar yang relevan di setiap penjelasan klinis. Gunakan daftar sitasi yang diberikan di bawah.',
    '- WAJIB membahas konsep dermatologi lingkungan yang relevan: TEWL pada suhu dingin pegunungan, stres osmotik air asin dan UV pesisir, polusi PM2.5, serta pengaruh kurang tidur terhadap hormon kortisol.',
    '- Tulis nama senyawa aktif dan nama jurnal dengan tebal markdown, contoh **Ceramide NP** dan **Jurnal Informatika Kaputama (JIK)**.',
    '- Jangan mendiagnosis penyakit. Sebut sebagai dugaan edukatif, bukan diagnosis medis.',
    '- Jangan menjamin cocok atau sembuh. Gunakan kata "umumnya", "dapat", dan "tergantung kondisi kulit".',
    '- Jangan mengarang jurnal, angka, atau klaim medis baru.',
    '- Untuk bahan berisiko seperti retinoid dan asam kuat, sertakan pertimbangan keamanan: mulai perlahan, perhatikan iritasi, hindari bila hamil atau menyusui bila relevan.',
    '- Bila ada tanda bahaya seperti nyeri hebat, bengkak, nanah, atau luka tidak sembuh, anjurkan pemeriksaan dokter kulit.',
    '',
    'SITASI WAJIB YANG HARUS MUNCUL DALAM JAWABAN:',
    ...CITATIONS.map((item) => `- ${item}`),
  ];

  const details = contextLines(context);
  if (details.length) {
    lines.push('', 'KONTEKS PENGGUNA (11 langkah konsultasi + hasil inferensi):');
    details.forEach((line) => lines.push(`- ${line}`));
  }

  return lines.join('\n');
};

const contentsFrom = (question, history) => {
  const safeHistory = Array.isArray(history) ? history.slice(-10) : [];
  const contents = safeHistory
    .filter((item) => item && typeof item.content === 'string' && item.content.trim())
    .map((item) => ({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: item.content.trim().slice(0, 4000) }],
    }));

  contents.push({
    role: 'user',
    parts: [{ text: `Pertanyaan pengguna: ${String(question || '').slice(0, 4000)}` }],
  });

  return contents;
};

const fallbackResponse = (notice, question, context) => ({
  answer: localAnswer(question, context),
  source: 'local-fallback',
  notice,
  citations: CITATIONS,
  model: null,
});

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Metode tidak diizinkan.' });
  }

  const { question, context, history } = req.body || {};
  const cleanQuestion = String(question || '').trim().slice(0, 4000);

  if (!cleanQuestion) {
    return fallbackResponse('Pertanyaan kosong, jawaban jurnal lokal digunakan.', cleanQuestion, context);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(200).json(fallbackResponse(
      'GEMINI_API_KEY belum dikonfigurasi di Vercel. Tambahkan Environment Variable lalu deploy ulang.',
      cleanQuestion,
      context,
    ));
  }

  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt(context) }] },
        contents: contentsFrom(cleanQuestion, history),
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
      signal: AbortSignal.timeout(25000),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.error?.message || `Gemini HTTP ${response.status}`);
    }

    if (data?.promptFeedback?.blockReason) {
      throw new Error(`Gemini memblokir prompt (${data.promptFeedback.blockReason}).`);
    }

    const answer = (data?.candidates || [])
      .flatMap((candidate) => candidate?.content?.parts || [])
      .map((part) => part?.text || '')
      .join('')
      .trim();

    if (!answer) {
      throw new Error('Gemini tidak menghasilkan teks jawaban.');
    }

    if (containsBrand(answer)) {
      return res.status(200).json(fallbackResponse(
        'Jawaban model mengandung nama komersial, sehingga diganti dengan jawaban jurnal lokal tanpa merek.',
        cleanQuestion,
        context,
      ));
    }

    return res.status(200).json({
      answer: withCitations(answer),
      source: 'gemini',
      notice: null,
      citations: CITATIONS,
      model,
    });
  } catch (error) {
    return res.status(200).json(fallbackResponse(
      `Gemini belum dapat dihubungi (${String(error?.message || 'kesalahan tidak diketahui').slice(0, 180)}). Fallback jurnal lokal digunakan.`,
      cleanQuestion,
      context,
    ));
  }
}
