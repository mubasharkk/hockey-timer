<?php

namespace App\Models;

use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class Tournament extends Model implements HasMedia
{
    use CrudTrait;
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'venue',
        'start_date',
        'end_date',
        'win_points',
        'draw_points',
        'loss_points',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    protected $appends = [
        'logo_url',
    ];

    public function games(): HasMany
    {
        return $this->hasMany(Game::class);
    }

    public function pools(): HasMany
    {
        return $this->hasMany(TournamentPool::class);
    }

    public function registerMediaCollections(): void
    {
        $this
            ->addMediaCollection('logo')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/gif'])
            ->singleFile();

        $this
            ->addMediaCollection('sponsor_logos')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/gif']);
    }

    protected function logoUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->getFirstMediaUrl('logo') ?: null,
        );
    }

    protected function slug(): Attribute
    {
        return Attribute::make(
            set: function ($value, array $attributes) {
                $rawTitle = $attributes['title'] ?? $this->title ?? '';
                $rawStart = $attributes['start_date'] ?? $this->start_date;
                $suffix = $rawStart
                    ? Carbon::parse($rawStart)->format('M-Y')
                    : now()->format('M-Y');
                $base = Str::slug($rawTitle);
                $slug = trim((string) $value) !== '' ? Str::slug($value) : Str::slug("{$base}-{$suffix}");

                return $slug;
            }
        );
    }
}
