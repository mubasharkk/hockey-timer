import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Combobox } from '@headlessui/react';

const sessionOptions = [2, 4, 6, 8];
const durationOptions = [15, 20, 30, 45];
const todayStr = () => new Date().toISOString().slice(0, 10);

const teamPresets = [
    {
        name: 'Lions',
        players: `1 Alex Keeper
2 Ben Stone
3 Chris Field
4 Daniel Swift
5 Ethan Hart`,
    },
    {
        name: 'Tigers',
        players: `7 Omar Khan
8 Priya Das
9 Quinn Lee
10 Raj Patel
11 Sara King`,
    },
    {
        name: 'Wolves',
        players: `4 Jamie Cole
6 Leo Park
12 Mia Grant
14 Noah Reed
18 Zoe Kim`,
    },
];

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        team_a_name: '',
        team_b_name: '',
        venue: '',
        game_date: todayStr(),
        game_time: '',
        sessions: 4,
        session_duration_minutes: 15,
        timer_mode: 'DESC',
        team_a_players_text: '',
        team_b_players_text: '',
    });

    const handleTeamSelection = (side, value) => {
        setData(side === 'A' ? 'team_a_name' : 'team_b_name', value);
        const preset = teamPresets.find((p) => p.name.toLowerCase() === value.toLowerCase());
        if (preset) {
            setData(side === 'A' ? 'team_a_players_text' : 'team_b_players_text', preset.players);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('games.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Create Match" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8">
                    <header className="space-y-2">
                        <h1 className="text-2xl font-semibold text-gray-900">New Match</h1>
                        <p className="text-sm text-gray-600">Capture match details, sessions, and optional player lists.</p>
                    </header>

                    <datalist id="team-presets">
                        {teamPresets.map((preset) => (
                            <option key={preset.name} value={preset.name} />
                        ))}
                    </datalist>

                    <form onSubmit={submit} className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <TeamCombobox
                                label="Team A Name"
                                value={data.team_a_name}
                                onChange={(val) => handleTeamSelection('A', val)}
                                error={errors.team_a_name}
                            />
                            <TeamCombobox
                                label="Team B Name"
                                value={data.team_b_name}
                                onChange={(val) => handleTeamSelection('B', val)}
                                error={errors.team_b_name}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Venue</label>
                                <input
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.venue}
                                    onChange={(e) => setData('venue', e.target.value)}
                                    required
                                />
                                {errors.venue && <p className="mt-1 text-xs text-red-600">{errors.venue}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Match Date</label>
                                <input
                                    type="date"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.game_time}
                                        onChange={(e) => setData('game_time', e.target.value)}
                                        required
                                    />
                                    {errors.game_time && <p className="mt-1 text-xs text-red-600">{errors.game_time}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Sessions</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.session_duration_minutes}
                                    onChange={(e) => setData('session_duration_minutes', Number(e.target.value))}
                                >
                                    {durationOptions.map((value) => (
                                        <option key={value} value={value}>
                                            {value} minutes
                                        </option>
                                    ))}
                                </select>
                                {errors.session_duration_minutes && (
                                    <p className="mt-1 text-xs text-red-600">{errors.session_duration_minutes}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Timer Mode</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.timer_mode}
                                    onChange={(e) => setData('timer_mode', e.target.value)}
                                >
                                    <option value="ASC">Ascending</option>
                                    <option value="DESC">Descending</option>
                                </select>
                                {errors.timer_mode && <p className="mt-1 text-xs text-red-600">{errors.timer_mode}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <div className=" items-center justify-between">
                                    <label className="block text-sm font-medium text-gray-700">Team A Players (optional)</label>
                                    <span className="text-xs text-gray-500">One per line. Prefix number to capture shirt #.</span>
                                </div>
                                <textarea
                                    rows={6}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.team_a_players_text}
                                    onChange={(e) => setData('team_a_players_text', e.target.value)}
                                />
                                {errors.team_a_players_text && (
                                    <p className="mt-1 text-xs text-red-600">{errors.team_a_players_text}</p>
                                )}
                            </div>
                            <div>
                                <div className=" items-center justify-between">
                                    <label className="block text-sm font-medium text-gray-700">Team B Players (optional)</label>
                                    <span className="text-xs text-gray-500">Example: “12 Alex Smith”.</span>
                                </div>
                                <textarea
                                    rows={6}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.team_b_players_text}
                                    onChange={(e) => setData('team_b_players_text', e.target.value)}
                                />
                                {errors.team_b_players_text && (
                                    <p className="mt-1 text-xs text-red-600">{errors.team_b_players_text}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                            Matches can only start when browser time matches the scheduled time (enforced on the summary screen).
                            </p>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
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

const TeamCombobox = ({ label, value, onChange, error }) => {
    const filtered =
        value.trim() === ''
            ? teamPresets
            : teamPresets.filter((preset) => preset.name.toLowerCase().includes(value.toLowerCase()));

    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <Combobox value={value} onChange={onChange}>
                <div className="relative">
                    <Combobox.Input
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                        onChange={(event) => onChange(event.target.value)}
                        displayValue={(val) => val}
                        required
                    />
                    {filtered.length > 0 && (
                        <Combobox.Options className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
                            {filtered.map((preset) => (
                                <Combobox.Option
                                    key={preset.name}
                                    value={preset.name}
                                    className={({ active }) =>
                                        `cursor-pointer px-3 py-2 text-sm ${active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-800'}`
                                    }
                                >
                                    {preset.name}
                                </Combobox.Option>
                            ))}
                        </Combobox.Options>
                    )}
                </div>
            </Combobox>
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    );
};
