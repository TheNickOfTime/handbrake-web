import { compare } from 'compare-versions';
import { access, readFile, rm, writeFile } from 'fs/promises';
import logger from 'logging';
import path from 'path';
import { GithubReleaseResponseType } from 'types/version';
import { GetStatusFromDatabase, UpdateStatusInDatabase } from './database/database-status';
import { GetConfig } from './config';
import { dataPath } from './data';

const currentVersion = 'v' + process.env.npm_package_version!;

const currentReleaseInfoPath = path.join(dataPath, 'version-info.json');
const latestReleaseInfoPath = path.join(dataPath, 'update-info.json');

let currentReleaseInfo: GithubReleaseResponseType | null = null;
let latestReleaseInfo: GithubReleaseResponseType | null = null;

export async function CheckForVersionUpdate() {
	if ((process.env.NODE_ENV = 'development' || process.env.NODE_ENV == undefined)) {
		logger.info(
			`[version] The environment is set to development, skipping lastest release info query.`
		);
		return;
	}

	const checkIntervalHours = GetConfig().version['check-interval'];
	if (checkIntervalHours == 0) {
		logger.info(`[version] The check-interval is set to 0, update checking is disabled.`);
		return;
	}

	const lastCheck = GetStatusFromDatabase('last-version-update-check')?.state || 0;
	const now = Date.now();
	const timeSinceLastCheck = now - lastCheck;
	const timeSinceLastCheckHours = Math.floor(timeSinceLastCheck / 1000 / 60 / 60);

	if (lastCheck != 0 && timeSinceLastCheckHours < checkIntervalHours) {
		logger.info(
			`[version] It has been less than the configured ${checkIntervalHours} hours since the last version check, update query.`
		);

		const updateInfo = await ReadReleaseInfo(latestReleaseInfoPath);
		if (updateInfo) {
			console.log(updateInfo.name);
			if (compare(updateInfo.name, currentVersion, '>')) {
				latestReleaseInfo = updateInfo;
			} else {
				await RemoveReleaseInfo(latestReleaseInfoPath);
				latestReleaseInfo = null;
				logger.info(
					`[verison] The stored update-info is now out of date with the current application and will be removed.`
				);
			}
		}

		return;
	}

	try {
		logger.info(`[version] Checking if there is an application update...`);

		const latestReleaseURL =
			'https://api.github.com/repos/thenickoftime/handbrake-web/releases/latest';

		// Fetch latest release information, timeout occurs after 5 seconds
		const abortController = new AbortController();
		const timeout = setTimeout(() => abortController.abort(), 5000);
		const request = await fetch(latestReleaseURL, { signal: abortController.signal });
		clearTimeout(timeout);
		const response: GithubReleaseResponseType = await request.json();

		const latestVersion = response.name;

		const isValidRelease = !response.draft && !response.prerelease;
		const versionComparison = compare(currentVersion, latestVersion, '<');

		if (isValidRelease && versionComparison) {
			logger.warn(
				`[version] An application update is available to '${latestVersion}' (current version is '${currentVersion}').`
			);
			logger.warn(
				`[version] See the release notes for '${latestVersion}' at '${response.html_url}'.`
			);
			latestReleaseInfo = response;
			await WriteReleaseInfo(latestReleaseInfoPath, response);
		} else {
			logger.info(`[version] The application is up to date.`);
			await RemoveReleaseInfo(latestReleaseInfoPath);
		}

		UpdateStatusInDatabase('last-version-update-check', Date.now());
	} catch (error) {
		logger.error(`[version] An error occurred while checking for the latest version.`);
		console.error(error);
	}
}

export async function GetLatestReleaseInfo() {
	await CheckForVersionUpdate();
	return latestReleaseInfo;
}

export async function GetCurrentReleaseInfo() {
	if ((process.env.NODE_ENV = 'development' || process.env.NODE_ENV == undefined)) {
		logger.info(
			`[version] The environment is set to development, skipping current release info query.`
		);
		await RemoveReleaseInfo(currentReleaseInfoPath);
		return null;
	}

	if (currentReleaseInfo) return currentReleaseInfo;

	try {
		await access(currentReleaseInfoPath);

		const info = (await ReadReleaseInfo(currentReleaseInfoPath))!;
		currentReleaseInfo = info;

		if (compare(info.name, currentVersion, '=')) {
			return currentReleaseInfo;
		} else {
			logger.info(
				`[version] Release information about the current version is outdated. Fetching information about '${currentVersion}' from GitHub.`
			);
		}
	} catch (error) {
		const parsedPath = path.parse(currentReleaseInfoPath);
		logger.info(
			`[version] The file '${parsedPath}' does not exist. Fetching the information about '${currentVersion}' from github...`
		);
	}

	try {
		const currentReleaseURL = `https://api.github.com/repos/thenickoftime/handbrake-web/releases/tags/${currentVersion}`;

		const abortController = new AbortController();
		const timeout = setTimeout(() => abortController.abort(), 5000);
		const request = await fetch(currentReleaseURL, { signal: abortController.signal });
		clearTimeout(timeout);

		if (request.status == 404) {
			logger.warn(
				`[version] Release '${currentVersion}' does not exist, or cannot be found on GitHub.`
			);

			return null;
		}

		logger.info(`[version] Fetched information about the current release.`);

		const response: GithubReleaseResponseType = await request.json();
		currentReleaseInfo = response;

		WriteReleaseInfo(currentReleaseInfoPath, response);
	} catch (error) {
		logger.error(`[version] An error occurred while fetching the current release information`);
		console.error(error);
	}

	return currentReleaseInfo;
}

async function ReadReleaseInfo(infoPath: string) {
	try {
		try {
			await access(infoPath);
		} catch {
			return null;
		}

		const releaseInfoContents = await readFile(infoPath, { encoding: 'utf-8' });
		const releaseInfoData: GithubReleaseResponseType = JSON.parse(releaseInfoContents);

		return releaseInfoData;
	} catch (error) {
		logger.error(
			`[version] An error occurred while reading release information from '${infoPath}'.`
		);
		throw error;
	}
}

async function WriteReleaseInfo(infoPath: string, info: GithubReleaseResponseType) {
	try {
		const data = JSON.stringify(info, null, 2);
		await writeFile(infoPath, data, { encoding: 'utf-8' });
		logger.info(`[version] Wrote information about the current release to '${infoPath}'.`);
	} catch (error) {
		logger.error(
			`[version] An error occurred while writing current release information to '${infoPath}'.`
		);
		throw error;
	}
}

async function RemoveReleaseInfo(infoPath: string) {
	try {
		await access(infoPath);

		try {
			await rm(infoPath);
		} catch (error) {
			logger.error(
				`[version] An error occurred while removing the release information file '${infoPath}'.`
			);
		}
	} catch {
		// Do nothing if the path doesn't exist
	}
}
