import { Head, Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import PublicLayout from '@/Layouts/PublicLayout.jsx';

function CodeBlock({ children }) {
    return (
        <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-green-300">
            <code>{children}</code>
        </pre>
    );
}

function Section({ title, children }) {
    return (
        <div className="mb-10">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">{title}</h2>
            {children}
        </div>
    );
}

function AttrRow({ name, type, defaultVal, description }) {
    return (
        <tr className="border-b border-gray-100">
            <td className="py-2 pr-4 font-mono text-sm text-blue-700">{name}</td>
            <td className="py-2 pr-4 text-sm text-gray-500">{type}</td>
            <td className="py-2 pr-4 font-mono text-sm text-gray-400">{defaultVal}</td>
            <td className="py-2 text-sm text-gray-600">{description}</td>
        </tr>
    );
}

export default function Widget() {
    const { appUrl } = usePage().props;

    return (
        <PublicLayout>
            <Head title="Widget Documentation" />
            <div className="flex min-h-screen flex-col">
                <div className="flex-1 py-12">
                    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

                        <div className="text-center">
                            <Link href="/">
                                <ApplicationLogo className="mx-auto h-48" />
                            </Link>
                        </div>

                        <div className="rounded-lg bg-white p-8 shadow-sm">
                            <h1 className="mb-2 text-3xl font-bold text-gray-900">Tournament Widget</h1>
                            <p className="mb-8 text-gray-500">
                                Embed live tournament standings, matches, results and top scorers on any webpage — no framework required.
                            </p>

                            <Section title="Quick start">
                                <p className="mb-3 text-gray-600">Add the container element and script tag to any HTML page:</p>
                                <CodeBlock>{`<!-- 1. Place the widget container where you want it to appear -->
<div
    data-ha-tournament
    data-slug="your-tournament-slug"
    data-api="{appUrl}">
</div>

<!-- 2. Include the widget script (CSS is loaded automatically) -->
<script src="{appUrl}/widget/tournament.js"></script>`}
                                </CodeBlock>
                            </Section>

                            <Section title="Configuration attributes">
                                <p className="mb-3 text-gray-600">
                                    All attributes are set on the <code className="rounded bg-gray-100 px-1 font-mono text-sm">data-ha-tournament</code> element.
                                </p>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="pb-2 pr-4 text-sm font-semibold text-gray-700">Attribute</th>
                                                <th className="pb-2 pr-4 text-sm font-semibold text-gray-700">Type</th>
                                                <th className="pb-2 pr-4 text-sm font-semibold text-gray-700">Default</th>
                                                <th className="pb-2 text-sm font-semibold text-gray-700">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <AttrRow name="data-slug"         type="string" defaultVal="required" description="Tournament slug from the URL (e.g. my-tournament-2026)" />
                                            <AttrRow name="data-api"          type="string" defaultVal="required" description="Base URL of your HockeyApp instance (e.g. {appUrl})" />
                                            <AttrRow name="data-upcoming"     type="number" defaultVal="10"       description="Max number of upcoming matches to display" />
                                            <AttrRow name="data-results"      type="number" defaultVal="0"        description="Max number of recent results to display (0 = hidden)" />
                                            <AttrRow name="data-top-scorers"  type="number" defaultVal="10"       description="Max number of top scorers to display (0 = hidden)" />
                                        </tbody>
                                    </table>
                                </div>
                            </Section>

                            <Section title="Full example">
                                <CodeBlock>{`<div
    data-ha-tournament
    data-slug="ramadan-cup-2026"
    data-api="{appUrl}"
    data-upcoming="5"
    data-results="5"
    data-top-scorers="10">
</div>

<script src="{appUrl}/widget/tournament.js"></script>`}
                                </CodeBlock>
                            </Section>

                            <Section title="What the widget displays">
                                <ul className="list-inside list-disc space-y-2 text-gray-600">
                                    <li><strong>Tournament header</strong> — title, venue and date range</li>
                                    <li><strong>Points table</strong> — pool standings with team logos, MP, W, D, L, G/F, G/A, G/D, Points</li>
                                    <li><strong>Upcoming / Results tabs</strong> — match cards with team logos, score, pool/knockout badge and excerpt</li>
                                    <li><strong>Top scorers</strong> — ranked list with player name, team and goal count</li>
                                </ul>
                            </Section>

                            <Section title="Styling">
                                <p className="mb-3 text-gray-600">
                                    The widget loads <code className="rounded bg-gray-100 px-1 font-mono text-sm">tournament.css</code> automatically
                                    from the same directory as the script. All classes are prefixed with <code className="rounded bg-gray-100 px-1 font-mono text-sm">ha-</code> to avoid conflicts with your existing styles.
                                    Override any class in your own stylesheet after the widget script.
                                </p>
                                <CodeBlock>{`/* Example: change the active tab underline colour */
.ha-tab.ha-active { border-bottom-color: #e63946; color: #e63946; }

/* Example: widen the widget */
.ha-widget { max-width: 960px; }`}
                                </CodeBlock>
                            </Section>

                            <Section title="Manual initialisation">
                                <p className="mb-3 text-gray-600">
                                    If you add widget containers dynamically after page load, initialise them manually:
                                </p>
                                <CodeBlock>{`HockeyAppWidget.init(document.getElementById('my-container'));`}
                                </CodeBlock>
                            </Section>

                            <Section title="API endpoint">
                                <p className="mb-3 text-gray-600">The widget fetches data from the public REST API:</p>
                                <CodeBlock>{`GET /api/tournaments/{slug}

// Response shape:
{
  "data": {
    "tournament":   { ... },
    "pool_results": [ ... ],
    "upcoming":     [ ... ],
    "results":      [ ... ],
    "top_scorers":  [ ... ]
  }
}`}
                                </CodeBlock>
                            </Section>

                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
