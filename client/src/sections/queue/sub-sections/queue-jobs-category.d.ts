import { QueueType } from 'types/queue';
type Params = {
    queue: QueueType;
    id: string;
    label: string;
    showHandles?: boolean;
    collapsable?: boolean;
    startCollapsed?: boolean;
    handleStopJob: (id: number) => void;
    handleResetJob: (id: number) => void;
    handleRemoveJob: (id: number) => void;
};
export default function QueueJobsCategory({ queue, id, label, showHandles, collapsable, startCollapsed, handleStopJob, handleResetJob, handleRemoveJob, }: Params): import("react/jsx-runtime").JSX.Element | undefined;
export {};
