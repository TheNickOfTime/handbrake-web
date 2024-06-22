/* eslint-disable react-hooks/exhaustive-deps */

import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { PrimaryOutletContextType } from '../../../pages/primary/primary-context';
import mime from 'mime';

import { QueueRequest } from '../../../../../types/queue';
import SectionOverlay from '../../section/section-overlay';
import ButtonGroup from '../../base/inputs/button-group/button-group';
import { HandbrakeOutputExtensions } from '../../../../../types/file-extensions';
import ButtonInput from '../../base/inputs/button/button-input';
import PathInput from '../../base/inputs/path/path-input';
import { FileBrowserMode } from '../../../../../types/file-browser';
import SelectInput from '../../base/inputs/select/select-input';
import TextInput from '../../base/inputs/text/text-input';
import { Directory, DirectoryItem, DirectoryItems } from '../../../../../types/directory';
import './create-job.scss';
import { HandleNameCollision } from './create-job-funcs';

type Params = {
	onClose: () => void;
};

enum JobFrom {
	FromFile,
	FromDirectory,
}

export default function CreateJob({ onClose }: Params) {
	const { presets, socket } = useOutletContext<PrimaryOutletContextType>();
	const [extensions] = useState<string[]>(Object.values(HandbrakeOutputExtensions));
	const [jobFrom, setJobFrom] = useState(JobFrom.FromFile);

	// Input -------------------------------------------------------------------
	const [inputPath, setInputPath] = useState('');
	const [inputFiles, setInputFiles] = useState<DirectoryItems>([]);

	// Output ------------------------------------------------------------------
	const [outputPath, setOutputPath] = useState('');
	const [outputFiles, setOutputFiles] = useState<DirectoryItems>([]);
	const [outputExtension, setOutputExtension] = useState(HandbrakeOutputExtensions.mkv);
	const [nameCollision, setNameCollision] = useState(false);

	// Preset ------------------------------------------------------------------
	const [preset, setPreset] = useState('');

	const requestDirectory = async (path: string) => {
		const response: Directory = await socket.emitWithAck('get-directory', path);
		return response;
	};

	const canSubmit =
		inputPath != '' &&
		inputFiles.length > 0 &&
		outputPath != '' &&
		outputFiles.length > 0 &&
		preset != '';
	// noExistingCollision;

	const handleJobFromChange = (newJobFrom: JobFrom) => {
		if (jobFrom != newJobFrom) {
			setJobFrom(newJobFrom);
			setInputPath('');
			setInputFiles([]);
			setOutputPath('');
			setOutputFiles([]);
			setNameCollision(false);
		}
	};

	const handleCancel = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();
		onClose();
	};

	const handleSubmit = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();

		inputFiles.forEach((file, index) => {
			const outputFile = outputFiles[index];
			const newJob: QueueRequest = {
				input: inputPath + '/' + file.name + file.extension,
				output: outputPath + '/' + outputFile.name + outputFile.extension,
				preset: preset,
			};
			socket.emit('add-to-queue', newJob);
			console.log(`[client] New job sent to the server.\n${newJob}`);
		});

		onClose();
	};

	const handleFileInputConfirm = async (item: DirectoryItem) => {
		// Set input variables
		setInputPath(item.path);
		setInputFiles([item]);

		// Set the output variables if the path is not set
		if (!outputPath) {
			const parentPath = item.path.replace(item.name + item.extension, '');
			setOutputPath(parentPath);

			const existingFiles: DirectoryItems = (await requestDirectory(parentPath)).items;
			const newOutputFiles: DirectoryItems = [
				{
					path: parentPath + item.name + item.extension,
					name: item.name,
					extension: outputExtension,
					isDirectory: false,
				},
			];
			const dedupedOutputFiles = HandleNameCollision(newOutputFiles, existingFiles);
			setOutputFiles(dedupedOutputFiles);
		}
	};

	const handleDirectoryInputConfirm = async (item: DirectoryItem) => {
		// Set input variables
		setInputPath(item.path);
		const inputPathItems: DirectoryItems = (await requestDirectory(item.path)).items
			.filter((item) => !item.isDirectory)
			.filter((item) => mime.getType(item.path)?.includes('video'));
		setInputFiles(inputPathItems);

		// Set output variables if the path is not set
		if (!outputPath) {
			setOutputPath(item.path);

			const existingFiles: DirectoryItems = (await requestDirectory(item.path)).items;
			const newOutputFiles: DirectoryItems = inputPathItems.map((item) => {
				return {
					path: item.path.replace(item.extension!, outputExtension),
					name: item.name,
					extension: outputExtension,
					isDirectory: item.isDirectory,
				};
			});
			const dedupedOutputFiles = HandleNameCollision(newOutputFiles, existingFiles);
			setOutputFiles(dedupedOutputFiles);
		}
	};

	const handleInputConfirm = async (item: DirectoryItem) => {
		switch (jobFrom) {
			case JobFrom.FromFile:
				handleFileInputConfirm(item);
				break;
			case JobFrom.FromDirectory:
				handleDirectoryInputConfirm(item);
				break;
		}
	};

	const handleOutputConfirm = async (item: DirectoryItem) => {
		setOutputPath(item.path);
		const existingFiles: DirectoryItems = (await requestDirectory(item.path)).items;
		const newOutputFiles = inputFiles.map((item) => {
			return {
				path: item.path.replace(item.extension!, outputExtension),
				name: item.name,
				extension: outputExtension,
				isDirectory: item.isDirectory,
			};
		});
		const dedupedOutputFiles = HandleNameCollision(newOutputFiles, existingFiles);
		setOutputFiles(dedupedOutputFiles);
	};

	const handleOutputNameChange = async (name: string) => {
		// setOutputName(name);
		if (outputFiles.length > 0) {
			const newOutputFiles = [...outputFiles];
			newOutputFiles[0].name = name;

			const existingFiles: DirectoryItems = (await requestDirectory(outputPath)).items;
			if (
				existingFiles
					.map((item) => item.name + item.extension)
					.includes(newOutputFiles[0].name + newOutputFiles[0].extension)
			) {
				setNameCollision(true);
			} else if (nameCollision) {
				setNameCollision(false);
			}

			setOutputFiles(newOutputFiles);
		}
	};

	const handleExtensionChange = async (extension: string) => {
		setOutputExtension(extension as HandbrakeOutputExtensions);
		const newOutputFiles = [...outputFiles];
		newOutputFiles.map((file) => {
			file.extension = extension;
			return file;
		});

		const existingFiles: DirectoryItems = (await requestDirectory(outputPath)).items;
		if (jobFrom == JobFrom.FromFile) {
			if (
				existingFiles
					.map((item) => item.name + item.extension)
					.includes(newOutputFiles[0].name + newOutputFiles[0].extension)
			) {
				setNameCollision(true);
			} else if (nameCollision) {
				setNameCollision(false);
			}
			setOutputFiles(newOutputFiles);
		} else {
			const dedupedOutputFiles = HandleNameCollision(newOutputFiles, existingFiles);
			setOutputFiles(dedupedOutputFiles);
		}
	};

	// const handlePresetChange = (preset: string) => {};

	return (
		<SectionOverlay id='create-new-job'>
			<h1>Create New Job</h1>
			<ButtonGroup>
				<button
					className={jobFrom == JobFrom.FromFile ? 'selected' : ''}
					onClick={() => handleJobFromChange(JobFrom.FromFile)}
				>
					<i className='bi bi-file-earmark-fill' />
					<span>From File (Single)</span>
				</button>
				<button
					className={jobFrom == JobFrom.FromDirectory ? 'selected' : ''}
					onClick={() => handleJobFromChange(JobFrom.FromDirectory)}
				>
					<i className='bi bi-folder-fill' />
					<span>From Folder (Bulk)</span>
				</button>
			</ButtonGroup>
			<form action=''>
				<fieldset className='input-section'>
					<legend>Input</legend>
					<PathInput
						id='input-path'
						label={jobFrom == JobFrom.FromFile ? 'File: ' : 'Directory: '}
						path='/video/input'
						mode={
							jobFrom == JobFrom.FromFile
								? FileBrowserMode.SingleFile
								: FileBrowserMode.Directory
						}
						value={inputPath}
						onConfirm={handleInputConfirm}
						key={jobFrom == JobFrom.FromFile ? 'input-file' : 'input-directory'}
					/>
				</fieldset>
				<fieldset className='output-section'>
					<legend>Output</legend>
					<PathInput
						id='output-path'
						label='Directory: '
						path={'/video/output'}
						mode={FileBrowserMode.Directory}
						value={outputPath}
						onConfirm={handleOutputConfirm}
						key={jobFrom == JobFrom.FromFile ? 'output-file' : 'output-directory'}
					/>
					{jobFrom == JobFrom.FromFile && nameCollision && (
						<span className='filename-conflict'>
							<i className='bi bi-exclamation-circle-fill' />{' '}
							<span>
								This filename conflicts with an existing file in the directory.
							</span>
						</span>
					)}
					{jobFrom == JobFrom.FromFile && (
						<TextInput
							id='output-name'
							label='File Name: '
							value={outputFiles[0] ? outputFiles[0].name : 'N/A'}
							onChange={handleOutputNameChange}
							disabled={!outputPath}
						/>
					)}
					<SelectInput
						id='output-extension'
						label='File Extension: '
						value={outputExtension}
						onChange={handleExtensionChange}
					>
						{extensions.map((extension) => (
							<option value={extension} key={extension}>
								{extension}
							</option>
						))}
					</SelectInput>
				</fieldset>
				<fieldset>
					<legend>Preset</legend>
					<SelectInput
						id='preset-select'
						label='Selected Preset: '
						value={preset}
						setValue={setPreset}
					>
						<option value=''>N/A</option>
						{Object.keys(presets).map((preset) => (
							<option value={preset} key={preset}>
								{preset}
							</option>
						))}
					</SelectInput>
				</fieldset>
				{inputFiles.length > 0 && outputFiles.length > 0 && (
					<div className='result-section'>
						<h3>Result</h3>
						<table>
							<thead>
								<tr>
									<th>#</th>
									<th>Input</th>
									<th>Output</th>
								</tr>
							</thead>
							<tbody>
								{inputFiles.map((file, index) => {
									const outputFile = outputFiles[index];

									const inputText = inputPath + '/' + file.name + file.extension;
									const outputText =
										outputPath + '/' + outputFile.name + outputFile.extension;

									return (
										<tr key={index}>
											<td>{index + 1}</td>
											<td>...{inputText.slice(-37)}</td>
											<td>...{outputText.slice(-37)}</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}
				<div className='buttons-section'>
					<ButtonInput label='Cancel' color='red' onClick={handleCancel} />
					<ButtonInput
						label='Submit'
						color='green'
						disabled={!canSubmit}
						onClick={handleSubmit}
					/>
				</div>
			</form>
		</SectionOverlay>
	);
}
