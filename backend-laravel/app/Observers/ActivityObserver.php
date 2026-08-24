<?php

namespace App\Observers;

use App\Models\Announcement;
use App\Models\ChatbotFaq;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Hr3Recommendation;
use App\Models\Position;
use App\Models\SalaryGrade;
use App\Models\SystemRole;
use App\Models\SystemUser;
use App\Services\AuditLogger;
use App\Services\Notifier;
use App\Services\NotificationRules;
use Illuminate\Database\Eloquent\Model;

/**
 * Single source of truth for audit logging + notifications.
 *
 * Every mutation on an observed model produces an immutable audit entry, and
 * (where relevant) a targeted notification. This removes the previous
 * per-controller AuditLogger::log() boilerplate and guarantees no mutation is
 * missed. Use ActivityObserver::withoutLogging() to suppress logging around
 * bespoke lifecycle actions that emit their own specific audit entry.
 */
class ActivityObserver
{
    /** When true, the observer becomes a no-op (used by lifecycle actions). */
    public static bool $disabled = false;

    /** Fields that do not represent a meaningful business change. */
    public const SOFT_FIELDS = [
        'updated_at',
        'last_login_at',
        'last_login_ip',
        'remember_token',
        'email_verified_at',
        'last_activity_at',
    ];

    /** Sensitive fields that should never be echoed into audit details. */
    public const HIDDEN_FIELDS = [
        'password',
        'password_hash',
        'remember_token',
    ];

    public static function withoutLogging(callable $callback)
    {
        $previous = self::$disabled;
        self::$disabled = true;

        try {
            return $callback();
        } finally {
            self::$disabled = $previous;
        }
    }

    public function created(Model $model): void
    {
        $this->record('Created', 'created', $model);
    }

    public function updated(Model $model): void
    {
        $dirty = array_keys($model->getDirty());
        $meaningful = array_diff($dirty, self::SOFT_FIELDS);

        if (empty($meaningful)) {
            return;
        }

        $this->record('Updated', 'updated', $model, $meaningful);
    }

    public function deleted(Model $model): void
    {
        $this->record('Deleted', 'deleted', $model);
    }

    protected function record(string $actionLabel, string $event, Model $model, ?array $changed = null): void
    {
        if (self::$disabled) {
            return;
        }

        $meta = $this->meta($model);

        if (! $meta) {
            return;
        }

        $details = null;

        if ($changed) {
            $shown = array_diff($changed, self::HIDDEN_FIELDS);
            $details = 'Changed: ' . implode(', ', $shown);
        }

        AuditLogger::log(
            $meta['label'] . ' ' . strtolower($actionLabel),
            $meta['module'],
            $actionLabel === 'Deleted' ? 'Warning' : 'Info',
            $meta['target_type'],
            (string) $model->getKey(),
            $details ?? $meta['summary'],
        );

        if ($model instanceof Announcement) {
            $this->broadcastAnnouncement($event, $model);
            return;
        }

        NotificationRules::handle($event, $model);
    }

    /**
     * Announcements are broadcast to all users (except the actor) rather than a
     * fixed admin list, since they are company-wide communication.
     */
    protected function broadcastAnnouncement(string $event, Announcement $announcement): void
    {
        $actor = request()->user();
        $except = $actor?->system_user_id ? [$actor->system_user_id] : null;

        $verb = $event === 'created' ? 'published' : 'updated';

        Notifier::toAll([
            'title' => "Announcement {$verb}",
            'body' => "\"{$announcement->title}\" was {$verb}.",
            'type' => 'info',
            'module_name' => 'Announcements',
            'target_type' => 'announcement',
            'target_id' => (string) $announcement->announcement_id,
        ], $except);
    }

    protected function meta(Model $model): ?array
    {
        return match (get_class($model)) {
            Employee::class => [
                'label' => 'Employee',
                'module' => 'Core HCM',
                'target_type' => 'employee',
                'summary' => 'Hired ' . $model->full_name,
            ],
            Department::class => [
                'label' => 'Department',
                'module' => 'Core HCM',
                'target_type' => 'department',
                'summary' => 'Department ' . $model->name,
            ],
            Position::class => [
                'label' => 'Position',
                'module' => 'Core HCM',
                'target_type' => 'position',
                'summary' => 'Position ' . $model->title,
            ],
            SalaryGrade::class => [
                'label' => 'Salary grade',
                'module' => 'Core HCM',
                'target_type' => 'salary-grade',
                'summary' => 'Salary grade ' . $model->code,
            ],
            Hr3Recommendation::class => [
                'label' => 'Performance evaluation',
                'module' => 'Core HCM',
                'target_type' => 'hr3_recommendation',
                'summary' => 'HR3 recommendation ' . $model->recommendation_id,
            ],
            SystemUser::class => [
                'label' => 'System user',
                'module' => 'User Management',
                'target_type' => 'user',
                'summary' => 'User ' . $model->username,
            ],
            SystemRole::class => [
                'label' => 'Role',
                'module' => 'User Management',
                'target_type' => 'role',
                'summary' => 'Role ' . $model->role_name,
            ],
            Announcement::class => [
                'label' => 'Announcement',
                'module' => 'Announcements',
                'target_type' => 'announcement',
                'summary' => 'Announcement ' . $model->title,
            ],
            ChatbotFaq::class => [
                'label' => 'Chatbot FAQ',
                'module' => 'Chatbot',
                'target_type' => 'faq',
                'summary' => 'FAQ ' . $model->question,
            ],
            default => null,
        };
    }
}
