import DirectoryPath from './directory-path';

type Params = {
	path: string;
};

export default function FileBrowserToolbar({ path }: Params) {
	return (
		<div className='file-browser-toolbar'>
			<DirectoryPath path={path} />
		</div>
	);
}
