<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ScanPlayerIdRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_documents' => [
                'required',
                'array',
                'min:1',
                'max:2',
            ],
            'id_documents.*' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,gif,webp',
                'max:10240', // 10MB max per file
            ],
            'additional_info' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'id_documents.required' => 'Please upload at least one ID document.',
            'id_documents.min' => 'Please upload at least one ID document.',
            'id_documents.max' => 'You can upload a maximum of 2 ID documents.',
            'id_documents.*.image' => 'Each file must be an image.',
            'id_documents.*.mimes' => 'Each image must be a JPG, PNG, GIF, or WebP file.',
            'id_documents.*.max' => 'Each image must not exceed 10MB.',
        ];
    }
}
