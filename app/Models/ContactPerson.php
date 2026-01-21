<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ContactPerson extends Model
{
    use HasFactory;

    protected $table = 'contact_persons';

    protected $fillable = [
        'contactable_id',
        'contactable_type',
        'name',
        'role',
        'phone',
        'email',
    ];

    public function contactable(): MorphTo
    {
        return $this->morphTo();
    }
}
