<?php

namespace Modules\Profile\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return view('profile::index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('profile::create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request) {}

    /**
     * Show the specified resource.
     */
    public function show($id)
    {
        return view('profile::show');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        return view('profile::edit');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id) {}

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id) {}

    /**
     * Upload profile photo.
     */
    public function uploadPhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|file|image|mimes:jpeg,jpg,png|max:2048',
        ]);

        $user = $request->user();

        // Delete old photo if exists (supports both the legacy
        // /storage/... URLs and the /api/v1/profile-photo/... URLs).
        if ($user->profile_photo_url) {
            $oldPath = $user->profile_photo_url;
            if (str_contains($oldPath, '/profile-photo/')) {
                $oldPath = 'profile-photos/' . basename($oldPath);
            } else {
                $oldPath = str_replace(asset('storage') . '/', '', $oldPath);
            }
            Storage::disk('public')->delete($oldPath);
        }

        // Store new photo — served via GET /api/v1/profile-photo/{file}
        // so it works even when public/storage is a stale copy (Windows dev).
        $path = $request->file('photo')->store('profile-photos', 'public');
        $url = url('/api/v1/profile-photo/' . basename($path));

        $user->profile_photo_url = $url;
        $user->save();

        return response()->json([
            'message' => 'Profile photo uploaded successfully',
            'url' => $url,
        ]);
    }

    /**
     * Remove profile photo.
     */
    public function removePhoto(Request $request)
    {
        $user = $request->user();

        if ($user->profile_photo_url) {
            $oldPath = str_replace('profile-photo/', '', $user->profile_photo_url);
            Storage::disk('public')->delete($oldPath);

            $user->profile_photo_url = null;
            $user->save();
        }

        return response()->json([
            'message' => 'Profile photo removed successfully',
        ]);
    }

    /**
     * Stream the stored profile photo inline.
     *
     * Served through the API (not `public/storage`) so uploads work even when
     * the storage symlink is stale or missing on Windows dev machines.
     */
    public function showPhoto(Request $request, string $filename)
    {
        $filename = basename($filename);
        $path = 'profile-photos/' . $filename;

        if (! Storage::disk('public')->exists($path)) {
            abort(404);
        }

        $mime = Storage::disk('public')->mimeType($path) ?: 'image/jpeg';

        return Storage::disk('public')->response($path, $filename, [
            'Content-Type' => $mime,
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }
}
