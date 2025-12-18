<?php

namespace App\Models;

use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class TournamentPool extends Model
{
    use CrudTrait;
    use HasFactory;

    protected $fillable = [
        'tournament_id',
        'name',
        'order',
    ];

    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class);
    }

    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class, 'tournament_pool_team')->withTimestamps();
    }
}
