(function () {
    'use strict';

    // Capture script base URL immediately while currentScript is still available
    const _scriptSrc = document.currentScript?.src || '';
    const _scriptBase = _scriptSrc.substring(0, _scriptSrc.lastIndexOf('/') + 1);

    const POOL_COLORS = ['#e63946','#f4a261','#2a9d8f','#457b9d','#8338ec','#fb5607'];

    function formatDate(dateStr, timeStr) {
        if (!dateStr) return '';
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        // Strip time component if present (e.g. "2026-03-23 00:00:00" or "2026-03-23T00:00:00Z")
        const datePart = dateStr.split('T')[0].split(' ')[0];
        const [year, month, day] = datePart.split('-').map(Number);
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

            rows.forEach((row, rowIdx) => {
                const logoHtml = row.logo_url
                    ? `<img class="ha-team-logo" src="${row.logo_url}" alt="${row.team_name}">`
                    : `<div class="ha-team-logo-placeholder">${(row.team_name || '?').charAt(0)}</div>`;
                const barColor = rowIdx < 2 ? color : '#e0e0e0';

                html += `
                    <tr>
                        <td class="ha-col-team">
                            <div class="ha-team-cell">
                                <div class="ha-team-color" style="background:${barColor}"></div>
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

    function buildTopScorers(topScorers, limit) {
        if (!topScorers || topScorers.length === 0) return '';
        const rows = topScorers.slice(0, limit);
        let html = `<h2 class="ha-section-title">Top scorers</h2>
        <table class="ha-scorers">
            <thead>
                <tr>
                    <th>Player</th>
                    <th class="ha-col-right">Goals</th>
                </tr>
            </thead>
            <tbody>`;
        rows.forEach((s, i) => {
            html += `
            <tr>
                <td>
                    <div class="ha-scorer-cell">
                        <div class="ha-scorer-num">${i + 1}</div>
                        <div>
                            <div class="ha-scorer-name">${s.player_name || s.name || '—'}</div>
                            ${s.team_name ? `<div class="ha-scorer-team">${s.team_name}</div>` : ''}
                        </div>
                    </div>
                </td>
                <td class="ha-col-right">${s.goals ?? '-'}</td>
            </tr>`;
        });
        html += `</tbody></table>`;
        return html;
    }

    function matchCard(g) {
        const home = g.home_team || {};
        const away = g.away_team || {};
        const isLive     = g.status === 'in_progress';
        const isFinished = g.status === 'finished';
        const isKnockout = g.game_type === 'knockout';

        const fmtScore = (score, shootout) =>
            (shootout > 0) ? `${score}(${shootout})` : score;

        const homeDisplay = fmtScore(g.home_final_score ?? g.home_score ?? '-', g.home_shootout_score ?? 0);
        const awayDisplay = fmtScore(g.away_final_score ?? g.away_score ?? '-', g.away_shootout_score ?? 0);
        const hasScore = g.home_final_score != null || g.home_score != null;

        return `
        <div class="ha-match-card">
            <div class="ha-match-meta">
                <span class="ha-match-date">${formatDate(g.game_date, g.game_time)}</span>
            </div>
            <div class="ha-match-body">
                <div class="ha-match-team">
                    ${teamLogo(home.logo_url, home.name, 32)}
                    <span class="ha-match-team-name">${home.name || '?'}</span>
                </div>
                <div class="ha-match-center">
                    ${hasScore
                        ? `<div class="ha-match-score${isLive ? ' ha-live' : ''}">${homeDisplay} – ${awayDisplay}</div>
                           ${isFinished ? `<div class="ha-match-final">Final Score</div>` : ''}`
                        : `<div class="ha-match-vs">VS</div>`
                    }
                    ${(g.excerpt || g.game_type || g.tournament_pool_name) ? `
                    <div class="ha-match-bottom">
                        ${g.game_type ? `<span class="ha-game-type${isKnockout ? ' ha-knockout' : ''}">${g.game_type.replace('_', ' ')}</span>` : ''}
                        ${g.tournament_pool_name ? `<span class="ha-game-type">${g.tournament_pool_name}</span>` : ''}
                        ${g.excerpt ? `<span class="ha-match-excerpt">${g.excerpt}</span>` : ''}
                    </div>` : ''}
                </div>
                <div class="ha-match-team ha-away">
                    ${teamLogo(away.logo_url, away.name, 32)}
                    <span class="ha-match-team-name">${away.name || '?'}</span>
                </div>
            </div>
        </div>`;
    }

    function buildMatchTabs(upcomingGames, resultGames, upcomingLimit, resultsLimit, widgetId) {
        const upcoming = (upcomingGames || []).slice(0, upcomingLimit);
        const results  = (resultGames   || []).slice(0, resultsLimit > 0 ? resultsLimit : resultGames?.length ?? 0);

        if (upcoming.length === 0 && results.length === 0) return '';

        const defaultTab = upcoming.length > 0 ? 'upcoming' : 'results';

        let html = `<h2 class="ha-section-title">Matches</h2>`;
        html += `<div class="ha-tabs">`;
        if (upcoming.length > 0) html += `<div class="ha-tab${defaultTab === 'upcoming' ? ' ha-active' : ''}" data-tab="upcoming" data-widget="${widgetId}">Upcoming</div>`;
        if (results.length  > 0) html += `<div class="ha-tab${defaultTab === 'results'  ? ' ha-active' : ''}" data-tab="results"  data-widget="${widgetId}">Results</div>`;
        html += `</div>`;

        if (upcoming.length > 0) {
            html += `<div class="ha-tab-panel${defaultTab === 'upcoming' ? ' ha-active' : ''}" data-panel="upcoming" data-widget="${widgetId}"><div class="ha-matches">`;
            upcoming.forEach(g => { html += matchCard(g); });
            html += `</div></div>`;
        }

        if (results.length > 0) {
            html += `<div class="ha-tab-panel${defaultTab === 'results' ? ' ha-active' : ''}" data-panel="results" data-widget="${widgetId}"><div class="ha-matches">`;
            results.forEach(g => { html += matchCard(g); });
            html += `</div></div>`;
        }

        return html;
    }

    let widgetCounter = 0;

    function render(container, data, opts) {
        const { tournament, pool_results, upcoming, results, top_scorers } = data;
        const t = tournament.data || tournament;
        const widgetId = ++widgetCounter;

        let html = `<div class="ha-widget">`;

        const startDate = t.start_date ? formatDate(t.start_date, null) : null;
        const endDate   = t.end_date   ? formatDate(t.end_date,   null) : null;
        const dateRange = startDate && endDate && startDate !== endDate
            ? `${startDate} – ${endDate}`
            : (startDate || endDate || null);

        html += `
            <div class="ha-header">
                <h1>${t.title}</h1>
                ${t.venue ? `<p>${t.venue}</p>` : ''}
                ${dateRange ? `<div class="ha-header-meta"><span class="ha-header-date">${dateRange}</span></div>` : ''}
            </div>`;

        html += buildStandings(pool_results);
        html += buildMatchTabs(upcoming, results, opts.upcoming, opts.results, widgetId);

        if (opts.topScorers > 0 && top_scorers?.length > 0) {
            html += buildTopScorers(top_scorers, opts.topScorers);
        }

        html += `<div class="ha-footer">Powered by <a href="#" target="_blank">HockeyApp</a></div>`;
        html += `</div>`;

        container.innerHTML = html;

        // Wire up tab clicks
        container.querySelectorAll(`.ha-tab[data-widget="${widgetId}"]`).forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.getAttribute('data-tab');
                container.querySelectorAll(`.ha-tab[data-widget="${widgetId}"]`).forEach(t => t.classList.remove('ha-active'));
                container.querySelectorAll(`.ha-tab-panel[data-widget="${widgetId}"]`).forEach(p => p.classList.remove('ha-active'));
                tab.classList.add('ha-active');
                container.querySelector(`.ha-tab-panel[data-panel="${target}"][data-widget="${widgetId}"]`).classList.add('ha-active');
            });
        });
    }

    function init(el) {
        const apiBase = el.getAttribute('data-api') || '';
        const slug = el.getAttribute('data-slug');

        if (!slug) {
            el.innerHTML = `<div class="ha-error">Missing data-slug attribute.</div>`;
            return;
        }

        const opts = {
            upcoming:   parseInt(el.getAttribute('data-upcoming')   ?? '10', 10),
            results:    parseInt(el.getAttribute('data-results')     ?? '0',  10),
            topScorers: parseInt(el.getAttribute('data-top-scorers') ?? '0', 10),
        };

        el.innerHTML = `<div class="ha-loading">Loading tournament data...</div>`;

        fetch(`${apiBase}/api/tournaments/${slug}`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(json => render(el, json.data, opts))
            .catch(err => {
                el.innerHTML = `<div class="ha-error">Failed to load tournament: ${err.message}</div>`;
            });
    }

    function injectStyles() {
        if (document.getElementById('ha-widget-styles')) return;
        const link = document.createElement('link');
        link.id = 'ha-widget-styles';
        link.rel = 'stylesheet';
        link.href = _scriptBase + 'tournament.css';
        document.head.appendChild(link);
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
