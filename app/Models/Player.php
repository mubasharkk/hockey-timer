<?php

namespace App\Models;

use App\Models\Traits\HasBloodGroup;
use App\Models\Traits\HasGender;
use App\Models\Traits\HasPlayerType;
use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Lecturize\Addresses\Traits\HasAddresses;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Player extends Model implements HasMedia
{
    use CrudTrait;
    use HasFactory;
    use HasAddresses;
    use InteractsWithMedia;
    use HasGender;
    use HasBloodGroup;
    use HasPlayerType;

    protected $fillable = [
        'user_id',
        'name',
        'player_pass_number',
        'nic_number',
        'date_of_birth',
        'gender',
        'phone',
        'blood_group',
        'player_type',
        'description',
        'is_active',
        'total_games',
        'total_goals',
        'total_green_cards',
        'total_yellow_cards',
        'total_red_cards',
        'total_penalty_corners',
        'total_penalty_strokes',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'is_active' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class)
            ->withPivot(['shirt_number', 'is_active'])
            ->withTimestamps();
    }

    public function contactPersons(): MorphMany
    {
        return $this->morphMany(ContactPerson::class, 'contactable');
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    /**
     * Search players by NIC or pass number.
     */
    public static function search(string $query)
    {
        return static::where('nic_number', 'like', "%{$query}%")
            ->orWhere('player_pass_number', 'like', "%{$query}%")
            ->orWhere('name', 'like', "%{$query}%");
    }
}
