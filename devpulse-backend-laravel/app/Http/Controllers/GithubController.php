<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Services\ScoreCalculator;

class GithubController extends Controller
{
    private function githubHeaders()
    {
        return [
            'Authorization' => 'token ' . env('GITHUB_TOKEN'),
        ];
    }

    public function getUser($username)
    {
        try {
            $response = Http::withHeaders($this->githubHeaders())
                ->get("https://api.github.com/users/{$username}");

            if ($response->status() === 404) {
                return response()->json(['message' => 'GitHub user not found'], 404);
            }

            $data = $response->json();

            $reposResponse = Http::withHeaders($this->githubHeaders())
                ->get("https://api.github.com/users/{$username}/repos");

            $repos = $reposResponse->json();

            $totalStars = collect($repos)->sum('stargazers_count');

            $prResponse = Http::withHeaders($this->githubHeaders())
                ->get("https://api.github.com/search/issues?q=author:{$username}+type:pr");

            $totalPRs = $prResponse->json()['total_count'] ?? 0;

            $totalCommits = 0;

            foreach ($repos as $repo) {
                try {
                    $commitRes = Http::withHeaders($this->githubHeaders())
                        ->get("https://api.github.com/repos/{$username}/{$repo['name']}/commits?per_page=1");

                    $linkHeader = $commitRes->header('link');

                    if ($linkHeader) {
                        preg_match('/page=(\d+)>; rel="last"/', $linkHeader, $match);
                        if (isset($match[1])) {
                            $totalCommits += (int) $match[1];
                        }
                    } else {
                        $totalCommits += count($commitRes->json());
                    }
                } catch (\Exception $e) {
                    // Skip empty repos
                }
            }

            $score = ScoreCalculator::calculate([
                'commits' => $totalCommits,
                'repos' => $data['public_repos'] ?? 0,
                'stars' => $totalStars,
                'prs' => $totalPRs,
                'followers' => $data['followers'] ?? 0,
            ]);

            return response()->json([
                'name' => $data['name'] ?? null,
                'username' => $data['login'] ?? null,
                'bio' => $data['bio'] ?? null,
                'avatar' => $data['avatar_url'] ?? null,
                'followers' => $data['followers'] ?? 0,
                'location' => $data['location'] ?? null,
                'joined' => $data['created_at'] ?? null,
                'score' => $score,
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }

    public function getRepos($username)
    {
        try {
            $response = Http::withHeaders($this->githubHeaders())
                ->get("https://api.github.com/users/{$username}/repos");

            $repos = $response->json();

            $totalStars = collect($repos)->sum('stargazers_count');

            $formattedRepos = [];

            foreach ($repos as $repo) {
                $langRes = Http::withHeaders($this->githubHeaders())
                    ->get("https://api.github.com/repos/{$username}/{$repo['name']}/languages");

                $formattedRepos[] = [
                    'name' => $repo['name'],
                    'description' => $repo['description'],
                    'full_name' => $repo['full_name'],
                    'stars' => $repo['stargazers_count'],
                    'forks' => $repo['forks_count'],
                    'language' => $repo['language'],
                    'languages' => array_keys($langRes->json() ?? []),
                    'url' => $repo['html_url'],
                ];
            }

            return response()->json([
                'totalRepos' => count($repos),
                'totalStars' => $totalStars,
                'repos' => $formattedRepos,
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function getCommits($username)
    {
        try {
            $reposRes = Http::withHeaders($this->githubHeaders())
                ->get("https://api.github.com/users/{$username}/repos");

            $repos = $reposRes->json();
            $totalCommits = 0;

            foreach ($repos as $repo) {
                try {
                    $commitRes = Http::withHeaders($this->githubHeaders())
                        ->get("https://api.github.com/repos/{$username}/{$repo['name']}/commits?per_page=1");

                    $linkHeader = $commitRes->header('link');

                    if ($linkHeader) {
                        preg_match('/page=(\d+)>; rel="last"/', $linkHeader, $match);
                        if (isset($match[1])) {
                            $totalCommits += (int) $match[1];
                        }
                    } else {
                        $totalCommits += count($commitRes->json());
                    }
                } catch (\Exception $e) {
                    // Skip
                }
            }

            return response()->json(['totalCommits' => $totalCommits]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getPullRequests($username)
    {
        try {
            $response = Http::withHeaders($this->githubHeaders())
                ->get("https://api.github.com/search/issues?q=author:{$username}+type:pr");

            return response()->json([
                'totalPullRequests' => $response->json()['total_count'] ?? 0,
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getContributions($username)
    {
        try {
            $query = [
                'query' => '
                {
                  user(login: "' . $username . '") {
                    contributionsCollection {
                      contributionCalendar {
                        weeks {
                          contributionDays {
                            contributionCount
                            date
                          }
                        }
                      }
                    }
                  }
                }
                '
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('GITHUB_TOKEN'),
            ])->post('https://api.github.com/graphql', $query);

            $monthlyData = [
                'Jan' => 0, 'Feb' => 0, 'Mar' => 0,
                'Apr' => 0, 'May' => 0, 'Jun' => 0,
            ];

            $weeks = $response->json()['data']['user']['contributionsCollection']['contributionCalendar']['weeks'];

            foreach ($weeks as $week) {
                foreach ($week['contributionDays'] as $day) {
                    $month = date('M', strtotime($day['date']));
                    if (array_key_exists($month, $monthlyData)) {
                        $monthlyData[$month] += $day['contributionCount'];
                    }
                }
            }

            return response()->json($monthlyData);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}