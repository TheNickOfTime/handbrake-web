import './workers.scss';
export type WorkerInfo = {
    [index: string]: {
        status: string;
        job: string;
        progress: string;
    };
};
export default function WorkersSection(): import("react/jsx-runtime").JSX.Element;
