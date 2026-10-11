<?php

namespace Modules\Profile\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
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
            'photo' => ['required', 'file', 'image', 'max:2048', Rule::mimeType('image/jpeg', 'image/png')],
        ]);

        $user = $request->user();

        // Delete old photo if exists
        if ($user->profile_photo_url) {
            $oldPath = str_replace(asset('storage') . '/', '', $user->profile_photo_url);
            Storage::disk('public')->delete($oldPath);
        }

        // Store new photo
        $path = $request->file('photo')->store('profile-photos', 'public');
        $url = asset('storage/' . $path);

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
            $oldPath = str_replace(asset('storage') . '/', '', $user->profile_photo_url);
            Storage::disk('public')->delete($oldPath);

            $user->profile_photo_url = null;
            $user->save();
        }

        return response()->json([
            'message' => 'Profile photo removed successfully',
        ]);
    }
}
