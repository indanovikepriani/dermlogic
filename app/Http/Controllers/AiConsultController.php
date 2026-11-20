<?php

namespace App\Http\Controllers;

use App\Exceptions\OllamaException;
use App\Services\JournalAiService;
use App\Services\OllamaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AiConsultController extends Controller
{
    public function ask(Request $request, OllamaService $ollama, JournalAiService $journal): JsonResponse
    {
        $validated = $request->validate([
            'question' => 'required|string|max:2000',
            'context' => 'sometimes|array',
            'history' => 'sometimes|array',
            'history.*.role' => 'required|in:user,assistant',
            'history.*.content' => 'required|string|max:4000',
        ]);

        $question = trim($validated['question']);
        $context = $validated['context'] ?? [];

        try {
            $rawAnswer = $ollama->chat(
                $question,
                $context,
                $validated['history'] ?? []
            );

            $result = $journal->prepare($rawAnswer, $question, $context);
        } catch (OllamaException $exception) {
            Log::warning('Ollama chat gagal, fallback jurnal lokal dipakai', [
                'status' => $exception->status,
                'error' => $exception->getMessage(),
            ]);

            $result = [
                'answer' => $journal->localAnswer($question, $context),
                'source' => 'local-fallback',
                'notice' => 'Koneksi ke model AI sedang tidak tersedia. Jawaban di bawah disusun otomatis dari pustaka jurnal DermLogic.',
            ];
        }

        return response()->json([
            'answer' => $result['answer'],
            'source' => $result['source'],
            'notice' => $result['notice'],
            'citations' => $journal->citations(),
            'model' => config('ollama.model'),
        ]);
    }
}
