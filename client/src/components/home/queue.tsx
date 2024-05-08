import { Queue as QueueType } from '../../../../types/queue';

export default function Queue({ queue }: { queue: QueueType }) {
	return (
		<div id='queue' className='container'>
			<h2>Queue</h2>
			<table className='table'>
				<thead>
					<tr>
						<th>#</th>
						<th>Input</th>
						<th>Output</th>
						<th>Progress</th>
					</tr>
				</thead>
				<tbody>
					{queue.map((entry, index) => (
						<tr>
							<th>{index + 1}</th>
							<td>{entry.input}</td>
							<td>{entry.output}</td>
							<td>Waiting...</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
