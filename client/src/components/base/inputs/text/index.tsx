import { EndWithColon } from '~funcs/string.funcs';
import styles from './styles.module.scss';

type Params = {
	id: string;
	label?: string;
	value: string;
	setValue?: React.Dispatch<React.SetStateAction<string>>;
	onChange?: (value: string) => void;
	onSubmit?: (value: string) => void;
	disabled?: boolean;
};

export default function TextInput({
	id,
	label,
	value,
	setValue,
	onChange,
	onSubmit,
	disabled = false,
}: Params) {
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (onChange) {
			onChange(event.target.value);
		}
		if (setValue) {
			setValue(event.target.value);
		}
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key == 'Enter' && onSubmit) {
			onSubmit(value);
		}
	};

	return (
		<div className={styles['text-input']}>
			{label && <label htmlFor={id}>{EndWithColon(label)}</label>}
			<input
				className='form-item'
				id={id}
				type='text'
				value={value}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				size={1}
				disabled={disabled}
			/>
		</div>
	);
}
