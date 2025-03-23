import { WatcherDefinitionWithRulesType, WatcherRuleDefinitionType } from 'types/watcher';
import './watcher-card.scss';
type Params = {
    watcherID: number;
    watcher: WatcherDefinitionWithRulesType;
    index: number;
    handleRemoveWatcher: (id: number) => void;
    handleAddRule: (id: number, rule: WatcherRuleDefinitionType) => void;
    handleUpdateRule: (id: number, rule: WatcherRuleDefinitionType) => void;
    handleRemoveRule: (ruleID: number) => void;
};
export default function WatcherCard({ watcherID, watcher, index, handleRemoveWatcher, handleAddRule, handleUpdateRule, handleRemoveRule, }: Params): import("react/jsx-runtime").JSX.Element;
export {};
