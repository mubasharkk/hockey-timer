<?php

namespace App\Models;

use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Lecturize\Addresses\Traits\HasAddresses;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Player extends Model implements HasMedia
{
    use CrudTrait;
    use HasFactory;
    use HasAddresses;
    use InteractsWithMedia;

    protected $fillable = [
        'team_id',
        'registered_player_id',
        'name',
        'shirt_number',
        'player_pass_number',
        'nic_number',
        'date_of_birth',
        'is_active',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'is_active' => 'boolean',
    ];

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function registeredPlayer(): BelongsTo
    {
        return $this->belongsTo(self::class, 'registered_player_id');
    }
}
