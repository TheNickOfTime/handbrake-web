import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { GithubReleaseResponseType } from 'types/version';
import './version-info.scss';

type Params = {
	socket: Socket;
};

export default function VersionInfo({ socket }: Params) {
	const [currentVersion, setCurrentVersion] = useState<GithubReleaseResponseType | null>(null);
	const [latestVersion, setLatestVersion] = useState<GithubReleaseResponseType | null>(null);

	const getCurrentVersionInfo = async () => {
		const info: GithubReleaseResponseType | null = await socket.emitWithAck(
			'get-current-version-info'
		);
		console.log(info ? info.name : info);
		setCurrentVersion(info);
	};

	const getLatestVersionInfo = async () => {
		const info: GithubReleaseResponseType | null = await socket.emitWithAck(
			'get-latest-version-info'
		);
		console.log(info ? info.name : info);
		setLatestVersion(info);
	};

	useEffect(() => {
		(async () => {
			if (socket.connected) {
				await getCurrentVersionInfo();
				await getLatestVersionInfo();
			}
		})();
	}, [socket.connected]);

	return (
		<div className='version-info'>
			{currentVersion ? (
				<a className='current-version' href={currentVersion.html_url} target='_blank'>
					{currentVersion.name}
				</a>
			) : (
				<span className='current-version'>v{APP_VERSION}</span>
			)}
			{latestVersion && (
				<a className='latest-version' href={latestVersion.html_url} target='_blank'>
					<i className='bi bi-exclamation-circle-fill' />
					<span className='version'>{latestVersion.name}</span>
					<span> Update Available</span>
				</a>
			)}
		</div>
	);
}
