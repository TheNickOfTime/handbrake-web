import {
	AddWatcherRuleType,
	DetailedWatcherType,
	UpdateWatcherRuleType,
} from '@handbrake-web/shared/types/database';
import {
	WatcherRuleBaseMethods,
	WatcherRuleFileInfoMethods,
	WatcherRuleMaskMethods,
	WatcherRuleStringComparisonMethods,
} from '@handbrake-web/shared/types/watcher';
import AddIcon from '@icons/plus-lg.svg?react';
import TrashIcon from '@icons/trash-fill.svg?react';
import { HTMLAttributes } from 'react';
import TextInfo from '~components/base/info/text-info';
import ButtonInput from '~components/base/inputs/button';
import WatcherCardRule from './components/rule-card';
import styles from './styles.module.scss';

interface Properties extends HTMLAttributes<HTMLDivElement> {
	watcher: DetailedWatcherType;
	index: number;
	handleRemoveWatcher: (id: number) => void;
	handleAddRule: (id: number, rule: AddWatcherRuleType) => void;
	handleUpdateRule: (id: number, rule: UpdateWatcherRuleType) => void;
	handleRemoveRule: (ruleID: number) => void;
}

export default function WatcherCard({
	watcher,
	index,
	handleRemoveWatcher,
	handleAddRule,
	handleUpdateRule,
	handleRemoveRule,
	className,
	...properties
}: Properties) {
	const defaultRuleDefinition: AddWatcherRuleType = {
		name: 'New Watcher Rule',
		mask: WatcherRuleMaskMethods.Include,
		base_rule_method: WatcherRuleBaseMethods.FileInfo,
		rule_method: WatcherRuleFileInfoMethods.FileName,
		comparison_method: WatcherRuleStringComparisonMethods.EqualTo,
		comparison: '',
	};

	return (
		<div
			className={`watcher-card ${styles['watcher-card']} ${className || ''}`}
			{...{ properties }}
		>
			<div className={styles['number']}>
				<h3>{index + 1}</h3>
			</div>
			<div className={styles['body']}>
				<div className={styles['info']}>
					<div className={styles['header']}>
						<h5 className={styles['heading']}>Info</h5>
						<ButtonInput
							className={styles['button']}
							Icon={TrashIcon}
							color='red'
							title='Remove Watcher'
							onClick={() => handleRemoveWatcher(watcher.watcher_id)}
						/>
					</div>
					<div className={styles['content']}>
						<TextInfo className={styles['text-info']} label='Watching Path'>
							{watcher.watch_path || 'N/A'}
						</TextInfo>
						<TextInfo className={styles['text-info']} label='Output Path'>
							{watcher.output_path || 'N/A'}
						</TextInfo>
						<TextInfo className={styles['text-info']} label='Preset'>
							{watcher.preset_id}
						</TextInfo>
						<TextInfo className={styles['text-info']} label='Start Queue'>
							{Boolean(watcher.start_queue) ? 'Yes' : 'No'}
						</TextInfo>
					</div>
				</div>
				<div className={styles['rules']}>
					<div className={styles['header']}>
						<h5 className={styles['heading']}>Rules</h5>
						<ButtonInput
							className={styles['button']}
							Icon={AddIcon}
							color='blue'
							title='Add Watcher Rule'
							onClick={() => handleAddRule(watcher.watcher_id, defaultRuleDefinition)}
						/>
					</div>
					<div className={styles['rule-cards']}>
						{watcher.rules.length == 0 && (
							<div className={styles['rule-card']} style={{ textAlign: 'center' }}>
								N/A
							</div>
						)}
						{watcher.rules.map((rule, index) => (
							<WatcherCardRule
								id={rule.rule_id}
								rule={rule}
								index={index}
								handleUpdateRule={handleUpdateRule}
								handleRemoveRule={handleRemoveRule}
								key={`watcher-${watcher.watcher_id}-rule-${rule.rule_id}`}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
