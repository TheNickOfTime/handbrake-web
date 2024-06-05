import { DirectoryTree } from 'directory-tree';
import { HandbrakePresetList } from '../../../../../../types/preset';
import PathInput from '../../../base/inputs/path/path-input';
import ButtonInput from '../../../base/inputs/button/button-input';
import TextInput from '../../../base/inputs/text/text-input';
import { useState } from 'react';
import SelectInput from '../../../base/inputs/select/select-input';
import { FileBrowserMode } from '../../../../../../types/file-browser';
import { HandbrakeVideoExtensions } from '../../../../../../types/file-extensions';

type Params = {
	tree: DirectoryTree;
	presets: HandbrakePresetList;
	input: string;
	setInput: React.Dispatch<React.SetStateAction<string>>;
	output: string | undefined;
	setOutput: React.Dispatch<React.SetStateAction<string>>;
	preset: string | undefined;
	setPreset: React.Dispatch<React.SetStateAction<string>>;
	fileExtension: string;
	setFileExtension: React.Dispatch<React.SetStateAction<string>>;
	handleCancel: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
	handleSubmit: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

export default function CreateJobFile({
	tree,
	presets,
	input,
	setInput,
	output,
	setOutput,
	preset,
	setPreset,
	fileExtension,
	setFileExtension,
	handleCancel,
	handleSubmit,
}: Params) {
	const [outputDirectory, setOutputDirectory] = useState('');
	const [outputFileName, setOutputFileName] = useState('');

	const handleInputConfirm = (file: string) => {
		setInput(file);

		const fileRegex = /\/([\w\d]+)(\.[\w\d]+)$/;
		const fileDirectory = file.replace(fileRegex, '');

		const fileMatch = file.match(fileRegex);
		if (fileMatch) {
			const fileName = fileMatch[1];
			const fileExtension = fileMatch[2];
			setOutputDirectory(fileDirectory);
			setOutputFileName(fileName);
			console.log(Object.keys(HandbrakeVideoExtensions));
			if (Object.keys(HandbrakeVideoExtensions).includes(fileExtension.replace('.', ''))) {
				console.log('wowie');
				setFileExtension(fileExtension);
			}

			handleOutputChange(fileDirectory, fileName, fileExtension);
		}
	};

	const handleOutputConfirm = (file: string) => {
		setOutputDirectory(file);
		handleOutputChange(file, outputFileName, fileExtension);
	};

	const handleFileNameChange = (value: string) => {
		setOutputFileName(value);
		handleOutputChange(outputDirectory, value, fileExtension);
	};

	const handleExtensionChange = (value: string) => {
		handleOutputChange(outputDirectory, outputFileName, value);
	};

	const handleOutputChange = (directory: string, name: string, extension: string) => {
		const fullOutput = directory + '/' + name + extension;
		setOutput(fullOutput);
	};

	return (
		<form action=''>
			<fieldset className='input-section'>
				<legend>Input</legend>
				<PathInput
					id='input-path'
					label='File: '
					tree={tree}
					mode={FileBrowserMode.SingleFile}
					value={input}
					onConfirm={handleInputConfirm}
					// setValue={setInput}
				/>
			</fieldset>
			<fieldset className='output-section'>
				<legend>Output</legend>
				<PathInput
					id='output-path'
					label='Directory:'
					tree={tree}
					mode={FileBrowserMode.Directory}
					value={outputDirectory}
					onConfirm={handleOutputConfirm}
				/>
				<TextInput
					id='output-name'
					label='File Name: '
					value={outputFileName}
					setValue={setOutputFileName}
					onChange={handleFileNameChange}
				/>
				<SelectInput
					id='output-extension'
					label='File Extension: '
					value={fileExtension}
					setValue={setFileExtension}
					onChange={handleExtensionChange}
				>
					<option value='.mkv'>.mkv</option>
					<option value='.mp4'>.mp4</option>
				</SelectInput>
				<div id='output-full'>
					<span className='label'>Full Path:</span>
					<span className='text form-item'>{output}</span>
				</div>
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
						<option value={preset}>{preset}</option>
					))}
				</SelectInput>
			</fieldset>
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
	);
}
