<?php

namespace App\Models;

use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Str;

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
        'uid',
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

    protected static function booted(): void
    {
        static::creating(function (Team $team) {
            if (empty($team->uid)) {
                $team->uid = static::generateUniqueUid();
            }
        });
    }

    public static function generateUniqueUid(): string
    {
        do {
            $uid = strtoupper(Str::random(8));
            $uid = preg_replace('/[^A-Z0-9]/', substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', random_int(0, 35), 1), $uid);
        } while (static::where('uid', $uid)->exists());

        return $uid;
    }

    protected $appends = [
        'logo_url',
    ];

    public function club(): BelongsTo
    {
        return $this->belongsTo(Club::class);
    }

    public function players(): BelongsToMany
    {
        return $this->belongsToMany(Player::class)
            ->withPivot(['shirt_number', 'is_active'])
            ->withTimestamps();
    }

    public function pools(): BelongsToMany
    {
        return $this->belongsToMany(TournamentPool::class, 'tournament_pool_team')->withTimestamps();
    }

    public function contactPersons(): MorphMany
    {
        return $this->morphMany(ContactPerson::class, 'contactable');
    }

    // Query Scopes
    public function scopeByUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByClub($query, int $clubId)
    {
        return $query->where('club_id', $clubId);
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
