import { Link } from '@tanstack/react-router';
import Section from '~components/root/section';
import { PresetEncoderDict, PresetFormatDict } from '~dict/presets.dict';
import { FirstLetterUpperCase } from '~funcs/string.funcs';
import { HandbrakePresetCategoryType } from '~types/preset';
import styles from './styles.module.scss';

type Params = {
	presets: HandbrakePresetCategoryType;
};

export default function DashboardPresets({ presets }: Params) {
	return (
		<Section id={styles['presets']}>
			<Link to='/presets'>
				<h2>
					Presets <i className='bi bi-arrow-right-short' />
				</h2>
			</Link>
			<div className='table-scroll'>
				<table>
					<thead>
						<tr>
							<th>Category</th>
							<th>Name</th>
							<th>Format</th>
							<th>Resolution</th>
							<th>Encoder</th>
						</tr>
					</thead>
					<tbody>
						{Object.keys(presets).map((category) => {
							return Object.values(presets[category]).map((preset) => {
								const info = preset.PresetList[0];
								const resolution = `${info.PictureWidth}x${info.PictureHeight}`;

								return (
									<tr key={`preset-${info.PresetName}`}>
										<td className='center'>{FirstLetterUpperCase(category)}</td>
										<td className='center'>{info.PresetName}</td>
										<td className='center'>
											{PresetFormatDict[info.FileFormat]}
										</td>
										<td className='center'>{resolution}</td>
										<td className='center'>
											{PresetEncoderDict[info.VideoEncoder]}
										</td>
									</tr>
								);
							});
						})}
					</tbody>
				</table>
			</div>
		</Section>
	);
}
