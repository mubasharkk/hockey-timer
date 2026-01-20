<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeamContactPerson extends Model
{
    use HasFactory;

    protected $table = 'team_contact_persons';

    protected $fillable = [
        'team_id',
        'name',
        'role',
        'phone',
        'email',
    ];

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }
}
