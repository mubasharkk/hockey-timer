import React from 'react';

const EventTimeline = ({ events = [], teams = [] }) => {
    if (!events.length) {
        return <p className="text-sm text-gray-500">No events yet.</p>;
    }

    const teamById = (id) => teams.find((t) => t.id === id);

    return (
        <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200" />
            <div className="space-y-4">
                {events.map((event, idx) => {
                    const team = event.team_id ? teamById(event.team_id) : null;
                    const side = team?.side === 'away' ? 'away' : 'home';
                    const align = side === 'away' ? 'justify-end' : 'justify-start';
                    const badge = eventBadge(event);
                    const playerLabel =
                        event.player_shirt_number != null
                            ? `#${event.player_shirt_number}${event.note ? ` ${event.note}` : ''}`
                            : event.note || '';

                    return (
                        <div key={event.id || idx} className={`relative flex ${align}`}>
                            <span className="absolute left-1/2 top-3 z-10 -translate-x-1/2 h-3 w-3 rounded-full bg-indigo-500 ring-4 ring-white shadow" />
                            <div
                                className={`flex max-w-[70%] items-start gap-3 rounded-md border border-gray-100 bg-gray-50 px-3 py-2 shadow-sm ${
                                    side === 'away' ? 'flex-row-reverse' : ''
                                }`}
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm">
                                    <img src={badge.icon} alt={badge.label} className="h-6 w-6" />
                                </div>
                                <div className="space-y-1 text-left">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">
                                        Session {event.session_number} · {badge.label}
                                    </p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {event.timer_value_seconds != null ? formatSeconds(event.timer_value_seconds) : '--:--'}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        {team?.name || '—'} {playerLabel && `· ${playerLabel}`}
                                    </p>
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
    if (type === 'yellow') return '/icons/red-card.png';
    if (type === 'green') return '/icons/red-card.png';
    return '/icons/red-card.png';
};

const formatSeconds = (seconds) => {
    const mins = Math.floor(seconds / 60)
        .toString()
        .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

export default EventTimeline;
