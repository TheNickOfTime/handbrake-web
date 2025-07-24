import TextInfo from '~components/base/info/text-info';
import { PresetEncoderDict, PresetPropertiesDict } from '~dict/presets.dict';
import { BooleanToConfirmation, FirstLetterUpperCase } from '~funcs/string.funcs';
import { HandbrakePresetDataType, VideoQualityType } from '~types/preset';
import PresetTab from '../../components/preset-tab';
import PresetTabSection from '../../components/preset-tab-section';
import styles from './styles.module.scss';

type Params = {
	preset: HandbrakePresetDataType;
};

export default function VideoTab({ preset }: Params) {
	return (
		<PresetTab className={styles['video-tab']}>
			<PresetTabSection label='Video'>
				<TextInfo label='Video Encoder'>{PresetEncoderDict[preset.VideoEncoder]}</TextInfo>
				<TextInfo label='Framerate (FPS)'>
					{preset.VideoFrameRate ? preset.VideoFrameRate : 'Same as source'}
					{', '}
					{preset.VideoFramerateMode}
				</TextInfo>
			</PresetTabSection>
			<PresetTabSection label='Quality'>
				{preset.VideoQualityType == VideoQualityType.ConstantQuality && (
					<TextInfo label='Constant Quality'>{preset.VideoQualitySlider}</TextInfo>
				)}
				{preset.VideoQualityType == VideoQualityType.AvgBitrate && (
					<>
						<TextInfo label='Average Bitrate (kbps)'>{preset.VideoAvgBitrate}</TextInfo>
						<TextInfo label='Multi-Pass Encoding'>
							{BooleanToConfirmation(preset.VideoMultiPass)}
						</TextInfo>
						<TextInfo label='Turbo analysis pass'>
							{BooleanToConfirmation(preset.VideoTurboMultiPass)}
						</TextInfo>
					</>
				)}
			</PresetTabSection>
			<PresetTabSection label='Encoder Options'>
				<TextInfo label='Encoder Preset'>
					{PresetPropertiesDict[preset.VideoPreset] ||
						FirstLetterUpperCase(preset.VideoPreset)}
				</TextInfo>
				<TextInfo label='Encoder Tune'>{preset.VideoTune || 'N/A'}</TextInfo>
				<TextInfo label='Encoder Profile'>
					{PresetPropertiesDict[preset.VideoProfile] || preset.VideoProfile}
				</TextInfo>
				<TextInfo label='Encoder Level'>
					{PresetPropertiesDict[preset.VideoLevel] || preset.VideoLevel}
				</TextInfo>
				<TextInfo label='Advanced Options'>
					{preset.VideoOptionExtra ? preset.VideoOptionExtra : 'N/A'}
				</TextInfo>
			</PresetTabSection>
		</PresetTab>
	);
}
