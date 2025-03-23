import { QueueType } from 'types/queue';
import { WorkerInfo } from '../workers';
import './workers-summary.scss';
type Params = {
    workerInfo: WorkerInfo;
    queue: QueueType;
};
export default function WorkersSummary({ workerInfo, queue }: Params): import("react/jsx-runtime").JSX.Element;
export {};
