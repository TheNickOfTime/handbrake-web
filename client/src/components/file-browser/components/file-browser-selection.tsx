type Params = {
	selectedFile: string;
	onConfirm: React.Dispatch<React.SetStateAction<string>>;
};

export default function FileBrowserSelection({ selectedFile, onConfirm }: Params) {
	return (
		<div className='file-browser-selection'>
			<span>Selected File: </span>
			<span className='selected-file'>{selectedFile}</span>
			<button className='btn btn-primary' onClick={() => onConfirm(selectedFile)}>
				Confirm
			</button>
		</div>
	);
}
