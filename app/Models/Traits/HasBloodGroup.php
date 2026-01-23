<?php

namespace App\Models\Traits;

trait HasBloodGroup
{
    public const BLOOD_GROUP_A_POSITIVE = 'A+';
    public const BLOOD_GROUP_A_NEGATIVE = 'A-';
    public const BLOOD_GROUP_B_POSITIVE = 'B+';
    public const BLOOD_GROUP_B_NEGATIVE = 'B-';
    public const BLOOD_GROUP_AB_POSITIVE = 'AB+';
    public const BLOOD_GROUP_AB_NEGATIVE = 'AB-';
    public const BLOOD_GROUP_O_POSITIVE = 'O+';
    public const BLOOD_GROUP_O_NEGATIVE = 'O-';

    public const BLOOD_GROUPS = [
        self::BLOOD_GROUP_A_POSITIVE => 'A+',
        self::BLOOD_GROUP_A_NEGATIVE => 'A-',
        self::BLOOD_GROUP_B_POSITIVE => 'B+',
        self::BLOOD_GROUP_B_NEGATIVE => 'B-',
        self::BLOOD_GROUP_AB_POSITIVE => 'AB+',
        self::BLOOD_GROUP_AB_NEGATIVE => 'AB-',
        self::BLOOD_GROUP_O_POSITIVE => 'O+',
        self::BLOOD_GROUP_O_NEGATIVE => 'O-',
    ];

    public function getBloodGroupLabelAttribute(): ?string
    {
        return self::BLOOD_GROUPS[$this->blood_group] ?? null;
    }
}
