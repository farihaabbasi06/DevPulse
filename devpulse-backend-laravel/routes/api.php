<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GithubController;
use App\Http\Controllers\AuthController;

Route::get('/user/{username}', [GithubController::class, 'getUser']);
Route::get('/repos/{username}', [GithubController::class, 'getRepos']);
Route::get('/commits/{username}', [GithubController::class, 'getCommits']);
Route::get('/pullrequests/{username}', [GithubController::class, 'getPullRequests']);
Route::get('/contributions/{username}', [GithubController::class, 'getContributions']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);