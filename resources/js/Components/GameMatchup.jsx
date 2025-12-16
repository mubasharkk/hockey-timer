import moment from 'moment';
import { Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';

export default function GameMatchup({ game }) {
    const home = game.home_team || { name: game.team_a_name };
    const away = game.away_team || { name: game.team_b_name };

    return (
        <div className="space-y-3 rounded-md border border-gray-100 bg-gray-50 p-4 text-center shadow-sm">
            <div className="grid grid-cols-3 items-center gap-4 text-center">
                <TeamBlock team={home} />
                <div className="text-sm font-semibold uppercase tracking-wide text-gray-500">VS</div>
                <TeamBlock team={away} />
            </div>
            {game.excerpt && <p className="text-sm text-gray-700">{game.excerpt}</p>}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-600">
                <span className="font-semibold text-gray-800">{game.venue || 'Venue TBA'}</span>
                {formatTime(game.game_time)}
                <span>{formatDateTime(game.game_date, game.game_time)}</span>
                {(game.code || game.id) && (
                    <Link
                        href={
                            game.code
                                ? route('public.ticker.code', game.code)
                                : `${route('public.ticker')}?game=${game.id}`
                        }
                        className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 font-semibold text-indigo-700 ring-1 ring-indigo-100 transition hover:bg-indigo-100"
                    >
                        <TickerIcon />
                        <span className="text-[11px] uppercase tracking-wide">Ticker</span>
                    </Link>
                )}
            </div>
        </div>
    );
}

const TeamBlock = ({ team }) => (
    <div className="flex flex-col items-center gap-2">
        <Logo src={team.logo_url} alt={team.name} />
        <div className="text-sm font-semibold text-gray-900 text-center">{team.name || 'TBD'}</div>
    </div>
);

const Logo = ({ src, alt }) => {
    if (src) {
        return <img src={src} alt={alt || 'team logo'} className="h-14 w-14 object-contain" />;
    }

    const initial = (alt || 'T')[0]?.toUpperCase() ?? 'T';
    return (
        <div className="flex h-14 w-14 items-center justify-center text-lg font-semibold text-gray-400">
            {initial}
        </div>
    );
};

const TickerIcon = () => (
    <FontAwesomeIcon icon={faPlay} className="h-3.5 w-3.5 text-indigo-700" />
);

const formatTime = (time) => {
    if (!time) return 'TBD';
    const value = moment(time, 'HH:mm');
    return value.isValid() ? value.format('hh:mm A') : time;
};

const formatDateTime = (date, time) => {
    const value = moment(`${date || ''} ${time || ''}`.trim(), 'YYYY-MM-DD HH:mm');
    if (!value.isValid()) {
        return [date, time].filter(Boolean).join(' ') || 'TBD';
    }
    return value.format('DD.MM.YYYY · hh:mm A');
};
