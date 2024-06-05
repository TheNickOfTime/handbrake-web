/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import { DirectoryTree } from 'directory-tree';
import { PrimaryOutletContextType } from '../../../pages/primary/primary-context';

import { QueueRequest } from '../../../../../types/queue';
import SectionOverlay from '../../section/section-overlay';
import ButtonGroup from '../../base/inputs/button-group/button-group';
import CreateJobFile from './forms/create-job-file';
import CreateJobFolder from './forms/create-job-folder';
import './create-job.scss';

type Params = {
	socket: Socket;
	onClose: () => void;
};

enum JobFrom {
	FromFile,
	FromDirectory,
}

export default function CreateJob({ socket, onClose }: Params) {
	const [tree, setTree] = useState<null | DirectoryTree>(null);
	const [jobFrom, setJobFrom] = useState(JobFrom.FromFile);
	const [inputPath, setInputPath] = useState('');
	const [outputPath, setOutputPath] = useState('');
	// const [requests, setRequests] = useState<QueueRequest[]>([]);
	const { presets } = useOutletContext<PrimaryOutletContextType>();
	const [preset, setPreset] = useState('');
	const [fileExtension, setFileExtension] = useState('.mkv');

	const onGetDirectoryTree = (tree: DirectoryTree) => {
		setTree(tree);
	};

	useEffect(() => {
		socket.on('get-directory-tree', onGetDirectoryTree);

		return () => {
			socket.off('get-directory-tree', onGetDirectoryTree);
		};
	}, []);

	useEffect(() => {
		socket.emit('get-directory-tree');
	}, []);

	const handleCancel = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();
		onClose();
	};

	const handleSubmit = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();

		const request: QueueRequest = {
			input: inputPath,
			output: outputPath,
			preset: preset,
		};
		socket.emit('add-to-queue', request);
		console.log(`[client] New job sent to the server.`);
		console.log(request);
		onClose();
	};

	return (
		<SectionOverlay id='create-new-job'>
			<h1>Create New Job</h1>
			<ButtonGroup>
				<button
					className={jobFrom == JobFrom.FromFile ? 'selected' : ''}
					onClick={() => setJobFrom(JobFrom.FromFile)}
				>
					<i className='bi bi-file-earmark-fill' />
					<span>From File (Single)</span>
				</button>
				<button
					className={jobFrom == JobFrom.FromDirectory ? 'selected' : ''}
					onClick={() => setJobFrom(JobFrom.FromDirectory)}
				>
					<i className='bi bi-folder-fill' />
					<span>From Folder (Bulk)</span>
				</button>
			</ButtonGroup>
			{jobFrom == JobFrom.FromFile && (
				<CreateJobFile
					tree={tree!}
					input={inputPath}
					setInput={setInputPath}
					output={outputPath}
					setOutput={setOutputPath}
					presets={presets}
					preset={preset}
					setPreset={setPreset}
					fileExtension={fileExtension}
					setFileExtension={setFileExtension}
					handleCancel={handleCancel}
					handleSubmit={handleSubmit}
				/>
			)}
			{/* {jobFrom == JobFrom.FromDirectory && (
				<CreateJobFolder
					tree={tree!}
					presets={presets}
					input={input}
					output={output}
					preset={preset}
					handleFileSelect={handleFileSelect}
					handlePresetChange={handlePresetChange}
					handleCancel={handleCancel}
					handleSubmit={handleSubmit}
				/>
			)} */}
		</SectionOverlay>
	);
}
