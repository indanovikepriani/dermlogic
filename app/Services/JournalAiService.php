<?php

namespace App\Services;

class JournalAiService
{
    private const CITATIONS = [
        'Rafi, R. A., Purnamasari, I., & Maulana, I. (2026), Jurnal Ilmiah Wahana Pendidikan',
        'Sulindawaty, et al. (2022), JIKOMSI',
        'Sasmita, G. (2020), Jurnal Informatika Kaputama (JIK)',
        'Putri, A. D., & Rahman, F. (2021), Jurnal Teknologi Informasi dan Sistem Cerdas',
    ];

    private const CONTEXT_FIELDS = [
        'Nama' => ['nama'],
        'Rentang usia' => ['usia'],
        'Fase fisiologis usia' => ['fase_usia'],
        'Gender' => ['gender'],
        'Lingkungan' => ['detail.lingkungan', 'lingkungan', 'env'],
        'Jenis kulit' => ['jenis_kulit', 'profil.kulit'],
        'Kondisi kulit' => ['kondisi_kulit', 'profil.keluhan'],
        'Kondisi barrier' => ['kondisi_barrier'],
        'Faktor penyebab' => ['faktor_penyebab'],
        'Pola jam tidur' => ['detail.tidur', 'tidur'],
        'Aktivitas harian' => ['detail.aktivitas', 'aktivitas'],
        'Preferensi makeup' => ['detail.makeup', 'makeup'],
        'Dugaan kondisi utama' => ['dugaan_utama', 'hasil_diagnosis'],
        'Kandungan skincare yang direkomendasikan' => ['dianjurkan'],
        'Kandungan yang perlu dihindari' => ['dihindari'],
        'Pertanyaan pengguna' => ['pertanyaan'],
        'Tanda bahaya' => ['tanda_bahaya'],
    ];

    private const BANNED_BRANDS = [
        'skintific', 'somethinc', 'wardah', 'emina', 'nivea', 'garnier', 'olay',
        'cerave', 'cetaphil', 'la roche', 'bioderma', 'avene', 'neutrogena',
        'the ordinary', 'lancome', 'estee lauder', 'maybelline', 'loreal',
        "l'oreal", 'revlon', 'innisfree', 'etude house', 'laneige', 'erborian',
        'eyenlip', 'ozelle', 'la tulipe', 'make over', 'mirror', 'viva',
    ];

    public function systemPrompt(array $context): string
    {
        $lines = [
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
        ];

        foreach (self::CITATIONS as $citation) {
            $lines[] = '- '.$citation;
        }

        $contextLines = $this->contextLines($context);

        if ($contextLines !== []) {
            $lines[] = '';
            $lines[] = 'KONTEKS PENGGUNA (11 langkah konsultasi + hasil inferensi):';

            foreach ($contextLines as $line) {
                $lines[] = '- '.$line;
            }
        }

        return implode("\n", $lines);
    }

    public function prepare(string $answer, string $question, array $context): array
    {
        if ($this->containsBrand($answer)) {
            return [
                'answer' => $this->localAnswer($question, $context),
                'source' => 'local-fallback',
                'notice' => 'Jawaban model mengandung nama komersial, sehingga diganti dengan jawaban jurnal lokal tanpa merek.',
            ];
        }

        return [
            'answer' => $this->withCitations($answer),
            'source' => 'ai',
            'notice' => null,
        ];
    }

    public function localAnswer(string $question, array $context): string
    {
        $haystack = mb_strtolower($question.' '.implode(' ', $this->flatten($context)));
        $name = trim((string) data_get($context, 'nama', ''));
        $greeting = $name !== '' ? 'Halo '.$name.', ' : '';

        $paragraphs = [];

        if ($this->matches($haystack, ['garam', 'laut', 'pesisir', 'asin', 'salt', 'uv', 'matahari', 'tabir surya', 'sunscreen', 'spf', 'rewind', 'panas'])) {
            $paragraphs[] = 'Untuk kulit terpapar **UV pesisir** dan **stres osmotik air asin**, bilas wajah dengan air tawar segera setelah terkena cipratan laut, lalu gunakan **Zinc Oxide SPF 50+ PA++++** dalam tekstur **water-based gel / oil-free**. Ulangi setiap 2 jam karena garam dan keringat menurunkan film pelindung. **Centella Asiatica** dan **Panthenol** membantu menenangkan kulit; hindari **Alcohol Denat** dan **Photosensitizing Essential Oils** karena memperberat iritasi dan risiko fototoksik.';
        } elseif ($this->matches($haystack, ['dingin', 'gunung', 'pegunungan', 'ac', 'tewl', 'kering', 'dehidrasi', 'ketarik', 'barrier', 'sawar'])) {
            $paragraphs[] = 'Pada iklim dingin pegunungan atau ruang ber-AC, **TEWL** (transepidermal water loss) meningkat sehingga kulit terasa ketarik. Pilih **rich cream hypoallergenic** dengan **Ceramide NP**, **Squalane**, **Panthenol**, dan **Multi-Peptide** untuk memperbaiki lipid sawar. Hindari **SLS** dan **Alcohol Denat** karena menguras lipid permukaan; oleskan pelembap saat kulit masih lembap.';
        } elseif ($this->matches($haystack, ['polusi', 'debu', 'pm2.5', 'kota', 'komuter', 'pori', 'komedo', 'jerawat', 'sebum', 'berminyak'])) {
            $paragraphs[] = 'Paparan **polusi PM2.5** bercampur sebum meningkatkan stres oksidatif dan risiko pori tersumbat. Gunakan pembersih lembut dua tahap pada malam hari, lalu **Niacinamide** dan **Salicylic Acid** secara bertahap untuk mengatur sebum dan melonggarkan sumbatan. Cuci wajah setiap 6 jam bila terpapar debu atau keringat, dan hindari **Coconut Oil** komedogenik pada area rawan jerawat.';
        } elseif ($this->matches($haystack, ['tidur', 'kortisol', 'lelah', 'kusam', 'jam', 'shift'])) {
            $paragraphs[] = 'Kurang tidur dan jadwal bergeser dapat meningkatkan hormon **kortisol** serta memperlambat pemulihan sawar kulit, sehingga kulit tampak kusam. Tidur 7–9 jam dengan jadwal konsisten dibarengi **Niacinamide**, **Multi-Peptide**, dan **Ceramide NP** dalam tekstur **oil-free lotion**. Batasi eksfoliasi agresif sampai pola tidur membaik.';
        } else {
            $paragraphs[] = 'Untuk perawatan harian, sesuaikan tekstur dengan kondisi kulit: **water-based gel / oil-free** untuk kulit berminyak atau lembap, dan **rich cream hypoallergenic** untuk kulit kering atau dingin. **Ceramide NP**, **Squalane**, **Panthenol**, dan **Niacinamide** umumnya membantu menjaga hidrasi dan sawar kulit. Hindari **Alcohol Denat**, **SLS**, **Fragrance**, **Coconut Oil** komedogenik, dan **Photosensitizing Essential Oils** bila kulit mudah iritasi.';
        }

        $age = mb_strtolower((string) data_get($context, 'usia', '').' '.(string) data_get($context, 'fase_usia', ''));

        if ($this->matches($age, ['remaja', '14', '19'])) {
            $paragraphs[] = 'Karena termasuk **Remaja (14–19 tahun)**, fokusnya adalah kontrol sebum ringan dengan **Niacinamide** dan **Salicylic Acid** konsentrasi rendah, serta **tabir surya** harian. Hindari **retinoid dosis tinggi** dan anti-aging keras kecuali atas anjuran dokter kulit.';
        } elseif ($this->matches($age, ['dewasa', '30', '44', 'matang', '45'])) {
            $paragraphs[] = 'Untuk fase **Dewasa (30–44 tahun)** atau **Usia Matang (≥45 tahun)**, tambahkan **Multi-Peptide**, **Bakuchiol/Retinaldehyde**, dan **Ceramide NP** pada rutinitas malam untuk mendukung sintesis kolagen dan memperbaiki lipid sawar.';
        }

        $paragraphs[] = 'Ini adalah dugaan edukatif berbasis penalaran sistem pakar dan literatur dermatologi lingkungan, bukan diagnosis medis. Jika muncul nyeri hebat, bengkak, nanah, atau keluhan menetap lebih dari 4 minggu, periksakan diri ke dokter kulit.';

        return $greeting.implode("\n\n", $paragraphs)."\n\n".$this->citationBlock();
    }

    public function withCitations(string $answer): string
    {
        $answer = rtrim($answer);

        foreach (self::CITATIONS as $citation) {
            $author = explode(' (', $citation)[0];

            if (! str_contains($answer, $author)) {
                return $answer."\n\n".$this->citationBlock();
            }
        }

        return $answer;
    }

    public function citationBlock(): string
    {
        $lines = ['**Sitasi jurnal pakar:**'];

        foreach (self::CITATIONS as $citation) {
            $lines[] = '- '.$this->boldJournals($citation);
        }

        return implode("\n", $lines);
    }

    private function boldJournals(string $citation): string
    {
        foreach ([
            'Jurnal Ilmiah Wahana Pendidikan',
            'JIKOMSI',
            'Jurnal Informatika Kaputama (JIK)',
            'Jurnal Teknologi Informasi dan Sistem Cerdas',
        ] as $journal) {
            $citation = str_replace($journal, '**'.$journal.'**', $citation);
        }

        return $citation;
    }

    public function citations(): array
    {
        return self::CITATIONS;
    }

    private function matches(string $haystack, array $keywords): bool
    {
        foreach ($keywords as $keyword) {
            if (mb_strlen($keyword) <= 2) {
                if (preg_match('/\b'.preg_quote($keyword, '/').'\b/u', $haystack)) {
                    return true;
                }
            } elseif (str_contains($haystack, $keyword)) {
                return true;
            }
        }

        return false;
    }

    private function containsBrand(string $answer): bool
    {
        $lower = mb_strtolower($answer);

        foreach (self::BANNED_BRANDS as $brand) {
            if (str_contains($lower, mb_strtolower($brand))) {
                return true;
            }
        }

        return false;
    }

    private function contextLines(array $context): array
    {
        $lines = [];

        foreach (self::CONTEXT_FIELDS as $label => $keys) {
            foreach ($keys as $key) {
                $value = $this->formatValue(data_get($context, $key));

                if ($value === '') {
                    continue;
                }

                $lines[] = $label.': '.$value;

                break;
            }
        }

        return $lines;
    }

    private function formatValue(mixed $value): string
    {
        if (is_array($value)) {
            $value = implode(', ', array_filter(array_map('strval', $value), fn ($item) => trim($item) !== ''));
        }

        $value = trim((string) $value);

        return $value === '' || $value === '-' ? '' : mb_substr($value, 0, 500);
    }

    private function flatten(array $context): array
    {
        $values = [];

        array_walk_recursive($context, function ($value) use (&$values) {
            if (is_scalar($value)) {
                $values[] = (string) $value;
            }
        });

        return $values;
    }
}
