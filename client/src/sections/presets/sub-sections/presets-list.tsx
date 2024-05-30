import { HandbrakePresetList } from '../../../../../types/preset';
import ButtonInput from '../../../components/base/inputs/button/button-input';
import SubSection from '../../../components/section/sub-section';
import './presets-list.scss';

type Params = {
	presets: HandbrakePresetList;
	handleRemovePreset: (preset: string) => void;
};

function PresetInfo({ label, info }: { label: string; info: string }) {
	return (
		<div className='preset-info'>
			<div className='label'>{label}:</div>
			<div className='info'>{info}</div>
		</div>
	);
}

export default function PresetsList({ presets, handleRemovePreset }: Params) {
	return (
		<SubSection title='List' id='list'>
			{Object.keys(presets).map((key) => {
				// console.log(presets[key]);
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
							<PresetInfo label='Encoder Profile' info={presetData.VideoProfile} />
							<PresetInfo label='Encoder Preset' info={presetData.VideoPreset} />
							<PresetInfo
								label='Quality Mode'
								info={presetData.VideoQualityType.toString()}
							/>
							<PresetInfo
								label='Quality'
								info={presetData.VideoQualitySlider.toString()}
							/>
							<PresetInfo label='Extra Options' info={presetData.VideoOptionExtra} />
						</div>
					</div>
				);
			})}
		</SubSection>
	);
}
