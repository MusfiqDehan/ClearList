<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:100'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'timezone' => ['sometimes', 'nullable', 'timezone'],
            'bio' => ['sometimes', 'nullable', 'string', 'max:500'],
            'avatar_url' => ['sometimes', 'nullable', 'url:http,https', 'max:2048'],
        ];
    }
}
