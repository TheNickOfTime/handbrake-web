import { ConfigType } from 'types/config';
type Params = {
    config: ConfigType;
    setConfig: React.Dispatch<React.SetStateAction<ConfigType>>;
    setValid: React.Dispatch<React.SetStateAction<boolean>>;
};
export default function SettingsPaths({ config, setConfig, setValid }: Params): import("react/jsx-runtime").JSX.Element;
export {};
