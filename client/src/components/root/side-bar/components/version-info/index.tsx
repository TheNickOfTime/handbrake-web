import { ConfigType } from '@handbrake-web/shared/types/config';
import { GithubReleaseResponseType } from '@handbrake-web/shared/types/version';
import WarningIcon from '@icons/exclamation-circle.svg?react';
import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import styles from './styles.module.scss';

type Params = {
	socket: Socket;
	config: ConfigType | undefined;
};

export default function VersionInfo({ socket, config }: Params) {
	const [currentVersion, setCurrentVersion] = useState<GithubReleaseResponseType | null>(null);
	const [latestVersion, setLatestVersion] = useState<GithubReleaseResponseType | null>(null);

	const getCurrentVersionInfo = async () => {
		const info: GithubReleaseResponseType | null = await socket.emitWithAck(
			'get-current-version-info'
		);
		// console.log(info ? info.name : info);
		setCurrentVersion(info);
	};

	const getLatestVersionInfo = async () => {
		const info: GithubReleaseResponseType | null = await socket.emitWithAck(
			'get-latest-version-info'
		);
		// console.log(info ? info.name : info);
		setLatestVersion(info);
	};

	useEffect(() => {
		(async () => {
			if (socket.connected) {
				await getCurrentVersionInfo();

				if (config && config.application['update-check-interval'] != 0) {
					await getLatestVersionInfo();
				}
			}
		})();
	}, [socket.connected]);

	return (
		<div className={styles['version-info']}>
			{currentVersion ? (
				<a
					className={styles['current-version']}
					href={currentVersion.html_url}
					target='_blank'
				>
					{currentVersion.name}
				</a>
			) : (
				<span className={styles['current-version']}>v{APP_VERSION}</span>
			)}
			{latestVersion && (
				<a
					className={styles['latest-version']}
					href={latestVersion.html_url}
					target='_blank'
				>
					<WarningIcon />
					<span className='version'>{latestVersion.name}</span>
					<span> Update Available</span>
				</a>
			)}
		</div>
	);
}
