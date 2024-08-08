import {
	WatcherDefinitionWithRulesType,
	WatcherRuleBaseMethods,
	WatcherRuleDefinitionType,
	WatcherRuleFileInfoMethods,
	WatcherRuleMaskMethods,
	WatcherRuleStringComparisonMethods,
} from 'types/watcher';
import ButtonInput from 'components/base/inputs/button/button-input';
import TextInfo from 'components/base/info/text-info/text-info';
import './watcher-card.scss';
import WatcherCardRule from './components/watcher-card-rule';

type Params = {
	watcherID: number;
	watcher: WatcherDefinitionWithRulesType;
	handleRemoveWatcher: (id: number) => void;
	handleAddRule: (id: number, rule: WatcherRuleDefinitionType) => void;
	handleUpdateRule: (id: number, rule: WatcherRuleDefinitionType) => void;
	handleRemoveRule: (ruleID: number) => void;
};

export default function WatcherCard({
	watcherID,
	watcher,
	handleRemoveWatcher,
	handleAddRule,
	handleUpdateRule,
	handleRemoveRule,
}: Params) {
	const defaultRuleDefinition: WatcherRuleDefinitionType = {
		name: 'New Watcher Rule',
		mask: WatcherRuleMaskMethods.Include,
		base_rule_method: WatcherRuleBaseMethods.FileInfo,
		rule_method: WatcherRuleFileInfoMethods.FileName,
		comparison_method: WatcherRuleStringComparisonMethods.EqualTo,
		comparison: '',
	};

	console.log(watcher.rules);

	return (
		<div className='watcher-card'>
			<div className='watcher-card-header'>
				<h3 className='watcher-card-header-label'>{watcher.watch_path}</h3>
				<div className='watcher-card-header-buttons'>
					<ButtonInput
						icon='bi-trash-fill'
						color='red'
						onClick={() => handleRemoveWatcher(watcherID)}
					/>
				</div>
			</div>
			<div className='watcher-card-info'>
				<h5>Info</h5>
				<TextInfo label='Watching Path'>{watcher.watch_path || 'N/A'}</TextInfo>
				<TextInfo label='Output Path'>{watcher.output_path || 'N/A'}</TextInfo>
				<TextInfo label='Preset'>{watcher.preset_id}</TextInfo>
				{/* <TextInfo label='Default Watch Behavior'>
					{defaultMaskLookup[WatcherRuleMaskMethods[watcher.default_mask]]}
				</TextInfo> */}
			</div>
			<div className='watcher-card-rules'>
				<h5>Rules</h5>
				<div className='watcher-card-rule-cards'>
					{Object.keys(watcher.rules)
						.map((ruleID) => parseInt(ruleID))
						.map((ruleID, index) => (
							<WatcherCardRule
								id={ruleID}
								rule={watcher.rules[ruleID]}
								index={index}
								handleUpdateRule={handleUpdateRule}
								handleRemoveRule={handleRemoveRule}
								key={`watcher-${watcherID}-rule-${ruleID}`}
							/>
						))}
				</div>
				<div className='watcher-card-rule-buttons'>
					<ButtonInput
						icon='bi-plus-lg'
						color='blue'
						onClick={() => handleAddRule(watcherID, defaultRuleDefinition)}
					/>
				</div>
			</div>
		</div>
	);
}
