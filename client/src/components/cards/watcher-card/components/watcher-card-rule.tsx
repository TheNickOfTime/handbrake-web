import TextInfo from 'components/base/info/text-info/text-info';
import TextInput from 'components/base/inputs/text/text-input';
import { useState } from 'react';
import {
	WatcherRuleBaseMethods,
	WatcherRuleComparisonLookup,
	WatcherRuleComparisonMethods,
	WatcherRuleDefinitionType,
	WatcherRuleFileInfoMethods,
	WatcherRuleMaskMethods,
	WatcherRuleMediaInfoMethods,
	WatcherRuleNumberComparisonMethods,
	WatcherRuleStringComparisonMethods,
} from 'types/watcher';

type Params = {
	id: number;
	rule: WatcherRuleDefinitionType;
	index: number;
	handleUpdateRule: (id: number, rule: WatcherRuleDefinitionType) => void;
	handleRemoveRule: (ruleID: number) => void;
};

const maskLookup: { [key in WatcherRuleMaskMethods]: string } = {
	[WatcherRuleMaskMethods.Include]: 'Watches',
	[WatcherRuleMaskMethods.Exclude]: 'Ignores',
};

const baseRuleLookup: { [key in WatcherRuleBaseMethods]: string } = {
	[WatcherRuleBaseMethods.FileInfo]: 'info',
	[WatcherRuleBaseMethods.MediaInfo]: 'media info',
};

const fileInfoLookup: { [key in WatcherRuleFileInfoMethods]: string } = {
	[WatcherRuleFileInfoMethods.FileName]: 'name',
	[WatcherRuleFileInfoMethods.FileExtension]: 'extension',
	[WatcherRuleFileInfoMethods.FileSize]: 'size',
};

const mediaInfoLookup: { [key in WatcherRuleMediaInfoMethods]: string } = {
	[WatcherRuleMediaInfoMethods.MediaWidth]: 'width (pixels)',
	[WatcherRuleMediaInfoMethods.MediaHeight]: 'height (pixels)',
	[WatcherRuleMediaInfoMethods.MediaBitrate]: 'bitrate (kb/s)',
	[WatcherRuleMediaInfoMethods.MediaEncoder]: 'encoder',
};

const stringComarisonLookup: { [key in WatcherRuleStringComparisonMethods]: string } = {
	[WatcherRuleStringComparisonMethods.Contains]: 'contains',
	[WatcherRuleStringComparisonMethods.EqualTo]: 'equals',
	[WatcherRuleStringComparisonMethods.RegularExpression]: 'matches (regEx)',
};

const numberComparisonLookup: { [key in WatcherRuleNumberComparisonMethods]: string } = {
	[WatcherRuleNumberComparisonMethods.LessThan]: 'less than',
	[WatcherRuleNumberComparisonMethods.LessThanOrEqualTo]: 'less than/equal to',
	[WatcherRuleNumberComparisonMethods.EqualTo]: 'equal to',
	[WatcherRuleNumberComparisonMethods.GreaterThan]: 'greater than',
	[WatcherRuleNumberComparisonMethods.GreaterThanOrEqualTo]: 'greater than/equal to',
};

export default function WatcherCardRule({
	id,
	rule,
	index,
	handleUpdateRule,
	handleRemoveRule,
}: Params) {
	const [ruleName, setRuleName] = useState(rule.name);
	const [ruleMask, setRuleMask] = useState(rule.mask);
	const [baseRuleMethod, setBaseRuleMethod] = useState(rule.base_rule_method);
	const [ruleMethod, setRuleMethod] = useState(rule.rule_method);
	const [compareMethod, setCompareMethod] = useState(rule.comparison_method);
	const [comparison, setComparison] = useState(rule.comparison);

	const handleSave = () => {
		handleUpdateRule(id, {
			name: ruleName,
			mask: ruleMask,
			base_rule_method: baseRuleMethod,
			rule_method: ruleMethod,
			comparison_method: compareMethod,
			comparison: comparison,
		});
	};

	const isModified =
		rule.name != ruleName ||
		rule.mask != ruleMask ||
		rule.base_rule_method != baseRuleMethod ||
		rule.rule_method != ruleMethod ||
		rule.comparison_method != compareMethod ||
		rule.comparison != comparison;

	const newBaseComparisonMethod =
		WatcherRuleComparisonLookup[
			baseRuleMethod == WatcherRuleBaseMethods.FileInfo
				? WatcherRuleFileInfoMethods[ruleMethod]
				: baseRuleMethod == WatcherRuleBaseMethods.MediaInfo
				? WatcherRuleMediaInfoMethods[ruleMethod]
				: 0
		];

	return (
		<div className='watcher-card-rule'>
			<div className='watcher-card-rule-header'>
				<span>{index + 1}.</span>
				<input
					type='text'
					id='rule-name'
					value={ruleName}
					onChange={(event) => setRuleName(event.target.value)}
				/>
				{isModified && (
					<button className='save-button' onClick={handleSave}>
						<i className='bi bi-floppy2-fill' />
					</button>
				)}
				<button className='remove-button' onClick={() => handleRemoveRule(id)}>
					<i className='bi bi-trash-fill' />
				</button>
			</div>
			<form
				className='watcher-card-rule-properties'
				onSubmit={(event) => event.preventDefault()}
			>
				<select
					id='rule-mask'
					value={ruleMask}
					onChange={(event) => setRuleMask(parseInt(event.target.value))}
				>
					{Object.keys(WatcherRuleMaskMethods)
						.splice(0, Object.keys(WatcherRuleMaskMethods).length / 2)
						.map((key) => parseInt(key) as WatcherRuleMaskMethods)
						.map((key) => (
							<option value={key} key={`mask-${key}`}>
								{maskLookup[key]}
							</option>
						))}
				</select>
				<span>the file's</span>
				<select
					id='base-rule-method'
					value={baseRuleMethod}
					onChange={(event) => setBaseRuleMethod(parseInt(event.target.value))}
				>
					{Object.keys(WatcherRuleBaseMethods)
						.splice(0, Object.keys(WatcherRuleBaseMethods).length / 2)
						.map((key) => parseInt(key) as WatcherRuleBaseMethods)
						.map((key) => (
							<option value={key} key={`base-rule-method-${key}`}>
								{baseRuleLookup[key]}
							</option>
						))}
				</select>
				<span>where it's</span>
				<select
					id='rule-method'
					value={ruleMethod}
					onChange={(event) => setRuleMethod(parseInt(event.target.value))}
				>
					{baseRuleMethod == WatcherRuleBaseMethods.FileInfo
						? Object.keys(WatcherRuleFileInfoMethods)
								.splice(0, Object.keys(WatcherRuleFileInfoMethods).length / 2)
								.map((key) => parseInt(key) as WatcherRuleFileInfoMethods)
								.map((key) => (
									<option value={key} key={`file-info-method-${key}`}>
										{fileInfoLookup[key]}
									</option>
								))
						: baseRuleMethod == WatcherRuleBaseMethods.MediaInfo
						? Object.keys(WatcherRuleMediaInfoMethods)
								.splice(0, Object.keys(WatcherRuleMediaInfoMethods).length / 2)
								.map((key) => parseInt(key) as WatcherRuleMediaInfoMethods)
								.map((key) => (
									<option value={key} key={`media-info-method-${key}`}>
										{mediaInfoLookup[key]}
									</option>
								))
						: null}
				</select>
				{newBaseComparisonMethod == WatcherRuleComparisonMethods.Number && <span>is</span>}
				<select
					id='comparison-method'
					value={compareMethod}
					onChange={(event) => setCompareMethod(parseInt(event.target.value))}
				>
					{newBaseComparisonMethod == WatcherRuleComparisonMethods.String
						? Object.keys(WatcherRuleStringComparisonMethods)
								.splice(
									0,
									Object.keys(WatcherRuleStringComparisonMethods).length / 2
								)
								.map((key) => parseInt(key) as WatcherRuleStringComparisonMethods)
								.map((key) => (
									<option value={key} key={`string-comparison-${key}`}>
										{stringComarisonLookup[key]}
									</option>
								))
						: newBaseComparisonMethod == WatcherRuleComparisonMethods.Number
						? Object.keys(WatcherRuleNumberComparisonMethods)
								.splice(
									0,
									Object.keys(WatcherRuleNumberComparisonMethods).length / 2
								)
								.map((key) => parseInt(key) as WatcherRuleNumberComparisonMethods)
								.map((key) => (
									<option value={key} key={`number-comparison-${key}`}>
										{numberComparisonLookup[key]}
									</option>
								))
						: null}
				</select>
				<input
					type={
						newBaseComparisonMethod == WatcherRuleComparisonMethods.String
							? 'text'
							: newBaseComparisonMethod == WatcherRuleComparisonMethods.Number
							? 'number'
							: 'text'
					}
					id='comparison'
					value={comparison}
					placeholder={
						newBaseComparisonMethod == WatcherRuleComparisonMethods.String
							? 'nothing'
							: newBaseComparisonMethod == WatcherRuleComparisonMethods.Number
							? '0'
							: ''
					}
					size={1}
					onChange={(event) => setComparison(event.target.value)}
				/>
			</form>
		</div>
	);
}
