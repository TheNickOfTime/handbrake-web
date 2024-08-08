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
	index: number;
	handleRemoveWatcher: (id: number) => void;
	handleAddRule: (id: number, rule: WatcherRuleDefinitionType) => void;
	handleUpdateRule: (id: number, rule: WatcherRuleDefinitionType) => void;
	handleRemoveRule: (ruleID: number) => void;
};

export default function WatcherCard({
	watcherID,
	watcher,
	index,
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
			<div className='watcher-card-number'>
				<h3>{index + 1}</h3>
			</div>
			<div className='watcher-card-body'>
				<div className='watcher-card-info'>
					<div className='watcher-card-info-header'>
						<h5>Info</h5>
						<ButtonInput
							icon='bi-trash-fill'
							color='red'
							title='Remove Watcher'
							onClick={() => handleRemoveWatcher(watcherID)}
						/>
					</div>
					<div className='watcher-card-info-children'>
						<TextInfo label='Watching Path'>{watcher.watch_path || 'N/A'}</TextInfo>
						<TextInfo label='Output Path'>{watcher.output_path || 'N/A'}</TextInfo>
						<TextInfo label='Preset'>{watcher.preset_id}</TextInfo>
					</div>
				</div>
				<div className='watcher-card-rules'>
					<div className='watcher-card-rules-header'>
						<h5>Rules</h5>
						<ButtonInput
							icon='bi-plus-lg'
							color='blue'
							title='Add Watcher Rule'
							onClick={() => handleAddRule(watcherID, defaultRuleDefinition)}
						/>
					</div>
					<div className='watcher-card-rule-cards'>
						{Object.keys(watcher.rules).length == 0 && (
							<div className='watcher-card-rule' style={{ textAlign: 'center' }}>
								N/A
							</div>
						)}
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
				</div>
			</div>
		</div>
	);
}
