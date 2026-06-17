<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;

class ActivityLogController extends Controller
{
    public function index()
    {
        return response()->json(
            ActivityLog::with('user')->orderBy('logged_at', 'desc')->limit(200)->get()
        );
    }
}