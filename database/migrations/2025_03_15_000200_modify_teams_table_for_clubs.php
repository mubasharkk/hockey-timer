<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->foreignId('club_id')->nullable()->after('user_id')->constrained()->nullOnDelete();
            $table->string('type', 20)->nullable()->after('name')->comment('mens, womens, seniors, veterans, others');
            $table->dropColumn('website');
        });
    }

    public function down(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->dropForeign(['club_id']);
            $table->dropColumn('club_id');
            $table->dropColumn('type');
            $table->string('website')->nullable()->after('phone');
        });
    }
};
