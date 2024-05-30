import ButtonInput from '../../../base/inputs/button/button-input';

type Params = {
	selectedFile: string;
	onConfirm: (file: string) => void;
};

export default function FileBrowserSelection({ selectedFile, onConfirm }: Params) {
	const canConfirm = selectedFile != 'N/A' && selectedFile != null;
	// const buttonClass = canConfirm ? 'btn-primary' : 'btn-secondary';
	const onClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();
		onConfirm(selectedFile);
	};

	return (
		<div className='file-browser-selection'>
			<span>Selected File: </span>
			<div className='selected-file'>{selectedFile}</div>
			{/* <button
				className={`btn ${buttonClass}`}
				disabled={!canConfirm}
				onClick={() => onConfirm(selectedFile)}
			>
				Confirm
			</button> */}
			<ButtonInput label='Confirm' color='green' disabled={!canConfirm} onClick={onClick} />
		</div>
	);
}
