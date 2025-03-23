import { Socket } from 'socket.io-client';
import './version-info.scss';
import { ConfigType } from 'types/config';
type Params = {
    socket: Socket;
    config: ConfigType | undefined;
};
export default function VersionInfo({ socket, config }: Params): import("react/jsx-runtime").JSX.Element;
export {};
