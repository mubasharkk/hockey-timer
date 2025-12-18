import React from 'react';

const EventTimeline = ({ events = [], teams = [], sessionCount = null, sessions = [] }) => {
    if (!events.length) {
        return <p className="text-sm text-gray-500">No events yet.</p>;
    }

    const orderedEvents = [...events].sort(
        (a, b) => new Date(b?.occurred_at || 0) - new Date(a?.occurred_at || 0)
    );

    const sessionDurationMap =
        sessions?.reduce((acc, session) => {
            if (session?.number != null && session?.planned_duration_seconds != null) {
                acc[session.number] = session.planned_duration_seconds;
            }
            return acc;
        }, {}) || {};

    const normalizeTeam = (team) => {
        if (!team) return null;
        return {
            ...team,
            name: team.name || team.team_name || null,
        };
    };

    const teamA = normalizeTeam(teams.find((t) => t.side === 'home') ?? teams[0] ?? null);
    const teamB = normalizeTeam(teams.find((t) => t.side === 'away') ?? teams[1] ?? null);
    const teamAId = teamA?.id ?? null;
    const teamBId = teamB?.id ?? null;
    const teamById = (id) => teams.find((t) => t.id === id);

    return (
        <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200" />
            <div className="mb-4 grid grid-cols-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <span className="text-right text-xl text-black pr-4">{teamA?.name || 'Team A'}</span>
                <span className="text-left text-xl text-black pl-4">{teamB?.name || 'Team B'}</span>
            </div>
            <div className="space-y-6">
                {orderedEvents.map((event, idx) => {
                    const team = event.team_id ? teamById(event.team_id) : null;
                    const side = event.team_id === teamBId ? 'teamB' : 'teamA';
                    const badge = eventBadge(event);
                    const playerLabel =
                        event.player_shirt_number != null
                            ? `#${event.player_shirt_number}${event.note ? ` ${event.note}` : ''}`
                            : event.note || '';

                    const noteLower = (event.note || '').toLowerCase();
                    const isGameStart = event.event_type === 'highlight' && noteLower.includes('game start');
                    const isSessionStart = event.event_type === 'highlight' && noteLower.includes('session') && noteLower.includes('start');
                    const isBreak = event.event_type === 'highlight' && noteLower.includes('break');
                    const isCenter =
                        event.event_type === 'session_end' ||
                        event.event_type === 'game_end' ||
                        isGameStart ||
                        isSessionStart ||
                        isBreak;

                    if (isCenter) {
                        const isGameEnd = event.event_type === 'game_end';
                        const label = isGameEnd
                            ? 'Game End'
                            : isGameStart
                                ? 'Game Start'
                                : isSessionStart
                                    ? `Session ${event.session_number} Start`
                                    : isBreak
                                        ? event.note || 'Break'
                                        : `Session ${event.session_number} End`;
                        return (
                            <div key={event.id || idx} className="relative flex w-full items-center justify-center">
                                <span
                                    className={`absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full ring-4 ring-white shadow ${
                                        isGameEnd ? 'bg-red-500' : isBreak ? 'bg-emerald-500' : 'bg-gray-800'
                                    }`}
                                />
                                <div
                                    className={`relative z-20 mx-auto flex max-w-md flex-col items-center rounded-md border px-4 py-2 text-center shadow-sm ${
                                        isGameEnd
                                            ? 'border-red-200 bg-red-50 text-red-700'
                                            : isBreak
                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                : 'border-gray-200 bg-gray-50 text-gray-700'
                                    }`}
                                >
                                    <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
                                    {/*{event.timer_value_seconds != null && (*/}
                                    {/*    <p className="text-[11px] font-medium text-gray-500">*/}
                                    {/*        {formatSeconds(event.timer_value_seconds)}*/}
                                    {/*    </p>*/}
                                    {/*)}*/}
                                    {event.occurred_at && (
                                        <p className="text-[11px] text-gray-500">
                                            {new Date(event.occurred_at).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    }

                    const sessionLabel = formatSessionAbbrev(event.session_number, sessionCount);

                    const cardBg = side === 'teamA' ? 'bg-gray-100' : 'bg-gray-50';

                    return (
                        <div key={event.id || idx} className="relative flex w-full items-center">
                            <span className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-indigo-500 ring-4 ring-white shadow" />
                            <div
                                className={`relative flex w-1/2 ${
                                    side === 'teamA' ? 'mr-auto justify-end pr-12' : 'ml-auto justify-start pl-12'
                                }`}
                            >
                                <div className={`relative flex max-w-[85%] items-start gap-3 rounded-md border border-gray-100 ${cardBg} px-3 py-2 shadow-sm`}>
                                    <span
                                        className={`absolute top-1/2 -translate-y-1/2 h-px bg-gray-200 ${
                                            side === 'teamA' ? 'left-full w-10' : 'right-full w-10'
                                        }`}
                                    />
                                    <span
                                        className={`absolute top-1/2 h-0 w-0 -translate-y-1/2 ${
                                            side === 'teamA'
                                                ? '-right-2 border-y-8 border-y-transparent border-l-8 border-l-gray-50'
                                                : '-left-2 border-y-8 border-y-transparent border-r-8 border-r-gray-50'
                                        }`}
                                    />
                                    <div className="flex flex-col items-center">
                                            <img src={badge.icon} alt={badge.label} className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-1 text-left">
                                        <p className="text-xs uppercase tracking-wide text-gray-500 flex items-center flex-wrap gap-1">
                                            <span className="text-[14px] font-bold text-black">
                                                {formatRemainingClock(event, sessionDurationMap)}
                                            </span>
                                            <span className="font-semibold">
                                                {badge.label} {sessionLabel ? `(${sessionLabel})` : ''}
                                            </span>
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {team?.name || '—'} {playerLabel && `· ${playerLabel}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const eventBadge = (event) => {
    switch (event.event_type) {
        case 'goal':
            return { icon: '/icons/goal.png', label: event.goal_type ? `${event.goal_type} Goal` : 'Goal' };
        case 'penalty_corner':
            return { icon: '/icons/foul.png', label: 'Penalty Corner' };
        case 'penalty_stroke':
            return { icon: '/icons/foul.png', label: 'Penalty Stroke' };
        case 'card':
            return { icon: cardIcon(event.card_type), label: `${event.card_type || ''} Card`.trim() };
        case 'session_end':
            return { icon: '/icons/half-time.png', label: 'Session End' };
        case 'game_end':
            return { icon: '/icons/full-time.png', label: 'Game End' };
        case 'highlight':
        default:
            return { icon: '/icons/foul.png', label: 'Highlight' };
    }
};

const cardIcon = (type) => {
    if (type === 'red') return '/icons/red-card.png';
    if (type === 'yellow') return '/icons/yellow-card.png';
    if (type === 'green') return '/icons/green-card.png';
    return '/icons/red-card.png';
};

const formatSessionAbbrev = (number, total) => {
    if (!number) return '';
    const label =
        total === 2
            ? 'H' // Half
            : total === 4
                ? 'Q' // Quarter
                : 'S'; // Session
    return `${label}${number}`;
};

const formatSeconds = (seconds) => {
    if (seconds == null) return '--:--';
    const mins = Math.floor(seconds / 60)
        .toString()
        .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

const formatRemainingClock = (event, durationMap = {}) => {
    if (!event) return '--:--';
    const planned = event.session_number != null ? durationMap?.[event.session_number] : null;
    if (planned != null && event.timer_value_seconds != null) {
        const remaining = Math.max(0, planned - event.timer_value_seconds);
        return formatSeconds(remaining);
    }
    if (event.timer_value_seconds != null) {
        return formatSeconds(event.timer_value_seconds);
    }
    return '--:--';
};

export default EventTimeline;
