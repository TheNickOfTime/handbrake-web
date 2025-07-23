import { EndWithColon } from '~funcs/string.funcs';
import styles from './styles.module.scss';

type Params = {
	id: string;
	label?: string;
	value: boolean;
	setValue?: React.Dispatch<React.SetStateAction<boolean>>;
	onChange?: (value: boolean) => void;
	disabled?: boolean;
};

export default function ToggleInput({
	id,
	label,
	value,
	setValue,
	onChange,
	disabled = false,
}: Params) {
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (setValue) {
			setValue(event.target.checked);
		}
		if (onChange) {
			onChange(event.target.checked);
		}
	};

	return (
		<div className={`toggle-input ${styles['toggle-input']}`} id={id}>
			{label && (
				<label
					className={`input-label ${'toggle-input-label'} ${disabled ? ' disabled' : ''}`}
					htmlFor='toggle-input-checkbox'
				>
					{EndWithColon(label)}
				</label>
			)}
			<label className={styles['toggle-input-checkbox']} id='toggle-input-checkbox'>
				<input
					type='checkbox'
					id='checkbox-input'
					checked={value}
					onChange={handleChange}
					disabled={disabled}
				/>
			</label>
		</div>
	);
}
