/// <reference types="vite/client" />

declare const APP_VERSION: string;

import 'react-router';
declare module 'react-router' {
	interface AppLoadContext {
		// add context properties here
	}
}
