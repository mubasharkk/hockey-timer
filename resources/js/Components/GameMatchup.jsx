import moment from 'moment';

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
                <span>{formatDateTime(game.game_date, game.game_time)}</span>
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
        return <img src={src} alt={alt || 'team logo'} className="h-14 w-14 rounded-md border border-gray-200 object-cover bg-white" />;
    }

    const initial = (alt || 'T')[0]?.toUpperCase() ?? 'T';
    return (
        <div className="flex h-14 w-14 items-center justify-center rounded-md border border-dashed border-gray-200 bg-white text-lg font-semibold text-gray-400">
            {initial}
        </div>
    );
};

const formatDateTime = (date, time) => {
    const value = moment(`${date || ''} ${time || ''}`.trim(), 'YYYY-MM-DD HH:mm');
    if (!value.isValid()) {
        return [date, time].filter(Boolean).join(' ') || 'TBD';
    }
    return value.format('DD.MM.YYYY · HH:mm');
};
