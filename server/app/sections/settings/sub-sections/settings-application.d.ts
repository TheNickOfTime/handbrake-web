import { ConfigType } from 'types/config';
type Params = {
    config: ConfigType;
    setConfig: React.Dispatch<React.SetStateAction<ConfigType>>;
};
export default function SettingsApplication({ config, setConfig }: Params): import("react/jsx-runtime").JSX.Element;
export {};
