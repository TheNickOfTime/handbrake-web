type Params = {
	path: string;
};

export default function DirectoryPath({ path }: Params) {
	return <div id='directory-path'>Directory: {path}</div>;
}
