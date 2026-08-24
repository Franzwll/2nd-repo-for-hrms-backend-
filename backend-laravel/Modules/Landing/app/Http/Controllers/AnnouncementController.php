<?php

namespace Modules\Landing\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Landing\Http\Requests\StoreAnnouncementRequest;
use Modules\Landing\Http\Resources\AnnouncementResource;

class AnnouncementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Announcement::query()->with('createdBy');

        if ($request->filled('audience')) {
            $query->where('audience', $request->string('audience'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $announcements = $query->orderByDesc('published_date')->get();

        return response()->json([
            'data' => AnnouncementResource::collection($announcements),
        ]);
    }

    public function store(StoreAnnouncementRequest $request): JsonResponse
    {
        $announcement = Announcement::create([
            ...$request->validated(),
            'published_date' => $request->date('published_date', 'Y-m-d') ?? now()->toDateString(),
            'created_by_user_id' => $request->user()?->system_user_id,
            'status' => $request->string('status', 'published'),
        ]);

        return response()->json([
            'message' => 'Announcement posted.',
            'data' => new AnnouncementResource($announcement->load('createdBy')),
        ], 201);
    }

    public function update(StoreAnnouncementRequest $request, Announcement $announcement): JsonResponse
    {
        $announcement->update([
            ...$request->validated(),
            'published_date' => $request->date('published_date', 'Y-m-d') ?? $announcement->published_date,
        ]);

        return response()->json([
            'message' => 'Announcement updated.',
            'data' => new AnnouncementResource($announcement->load('createdBy')),
        ]);
    }

    public function destroy(Announcement $announcement): JsonResponse
    {
        $announcement->delete();

        return response()->json(['message' => 'Announcement deleted.']);
    }
}