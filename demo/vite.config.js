import { sentryVitePlugin } from '@sentry/vite-plugin';
import { ViteEjsPlugin } from 'vite-plugin-ejs';
import { compilerOptions } from '../tsconfig.json';
import { resolve } from 'path';

const alias = Object.entries(compilerOptions.paths).reduce((acc, [key, [dist, src]]) => {
    return {
        ...acc,
        [key]: resolve(__dirname, '../', src),
    };
}, {});

export default {
    server: {
        host: 'localhost',
    },
    resolve: {
        alias,
    },
    plugins: [
        ViteEjsPlugin(),
        sentryVitePlugin({
            org: 'liquid-editor',
            project: 'liquid-editor-demo',
        }),
    ],
};
