<?php

namespace Modules\Settings\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = auth('sanctum')->user();
        $query = Notification::query()->orderByDesc('created_at');

        if ($user) {
            $query->where('system_user_id', $user->system_user_id);
        }

        $notifications = $query->limit(50)->get();

        return response()->json([
            'data' => $notifications->map(fn ($n) => [
                'id'         => (string) $n->notification_id,
                'title'      => $n->title,
                'detail'     => $n->body ?? '',
                'module'     => $n->module_name,
                'tone'       => $n->type ?? 'info',
                'read'       => (bool) $n->is_read,
                'time'       => $n->created_at ? $n->created_at->diffForHumans() : 'Just now',
                'created_at' => $n->created_at?->toISOString(),
            ]),
            'unread_count' => $query->where('is_read', false)->count(),
        ]);
    }

    public function markRead(int $id): JsonResponse
    {
        $notification = Notification::find($id);
        if ($notification) {
            $notification->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }

        return response()->json(['message' => 'Notification marked as read.']);
    }

    public function markAllRead(): JsonResponse
    {
        $user = auth('sanctum')->user();
        $query = Notification::where('is_read', false);
        if ($user) {
            $query->where('system_user_id', $user->system_user_id);
        }
        $query->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return response()->json(['message' => 'All notifications marked as read.']);
    }
}
