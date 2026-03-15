import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFutbol, faFlag, faClock } from '@fortawesome/free-solid-svg-icons';

const EVENT_ICONS = {
    goal: { icon: faFutbol, color: 'text-green-600', bg: 'bg-green-100' },
    card: { icon: faFlag, color: 'text-yellow-600', bg: 'bg-yellow-100' },
};

const CARD_COLORS = {
    green: { color: 'text-green-600', bg: 'bg-green-100' },
    yellow: { color: 'text-yellow-600', bg: 'bg-yellow-100' },
    red: { color: 'text-red-600', bg: 'bg-red-100' },
};

const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatTimer = (seconds) => {
    if (!seconds && seconds !== 0) return null;
    const mins = Math.floor(seconds / 60);
    return `${mins}'`;
};

const buildDescription = (event) => {
    const parts = [];

    if (event.event_type === 'goal') {
        parts.push(event.goal_type ? `${event.goal_type} goal` : 'Goal');
    } else if (event.event_type === 'card') {
        const cardLabel = event.card_type ? `${event.card_type} card` : 'Card';
        parts.push(cardLabel.charAt(0).toUpperCase() + cardLabel.slice(1));
    }

    if (event.team?.name) {
        parts.push(`for ${event.team.name}`);
    }

    if (event.opponent_team) {
        parts.push(`vs ${event.opponent_team}`);
    }

    if (event.game?.tournament_name) {
        parts.push(`in ${event.game.tournament_name}`);
    }

    return parts.join(' ');
};

export default function PlayerRecentEvents({ events = [] }) {
    const items = Array.isArray(events) ? events : events?.data || [];

    if (items.length === 0) return null;

    return (
        <div className="rounded-xl border border-gray-200 bg-white/90 p-6 shadow-sm backdrop-blur-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Activity</h2>
            <ul className="space-y-3">
                {items.map((event) => {
                    const cardStyle = event.event_type === 'card' && event.card_type
                        ? CARD_COLORS[event.card_type.toLowerCase()]
                        : null;
                    const style = cardStyle || EVENT_ICONS[event.event_type] || EVENT_ICONS.goal;

                    return (
                        <li key={event.id} className="flex items-start gap-3">
                            <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${style.bg}`}>
                                <FontAwesomeIcon icon={style.icon || faFutbol} className={`h-3.5 w-3.5 ${style.color}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm text-gray-900">
                                    {buildDescription(event)}
                                </p>
                                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                    {event.game?.game_date && (
                                        <span>{formatDate(event.game.game_date)}</span>
                                    )}
                                    {event.timer_value_seconds != null && (
                                        <span className="flex items-center gap-0.5">
                                            <FontAwesomeIcon icon={faClock} className="h-2.5 w-2.5" />
                                            {formatTimer(event.timer_value_seconds)}
                                        </span>
                                    )}
                                    {event.note && (
                                        <span className="italic">{event.note}</span>
                                    )}
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
