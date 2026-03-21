import { createInertiaApp } from '@inertiajs/react'
import { renderToString } from 'react-dom/server'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'

const appName = import.meta.env.VITE_APP_NAME || 'Laravel'

export default async function render(page) {
    return createInertiaApp({
        page,
        render: renderToString,
        title: (title) => `${title} - ${appName}`,
        resolve: (name) =>
            resolvePageComponent(
                `./Pages/${name}.jsx`,
                import.meta.glob('./Pages/**/*.jsx')
            ),
        setup: ({ App, props }) => <App {...props} />,
    })
}
