<?php

namespace App\Services;

use App\Exceptions\OllamaException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class OllamaService
{
    public function __construct(private JournalAiService $journal)
    {
    }

    public function chat(string $question, array $context = [], array $history = []): string
    {
        $messages = [
            ['role' => 'system', 'content' => $this->systemPrompt($context)],
        ];

        foreach ($this->history($history) as $message) {
            $messages[] = $message;
        }

        $messages[] = ['role' => 'user', 'content' => $question];

        try {
            $response = Http::timeout(max(1, (int) config('ollama.timeout')))
                ->acceptJson()
                ->post(rtrim((string) config('ollama.url'), '/').'/api/chat', [
                    'model' => (string) config('ollama.model'),
                    'messages' => $messages,
                    'stream' => false,
                    'options' => [
                        'temperature' => (float) config('ollama.temperature'),
                        'num_ctx' => (int) config('ollama.num_ctx'),
                    ],
                ]);
        } catch (ConnectionException $exception) {
            throw $this->connectionMessage($exception);
        }

        if ($response->failed()) {
            throw $this->responseError($response);
        }

        $answer = trim((string) data_get($response->json() ?? [], 'message.content', ''));

        if ($answer === '') {
            throw new OllamaException('Ollama belum menghasilkan jawaban. Coba ajukan pertanyaan lain.', 502);
        }

        return $answer;
    }

    private function history(array $history): array
    {
        $limit = max(2, min(30, (int) config('ollama.history_limit', 10)));

        return collect($history)
            ->filter(fn ($item) => is_array($item))
            ->map(fn ($item) => [
                'role' => (string) ($item['role'] ?? ''),
                'content' => trim((string) ($item['content'] ?? '')),
            ])
            ->filter(fn ($item) => in_array($item['role'], ['user', 'assistant'], true) && $item['content'] !== '')
            ->slice(-$limit)
            ->map(fn ($item) => [
                'role' => $item['role'],
                'content' => mb_substr($item['content'], 0, 4000),
            ])
            ->values()
            ->all();
    }

    private function systemPrompt(array $context): string
    {
        return $this->journal->systemPrompt($context);
    }

    private function connectionMessage(ConnectionException $exception): OllamaException
    {
        $message = strtolower($exception->getMessage());

        if (str_contains($message, 'timed out') || str_contains($message, 'timeout') || str_contains($message, 'error 28')) {
            return new OllamaException(
                'Ollama terlalu lama merespons. Coba lagi sebentar, atau naikkan OLLAMA_TIMEOUT di file .env.',
                504
            );
        }

        return new OllamaException(
            'Ollama belum berjalan. Jalankan aplikasi Ollama terlebih dahulu, lalu coba lagi.',
            503
        );
    }

    private function responseError($response): OllamaException
    {
        $status = $response->status();
        $error = trim((string) ($response->json('error') ?? $response->body()));
        $error = preg_replace('/\s+/', ' ', $error) ?: '';
        $model = (string) config('ollama.model');

        if ($status === 404 && str_contains(strtolower($error), 'model')) {
            return new OllamaException(
                'Model '.$model.' belum tersedia. Jalankan perintah: ollama pull '.$model,
                503
            );
        }

        if (str_contains(strtolower($error), 'cuda') || str_contains(strtolower($error), 'llama-server process has terminated')) {
            return new OllamaException(
                'Akselerasi GPU Ollama bermasalah (driver CUDA tidak sesuai). Jalankan ulang Ollama dengan mode CPU: set OLLAMA_LLM_LIBRARY=cpu lalu restart Ollama, atau perbarui driver NVIDIA.',
                503
            );
        }

        $detail = $error !== '' ? ' Rincian: '.mb_substr($error, 0, 200) : '';

        return new OllamaException(
            'Ollama belum dapat menjawab (HTTP '.$status.').'.$detail,
            $status >= 400 && $status < 500 ? $status : 502
        );
    }
}
