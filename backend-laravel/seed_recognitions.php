<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Modules\EmployeeSelfService\Models\SocialRecognition;
use App\Models\SystemSetting;
use App\Models\Employee;

if (SocialRecognition::count() === 0) {
    $existing = SystemSetting::getValue('ess_social_recognitions', []);

    if (! empty($existing) && is_array($existing)) {
        foreach ($existing as $item) {
            SocialRecognition::create([
                'sender_name' => $item['sender'] ?? 'Oxford Suites Staff',
                'recipient_name' => $item['recipient'] ?? 'Oxford Suites Staff',
                'sender_role' => $item['senderRole'] ?? 'Hotel Staff',
                'recipient_role' => $item['recipientRole'] ?? 'Hotel Staff',
                'core_value' => $item['badge'] ?? 'Guest Delight',
                'message' => $item['message'] ?? 'Great job demonstrating hotel service standards!',
                'clap_count' => (int) ($item['reactions']['clap'] ?? 1),
                'heart_count' => (int) ($item['reactions']['heart'] ?? 0),
                'star_count' => (int) ($item['reactions']['star'] ?? 0),
                'fire_count' => (int) ($item['reactions']['fire'] ?? 0),
            ]);
        }
        echo "Seeded " . count($existing) . " records from system_settings.\n";
    } else {
        $defaults = [
            [
                'sender_name' => 'Chef Antonio',
                'recipient_name' => 'Aldrex M. Cordon',
                'sender_role' => 'Kitchen Staff · Culinary',
                'recipient_role' => 'Front Desk Receptionist',
                'core_value' => 'Teamwork & Malasakit',
                'message' => 'Maintained peak efficiency and spotless kitchen line standards during the Saturday banquet rush.',
                'clap_count' => 15,
                'heart_count' => 8,
                'star_count' => 6,
                'fire_count' => 4,
            ],
            [
                'sender_name' => 'Maria Santos',
                'recipient_name' => 'Chef Marco Rossi',
                'sender_role' => 'Front Desk Supervisor',
                'recipient_role' => 'Executive Sous Chef',
                'core_value' => 'Guest Delight',
                'message' => 'Personally crafted an exceptional off-menu gluten-free banquet dish for a VIP wedding party on 15 minutes notice.',
                'clap_count' => 12,
                'heart_count' => 5,
                'star_count' => 3,
                'fire_count' => 1,
            ],
            [
                'sender_name' => 'David Lee',
                'recipient_name' => 'Elena Vasquez',
                'sender_role' => 'Guest Relations Manager',
                'recipient_role' => 'Concierge Executive',
                'core_value' => 'Going the Extra Mile',
                'message' => 'Coordinated emergency medical assistance and translated hospital documentation for an international guest during typhoon season.',
                'clap_count' => 18,
                'heart_count' => 9,
                'star_count' => 7,
                'fire_count' => 5,
            ],
            [
                'sender_name' => 'Ana Ramos',
                'recipient_name' => 'Gabriel Mendoza',
                'sender_role' => 'HR Manager',
                'recipient_role' => 'Security Shift Lead',
                'core_value' => 'Integrity & Trust',
                'message' => 'Demonstrated total honesty and swift action by returning a misplaced diamond watch to the lost-and-found vault.',
                'clap_count' => 10,
                'heart_count' => 4,
                'star_count' => 2,
                'fire_count' => 1,
            ],
        ];

        foreach ($defaults as $d) {
            SocialRecognition::create($d);
        }
        echo "Seeded default Oxford Suites recognition posts.\n";
    }
} else {
    echo "Social recognitions already populated (" . SocialRecognition::count() . " rows).\n";
}
