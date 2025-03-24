import { QueueType } from 'types/queue';
type Params = {
    queue: QueueType;
    handleAddNewJob: () => void;
    handleClearAllJobs: () => void;
    handleClearFinishedJobs: () => void;
    handleStopJob: (id: number) => void;
    handleResetJob: (id: number) => void;
    handleRemoveJob: (id: number) => void;
};
export default function QueueJobs({ queue, handleAddNewJob, handleClearAllJobs, handleClearFinishedJobs, handleStopJob, handleResetJob, handleRemoveJob, }: Params): import("react/jsx-runtime").JSX.Element;
export {};
