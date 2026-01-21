<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Drop the old team_contact_persons table
        Schema::dropIfExists('team_contact_persons');

        // Create new polymorphic contact_persons table
        Schema::create('contact_persons', function (Blueprint $table) {
            $table->id();
            $table->morphs('contactable'); // contactable_id, contactable_type
            $table->string('name');
            $table->string('role')->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('email')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_persons');

        // Recreate the old table structure
        Schema::create('team_contact_persons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('role')->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('email')->nullable();
            $table->timestamps();
        });
    }
};
