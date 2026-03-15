import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';

const sessionOptions = [1, 2, 4, 6, 8];
const todayStr = () => new Date().toISOString().slice(0, 10);

export default function Create({ auth, teams = [], sportsOptions = {}, gameTypes = {}, tournaments = [], prefillTournamentId = '' }) {
    const teamList = Array.isArray(teams) ? teams : teams?.data || [];
    const tournamentList = Array.isArray(tournaments) ? tournaments : tournaments?.data || [];
    const { data, setData, post, processing, errors } = useForm({
        home_team_id: '',
        away_team_id: '',
        tournament_id: prefillTournamentId || '',
        game_type: 'pool',
        tournament_pool_id: '',
        venue: '',
        excerpt: '',
        notes: '',
        game_date: todayStr(),
        game_time: '',
        sessions: 4,
        session_duration_minutes: 15,
        timer_mode: 'DESC',
        sport_type: 'field_hockey',
        continue_timer_on_goal: false,
        game_officials: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('games.store'));
    };

    const selectedTournament = useMemo(
        () => tournamentList.find((t) => `${t.id}` === `${data.tournament_id}`),
        [tournamentList, data.tournament_id]
    );

    const tournamentPools = useMemo(() => {
        if (!selectedTournament?.pools) return [];
        return selectedTournament.pools;
    }, [selectedTournament]);

    const tournamentTeamIds = useMemo(() => {
        if (!tournamentPools.length) return [];
        const ids = tournamentPools.flatMap((p) => (p.teams || []).map((team) => team.id));
        return Array.from(new Set(ids));
    }, [tournamentPools]);

    const filteredTeams = useMemo(() => {
        if (data.tournament_id) {
            return teamList.filter((team) => tournamentTeamIds.includes(team.id));
        }
        return teamList;
    }, [teamList, tournamentTeamIds, data.tournament_id]);

    useEffect(() => {
        if (selectedTournament?.venue) {
            setData('venue', selectedTournament.venue);
        }
    }, [selectedTournament, setData]);

    useEffect(() => {
        if (!filteredTeams.find((t) => `${t.id}` === `${data.home_team_id}`)) {
            setData('home_team_id', '');
        }
        if (!filteredTeams.find((t) => `${t.id}` === `${data.away_team_id}`)) {
            setData('away_team_id', '');
        }
    }, [filteredTeams, data.home_team_id, data.away_team_id, setData]);

    const rosterFor = (teamId) => teamList.find((t) => `${t.id}` === `${teamId}`);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Create Match" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl space-y-6">
                    <header className="space-y-2">
                        <h1 className="text-2xl font-semibold text-gray-900">New Match</h1>
                        <p className="text-sm text-gray-600">Pick registered teams and set match timing.</p>
                    </header>

                    <form onSubmit={submit} className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <TeamSelect
                                label="Home Team"
                                value={data.home_team_id}
                                onChange={(val) => setData('home_team_id', val)}
                                teams={filteredTeams}
                                error={errors.home_team_id}
                            />
                            <TeamSelect
                                label="Away Team"
                                value={data.away_team_id}
                                onChange={(val) => setData('away_team_id', val)}
                                teams={filteredTeams}
                                error={errors.away_team_id}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tournament (optional)</label>
                                <select
                                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                                    value={data.tournament_id}
                                    onChange={(e) => {
                                        setData((prev) => ({
                                            ...prev,
                                            tournament_id: e.target.value,
                                            tournament_pool_id: '',
                                            game_type: e.target.value ? 'pool' : 'friendly',
                                        }));
                                    }}
                                >
                                    <option value="">No tournament</option>
                                    {tournamentList.map((tournament) => (
                                        <option key={tournament.id} value={tournament.id}>
                                            {tournament.title}
                                        </option>
                                    ))}
                                </select>
                                {errors.tournament_id && <p className="mt-1 text-xs text-red-600">{errors.tournament_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Game Type</label>
                                <select
                                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                                    value={data.game_type}
                                    onChange={(e) => setData('game_type', e.target.value)}
                                >
                                    {Object.entries(gameTypes).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                                {errors.game_type && <p className="mt-1 text-xs text-red-600">{errors.game_type}</p>}
                            </div>
                            {tournamentPools.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Pool (optional)</label>
                                    <select
                                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                                        value={data.tournament_pool_id}
                                        onChange={(e) => setData('tournament_pool_id', e.target.value)}
                                    >
                                        <option value="">No specific pool</option>
                                        {tournamentPools.map((pool) => (
                                            <option key={pool.id} value={pool.id}>
                                                Pool {pool.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.tournament_pool_id && <p className="mt-1 text-xs text-red-600">{errors.tournament_pool_id}</p>}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Venue</label>
                                <input
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    value={data.venue}
                                    onChange={(e) => setData('venue', e.target.value)}
                                    required
                                />
                                {errors.venue && <p className="mt-1 text-xs text-red-600">{errors.venue}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Excerpt (public)</label>
                                <input
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    value={data.excerpt}
                                    onChange={(e) => setData('excerpt', e.target.value)}
                                    placeholder="Short public summary"
                                />
                                {errors.excerpt && <p className="mt-1 text-xs text-red-600">{errors.excerpt}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Match Date</label>
                                    <input
                                        type="date"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                        value={data.game_date}
                                        min={todayStr()}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const min = todayStr();
                                            setData('game_date', val && val >= min ? val : min);
                                        }}
                                        required
                                    />
                                    {errors.game_date && <p className="mt-1 text-xs text-red-600">{errors.game_date}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Match Time</label>
                                    <input
                                        type="time"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                        value={data.game_time}
                                        onChange={(e) => setData('game_time', e.target.value)}
                                        required
                                    />
                                    {errors.game_time && <p className="mt-1 text-xs text-red-600">{errors.game_time}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Sessions</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    value={data.sessions}
                                    onChange={(e) => setData('sessions', Number(e.target.value))}
                                >
                                    {sessionOptions.map((value) => (
                                        <option key={value} value={value}>
                                            {value}
                                        </option>
                                    ))}
                                </select>
                                {errors.sessions && <p className="mt-1 text-xs text-red-600">{errors.sessions}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Session Duration (min)</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    value={data.session_duration_minutes}
                                    onChange={(e) => setData('session_duration_minutes', e.target.value)}
                                />
                                {errors.session_duration_minutes && (
                                    <p className="mt-1 text-xs text-red-600">{errors.session_duration_minutes}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Timer Mode</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    value={data.timer_mode}
                                    onChange={(e) => setData('timer_mode', e.target.value)}
                                >
                                    <option value="ASC">Ascending</option>
                                    <option value="DESC">Descending</option>
                                </select>
                                {errors.timer_mode && <p className="mt-1 text-xs text-red-600">{errors.timer_mode}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Sport Type</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    value={data.sport_type}
                                    onChange={(e) => setData('sport_type', e.target.value)}
                                >
                                    {Object.entries(sportsOptions).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                                {errors.sport_type && <p className="mt-1 text-xs text-red-600">{errors.sport_type}</p>}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                id="continue_timer_on_goal"
                                name="continue_timer_on_goal"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-green-500"
                                checked={data.continue_timer_on_goal}
                                onChange={(e) => setData('continue_timer_on_goal', e.target.checked)}
                            />
                            <label htmlFor="continue_timer_on_goal" className="text-sm text-gray-700">
                                Continue running timer when goals or penalties are recorded
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Game Officials (optional)</label>
                            <input
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                value={data.game_officials}
                                onChange={(e) => setData('game_officials', e.target.value)}
                                placeholder="e.g., Ref: Alex / Umpires: Pat, Lee"
                            />
                            {errors.game_officials && <p className="mt-1 text-xs text-red-600">{errors.game_officials}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Notes (admin only, optional)</label>
                            <textarea
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Internal notes"
                            />
                            {errors.notes && <p className="mt-1 text-xs text-red-600">{errors.notes}</p>}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <RosterPreview title="Home Roster" team={rosterFor(data.home_team_id)} />
                            <RosterPreview title="Away Roster" team={rosterFor(data.away_team_id)} />
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                                Matches can only start when browser time matches the scheduled time (enforced on the summary screen).
                            </p>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-green-300"
                            >
                                {processing ? 'Saving...' : 'Save & Continue'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

const TeamSelect = ({ label, value, onChange, teams, error }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <select
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            required
        >
            <option value="">Select team</option>
            {teams.map((team) => (
                <option key={team.id} value={team.id}>
                    {team.name} {team.club ? `/ ${team.club.name}` : ''}
                </option>
            ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);

const RosterPreview = ({ title, team }) => {
    if (!team) {
        return (
            <div className="rounded-md border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                <p className="font-semibold text-gray-700">{title}</p>
                <p>Select a team to preview the registered lineup.</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border border-gray-100 bg-gray-50 p-4">
            <div className="mb-2 flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-gray-800">{title}</p>
                    <p className="text-xs text-gray-600">{team.name}</p>
                </div>
                <span className="rounded-full bg-green-100 px-3 py-1 text-[11px] font-semibold uppercase text-green-700">
                    {team.players?.length ?? 0} players
                </span>
            </div>
            {team.players && team.players.length > 0 ? (
                <ul className="space-y-1 text-sm text-gray-700">
                    {team.players.map((player) => (
                        <li key={player.id} className="flex items-center justify-between rounded bg-white px-2 py-1">
                            <span className="flex items-center gap-2">
                                <span className="rounded bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                                    {player.shirt_number ?? '—'}
                                </span>
                                <span>{player.name}</span>
                            </span>
                            {!player.is_active && <span className="text-[11px] font-semibold uppercase text-amber-600">Inactive</span>}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-500">No players registered for this team.</p>
            )}
        </div>
    );
};
