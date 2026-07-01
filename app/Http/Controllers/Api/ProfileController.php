<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    /**
     * GET /api/profile
     * Ambil data profile user yang sedang login.
     */
    public function show(Request $request)
    {
        return response()->json(['user' => $request->user()]);
    }

    /**
     * POST /api/profile
     * Update Full Name, Business Name, Email, dan (opsional) Profile Picture
     * dalam satu kali submit "Save Changes" sesuai spek Catatan#7.
     *
     * NB: dipakai POST (bukan PUT) supaya upload file (multipart/form-data)
     * gampang dari FE tanpa perlu method-spoofing manual.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name'          => ['required', 'string', 'max:255'],
            'business_name' => ['required', 'string', 'max:255'],
            'email'         => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            // Restriksi sesuai spek: hanya JPG/PNG, max 2MB (2048 KB)
            'avatar'        => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        $user->name          = $request->name;
        $user->business_name = $request->business_name;
        $user->email         = $request->email;

        if ($request->hasFile('avatar')) {
            // Hapus foto lama (kalau ada) biar storage tidak numpuk file yatim
            if ($user->avatar_path) {
                Storage::disk('public')->delete($user->avatar_path);
            }
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar_path = $path;
        }

        $user->save();

        return response()->json([
            'message' => 'Profile berhasil disimpan',
            'user'    => $user,
        ]);
    }
}