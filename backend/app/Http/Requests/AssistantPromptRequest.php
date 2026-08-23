<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssistantPromptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'prompt' => ['required', 'string', 'min:1', 'max:4000'],
            'conversation_id' => ['nullable', 'uuid'],
        ];
    }
}
