import { Socket } from 'socket.io-client';
import { HandbrakePresetCategoryType } from 'types/preset';
import './upload-preset.scss';
type Params = {
    socket: Socket;
    presets: HandbrakePresetCategoryType;
    handleClose: () => void;
};
export default function UploadPreset({ socket, presets, handleClose }: Params): import("react/jsx-runtime").JSX.Element;
export {};
