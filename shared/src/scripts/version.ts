import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cwd } from 'node:process';

export function GetApplicationVersion(): string {
	return JSON.parse(readFileSync(resolve(cwd(), 'package.json'), { encoding: 'utf-8' })).version;
}
