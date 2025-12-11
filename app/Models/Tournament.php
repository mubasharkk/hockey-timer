<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class Tournament extends Model
{
    use HasFactory;

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

    public function games(): HasMany
    {
        return $this->hasMany(Game::class);
    }

    public function pools(): HasMany
    {
        return $this->hasMany(TournamentPool::class);
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
