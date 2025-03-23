import { QueueType } from 'types/queue';
import { WorkerIDType } from 'types/socket';
import './dashboard-workers.scss';
type Params = {
    queue: QueueType;
    workers: WorkerIDType[];
};
export default function DashboardWorkers({ queue, workers }: Params): import("react/jsx-runtime").JSX.Element;
export {};
