import { DirectoryTree } from 'directory-tree';
import { HandbrakePresetList } from '../../../../../../types/preset';
import PathInput from '../../../base/inputs/path/path-input';
import ButtonInput from '../../../base/inputs/button/button-input';

type Params = {
	tree: DirectoryTree;
	presets: HandbrakePresetList;
	input: string;
	output: string;
	preset: string;
	handleFileSelect: (file: string) => void;
	handlePresetChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
	handleCancel: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
	handleSubmit: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

export default function CreateJobFolder({
	tree,
	presets,
	input,
	output,
	preset,
	handleFileSelect,
	handlePresetChange,
	handleCancel,
	handleSubmit,
}: Params) {
	return (
		<form action=''>
			<PathInput
				id='input-path'
				label='Input Path: '
				tree={tree}
				value={input}
				setValue={handleFileSelect}
			/>
			<div className='output-path-section'>
				<label htmlFor='output-path'>Output Path: </label>
				<input type='text' id='output-path' value={output} disabled />
			</div>
			<div className='preset-section'>
				<label htmlFor='preset-select'>Preset:</label>
				<select id='preset-select' value={preset} onChange={handlePresetChange}>
					<option value=''>N/A</option>
					{Object.keys(presets).map((preset) => (
						<option value={preset}>{preset}</option>
					))}
				</select>
			</div>
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
