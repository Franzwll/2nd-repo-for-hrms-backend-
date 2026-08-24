<?php

namespace App\Services;

use App\Models\ChatbotFaq;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Hr3Recommendation;
use App\Models\Position;
use App\Models\SalaryGrade;
use App\Models\SystemRole;
use App\Models\SystemUser;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

/**
 * Maps a model lifecycle event to targeted notification recipients.
 *
 * Rules of thumb:
 * - Notify only people who care (admins, the affected user, the role's members).
 * - Never notify the actor about their own routine edit (security events are the
 *   exception and are handled explicitly in the Auth flow).
 */
class NotificationRules
{
    public static function handle(string $event, Model $model): void
    {
        $actor = Auth::guard('sanctum')->user();
        $actorId = $actor?->system_user_id;

        $result = match (get_class($model)) {
            Employee::class => self::forEmployee($event, $model),
            Department::class, Position::class, SalaryGrade::class => self::forCoreHcm($event, $model),
            Hr3Recommendation::class => self::forHr3($event, $model),
            SystemUser::class => self::forSystemUser($event, $model),
            SystemRole::class => self::forSystemRole($event, $model),
            ChatbotFaq::class => self::forChatbotFaq($event, $model),
            default => null,
        };

        if (! $result) {
            return;
        }

        $recipients = self::excludeActor($result['recipients'], $actorId);

        if (empty($recipients)) {
            return;
        }

        Notifier::to($recipients, $result['notification']);
    }

    protected static function excludeActor(array $ids, ?int $actorId): array
    {
        if ($actorId === null) {
            return $ids;
        }

        return array_values(array_diff(array_map('intval', $ids), [$actorId]));
    }

    protected static function attrs(
        string $module,
        string $type,
        string $targetType,
        mixed $targetId,
        string $title,
        string $body
    ): array {
        return [
            'title' => $title,
            'body' => $body,
            'type' => $type,
            'module_name' => $module,
            'target_type' => $targetType,
            'target_id' => (string) $targetId,
        ];
    }

    protected static function forEmployee(string $event, Employee $employee): ?array
    {
        $name = $employee->full_name;
        $admins = array_merge(Notifier::hrAdminIds(), Notifier::superAdminIds());

        return match ($event) {
            'created' => [
                'recipients' => $admins,
                'notification' => self::attrs(
                    'Core HCM', 'success', 'employee', $employee->employee_id,
                    'New employee added', "{$name} was added to Core HCM."
                ),
            ],
            'updated' => [
                'recipients' => $admins,
                'notification' => self::attrs(
                    'Core HCM', 'info', 'employee', $employee->employee_id,
                    'Employee updated', "{$name}'s record was updated."
                ),
            ],
            'deleted' => [
                'recipients' => Notifier::superAdminIds(),
                'notification' => self::attrs(
                    'Core HCM', 'warning', 'employee', $employee->employee_id,
                    'Employee removed', "{$name} was removed from Core HCM."
                ),
            ],
            default => null,
        };
    }

    protected static function forCoreHcm(string $event, Model $model): ?array
    {
        $label = match (get_class($model)) {
            Department::class => 'Department',
            Position::class => 'Position',
            SalaryGrade::class => 'Salary grade',
        };
        $name = match (get_class($model)) {
            Department::class => $model->name,
            Position::class => $model->title,
            SalaryGrade::class => (string) $model->code,
        };

        $admins = array_merge(Notifier::hrAdminIds(), Notifier::superAdminIds());
        $verb = match ($event) {
            'created' => 'created',
            'updated' => 'updated',
            'deleted' => 'removed',
            default => $event,
        };
        $type = $event === 'deleted' ? 'warning' : 'info';

        return [
            'recipients' => $admins,
            'notification' => self::attrs(
                'Core HCM', $type, strtolower($label), $model->getKey(),
                "{$label} {$verb}", "\"{$name}\" was {$verb}."
            ),
        ];
    }

    protected static function forHr3(string $event, Hr3Recommendation $rec): ?array
    {
        $name = $rec->employee
            ? trim(($rec->employee->first_name ?? '') . ' ' . ($rec->employee->last_name ?? ''))
            : 'Unknown';

        return [
            'recipients' => Notifier::superAdminIds(),
            'notification' => self::attrs(
                'Core HCM', 'info', 'hr3_recommendation', $rec->recommendation_id,
                'Performance evaluation updated', "Evaluation for {$name} was {$event}."
            ),
        ];
    }

    protected static function forSystemUser(string $event, SystemUser $user): ?array
    {
        if ($event === 'created') {
            return [
                'recipients' => array_merge([$user->system_user_id], Notifier::superAdminIds()),
                'notification' => self::attrs(
                    'User Management', 'success', 'user', $user->system_user_id,
                    'Account created', "Your system account ({$user->username}) was created."
                ),
            ];
        }

        if ($event === 'deleted') {
            return [
                'recipients' => Notifier::superAdminIds(),
                'notification' => self::attrs(
                    'User Management', 'warning', 'user', $user->system_user_id,
                    'System user removed', "Account {$user->username} was deleted."
                ),
            ];
        }

        if ($event === 'updated') {
            $relevant = array_intersect(array_keys($user->getDirty()), ['status', 'role_id']);

            if (empty($relevant)) {
                return null;
            }

            $recipients = array_merge([$user->system_user_id], Notifier::superAdminIds());

            if (in_array('status', $relevant, true)) {
                return [
                    'recipients' => $recipients,
                    'notification' => self::attrs(
                        'User Management', 'warning', 'user', $user->system_user_id,
                        'Account status changed', "Your account is now {$user->status}."
                    ),
                ];
            }

            return [
                'recipients' => $recipients,
                'notification' => self::attrs(
                    'User Management', 'info', 'user', $user->system_user_id,
                    'Account role updated', "Your system role was changed."
                ),
            ];
        }

        return null;
    }

    protected static function forSystemRole(string $event, SystemRole $role): ?array
    {
        $verb = match ($event) {
            'created' => 'created',
            'updated' => 'updated',
            'deleted' => 'removed',
            default => $event,
        };
        $type = $event === 'deleted' ? 'warning' : 'info';

        $recipients = array_merge(
            Notifier::superAdminIds(),
            $role->users()->pluck('system_user_id')->all()
        );

        return [
            'recipients' => $recipients,
            'notification' => self::attrs(
                'User Management', $type, 'role', $role->role_id,
                "Role {$verb}", "Role \"{$role->role_name}\" was {$verb}."
            ),
        ];
    }

    protected static function forChatbotFaq(string $event, ChatbotFaq $faq): ?array
    {
        $verb = match ($event) {
            'created' => 'created',
            'updated' => 'updated',
            'deleted' => 'removed',
            default => $event,
        };

        return [
            'recipients' => Notifier::superAdminIds(),
            'notification' => self::attrs(
                'Chatbot', $event === 'deleted' ? 'warning' : 'info', 'faq', $faq->faq_id,
                "Chatbot FAQ {$verb}", "FAQ \"{$faq->question}\" was {$verb}."
            ),
        ];
    }
}
