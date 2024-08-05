type Params = {
	handleDrop: () => void;
};

export default function QueueJobPreview({ handleDrop }: Params) {
	const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
	};

	return (
		<div className='drop-preview' onDragOver={handleDragOver} onDrop={handleDrop}>
			<hr />
		</div>
	);
}
