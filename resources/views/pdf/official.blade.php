<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Official Match Report</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
        h1 { font-size: 18px; margin-bottom: 8px; }
        h2 { font-size: 14px; margin: 12px 0 6px; }
        table { width: 100%; border-collapse: collapse; margin-top: 6px; }
        th, td { border: 1px solid #ccc; padding: 4px 6px; text-align: left; }
        .meta { margin-bottom: 12px; }
    </style>
</head>
<body>
    <h1>{{ $game->team_a_name }} vs {{ $game->team_b_name }}</h1>
    <div class="meta">
        <div>Venue: {{ $game->venue }}</div>
        <div>Date/Time: {{ $game->game_date }} {{ $game->game_time }}</div>
        <div>Sessions: {{ $game->sessions }} x {{ $game->session_duration_minutes }} minutes</div>
    </div>

    <h2>Teams & Players</h2>
    <table>
        <thead>
            <tr>
                <th style="width: 50%">{{ $game->team_a_name }}</th>
                <th style="width: 50%">{{ $game->team_b_name }}</th>
            </tr>
        </thead>
        <tbody>
            @php
                $homePlayers = $game->teams->firstWhere('side', 'home')?->players ?? collect();
                $awayPlayers = $game->teams->firstWhere('side', 'away')?->players ?? collect();
                $max = max($homePlayers->count(), $awayPlayers->count());
            @endphp
            @for ($i = 0; $i < $max; $i++)
                <tr>
                    <td>{{ ($homePlayers[$i]->shirt_number ?? '') ? '#' . $homePlayers[$i]->shirt_number . ' ' : '' }}{{ $homePlayers[$i]->name ?? '' }}</td>
                    <td>{{ ($awayPlayers[$i]->shirt_number ?? '') ? '#' . $awayPlayers[$i]->shirt_number . ' ' : '' }}{{ $awayPlayers[$i]->name ?? '' }}</td>
                </tr>
            @endfor
        </tbody>
    </table>
</body>
</html>
