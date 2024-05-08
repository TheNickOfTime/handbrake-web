import { ConnectionIDs } from '../../../../types/socket';
import TextInput from '../test/text-input';

type Params = {
	server: string;
	setServer: React.Dispatch<React.SetStateAction<string>>;
	connections: ConnectionIDs;
};

export default function ServerInfo({ server, setServer, connections }: Params) {
	return (
		<div className='container'>
			<h2>Server Info</h2>
			<TextInput id='server' label='Server URL:' value={server} setValue={setServer} />
			<div className='row'>
				<div className='col'>
					<h5>Clients</h5>
					<table className='table col'>
						<thead>
							<th>#</th>
							<th>ID</th>
						</thead>
						<tbody>
							{connections &&
								connections.clients.map((client, index) => (
									<tr>
										<th>{index}</th>
										<td>{client}</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>
				<div className='col'>
					<h5>Workers</h5>
					<table className='table col'>
						<thead>
							<th>#</th>
							<th>ID</th>
						</thead>
						<tbody>
							{connections &&
								connections.workers.map((worker, index) => (
									<tr>
										<th>{index}</th>
										<td>{worker}</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
