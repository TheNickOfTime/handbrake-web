import { QueueStatus as QueueStatusType } from 'types/queue';
type Params = {
    queueStatus: QueueStatusType;
    handleStartQueue: () => void;
    handleStopQueue: () => void;
};
export default function QueueStatus({ queueStatus, handleStartQueue, handleStopQueue }: Params): import("react/jsx-runtime").JSX.Element;
export {};
