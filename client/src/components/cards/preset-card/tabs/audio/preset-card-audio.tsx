import { HandbrakePresetDataType } from 'types/preset';
import { PresetAudioEncoderDict } from 'dict/presets.dict';
import TextInfo from 'components/base/info/text-info/text-info';
import './preset-card-audio.scss';
import { FirstLetterUpperCase } from 'funcs/string.funcs';
import { LanguageCodeToName } from 'funcs/locale.funcs';

type Params = {
	preset: HandbrakePresetDataType;
};

export default function PresetCardAudio({ preset }: Params) {
	return (
		<div className='preset-card-section' id='audio'>
			<div className='preset-card-subsection'>
				<div className='preset-card-subsection-header'>Source Track Selection</div>
				<TextInfo label='Track Selection Behavior'>
					{FirstLetterUpperCase(preset.AudioTrackSelectionBehavior)}
				</TextInfo>
				<TextInfo label='Selected Languages'>
					{preset.AudioLanguageList.map((language) => LanguageCodeToName(language)).join(
						', '
					)}
				</TextInfo>
			</div>
			<div className='preset-card-subsection'>
				<div className='preset-card-subsection-header'>Auto Passthru Behavior</div>
				<div className='side-by-side'>
					{Object.keys(PresetAudioEncoderDict)
						.filter((entry) => entry.includes('copy:'))
						.map((entry, index) => (
							<TextInfo
								label={PresetAudioEncoderDict[entry]}
								key={`audio-passthru-${index}`}
							>
								{preset.AudioCopyMask.includes(entry) ? 'Yes' : 'No'}
							</TextInfo>
						))}
				</div>
			</div>
			<div className='preset-card-subsection'>
				<div className='preset-card-subsection-header'>
					Audio encoder settings for each chosen track
				</div>
				{!(preset.AudioList.length > 0) && <div>N/A</div>}
				{preset.AudioList.length > 0 && (
					<div className='table-scroll'>
						<table>
							<tbody>
								{preset.AudioList.sort((entry) =>
									entry.AudioEncoder.includes('copy') ? -1 : 1
								).map((entry, index) => (
									<tr key={`audio-encoder-${index}`}>
										<td>
											<TextInfo label='Encoder'>
												{PresetAudioEncoderDict[entry.AudioEncoder]}
											</TextInfo>
										</td>
										{!entry.AudioEncoder.includes('copy') && (
											<>
												{!entry.AudioTrackQualityEnable && (
													<td>
														<TextInfo label='Bitrate'>
															{entry.AudioBitrate}
														</TextInfo>
													</td>
												)}
												{entry.AudioTrackQualityEnable && (
													<td>
														<TextInfo label='Quality'>
															{entry.AudioTrackQuality}
														</TextInfo>
													</td>
												)}
												<td>
													<TextInfo label='Mixdown'>
														{entry.AudioMixdown}
													</TextInfo>
												</td>
												<td>
													<TextInfo label='Samplerate'>
														{entry.AudioSamplerate}
													</TextInfo>
												</td>
												<td>
													<TextInfo label='DRC'>
														{entry.AudioCompressionLevel}
													</TextInfo>
												</td>
												<td>
													<TextInfo label='Gain'>
														{entry.AudioTrackGainSlider}
													</TextInfo>
												</td>
											</>
										)}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}
