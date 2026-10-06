<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Interview / assessment facilities.
     *
     * Mock reference data matches the facility board used in the scheduling
     * reference shots: Room 1 / Room 2 / Room 3 for on-site interviews and the
     * "Online Interview" virtual room for video interviews.
     */
    public function up(): void
    {
        Schema::create('facilities', function (Blueprint $table) {
            $table->id('facility_id');
            $table->string('name', 120)->unique();
            $table->string('type', 20);                                  // On-site | Virtual
            $table->string('location', 190)->nullable();
            $table->unsignedInteger('capacity')->default(1);
            $table->string('icon', 60)->nullable();                      // room | online
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('type', 'idx_facilities_type');
            $table->index('is_active', 'idx_facilities_is_active');
        });

        DB::statement("ALTER TABLE `facilities` ADD CONSTRAINT `chk_facilities_type` CHECK (`type` IN ('On-site', 'Virtual'))");

        // Mock data for the facility request feature.
        DB::table('facilities')->insert([
            [
                'name'        => 'Room 1',
                'type'        => 'On-site',
                'location'    => 'Oxford Suites Makati, HR Office, 3rd Floor',
                'capacity'    => 1,
                'icon'        => 'room',
                'description' => 'Primary on-site interview room with guest-facing setup.',
                'is_active'   => true,
            ],
            [
                'name'        => 'Room 2',
                'type'        => 'On-site',
                'location'    => 'Oxford Suites Makati, HR Office, 3rd Floor',
                'capacity'    => 1,
                'icon'        => 'room',
                'description' => 'Secondary on-site interview room for panel interviews.',
                'is_active'   => true,
            ],
            [
                'name'        => 'Room 3',
                'type'        => 'On-site',
                'location'    => 'Oxford Suites Makati, HR Office, 3rd Floor',
                'capacity'    => 2,
                'icon'        => 'room',
                'description' => 'Practical demonstration room for hands-on assessments.',
                'is_active'   => true,
            ],
            [
                'name'        => 'Online Interview',
                'type'        => 'Virtual',
                'location'    => 'meet.oxfordsuites.ph/interview-room',
                'capacity'    => 5,
                'icon'        => 'online',
                'description' => 'Virtual interview room hosted on the company meeting platform.',
                'is_active'   => true,
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('facilities');
    }
};
