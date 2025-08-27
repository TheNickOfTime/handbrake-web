import { useContext } from 'react';
import ButtonInput from '~components/base/inputs/button';
import { CreateJobContext } from '../../context';
import styles from '../../styles.module.scss';

export default function ButtonsSection() {
	const { handleCancel, canSubmit, handleSubmit } = useContext(CreateJobContext)!;

	return (
		<div className={styles['buttons-section']}>
			<ButtonInput label='Cancel' color='red' onClick={handleCancel} />
			<ButtonInput
				label='Submit'
				color='green'
				disabled={!canSubmit}
				onClick={handleSubmit}
			/>
		</div>
	);
}
