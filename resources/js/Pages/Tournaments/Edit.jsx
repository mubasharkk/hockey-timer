import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';

export default function Edit({ auth, tournament }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        title: tournament.title || '',
        slug: tournament.slug || '',
        venue: tournament.venue || '',
        start_date: formatDateForInput(tournament.start_date),
        end_date: formatDateForInput(tournament.end_date),
        win_points: tournament.win_points ?? 3,
        draw_points: tournament.draw_points ?? 1,
        loss_points: tournament.loss_points ?? 0,
        pools_count: tournament.pools?.length || 1,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('tournaments.update', tournament.id));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Edit Tournament" />
            <div className="py-8">
                <div className="mx-auto max-w-3xl space-y-6 sm:px-6 lg:px-8">
                    <header className="space-y-2">
                        <h1 className="text-2xl font-semibold text-gray-900">Edit Tournament</h1>
                        <p className="text-sm text-gray-600">Update the tournament details and points system.</p>
                    </header>

                    <form onSubmit={submit} className="space-y-5 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <input
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                required
                            />
                            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Slug (optional)</label>
                            <input
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.slug}
                                onChange={(e) => setData('slug', e.target.value)}
                                placeholder="auto-generated if left blank"
                            />
                            {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug}</p>}
                        </div>
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

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                <input
                                    type="date"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                    required
                                />
                                {errors.start_date && <p className="mt-1 text-xs text-red-600">{errors.start_date}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">End Date (optional)</label>
                                <input
                                    type="date"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                    min={data.start_date || undefined}
                                />
                                {errors.end_date && <p className="mt-1 text-xs text-red-600">{errors.end_date}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <NumberField
                                label="Win Points"
                                value={data.win_points}
                                onChange={(val) => setData('win_points', val)}
                                error={errors.win_points}
                            />
                            <NumberField
                                label="Draw Points"
                                value={data.draw_points}
                                onChange={(val) => setData('draw_points', val)}
                                error={errors.draw_points}
                            />
                            <NumberField
                                label="Loss Points"
                                value={data.loss_points}
                                onChange={(val) => setData('loss_points', val)}
                                error={errors.loss_points}
                            />
                            <NumberField
                                label="Number of Pools (optional)"
                                value={data.pools_count}
                                onChange={(val) => setData('pools_count', val)}
                                error={errors.pools_count}
                            />
                        </div>

                        <div className="flex items-center justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
                            >
                                <FontAwesomeIcon icon={faSave} className="h-4 w-4" />
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

const NumberField = ({ label, value, onChange, error }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            type="number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            min={0}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);

function formatDateForInput(date) {
    if (!date) return '';
    const d = moment(date);
    return d.isValid() ? d.format('YYYY-MM-DD') : '';
}
