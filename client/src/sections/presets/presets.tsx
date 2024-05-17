import { useOutletContext } from 'react-router-dom';
import { PrimaryOutletContextType } from '../../pages/primary/primary-context';
import Section from '../../components/section/section';
import './presets.scss';
import ButtonInput from '../../components/base/inputs/button/button-input';
import UploadPreset from '../../components/upload-preset/upload-preset';
import { useState } from 'react';

function PresetInfo({ label, info }: { label: string; info: string }) {
	return (
		<div className='preset-info'>
			<div className='label'>{label}:</div>
			<div className='info'>{info}</div>
		</div>
	);
}

export default function PresetsSection() {
	const { presets, socket } = useOutletContext<PrimaryOutletContextType>();

	const [showUploadPreset, setShowUploadPreset] = useState(false);

	const handleCloseUploadPreset = () => {
		setShowUploadPreset(false);
	};

	// const handleEditPresetName = () => {};

	const handleRemovePreset = (preset: string) => {
		socket.emit('remove-preset', preset);
		console.log(`[client] Requesting the server remove preset '${preset}'`);
	};

	return (
		<Section title='Presets' id='presets-section'>
			<div className='sub-section buttons'>
				<div className='preset-count'>Presets: {Object.keys(presets).length}</div>
				<ButtonInput
					label='Upload New Preset'
					icon='bi-plus-lg'
					color='blue'
					onClick={() => setShowUploadPreset(true)}
				/>
			</div>
			{Object.keys(presets).length > 0 && (
				<div className='sub-section presets'>
					<h2>List</h2>
					{Object.keys(presets).map((key) => {
						console.log(presets[key]);
						const presetData = presets[key].PresetList[0];
						const resolution = `${presetData.PictureWidth}x${presetData.PictureHeight}`;
						return (
							<div className='preset-section' key={key}>
								<div className='preset-header'>
									<h3 className='preset-label'>{key}</h3>
									<div className='preset-buttons'>
										{/* <ButtonInput
										icon='bi-pencil-square'
										color='yellow'
										onClick={() => {}}
									/> */}
										<ButtonInput
											icon='bi-trash-fill'
											color='red'
											onClick={() => handleRemovePreset(key)}
										/>
									</div>
								</div>
								<div className='preset-data'>
									<PresetInfo label='Format' info={presetData.FileFormat} />
									<PresetInfo label='Resolution' info={resolution} />
									<PresetInfo label='Encoder' info={presetData.VideoEncoder} />
									<PresetInfo
										label='Encoder Profile'
										info={presetData.VideoProfile}
									/>
									<PresetInfo
										label='Encoder Preset'
										info={presetData.VideoPreset}
									/>
									<PresetInfo
										label='Quality Mode'
										info={presetData.VideoQualityType.toString()}
									/>
									<PresetInfo
										label='Quality'
										info={presetData.VideoQualitySlider.toString()}
									/>
									<PresetInfo
										label='Extra Options'
										info={presetData.VideoOptionExtra}
									/>
								</div>
							</div>
						);
					})}
				</div>
			)}
			{showUploadPreset && (
				<UploadPreset socket={socket} handleClose={handleCloseUploadPreset} />
			)}
		</Section>
	);
}
