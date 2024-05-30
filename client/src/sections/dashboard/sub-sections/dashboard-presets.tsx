import { NavLink } from 'react-router-dom';
import SubSection from '../../../components/section/sub-section';
import { HandbrakePresetList } from '../../../../../types/preset';
import './dashboard-presets.scss';

type Params = {
	presets: HandbrakePresetList;
};

export default function DashboardPresets({ presets }: Params) {
	return (
		<SubSection id='presets'>
			<NavLink to='/presets'>
				<h2>
					Presets <i className='bi bi-arrow-right-short' />
				</h2>
			</NavLink>
			<div className='table-scroll'>
				<table>
					<thead>
						<tr>
							<th>Name</th>
							<th>Format</th>
							<th>Resolution</th>
							<th>Encoder</th>
						</tr>
					</thead>
					<tbody>
						{Object.values(presets).map((preset) => {
							const info = preset.PresetList[0];
							const resolution = `${info.PictureWidth}x${info.PictureHeight}`;

							return (
								<tr key={`preset-${info.PresetName}`}>
									<td>{info.PresetName}</td>
									<td className='center'>{info.FileFormat}</td>
									<td className='center'>{resolution}</td>
									<td className='center'>{info.VideoEncoder}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</SubSection>
	);
}
