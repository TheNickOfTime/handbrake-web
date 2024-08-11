import PathInput from 'components/base/inputs/path/path-input';
import SubSection from 'components/section/sub-section';
import { FileBrowserMode } from 'types/file-browser';

type Params = {
	paths: {
		mediaPath: string;
		inputPath: string;
		outputPath: string;
	};
	setPaths: {
		setMediaPath: React.Dispatch<React.SetStateAction<string>>;
		setInputPath: React.Dispatch<React.SetStateAction<string>>;
		setOutputPath: React.Dispatch<React.SetStateAction<string>>;
	};
};

export default function PresetPaths({ paths, setPaths }: Params) {
	return (
		<SubSection title='Locations' id='paths'>
			<PathInput
				id='media-path-selection'
				label='Root Media Path'
				path='/'
				mode={FileBrowserMode.Directory}
				allowCreate={false}
				value={paths.mediaPath}
				onConfirm={(item) => setPaths.setMediaPath(item.path)}
			/>
			<PathInput
				id='input-path-selection'
				label='Default Input Path'
				path={paths.mediaPath}
				mode={FileBrowserMode.Directory}
				allowCreate={true}
				value={paths.inputPath}
				onConfirm={(item) => setPaths.setInputPath(item.path)}
			/>
			<PathInput
				id='output-path-selection'
				label='Default Output Path'
				path={paths.mediaPath}
				mode={FileBrowserMode.Directory}
				allowCreate={true}
				value={paths.outputPath}
				onConfirm={(item) => setPaths.setOutputPath(item.path)}
			/>
		</SubSection>
	);
}
