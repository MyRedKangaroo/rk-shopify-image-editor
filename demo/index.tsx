import ReactDOM from 'react-dom/client';
import React from 'react';
import App from './App';
import axios from 'axios';
import * as Sentry from '@sentry/react';
import * as FullStory from '@fullstory/browser';
import { v4 } from 'uuid';

if (import.meta.env.MODE !== 'development') {
    Sentry.init({
        dsn: 'https://863e40f76e55a3069746b3a0326062a4@o4505696852967424.ingest.sentry.io/4505696854933504',
        integrations: [
            new Sentry.BrowserTracing({
                // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
                tracePropagationTargets: ['localhost'],
            }),
            new Sentry.Replay(),
        ],
    });
    let uid = window.localStorage.getItem('uid');
    if (!uid) {
        uid = v4();
        window.localStorage.setItem('uid', uid);
    }
    Sentry.setUser({ id: uid });
    FullStory.identify(uid);
}
axios.defaults.baseURL = 'https://api-gilt-one.vercel.app/';
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
