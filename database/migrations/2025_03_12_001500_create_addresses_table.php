<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAddressesTable extends Migration
{
    protected string $table;

    public function __construct()
    {
        $this->table = config('lecturize.addresses.table', 'addresses');
    }

    public function up(): void
    {
        Schema::create($this->table, function (Blueprint $table) {
            $table->increments('id');

            $table->string('street', 60)->nullable();
            $table->string('city', 60)->nullable();
            $table->string('state', 60)->nullable();
            $table->string('post_code', 10)->nullable();

            $table->integer('country_id')->nullable()->unsigned()->index();
            $table->string('note')->nullable();

            $table->float('lat', 10, 6)->nullable();
            $table->float('lng', 10, 6)->nullable();

            $table->nullableMorphs('addressable');

            foreach (config('lecturize.addresses.flags', ['public', 'primary', 'billing', 'shipping']) as $flag) {
                $table->boolean('is_' . $flag)->default(false)->index();
            }

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists($this->table);
    }
}
