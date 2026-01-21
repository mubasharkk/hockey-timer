<?php

namespace App\Models;

use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use App\Models\Game;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Team extends Model implements HasMedia
{
    use CrudTrait;
    use HasFactory;
    use InteractsWithMedia;

    public const TYPE_MENS = 'mens';
    public const TYPE_WOMENS = 'womens';
    public const TYPE_SENIORS = 'seniors';
    public const TYPE_VETERANS = 'veterans';
    public const TYPE_OTHERS = 'others';

    public const TYPES = [
        self::TYPE_MENS => "Men's",
        self::TYPE_WOMENS => "Women's",
        self::TYPE_SENIORS => 'Seniors',
        self::TYPE_VETERANS => 'Veterans',
        self::TYPE_OTHERS => 'Others',
    ];

    protected $fillable = [
        'user_id',
        'club_id',
        'game_id',
        'registered_team_id',
        'is_registered',
        'name',
        'type',
        'side',
        'score',
        'coach',
        'manager',
        'email',
        'phone',
        'description',
    ];

    protected $appends = [
        'logo_url',
    ];

    public function club(): BelongsTo
    {
        return $this->belongsTo(Club::class);
    }

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class, 'game_id');
    }

    public function players(): HasMany
    {
        return $this->hasMany(Player::class);
    }

    public function pools(): BelongsToMany
    {
        return $this->belongsToMany(TournamentPool::class, 'tournament_pool_team')->withTimestamps();
    }

    public function contactPersons(): MorphMany
    {
        return $this->morphMany(ContactPerson::class, 'contactable');
    }

    public function getTypeLabelAttribute(): ?string
    {
        return self::TYPES[$this->type] ?? null;
    }

    public function registerMediaCollections(): void
    {
        $this
            ->addMediaCollection('logo')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/gif'])
            ->singleFile();
    }

    protected function logoUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->getFirstMediaUrl('logo') ?: null,
        );
    }
}
