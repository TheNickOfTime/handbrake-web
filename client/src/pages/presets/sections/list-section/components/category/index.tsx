import CaretDownIcon from '@icons/caret-down-fill.svg?react';
import CaretUpIcon from '@icons/caret-up-fill.svg?react';
import FolderOpenIcon from '@icons/folder2-open.svg?react';
import FolderIcon from '@icons/folder2.svg?react';
import { CSSProperties, useState } from 'react';
import PresetCard from '~components/cards/preset-card';
import { FirstLetterUpperCase } from '~funcs/string.funcs';
import { HandbrakePresetListType } from '~types/preset';
import styles from './styles.module.scss';

type Params = {
	category: string;
	presets: HandbrakePresetListType;
	collapsed: boolean;
	canModify: boolean;
	handleRenamePreset: (oldName: string, newName: string, category: string) => void;
	handleRemovePreset: (preset: string, category: string) => void;
};

export default function PresetCategory({
	category,
	presets,
	collapsed,
	canModify,
	handleRenamePreset,
	handleRemovePreset,
}: Params) {
	const [isExpanded, setIsExpanded] = useState(!collapsed);

	return (
		<div className={styles['preset-category']}>
			<button className={styles['header']} onClick={() => setIsExpanded(!isExpanded)}>
				{isExpanded ? (
					<FolderOpenIcon className={styles['folder-icon']} />
				) : (
					<FolderIcon className={styles['folder-icon']} />
				)}
				<span>{`${FirstLetterUpperCase(category)}${
					isExpanded ? '' : ` (${Object.keys(presets).length})`
				}`}</span>
				{isExpanded ? (
					<CaretDownIcon className={styles['caret-icon']} />
				) : (
					<CaretUpIcon className={styles['caret-icon']} />
				)}
			</button>
			<div
				className={styles['preset-cards']}
				data-expanded={isExpanded}
				style={{ '--preset-count': Object.keys(presets).length } as CSSProperties}
			>
				<div className={styles['wrapper']}>
					<div className={styles['cards']}>
						{Object.keys(presets).map((preset) => (
							<PresetCard
								preset={presets[preset]}
								category={category}
								canModify={canModify}
								handleRenamePreset={canModify ? handleRenamePreset : undefined}
								handleRemovePreset={handleRemovePreset}
								key={`${category}-${preset}`}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
