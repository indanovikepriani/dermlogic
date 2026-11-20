<?php

namespace Tests\Feature;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AiConsultTest extends TestCase
{
    public function test_chat_mengirim_pertanyaan_konteks_dan_riwayat_ke_ollama(): void
    {
        Http::fake([
            config('ollama.url').'/api/chat' => Http::response([
                'model' => 'qwen2.5:1.5b',
                'message' => ['role' => 'assistant', 'content' => 'Umumnya kandungan itu aman, tetapi perhatikan toleransi kulit Anda.'],
            ]),
        ]);

        $response = $this->postJson('/ai/tanya', [
            'question' => 'Bolehkah niacinamide dipakai?',
            'context' => [
                'nama' => 'Andi',
                'usia' => 'Remaja (14 – 19 Tahun)',
                'fase_usia' => 'Fase fluktuasi hormon & produksi sebum aktif',
                'jenis_kulit' => 'Kulit kering',
                'kondisi_kulit' => 'Kulit kusam',
                'hasil_diagnosis' => 'Sawar kulit rentan',
                'faktor_penyebab' => 'Kurang tidur',
                'dianjurkan' => ['Ceramide', 'Hyaluronic acid'],
                'dihindari' => 'Parfum',
            ],
            'history' => [
                ['role' => 'user', 'content' => 'Halo'],
                ['role' => 'assistant', 'content' => 'Halo, ada yang bisa saya bantu?'],
            ],
        ])->assertOk()
            ->assertJsonPath('source', 'ai')
            ->assertJsonPath('model', 'qwen2.5:1.5b');

        $this->assertStringContainsString('Umumnya kandungan itu aman', $response->json('answer'));
        $this->assertStringContainsString('Jurnal Ilmiah Wahana Pendidikan', $response->json('answer'));
        $this->assertStringContainsString('JIKOMSI', $response->json('answer'));
        $this->assertStringContainsString('Jurnal Informatika Kaputama (JIK)', $response->json('answer'));
        $this->assertStringContainsString('Jurnal Teknologi Informasi dan Sistem Cerdas', $response->json('answer'));

        Http::assertSent(function ($request) {
            $data = $request->data();
            $messages = $data['messages'] ?? [];

            return str_ends_with($request->url(), '/api/chat')
                && ($data['model'] ?? '') === 'qwen2.5:1.5b'
                && ($data['stream'] ?? true) === false
                && count($messages) === 4
                && ($messages[0]['role'] ?? '') === 'system'
                && str_contains($messages[0]['content'], 'DILARANG KERAS menyebut nama merek')
                && str_contains($messages[0]['content'], 'Rentang usia: Remaja (14 – 19 Tahun)')
                && str_contains($messages[0]['content'], 'Fase fisiologis usia: Fase fluktuasi hormon & produksi sebum aktif')
                && str_contains($messages[0]['content'], 'Jenis kulit: Kulit kering')
                && str_contains($messages[0]['content'], 'Faktor penyebab: Kurang tidur')
                && str_contains($messages[0]['content'], 'Kandungan yang perlu dihindari: Parfum')
                && ($messages[1]['content'] ?? '') === 'Halo'
                && ($messages[2]['content'] ?? '') === 'Halo, ada yang bisa saya bantu?'
                && ($messages[3]['role'] ?? '') === 'user'
                && ($messages[3]['content'] ?? '') === 'Bolehkah niacinamide dipakai?';
        });
    }

    public function test_pertanyaan_umum_tanpa_konteks_tetap_dijawab(): void
    {
        Http::fake([
            config('ollama.url').'/api/chat' => Http::response([
                'message' => ['role' => 'assistant', 'content' => 'Gel biasanya lebih ringan daripada krim.'],
            ]),
        ]);

        $this->postJson('/ai/tanya', [
            'question' => 'Apa beda serum gel dan krim?',
        ])->assertOk()->assertJsonPath('source', 'ai');

        Http::assertSent(function ($request) {
            $messages = $request->data()['messages'] ?? [];

            return count($messages) === 2
                && ! str_contains($messages[0]['content'], 'KONTEKS PENGGUNA (11 langkah konsultasi');
        });
    }

    public function test_fallback_jurnal_lokal_saat_ollama_belum_berjalan(): void
    {
        Http::fake(fn () => throw new ConnectionException('connection refused'));

        $response = $this->postJson('/ai/tanya', [
            'question' => 'Apa beda serum gel dan krim?',
            'context' => ['usia' => 'Remaja (14 – 19 Tahun)'],
        ])->assertOk()
            ->assertJsonPath('source', 'local-fallback');

        $this->assertStringContainsString('Remaja (14–19 tahun)', $response->json('answer'));
        $this->assertStringContainsString('Jurnal Ilmiah Wahana Pendidikan', $response->json('answer'));
        $this->assertStringContainsString('JIKOMSI', $response->json('answer'));
        $this->assertStringContainsString('Jurnal Informatika Kaputama (JIK)', $response->json('answer'));
        $this->assertStringContainsString('Jurnal Teknologi Informasi dan Sistem Cerdas', $response->json('answer'));
    }

    public function test_fallback_jurnal_lokal_saat_ollama_timeout(): void
    {
        Http::fake(fn () => throw new ConnectionException('cURL error 28: Operation timed out'));

        $this->postJson('/ai/tanya', [
            'question' => 'Apa beda serum gel dan krim?',
        ])->assertOk()->assertJsonPath('source', 'local-fallback');
    }

    public function test_fallback_jurnal_lokal_saat_model_belum_tersedia(): void
    {
        Http::fake([
            config('ollama.url').'/api/chat' => Http::response([
                'error' => 'model "qwen2.5:1.5b" not found, try pulling it first',
            ], 404),
        ]);

        $this->postJson('/ai/tanya', [
            'question' => 'Apa beda serum gel dan krim?',
        ])->assertOk()->assertJsonPath('source', 'local-fallback');
    }

    public function test_jawaban_bermerek_diganti_dengan_jawaban_jurnal_lokal(): void
    {
        Http::fake([
            config('ollama.url').'/api/chat' => Http::response([
                'message' => ['role' => 'assistant', 'content' => 'Coba produk Skintific atau Somethinc ya.'],
            ]),
        ]);

        $response = $this->postJson('/ai/tanya', [
            'question' => 'Rekomendasi pelembap untuk kulit kering?',
        ])->assertOk()->assertJsonPath('source', 'local-fallback');

        $this->assertStringNotContainsString('Skintific', $response->json('answer'));
        $this->assertStringNotContainsString('Somethinc', $response->json('answer'));
        $this->assertStringContainsString('Ceramide NP', $response->json('answer'));
        $this->assertStringContainsString('Jurnal Teknologi Informasi dan Sistem Cerdas', $response->json('answer'));
    }

    public function test_riwayat_tidak_valid_ditolak(): void
    {
        Http::fake();

        $this->postJson('/ai/tanya', [
            'question' => 'Halo',
            'history' => [
                ['role' => 'sistem', 'content' => 'pesan sistem'],
            ],
        ])->assertStatus(422);

        Http::assertNothingSent();
    }
}
