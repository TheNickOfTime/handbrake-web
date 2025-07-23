import Section from '~components/root/section';
import { PresetEncoderDict, PresetFormatDict } from '~dict/presets.dict';
import { FirstLetterUpperCase } from '~funcs/string.funcs';
import DashboardTable from '~pages/dashboard/components/dashboard-table';
import { HandbrakePresetCategoryType } from '~types/preset';
import styles from './styles.module.scss';

interface Properties {
	presets: HandbrakePresetCategoryType;
}

export default function PresetsSection({ presets }: Properties) {
	return (
		<Section className={styles['presets']} heading='Presets' link='/presets'>
			<DashboardTable>
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
									<td align='center'>{FirstLetterUpperCase(category)}</td>
									<td align='center'>{info.PresetName}</td>
									<td align='center'>{PresetFormatDict[info.FileFormat]}</td>
									<td align='center'>{resolution}</td>
									<td align='center'>{PresetEncoderDict[info.VideoEncoder]}</td>
								</tr>
							);
						});
					})}
				</tbody>
			</DashboardTable>
		</Section>
	);
}
