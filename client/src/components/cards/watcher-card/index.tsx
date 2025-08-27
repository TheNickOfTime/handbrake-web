import TextInfo from '~components/base/info/text-info';
import ButtonInput from '~components/base/inputs/button';
import {
	WatcherDefinitionWithRulesType,
	WatcherRuleBaseMethods,
	WatcherRuleDefinitionType,
	WatcherRuleFileInfoMethods,
	WatcherRuleMaskMethods,
	WatcherRuleStringComparisonMethods,
} from '~types/watcher';
import WatcherCardRule from './components/watcher-card-rule';
import styles from './styles.module.scss';

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
		<div className={`watcher-card ${styles['watcher-card']}`}>
			<div className={styles['watcher-card-number']}>
				<h3>{index + 1}</h3>
			</div>
			<div className={styles['watcher-card-body']}>
				<div className={styles['watcher-card-info']}>
					<div className={styles['watcher-card-info-header']}>
						<h5>Info</h5>
						<ButtonInput
							Icon='bi-trash-fill'
							color='red'
							title='Remove Watcher'
							onClick={() => handleRemoveWatcher(watcherID)}
						/>
					</div>
					<div className={styles['watcher-card-info-children']}>
						<TextInfo label='Watching Path'>{watcher.watch_path || 'N/A'}</TextInfo>
						<TextInfo label='Output Path'>{watcher.output_path || 'N/A'}</TextInfo>
						<TextInfo label='Preset'>{watcher.preset_id}</TextInfo>
					</div>
				</div>
				<div className={styles['watcher-card-rules']}>
					<div className={styles['watcher-card-rules-header']}>
						<h5>Rules</h5>
						<ButtonInput
							Icon='bi-plus-lg'
							color='blue'
							title='Add Watcher Rule'
							onClick={() => handleAddRule(watcherID, defaultRuleDefinition)}
						/>
					</div>
					<div className={styles['watcher-card-rule-cards']}>
						{Object.keys(watcher.rules).length == 0 && (
							<div
								className={styles['watcher-card-rule']}
								style={{ textAlign: 'center' }}
							>
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
