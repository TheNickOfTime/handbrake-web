import TextInfo from 'components/base/info/text-info/text-info';
import { HandbrakePresetData, VideoQualityType } from 'types/preset';
import './preset-card-video.scss';

type Params = {
	preset: HandbrakePresetData;
};

export default function PresetCardVideo({ preset }: Params) {
	return (
		<div className='preset-card-section' id='video'>
			<div className='preset-card-subsection'>
				<div className='preset-card-subsection-header'>Video</div>
				<TextInfo label='Video Encoder'>{preset.VideoEncoder}</TextInfo>
				<TextInfo label='Framerate (FPS)'>
					{preset.VideoFrameRate ? preset.VideoFrameRate : 'Same as source'}
					{', '}
					{preset.VideoFramerateMode}
				</TextInfo>
			</div>
			<div className='preset-card-subsection'>
				<div className='preset-card-subsection-header'>Quality</div>
				{preset.VideoQualityType == VideoQualityType.ConstantQuality && (
					<TextInfo label='Constant Quality'>{preset.VideoQualitySlider}</TextInfo>
				)}
				{preset.VideoQualityType == VideoQualityType.AvgBitrate && (
					<>
						<TextInfo label='Average Bitrate (kbps)'>{preset.VideoAvgBitrate}</TextInfo>
						<TextInfo label='Multi-Pass Encoding'>
							{preset.VideoMultiPass ? 'Yes' : 'No'}
						</TextInfo>
						<TextInfo label='Turbo analysis pass'>
							{preset.VideoTurboMultiPass ? 'Yes' : 'No'}
						</TextInfo>
					</>
				)}
			</div>
			<div className='preset-card-subsection'>
				<div className='preset-card-subsection-header'>Encoder Options</div>
				<TextInfo label='Encoder Preset'>{preset.VideoPreset}</TextInfo>
				<TextInfo label='Encoder Tune'>{preset.VideoTune}</TextInfo>
				<TextInfo label='Encoder Profile'>{preset.VideoProfile}</TextInfo>
				<TextInfo label='Encoder Level'>{preset.VideoLevel}</TextInfo>
				<TextInfo label='Advanced Options'>
					{preset.VideoOptionExtra ? preset.VideoOptionExtra : 'N/A'}
				</TextInfo>
			</div>
		</div>
	);
}
