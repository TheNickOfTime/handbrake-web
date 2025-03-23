import { Socket } from 'socket.io-client';
import { ConfigType } from 'types/config';
import './side-bar.scss';
type Params = {
    showSidebar: boolean;
    setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
    socket: Socket;
    config: ConfigType | undefined;
};
export default function SideBar({ showSidebar, setShowSidebar, socket, config }: Params): import("react/jsx-runtime").JSX.Element;
export {};
