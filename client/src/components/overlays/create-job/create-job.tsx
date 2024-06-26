/* eslint-disable react-hooks/exhaustive-deps */

import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { PrimaryOutletContextType } from '../../../pages/primary/primary-context';
import { QueueRequest } from '../../../../../types/queue';
import SectionOverlay from '../../section/section-overlay';
import ButtonGroup from '../../base/inputs/button-group/button-group';
import { HandbrakeOutputExtensions } from '../../../../../types/file-extensions';
import ButtonInput from '../../base/inputs/button/button-input';
import PathInput from '../../base/inputs/path/path-input';
import { FileBrowserMode } from '../../../../../types/file-browser';
import SelectInput from '../../base/inputs/select/select-input';
import TextInput from '../../base/inputs/text/text-input';
import CheckboxInput from '../../base/inputs/checkbox/checkbox-input';
import { DirectoryItem, DirectoryItems } from '../../../../../types/directory';
import {
	FilterVideoFiles,
	GetOutputItemsFromInputItems,
	HandleNameCollision,
	RequestDirectory,
} from './create-job-funcs';
import './create-job.scss';

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
	const [isRecursive, setIsRecursive] = useState(false);

	// Output ------------------------------------------------------------------
	const [outputPath, setOutputPath] = useState('');
	const [outputFiles, setOutputFiles] = useState<DirectoryItems>([]);
	const [outputExtension, setOutputExtension] = useState(HandbrakeOutputExtensions.mkv);
	const [nameCollision, setNameCollision] = useState(false);
	const [outputChanged, setOutputChanged] = useState(false);

	// Preset ------------------------------------------------------------------
	const [preset, setPreset] = useState('');

	// Results -----------------------------------------------------------------
	const [seeMore, setSeeMore] = useState(false);

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
			setIsRecursive(false);
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

		console.log(inputFiles, outputFiles);

		inputFiles.forEach((file, index) => {
			const outputFile = outputFiles[index];
			const newJob: QueueRequest = {
				input: file.path,
				output: outputFile.path,
				preset: preset,
			};
			socket.emit('add-to-queue', newJob);
			console.log(`[client] New job sent to the server.\n${newJob}`);
		});

		onClose();
	};

	const handleFileInputConfirm = async (item: DirectoryItem) => {
		const prevPath =
			inputFiles.length > 0
				? inputFiles[0].path.replace(inputFiles[0].name + inputFiles[0].extension, '')
				: undefined;
		console.log(prevPath == outputPath);

		// Set input variables
		setInputPath(item.path);
		setInputFiles([item]);

		// Set the output variables if the path is not set
		if (!outputPath || !outputChanged) {
			const parentPath = item.path.replace(item.name + item.extension, '');
			setOutputPath(parentPath);

			const existingFiles: DirectoryItems = (await RequestDirectory(socket, parentPath))
				.items;
			const newOutputFiles: DirectoryItems = [
				{
					path: parentPath + item.name + outputExtension,
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
		// Get input/output variables
		const inputPathItems: DirectoryItems = FilterVideoFiles(
			(await RequestDirectory(socket, item.path, isRecursive)).items
		);

		const newOutputPath = outputChanged ? outputPath : item.path;
		const existingFiles: DirectoryItems = (await RequestDirectory(socket, item.path)).items;
		const newOutputFiles: DirectoryItems = inputPathItems.map((inputItem) => {
			return {
				path: newOutputPath + '/' + inputItem.name + inputItem.extension,
				name: inputItem.name,
				extension: outputExtension,
				isDirectory: inputItem.isDirectory,
			};
		});
		const dedupedOutputFiles = HandleNameCollision(newOutputFiles, existingFiles);

		// Set input/output states
		setInputPath(item.path);
		if (outputPath != newOutputPath) {
			setOutputPath(newOutputPath);
		}

		setInputFiles(inputPathItems);
		setOutputFiles(dedupedOutputFiles);
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

	const handleRecursiveChange = async (value: boolean) => {
		if (inputPath) {
			const newInputFiles = FilterVideoFiles(
				(await RequestDirectory(socket, inputPath, value)).items
			);
			const existingFiles: DirectoryItems = (await RequestDirectory(socket, outputPath))
				.items;
			const newOutputFiles = HandleNameCollision(
				GetOutputItemsFromInputItems(newInputFiles, outputExtension),
				existingFiles
			);
			setInputFiles(newInputFiles);
			setOutputFiles(newOutputFiles);
		}
	};

	const handleOutputConfirm = async (item: DirectoryItem) => {
		setOutputPath(item.path);
		const existingFiles: DirectoryItems = (await RequestDirectory(socket, item.path)).items;
		const newOutputFiles = inputFiles.map((inputItem) => {
			return {
				path: item.path + '/' + inputItem.name + outputExtension,
				name: inputItem.name,
				extension: outputExtension,
				isDirectory: inputItem.isDirectory,
			};
		});
		const dedupedOutputFiles = HandleNameCollision(newOutputFiles, existingFiles);
		setOutputFiles(dedupedOutputFiles);
		setOutputChanged(true);
	};

	const handleOutputNameChange = async (name: string) => {
		// setOutputName(name);
		if (outputFiles.length > 0) {
			const newOutputFiles = [...outputFiles];
			newOutputFiles[0].path = outputPath + name + outputExtension;
			newOutputFiles[0].name = name;
			setOutputFiles(newOutputFiles);
			setOutputChanged(true);

			const existingFiles: DirectoryItems = (await RequestDirectory(socket, outputPath))
				.items;
			if (
				existingFiles
					.map((item) => item.name + item.extension)
					.includes(newOutputFiles[0].name + newOutputFiles[0].extension)
			) {
				setNameCollision(true);
			} else if (nameCollision) {
				setNameCollision(false);
			}
		}
	};

	const handleExtensionChange = async (extension: string) => {
		setOutputExtension(extension as HandbrakeOutputExtensions);
		setOutputChanged(true);
		const newOutputFiles = [...outputFiles];
		newOutputFiles.map((file) => {
			file.extension = extension;
			return file;
		});

		const existingFiles: DirectoryItems = (await RequestDirectory(socket, outputPath)).items;
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

	const handleSeeMore = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();
		setSeeMore(!seeMore);
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
					{jobFrom == JobFrom.FromDirectory && (
						<CheckboxInput
							id='recursive-input'
							label='Recursive:'
							value={isRecursive}
							setValue={setIsRecursive}
							onChange={handleRecursiveChange}
						/>
					)}
				</fieldset>
				<fieldset className='output-section'>
					<legend>{outputChanged ? 'Output' : 'Output (Auto)'}</legend>
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
						<h3>
							{`${inputFiles.length} ${inputFiles.length > 1 ? 'Results' : 'Result'}`}
						</h3>
						<div className='table-scroll'>
							<table>
								<thead>
									<tr>
										<th>#</th>
										<th>Input</th>
										<th>Output</th>
									</tr>
								</thead>
								<tbody>
									{inputFiles
										.slice(0, seeMore ? inputFiles.length : 5)
										.map((file, index) => {
											const outputFile = outputFiles[index];

											const inputText =
												file.path.length > 50
													? `${file.path.slice(0, 10)}...${(
															file.name + file.extension
													  ).slice(-37)}`
													: file.path;

											const outputText =
												outputFile.path.length > 50
													? `${outputFile.path.slice(0, 10)}...${(
															outputFile.name + outputFile.extension
													  ).slice(-37)}`
													: outputFile.path;

											return (
												<tr key={index}>
													<td className='index-cell'>{index + 1}</td>
													<td className='input-cell' title={file.path}>
														{inputText}
													</td>
													<td
														className='output-cell'
														title={outputFile.path}
													>
														{outputText}
													</td>
												</tr>
											);
										})}
								</tbody>
							</table>
						</div>
						<button className='see-more' onClick={handleSeeMore}>
							<i
								className={`bi ${
									seeMore ? 'bi-caret-up-fill' : 'bi-caret-down-fill'
								}`}
							/>
							<span>
								{seeMore ? ' See Less' : ` See ${inputFiles.length - 5} More`}
							</span>
						</button>
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
