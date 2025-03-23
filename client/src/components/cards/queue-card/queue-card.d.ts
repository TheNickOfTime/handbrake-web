import { JobType } from 'types/queue';
import './queue-card.scss';
type Params = {
    id: string;
    job: JobType;
    index: number;
    jobID: number;
    categoryID: string;
    showDragHandles?: boolean;
    handleStopJob: () => void;
    handleResetJob: () => void;
    handleRemoveJob: () => void;
    setDraggedID: React.Dispatch<React.SetStateAction<string | undefined>>;
    setDraggedInitialIndex: React.Dispatch<React.SetStateAction<number>>;
    setDraggedDesiredIndex: React.Dispatch<React.SetStateAction<number>>;
    handleDrop: () => void;
};
export default function QueueCard({ id, job, index, jobID, categoryID, showDragHandles, handleStopJob, handleResetJob, handleRemoveJob, setDraggedID, setDraggedInitialIndex, setDraggedDesiredIndex, handleDrop, }: Params): import("react/jsx-runtime").JSX.Element;
export {};
