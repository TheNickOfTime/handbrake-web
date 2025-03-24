import { WatcherRuleDefinitionType } from 'types/watcher';
type Params = {
    id: number;
    rule: WatcherRuleDefinitionType;
    index: number;
    handleUpdateRule: (id: number, rule: WatcherRuleDefinitionType) => void;
    handleRemoveRule: (ruleID: number) => void;
};
export default function WatcherCardRule({ id, rule, index, handleUpdateRule, handleRemoveRule, }: Params): import("react/jsx-runtime").JSX.Element;
export {};
