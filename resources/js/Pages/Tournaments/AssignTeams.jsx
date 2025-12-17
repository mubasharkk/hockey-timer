import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRandom, faSave } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';

export default function AssignTeams({ auth, tournament, teams = [] }) {
    const currentTournament = tournament?.data ?? tournament;
    const pools = currentTournament.pools || [];
    const teamList = Array.isArray(teams) ? teams : teams?.data || [];
    const initialPools = pools.reduce((acc, pool) => {
        acc[pool.id] = (pool.teams || []).map((t) => t.id);
        return acc;
    }, {});

    const { data, setData, post, processing, errors } = useForm({
        randomize: false,
        pools: initialPools,
        team_ids: [],
    });

    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (!data.randomize) return;
        const selected = Object.values(data.pools || {}).flat();
        setData('team_ids', selected);
    }, [data.randomize]); // eslint-disable-line react-hooks/exhaustive-deps

    const teamOptions = useMemo(
        () => teamList.map((team) => ({ value: team.id, label: team.name })),
        [teamList]
    );

    const handlePoolChange = (poolId, selectedIds) => {
        setData('pools', { ...data.pools, [poolId]: selectedIds });
    };

    const submit = (e) => {
        e.preventDefault();
        setMessage(null);
        post(route('tournaments.pools.teams.update', currentTournament.id), {
            onError: () => setMessage('Please resolve the validation errors below.'),
        });
    };

    const handleRandom = () => {
        const allTeamIds = teamList.map((t) => t.id);
        setData({
            ...data,
            randomize: true,
            team_ids: allTeamIds,
        });
        setMessage('Teams will be randomly and evenly distributed across pools on save.');
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Assign Teams to Pools" />
            <div className="py-8">
                <div className="mx-auto max-w-5xl space-y-6 sm:px-6 lg:px-8">
                    <header className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Pools</p>
                        <h1 className="text-2xl font-semibold text-gray-900">Assign Teams to {currentTournament.title}</h1>
                        <p className="text-sm text-gray-600">
                            Minimum 4 teams required; teams must be evenly split across {pools.length} pool(s).
                        </p>
                    </header>

                    <form onSubmit={submit} className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={handleRandom}
                                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                            >
                                <FontAwesomeIcon icon={faRandom} className="h-4 w-4" />
                                Randomly distribute all teams
                            </button>
                            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={data.randomize}
                                    onChange={(e) => setData('randomize', e.target.checked)}
                                />
                                Randomize on save
                            </label>
                        </div>
                        {message && <div className="rounded-md bg-indigo-50 px-3 py-2 text-sm text-indigo-800">{message}</div>}
                        {errors.teams && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errors.teams}</div>}
                        {errors.pools && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errors.pools}</div>}

                        {data.randomize && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Teams to randomize</label>
                                <Select
                                    isMulti
                                    options={teamOptions}
                                    value={teamOptions.filter((opt) => data.team_ids?.includes(opt.value))}
                                    onChange={(options) => setData('team_ids', (options || []).map((o) => o.value))}
                                    classNamePrefix="rs"
                                />
                                {errors.team_ids && <p className="mt-1 text-xs text-red-600">{errors.team_ids}</p>}
                            </div>
                        )}

                        {!data.randomize &&
                            pools.map((pool) => (
                                <PoolSelect
                                    key={pool.id}
                                    pool={pool}
                                    value={data.pools?.[pool.id] || []}
                                    onChange={(ids) => handlePoolChange(pool.id, ids)}
                                    options={teamOptions}
                                />
                            ))}

                        <div className="flex items-center justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
                            >
                                <FontAwesomeIcon icon={faSave} className="h-4 w-4" />
                                {processing ? 'Saving...' : 'Save Assignments'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

const PoolSelect = ({ pool, value, onChange, options }) => (
    <div className="rounded-md border border-gray-200 p-4">
        <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-800">Pool {pool.name}</p>
            <span className="text-xs text-gray-500">{value.length} selected</span>
        </div>
        <Select
            isMulti
            options={options}
            value={options.filter((opt) => value.includes(opt.value))}
            onChange={(opts) => onChange((opts || []).map((o) => o.value))}
            classNamePrefix="rs"
        />
    </div>
);
