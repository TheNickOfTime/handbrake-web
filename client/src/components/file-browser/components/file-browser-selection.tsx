type Params = {
	selectedFile: string;
	onConfirm: (file: string) => void;
};

export default function FileBrowserSelection({ selectedFile, onConfirm }: Params) {
	const canConfirm = selectedFile != 'N/A' && selectedFile != null;
	const buttonClass = canConfirm ? 'btn-primary' : 'btn-secondary';

	return (
		<div className='file-browser-selection'>
			<span>Selected File: </span>
			<div className='selected-file'>{selectedFile}</div>
			<button
				className={`btn ${buttonClass}`}
				disabled={!canConfirm}
				onClick={() => onConfirm(selectedFile)}
			>
				Confirm
			</button>
		</div>
	);
}
