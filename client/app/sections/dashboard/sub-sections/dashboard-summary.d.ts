import { QueueStatus } from 'types/queue';
import './dashboard-summary.scss';
type Params = {
    connectionStatus: boolean;
    queueStatus: QueueStatus;
};
export default function DashboardSummary({ connectionStatus, queueStatus }: Params): import("react/jsx-runtime").JSX.Element;
export {};
