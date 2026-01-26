<?php

namespace App\Models;

use App\Models\Traits\HasBloodGroup;
use App\Models\Traits\HasGender;
use App\Models\Traits\HasPlayerType;
use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
        'team_id',
        'name',
        'shirt_number',
        'player_pass_number',
        'nic_number',
        'date_of_birth',
        'gender',
        'phone',
        'blood_group',
        'player_type',
        'description',
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

    public function contactPersons(): MorphMany
    {
        return $this->morphMany(ContactPerson::class, 'contactable');
    }
}
