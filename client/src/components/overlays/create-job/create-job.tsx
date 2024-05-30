/* eslint-disable react-hooks/exhaustive-deps */

import { DirectoryTree } from 'directory-tree';
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Socket } from 'socket.io-client';

import { PrimaryOutletContextType } from '../../../pages/primary/primary-context';
import PathInput from '../../base/inputs/path/path-input';
import ButtonInput from '../../base/inputs/button/button-input';
import { QueueRequest } from '../../../../../types/queue';
import './create-job.scss';

type Params = {
	socket: Socket;
	onClose: () => void;
};

export default function CreateJob({ socket, onClose }: Params) {
	const { presets } = useOutletContext<PrimaryOutletContextType>();

	const [tree, setTree] = useState<null | DirectoryTree>(null);
	const [input, setInput] = useState('');
	const [output, setOutput] = useState('');
	const [preset, setPreset] = useState('');
	const [fileExtension] = useState('.mkv');

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

	const handleFileSelect = (file: string) => {
		setInput(file);

		const fileExtensionRegEx = /(\.[\w\d]+)$/;
		const outputFile = file.replace(fileExtensionRegEx, fileExtension);
		setOutput(outputFile);
	};

	const handlePresetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setPreset(event.target.value);
	};

	const handleCancel = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();
		onClose();
	};

	const handleSubmit = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();
		const request: QueueRequest = {
			input: input,
			output: output,
			preset: preset,
		};
		socket.emit('add-to-queue', request);
		onClose();
	};

	return (
		<div className='create-job'>
			<div className='create-job-window'>
				<h1>Create New Job</h1>
				<form>
					<PathInput
						id='input-path'
						label='Input Path: '
						tree={tree}
						value={input}
						setValue={handleFileSelect}
					/>
					<div className='output-path-section'>
						<label htmlFor='output-path'>Output Path: </label>
						<input type='text' id='output-path' value={output} disabled />
					</div>
					<div className='preset-section'>
						<label htmlFor='preset-select'>Preset:</label>
						<select id='preset-select' value={preset} onChange={handlePresetChange}>
							<option value=''>N/A</option>
							{Object.keys(presets).map((preset) => (
								<option value={preset}>{preset}</option>
							))}
						</select>
					</div>
					<div className='buttons-section'>
						<ButtonInput label='Cancel' color='red' onClick={handleCancel} />
						<ButtonInput
							label='Submit'
							color='green'
							disabled={!(input && output && preset)}
							onClick={handleSubmit}
						/>
					</div>
				</form>
			</div>
		</div>
	);
}
