import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { HandbrakePresetCategoryType, HandbrakePresetType } from 'types/preset';
import { FirstLetterUpperCase } from 'funcs/string.funcs';
import ButtonInput from 'components/base/inputs/button/button-input';
import SectionOverlay from 'components/section/section-overlay';
import SelectInput from 'components/base/inputs/select/select-input';
import TextInput from 'components/base/inputs/text/text-input';
import './upload-preset.scss';

type Params = {
	socket: Socket;
	presets: HandbrakePresetCategoryType;
	handleClose: () => void;
};

export default function UploadPreset({ socket, presets, handleClose }: Params) {
	const [preset, setPreset] = useState<null | HandbrakePresetType>(null);
	const [presetCategory, setPresetCategory] = useState(
		Object.keys(presets).filter((category) => category != 'uncategorized').length > 0
			? Object.keys(presets).filter((category) => category != 'uncategorized')[0]
			: 'new'
	);
	const [newCategory, setNewCategory] = useState('');
	const [presetName, setPresetName] = useState('');

	useEffect(() => {
		console.log(presetCategory, newCategory);
	}, [presetCategory]);

	const handlePresetFile = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file && file.type == 'application/json') {
			const reader = new FileReader();
			reader.onload = (event) => {
				const result = event.target?.result?.toString();
				const json: HandbrakePresetType = JSON.parse(result!);
				setPreset(json);
				setPresetName(json.PresetList[0].PresetName);
				console.log(`[client] Preset has been updated to '${presetName}'`);
			};
			reader.readAsText(file);
		}
	};

	const handlePresetName = (value: string) => {
		const newName = value;
		const newPreset = preset;
		preset!.PresetList[0].PresetName = newName;
		setPreset(newPreset);
		setPresetName(value);
	};

	const handleAddPreset = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();
		if (preset && presetName != '') {
			const category = newCategory ? newCategory : presetCategory;
			socket.emit('add-preset', preset, category);
		}
		handleClose();
	};

	return (
		<SectionOverlay id='upload-preset'>
			<h1>Upload Preset</h1>
			<div className='file-section'>
				<label htmlFor='preset-file'>Preset: </label>
				<input
					className='file-upload'
					type='file'
					id='preset-file'
					onChange={handlePresetFile}
				/>
			</div>
			{preset && (
				<div className='fields-section'>
					<h3>New Preset</h3>
					<SelectInput
						id='category-select'
						label='Category'
						value={presetCategory}
						setValue={setPresetCategory}
					>
						{Object.keys(presets)
							.filter((category) => category != 'uncategorized')
							.map((category) => (
								<option value={category} key={`preset-category-${category}`}>
									{FirstLetterUpperCase(category)}
								</option>
							))}
						<option value='new'>New Category</option>
					</SelectInput>
					{presetCategory == 'new' && (
						<TextInput
							id='new-category-input'
							label='New Category'
							value={newCategory}
							setValue={setNewCategory}
						/>
					)}
					{presets[presetCategory] &&
						Object.keys(presets[presetCategory]).includes(presetName) && (
							<div className='preset-overwrite'>
								<i className='bi bi-exclamation-circle-fill' />
								<span>
									Preset '{presetName}' already exists and will be overwriten if
									the name is not changed.
								</span>
							</div>
						)}
					<TextInput
						id='preset-name'
						label='Preset Name'
						value={presetName}
						onChange={handlePresetName}
					/>
				</div>
			)}
			<div className='buttons-section'>
				<ButtonInput label='Cancel' color='red' onClick={handleClose} />
				<ButtonInput
					label='Upload'
					color='blue'
					disabled={
						preset == null ||
						presetName == '' ||
						(presetCategory == 'new' && !newCategory)
					}
					onClick={handleAddPreset}
				/>
			</div>
		</SectionOverlay>
	);
}
