<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

class ImageService
{
    /**
     * Fix image orientation based on EXIF data and return path to corrected file.
     *
     * @param UploadedFile $file The uploaded image file
     * @return UploadedFile The corrected image file
     */
    public function fixOrientation(UploadedFile $file): UploadedFile
    {
        try {
            // Read the image
            $image = Image::read($file->getRealPath());

            // Auto-orient based on EXIF data
            $image->orient();

            // Generate a temporary path for the corrected image
            $tempPath = sys_get_temp_dir() . '/' . uniqid('img_') . '.' . $file->getClientOriginalExtension();

            // Save the corrected image
            $image->save($tempPath, quality: 90);

            // Create a new UploadedFile from the corrected image
            return new UploadedFile(
                $tempPath,
                $file->getClientOriginalName(),
                $file->getMimeType(),
                null,
                true // Mark as test to allow moving the file
            );
        } catch (\Exception $e) {
            Log::warning('Failed to fix image orientation', [
                'file' => $file->getClientOriginalName(),
                'error' => $e->getMessage(),
            ]);

            // Return original file if orientation fix fails
            return $file;
        }
    }

    /**
     * Fix orientation for multiple files.
     *
     * @param array<UploadedFile> $files
     * @return array<UploadedFile>
     */
    public function fixOrientationMultiple(array $files): array
    {
        return array_map(fn($file) => $this->fixOrientation($file), $files);
    }

    /**
     * Resize image while maintaining aspect ratio.
     *
     * @param UploadedFile $file
     * @param int $maxWidth
     * @param int $maxHeight
     * @return UploadedFile
     */
    public function resize(UploadedFile $file, int $maxWidth = 1920, int $maxHeight = 1080): UploadedFile
    {
        try {
            $image = Image::read($file->getRealPath());

            // Scale down if larger than max dimensions
            $image->scaleDown($maxWidth, $maxHeight);

            $tempPath = sys_get_temp_dir() . '/' . uniqid('img_') . '.' . $file->getClientOriginalExtension();
            $image->save($tempPath, quality: 90);

            return new UploadedFile(
                $tempPath,
                $file->getClientOriginalName(),
                $file->getMimeType(),
                null,
                true
            );
        } catch (\Exception $e) {
            Log::warning('Failed to resize image', [
                'file' => $file->getClientOriginalName(),
                'error' => $e->getMessage(),
            ]);

            return $file;
        }
    }

    /**
     * Process image: fix orientation and optionally resize.
     *
     * @param UploadedFile $file
     * @param int|null $maxWidth
     * @param int|null $maxHeight
     * @return UploadedFile
     */
    public function process(UploadedFile $file, ?int $maxWidth = null, ?int $maxHeight = null): UploadedFile
    {
        // First fix orientation
        $processed = $this->fixOrientation($file);

        // Then resize if dimensions specified
        if ($maxWidth && $maxHeight) {
            $processed = $this->resize($processed, $maxWidth, $maxHeight);
        }

        return $processed;
    }

    /**
     * Process multiple images.
     *
     * @param array<UploadedFile> $files
     * @param int|null $maxWidth
     * @param int|null $maxHeight
     * @return array<UploadedFile>
     */
    public function processMultiple(array $files, ?int $maxWidth = null, ?int $maxHeight = null): array
    {
        return array_map(fn($file) => $this->process($file, $maxWidth, $maxHeight), $files);
    }
}
