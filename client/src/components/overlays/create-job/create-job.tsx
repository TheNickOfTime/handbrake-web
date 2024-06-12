/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import { DirectoryTree } from 'directory-tree';
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
import { getCurrentPathTree } from '../../modules/file-browser/file-browser-utils';
import './create-job.scss';

type Params = {
	socket: Socket;
	onClose: () => void;
};

type SplitFileName = {
	name: string;
	extension: string;
};

type SplitFilePath = {
	path: string;
} & SplitFileName;

enum JobFrom {
	FromFile,
	FromDirectory,
}

export default function CreateJob({ socket, onClose }: Params) {
	const { presets } = useOutletContext<PrimaryOutletContextType>();
	const [extensions] = useState<string[]>(Object.values(HandbrakeOutputExtensions));

	const [tree, setTree] = useState<null | DirectoryTree>(null);
	const [jobFrom, setJobFrom] = useState(JobFrom.FromFile);
	const [inputPath, setInputPath] = useState('');
	const [inputFiles, setInputFiles] = useState<SplitFileName[]>([]);
	const [outputPath, setOutputPath] = useState('');
	const [outputExtension, setOutputExtension] = useState(HandbrakeOutputExtensions.mkv);
	const [outputFiles, setOutputFiles] = useState<SplitFileName[]>([]);
	const [preset, setPreset] = useState('');
	// const [canSubmit, setCanSubmit] = useState(false);

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

	const noExistingCollision =
		tree &&
		getCurrentPathTree(outputPath, tree.path, tree)
			.children?.map((child) => child.name)
			.every((existingPath) =>
				outputFiles
					.map((output) => output.name + output.extension)
					.every((outputPath) => outputPath != existingPath)
			);

	const canSubmit =
		inputPath != '' &&
		inputFiles.length > 0 &&
		outputPath != '' &&
		outputFiles.length > 0 &&
		preset != '' &&
		noExistingCollision;

	const splitName = (name: string) => {
		const splitRegex = /^([\w\d]+)(\.[\w\d]+)$/;
		const splitResult = name.match(splitRegex);
		if (splitResult) {
			const result: SplitFileName = {
				name: splitResult[1],
				extension: splitResult[2],
			};
			return result;
		} else {
			console.error(`[client] [error] Could not split the name '${name}'.`);
		}
	};

	const splitPath = (path: string) => {
		const splitRegex = /\/([\w\d]+)(\.[\w\d]+)$/;
		const splitResult = path.match(splitRegex);
		if (splitResult) {
			const result: SplitFilePath = {
				path: path.replace(splitRegex, ''),
				name: splitResult[1],
				extension: splitResult[2],
			};
			return result;
		} else {
			console.error(`[client] [error] Could not split the path '${path}'.`);
		}
	};

	const generateOutputFilesFromInputFiles = (inputFiles: SplitFileName[]) => {
		const deepCopyInputFiles: SplitFileName[] = JSON.parse(JSON.stringify(inputFiles));
		const newOutputFiles: SplitFileName[] = deepCopyInputFiles.map((child) => {
			const result: SplitFileName = {
				name: child.name,
				extension: outputExtension,
			};
			return result;
		});

		return newOutputFiles;
	};

	const handleNameCollision = (outputPath: string, outputs: SplitFileName[]) => {
		const fileCollisions: { [index: string]: number[] } = {};
		const existingOutputFiles = getCurrentPathTree(outputPath, tree!.path, tree!).children!.map(
			(child) => child.name
		);

		// Loop through each output
		outputs.forEach((output, index) => {
			const originalOutputName = output.name + output.extension;
			if (!fileCollisions[originalOutputName]) {
				fileCollisions[originalOutputName] = [];
			}

			// Check if there are collisions with existing files at the output path
			existingOutputFiles.forEach((existingFile) => {
				if (originalOutputName == existingFile) {
					fileCollisions[originalOutputName].push(index);
					console.log(
						`${originalOutputName} collides with existing file ${existingFile} at the output path.`
					);
					return;
				}
			});

			// Check if there are collisions with the other output files
			outputs.slice(index).forEach((otherOutput) => {
				if (
					output.name == otherOutput.name &&
					!fileCollisions[originalOutputName].includes(index)
				) {
					fileCollisions[originalOutputName].push(index);
					console.log(
						`${originalOutputName} collides with another output ${otherOutput.name}${otherOutput.extension}`
					);
					return;
				}
			});
		});

		const newOutputs: SplitFileName[] = JSON.parse(JSON.stringify(outputs));
		Object.values(fileCollisions).forEach((collisionArray) => {
			let fileIndex = 1;
			collisionArray.forEach((value) => {
				while (
					existingOutputFiles.includes(
						newOutputs[value].name + `_${fileIndex}` + newOutputs[value].extension
					) ||
					Object.values(newOutputs)
						.map((output) => output.name)
						.includes(newOutputs[value].name + `_${fileIndex}`)
				) {
					fileIndex += 1;
				}

				newOutputs[value].name += `_${fileIndex}`;
			});
		});

		return newOutputs;
	};

	const handleJobFromChange = (newJobFrom: JobFrom) => {
		if (jobFrom != newJobFrom) {
			setJobFrom(newJobFrom);
			setInputPath('');
			setInputFiles([]);
			setOutputPath('');
			setOutputFiles([]);
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

	const handleFileInputConfirm = (path: string) => {
		const splitInputPath = splitPath(path);
		if (splitInputPath) {
			const newInputPath = splitInputPath.path;
			setInputPath(newInputPath);

			const newInputFiles: SplitFileName[] = [
				{
					name: splitInputPath.name,
					extension: splitInputPath.extension,
				},
			];
			setInputFiles(newInputFiles);

			const newOutputPath =
				outputPath == '' || outputFiles.length == 0 ? splitInputPath.path : outputPath;
			if (outputPath != newOutputPath) {
				setOutputPath(newOutputPath);

				const newOutputFiles: SplitFileName[] =
					generateOutputFilesFromInputFiles(newInputFiles);

				const dedupedOutputFiles = handleNameCollision(newOutputPath, newOutputFiles);
				setOutputFiles(dedupedOutputFiles);
			}
		}
	};

	const handleDirectoryInputConfirm = (path: string) => {
		// Set Paths
		const newInputPath = path;
		setInputPath(newInputPath);

		const newOutputPath = outputPath == '' ? path : outputPath;
		if (newOutputPath != outputPath) {
			setOutputPath(path);
		}

		// Set Files
		const inputChildren = getCurrentPathTree(path, tree!.path, tree!).children;
		if (inputChildren) {
			const filteredChildren = inputChildren
				.filter((child) => !child.children)
				.filter((child) => mime.getType(child.name)?.includes('video'));

			const newInputFiles: SplitFileName[] = filteredChildren.map((child) => {
				const childNameSplit = splitName(child.name)!;
				return childNameSplit;
			});
			setInputFiles(newInputFiles);

			const newOutputFiles: SplitFileName[] =
				generateOutputFilesFromInputFiles(newInputFiles);

			// console.log(newOutputFiles);
			const dedupedOutputFiles = handleNameCollision(newOutputPath, newOutputFiles);

			setOutputFiles(dedupedOutputFiles);
		}
	};

	const handleInputConfirm = (path: string) => {
		switch (jobFrom) {
			case JobFrom.FromFile:
				handleFileInputConfirm(path);
				break;
			case JobFrom.FromDirectory:
				handleDirectoryInputConfirm(path);
				break;
		}
	};

	const handleOutputConfirm = (path: string) => {
		const newOutputPath = path;
		const newOutputFiles = generateOutputFilesFromInputFiles(inputFiles);
		const dedupedOutputFiles = handleNameCollision(newOutputPath, newOutputFiles);
		setOutputFiles(dedupedOutputFiles);
		setOutputPath(newOutputPath);
	};

	const handleOutputNameChange = (name: string) => {
		// setOutputName(name);
		if (outputFiles.length > 0) {
			const newOutputFiles = [...outputFiles];
			newOutputFiles[0].name = name;
			setOutputFiles(newOutputFiles);
		}
	};

	const handleExtensionChange = (extension: string) => {
		setOutputExtension(extension as HandbrakeOutputExtensions);
		const newOutputFiles = [...outputFiles];
		newOutputFiles.map((file) => {
			file.extension = extension;
			return file;
		});
		setOutputFiles(newOutputFiles);
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
						tree={tree}
						mode={
							jobFrom == JobFrom.FromFile
								? FileBrowserMode.SingleFile
								: FileBrowserMode.Directory
						}
						value={inputPath}
						onConfirm={handleInputConfirm}
					/>
				</fieldset>
				<fieldset className='output-section'>
					<legend>Output</legend>
					<PathInput
						id='output-path'
						label='Directory: '
						tree={tree}
						mode={FileBrowserMode.Directory}
						value={outputPath}
						onConfirm={handleOutputConfirm}
					/>
					{jobFrom == JobFrom.FromFile && !noExistingCollision && (
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
						label='Selected Preset'
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
