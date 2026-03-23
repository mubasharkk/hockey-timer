(function () {
    'use strict';

    const STYLES = `
        .ha-widget * { box-sizing: border-box; margin: 0; padding: 0; }
        .ha-widget {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            color: #111;
            background: #fff;
            max-width: 720px;
            width: 100%;
        }
        .ha-widget a { color: inherit; text-decoration: none; }

        /* Header */
        .ha-header { margin-bottom: 24px; }
        .ha-header h1 { font-size: 28px; font-weight: 800; margin-bottom: 4px; }
        .ha-header p { font-size: 13px; color: #555; line-height: 1.5; }

        /* Section title */
        .ha-section-title {
            font-size: 22px;
            font-weight: 800;
            margin: 28px 0 12px;
        }

        /* Pool label */
        .ha-pool-label {
            font-size: 13px;
            font-weight: 700;
            color: #333;
            margin: 16px 0 6px;
        }

        /* Standings table */
        .ha-table { width: 100%; border-collapse: collapse; }
        .ha-table th {
            font-size: 11px;
            font-weight: 700;
            color: #888;
            text-align: center;
            padding: 4px 6px;
            border-bottom: 1px solid #e5e5e5;
        }
        .ha-table th.ha-col-team { text-align: left; }
        .ha-table td {
            text-align: center;
            padding: 7px 6px;
            border-bottom: 1px solid #f0f0f0;
            font-size: 13px;
        }
        .ha-table td.ha-col-team { text-align: left; }
        .ha-table tr:last-child td { border-bottom: none; }
        .ha-team-cell {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .ha-team-color {
            width: 4px;
            height: 32px;
            border-radius: 2px;
            background: #ccc;
            flex-shrink: 0;
        }
        .ha-team-logo {
            width: 28px;
            height: 28px;
            object-fit: contain;
            flex-shrink: 0;
        }
        .ha-team-logo-placeholder {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #e5e5e5;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 700;
            color: #777;
            flex-shrink: 0;
        }
        .ha-team-name { font-weight: 600; font-size: 13px; }
        .ha-col-pts { font-weight: 700; }

        /* Upcoming matches */
        .ha-matches { display: flex; flex-direction: column; gap: 8px; }
        .ha-match-card {
            display: flex;
            flex-direction: column;
            padding: 10px 14px;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            gap: 8px;
        }
        .ha-match-meta {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .ha-match-date { font-size: 11px; color: #888; }
        .ha-match-body {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
        }
        .ha-match-team {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
        }
        .ha-match-team.ha-away { flex-direction: row-reverse; }
        .ha-match-team-name { font-weight: 600; font-size: 13px; }
        .ha-match-logo {
            width: 32px;
            height: 32px;
            object-fit: contain;
        }
        .ha-match-logo-placeholder {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #e5e5e5;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 700;
            color: #777;
        }
        .ha-match-center { text-align: center; flex-shrink: 0; min-width: 90px; }
        .ha-match-score {
            font-size: 18px;
            font-weight: 800;
            letter-spacing: 2px;
        }
        .ha-match-score.ha-live { color: #e02020; }
        .ha-match-label {
            display: inline-block;
            font-size: 10px;
            font-weight: 700;
            color: #fff;
            background: #457b9d;
            border-radius: 4px;
            padding: 1px 6px;
            margin-top: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .ha-match-label.ha-knockout { background: #e63946; }
        .ha-match-bottom { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 4px; flex-wrap: wrap; }
        .ha-match-excerpt { font-size: 11px; color: #999; font-style: italic; }
        .ha-game-type {
            font-size: 10px;
            font-weight: 700;
            color: #555;
            background: #f0f0f0;
            border-radius: 4px;
            padding: 1px 6px;
            text-transform: capitalize;
        }
        .ha-match-vs { font-size: 13px; font-weight: 700; color: #aaa; }

        /* Powered by */
        .ha-footer {
            margin-top: 20px;
            font-size: 11px;
            color: #bbb;
            text-align: right;
        }
        .ha-footer a { color: #bbb; }

        /* Loading / error */
        .ha-loading { padding: 20px; text-align: center; color: #888; font-size: 13px; }
        .ha-error { padding: 20px; text-align: center; color: #e02020; font-size: 13px; }
    `;

    const POOL_COLORS = ['#e63946','#f4a261','#2a9d8f','#457b9d','#8338ec','#fb5607'];

    function formatDate(dateStr, timeStr) {
        if (!dateStr) return '';
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        // Parse date parts directly to avoid UTC timezone shift
        const [year, month, day] = dateStr.split('-').map(Number);
        const monthName = months[month - 1];
        if (!timeStr) return `${monthName} ${day} ${year}`;
        const [rawH, rawM] = timeStr.split(':').map(Number);
        const ampm = rawH >= 12 ? 'PM' : 'AM';
        const h12 = String(rawH % 12 || 12).padStart(2, '0');
        const mins = String(rawM).padStart(2, '0');
        return `${monthName} ${day} ${year}, ${h12}:${mins} ${ampm}`;
    }

    function teamLogo(url, name, size) {
        if (url) {
            return `<img class="ha-match-logo" src="${url}" alt="${name}" width="${size}" height="${size}" style="width:${size}px;height:${size}px">`;
        }
        return `<div class="ha-match-logo-placeholder" style="width:${size}px;height:${size}px">${(name || '?').charAt(0)}</div>`;
    }

    function buildStandings(poolResults) {
        if (!poolResults || poolResults.length === 0) return '';

        // Group by pool
        const pools = {};
        const poolOrder = [];
        poolResults.forEach(row => {
            const key = row.pool_name || `Pool ${row.pool_id}`;
            if (!pools[key]) { pools[key] = []; poolOrder.push(key); }
            pools[key].push(row);
        });

        let html = `<h2 class="ha-section-title">Points table</h2>`;

        poolOrder.forEach((poolName, poolIdx) => {
            const rows = pools[poolName];
            const color = POOL_COLORS[poolIdx % POOL_COLORS.length];

            html += `<div class="ha-pool-label">${poolName}</div>`;
            html += `
            <table class="ha-table">
                <thead>
                    <tr>
                        <th class="ha-col-team">Team</th>
                        <th>MP</th>
                        <th>W</th>
                        <th>D</th>
                        <th>L</th>
                        <th>G/F</th>
                        <th>G/A</th>
                        <th>G/D</th>
                        <th>Points</th>
                    </tr>
                </thead>
                <tbody>`;

            rows.forEach(row => {
                const logoHtml = row.logo_url
                    ? `<img class="ha-team-logo" src="${row.logo_url}" alt="${row.team_name}">`
                    : `<div class="ha-team-logo-placeholder">${(row.team_name || '?').charAt(0)}</div>`;

                html += `
                    <tr>
                        <td class="ha-col-team">
                            <div class="ha-team-cell">
                                <div class="ha-team-color" style="background:${color}"></div>
                                ${logoHtml}
                                <span class="ha-team-name">${row.team_name}</span>
                            </div>
                        </td>
                        <td>${row.played ?? '-'}</td>
                        <td>${row.wins ?? '-'}</td>
                        <td>${row.draws ?? '-'}</td>
                        <td>${row.losses ?? '-'}</td>
                        <td>${row.goals_for ?? '-'}</td>
                        <td>${row.goals_against ?? '-'}</td>
                        <td>${row.goal_diff ?? '-'}</td>
                        <td class="ha-col-pts">${row.total_points ?? '-'}</td>
                    </tr>`;
            });

            html += `</tbody></table>`;
        });

        return html;
    }

    function buildMatches(games) {
        if (!games || games.length === 0) return '';

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const upcoming = games.filter(g => {
            if (!g.game_date) return false;
            return new Date(g.game_date) >= now && g.status !== 'finished';
        }).slice(0, 10);

        if (upcoming.length === 0) return '';

        let html = `<h2 class="ha-section-title">Upcoming matches</h2><div class="ha-matches">`;

        upcoming.forEach(g => {
            const home = g.home_team || {};
            const away = g.away_team || {};
            const isLive = g.status === 'in_progress';
            const hasScore = g.home_score != null && g.away_score != null;
            const isKnockout = g.game_type === 'knockout';

            const label = isKnockout
                ? g.knockout_round || 'Knockout'
                : (g.tournament_pool_name || null);

            html += `
            <div class="ha-match-card">
                <div class="ha-match-meta">
                    <span class="ha-match-date">${formatDate(g.game_date, g.game_time)}</span>
                    ${label ? `<span class="ha-match-label${isKnockout ? ' ha-knockout' : ''}">${label}</span>` : ''}
                </div>
                <div class="ha-match-body">
                    <div class="ha-match-team">
                        ${teamLogo(home.logo_url, home.name, 32)}
                        <span class="ha-match-team-name">${home.name || '?'}</span>
                    </div>
                    <div class="ha-match-center">
                        ${hasScore
                            ? `<div class="ha-match-score${isLive ? ' ha-live' : ''}">${g.home_score} – ${g.away_score}</div>`
                            : `<div class="ha-match-vs">VS</div>`
                        }
                        ${(g.excerpt || g.game_type) ? `
                        <div class="ha-match-bottom">
                            ${g.game_type ? `<span class="ha-game-type">${g.game_type.replace('_', ' ')}</span>` : ''}
                            ${g.excerpt ? `<span class="ha-match-excerpt">${g.excerpt}</span>` : ''}
                        </div>` : ''}
                    </div>
                    <div class="ha-match-team ha-away">
                        ${teamLogo(away.logo_url, away.name, 32)}
                        <span class="ha-match-team-name">${away.name || '?'}</span>
                    </div>
                </div>
            </div>`;
        });

        html += `</div>`;
        return html;
    }

    function render(container, data) {
        const { tournament, pool_results, top_scorers } = data;
        const t = tournament.data || tournament;

        let html = `<div class="ha-widget">`;

        // Header
        html += `
            <div class="ha-header">
                <h1>${t.title}</h1>
                ${t.venue ? `<p>${t.venue}</p>` : ''}
            </div>`;

        // Pool standings
        html += buildStandings(pool_results);

        // Upcoming matches
        html += buildMatches(t.games || []);

        // Footer
        html += `<div class="ha-footer">Powered by <a href="#" target="_blank">HockeyApp</a></div>`;

        html += `</div>`;
        container.innerHTML = html;
    }

    function init(el) {
        const apiBase = el.getAttribute('data-api') || '';
        const slug = el.getAttribute('data-slug');

        if (!slug) {
            el.innerHTML = `<div class="ha-error">Missing data-slug attribute.</div>`;
            return;
        }

        el.innerHTML = `<div class="ha-loading">Loading tournament data...</div>`;

        fetch(`${apiBase}/api/tournaments/${slug}`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(json => render(el, json.data))
            .catch(err => {
                el.innerHTML = `<div class="ha-error">Failed to load tournament: ${err.message}</div>`;
            });
    }

    function injectStyles() {
        if (document.getElementById('ha-widget-styles')) return;
        const style = document.createElement('style');
        style.id = 'ha-widget-styles';
        style.textContent = STYLES;
        document.head.appendChild(style);
    }

    function boot() {
        injectStyles();
        document.querySelectorAll('[data-ha-tournament]').forEach(init);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    // Expose for manual init
    window.HockeyAppWidget = { init };
})();
