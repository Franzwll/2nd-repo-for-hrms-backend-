<?php

namespace Modules\Profile\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

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
     * Update the authenticated user's own account fields.
     *
     * Only safe, account-owned attributes are accepted here. Employment,
     * role, status and 201 data must go through their owning modules.
     */
    public function update(Request $request, $id = null)
    {
        $user = $request->user();

        $validated = $request->validate([
            'full_name' => ['sometimes', 'string', 'max:160'],
            'email' => [
                'sometimes',
                'email',
                'max:190',
                Rule::unique('system_users', 'email')->ignore(
                    $user->system_user_id,
                    'system_user_id',
                ),
            ],
            'gender' => ['sometimes', 'nullable', Rule::in(['Male', 'Female', 'Other'])],
        ]);

        if (array_key_exists('full_name', $validated)) {
            $user->full_name = $validated['full_name'];
        }
        if (array_key_exists('email', $validated)) {
            $user->email = $validated['email'];
        }
        if (array_key_exists('gender', $validated)) {
            $user->gender = $validated['gender'];
        }
        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => [
                'system_user_id' => $user->system_user_id,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'gender' => $user->gender,
            ],
        ]);
    }

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
