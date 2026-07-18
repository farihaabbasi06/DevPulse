<?php

namespace App\Services;

class ScoreCalculator
{
    private static function normalize($value, $maxValue)
    {
        return min(($value / $maxValue) * 100, 100);
    }

    public static function calculate($data)
    {
        $commitScore = self::normalize($data['commits'], 500);
        $repoScore = self::normalize($data['repos'], 30);
        $starScore = self::normalize($data['stars'], 100);
        $prScore = self::normalize($data['prs'], 50);
        $followerScore = self::normalize($data['followers'], 500);

        $finalScore =
            $commitScore * 0.30 +
            $repoScore * 0.20 +
            $starScore * 0.20 +
            $prScore * 0.15 +
            $followerScore * 0.15;

        return round($finalScore);
    }
}