<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
use Firebase\JWT\JWT;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->only(['name', 'email', 'password']);

        $existingUser = User::where('email', $data['email'])->first();

        if ($existingUser) {
            return response()->json(['message' => 'User already exists'], 400);
        }

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        return response()->json([
            'message' => 'User registered successfully',
            'userId' => $user->id,
        ]);
    }

    public function login(Request $request)
    {
        $data = $request->only(['email', 'password']);

        $user = User::where('email', $data['email'])->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 400);
        }

        if (!Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Invalid password'], 400);
        }

        $payload = [
            'id' => $user->id,
            'email' => $user->email,
            'exp' => time() + (60 * 60 * 24), // 1 day
        ];

        $token = JWT::encode($payload, env('JWT_SECRET'), 'HS256');

        return response()->json(['token' => $token]);
    }

    public function forgotPassword(Request $request)
    {


    
        $email = $request->input('email');

        $user = User::where('email', $email)->first();



        if (!$user) {
            return response()->json(['message' => 'Email not found'], 404);
        }

        $otp = rand(100000, 999999);

        Cache::put('otp_' . $email, $otp, now()->addMinutes(10));

        Mail::html("<h2>Your OTP is: <b>{$otp}</b></h2><p>This OTP expires in 10 minutes.</p>", function ($message) use ($email) {
            $message->to($email)
                ->subject('DevPulse Password Reset OTP');
        });

        return response()->json(['message' => 'OTP sent to email']);
    }

    public function resetPassword(Request $request)
    {
        $email = $request->input('email');
        $otp = $request->input('otp');
        $newPassword = $request->input('newPassword');

        $storedOtp = Cache::get('otp_' . $email);

        if (!$storedOtp) {
            return response()->json(['message' => 'OTP not found'], 400);
        }

        if ((string) $storedOtp !== (string) $otp) {
            return response()->json(['message' => 'Wrong OTP'], 400);
        }

        User::where('email', $email)->update([
            'password' => Hash::make($newPassword),
        ]);

        Cache::forget('otp_' . $email);

        return response()->json(['message' => 'Password reset successful']);
    }
}