<?php

return [
    'url' => rtrim(env('OLLAMA_URL', 'http://localhost:11434'), '/'),
    'model' => env('OLLAMA_MODEL', 'qwen2.5:1.5b'),
    'timeout' => (int) env('OLLAMA_TIMEOUT', 120),
    'history_limit' => (int) env('OLLAMA_HISTORY_LIMIT', 10),
    'temperature' => (float) env('OLLAMA_TEMPERATURE', 0.3),
    'num_ctx' => (int) env('OLLAMA_NUM_CTX', 2048),
];
