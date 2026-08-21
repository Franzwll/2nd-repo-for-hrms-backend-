<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    /**
     * Get notifications for the authenticated user.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $notifications = DB::table('notifications')
            ->where('system_user_id', $user->system_user_id)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(function ($n) {
                return [
                    'id' => 'NTF-' . str_pad($n->notification_id, 3, '0', STR_PAD_LEFT),
                    'notification_id' => $n->notification_id,
                    'title' => $n->title,
                    'detail' => $n->body,
                    'time' => $this->formatTimeAgo($n->created_at),
                    'read' => (bool) $n->is_read,
                    'tone' => $this->mapTone($n->type),
                    'type' => $n->type,
                    'module' => $n->module_name,
                    'created_at' => $n->created_at,
                ];
            });

        return response()->json([
            'data' => $notifications,
            'unread_count' => DB::table('notifications')
                ->where('system_user_id', $user->system_user_id)
                ->where('is_read', false)
                ->count(),
        ]);
    }

    /**
     * Mark a notification as read.
     */
    public function markRead(Request $request, $id)
    {
        $user = $request->user();

        DB::table('notifications')
            ->where('notification_id', $id)
            ->where('system_user_id', $user->system_user_id)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json(['message' => 'Notification marked as read']);
    }

    /**
     * Mark all notifications as read for the authenticated user.
     */
    public function markAllRead(Request $request)
    {
        $user = $request->user();

        DB::table('notifications')
            ->where('system_user_id', $user->system_user_id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    /**
     * Create a notification (for system use).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'system_user_id' => 'required|exists:system_users,system_user_id',
            'type' => 'required|string|max:50',
            'title' => 'required|string|max:200',
            'body' => 'nullable|string',
            'module_name' => 'nullable|string|max:100',
            'target_type' => 'nullable|string|max:100',
            'target_id' => 'nullable|string|max:100',
        ]);

        $id = DB::table('notifications')->insertGetId([
            ...$validated,
            'is_read' => false,
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Notification created',
            'data' => ['notification_id' => $id],
        ], 201);
    }

    /**
     * Format timestamp to relative time.
     */
    private function formatTimeAgo($timestamp): string
    {
        $created = \Carbon\Carbon::parse($timestamp);
        $now = now();
        $diffMinutes = $created->diffInMinutes($now);

        if ($diffMinutes < 1) return 'Just now';
        if ($diffMinutes < 60) return $diffMinutes . ' min ago';

        $diffHours = $created->diffInHours($now);
        if ($diffHours < 24) return $diffHours . ' hr' . ($diffHours > 1 ? 's' : '') . ' ago';

        $diffDays = $created->diffInDays($now);
        if ($diffDays === 1) return 'Yesterday';
        if ($diffDays < 7) return $diffDays . ' days ago';

        return $created->format('M d, Y');
    }

    /**
     * Map notification type to UI tone.
     */
    private function mapTone(string $type): string
    {
        return match ($type) {
            'success', 'approved', 'completed' => 'success',
            'warning', 'suspended', 'rejected', 'returned' => 'warning',
            default => 'info',
        };
    }
}