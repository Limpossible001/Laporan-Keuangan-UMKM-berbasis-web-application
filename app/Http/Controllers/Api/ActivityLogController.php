<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            ActivityLog::where('user_id', $request->user()->id)
                ->orderBy('logged_at', 'desc')
                ->limit(200)
                ->get()
        );
    }
}