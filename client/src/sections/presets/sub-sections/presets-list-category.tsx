import PresetCard from 'components/cards/preset-card/preset-card';
import { FirstLetterUpperCase } from 'funcs/string.funcs';
import { useState } from 'react';
import { HandbrakePresetListType } from 'types/preset';

type Params = {
	category: string;
	presets: HandbrakePresetListType;
	allowRename: boolean;
	handleRenamePreset: (oldName: string, newName: string) => void;
	handleRemovePreset: (preset: string) => void;
};

export default function PresetListCategory({
	category,
	presets,
	allowRename,
	handleRenamePreset,
	handleRemovePreset,
}: Params) {
	const [isExpanded, setIsExpanded] = useState(true);

	return (
		<div className='category-list'>
			<div className='category-list-header' onClick={() => setIsExpanded(!isExpanded)}>
				<i className={`bi ${isExpanded ? 'bi-folder2-open' : 'bi-folder2'}`} />
				<span>{FirstLetterUpperCase(category)}</span>
				<i className={`bi ${isExpanded ? 'bi-caret-down-fill' : 'bi-caret-up-fill'}`} />
			</div>
			{isExpanded && (
				<div className='category-list-cards'>
					{Object.keys(presets).map((preset) => (
						<PresetCard
							preset={presets[preset]}
							handleRenamePreset={allowRename ? handleRenamePreset : undefined}
							handleRemovePreset={handleRemovePreset}
							key={`${category}-${preset}`}
						/>
					))}
				</div>
			)}
		</div>
	);
}
