import './button-input.scss';

type Params = {
	label?: string;
	icon?: string;
	color?: string;
	disabled?: boolean;
	onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

export default function ButtonInput({ label, icon, color, disabled = false, onClick }: Params) {
	return (
		<button className={`controlled-button ${color}`} onClick={onClick} disabled={disabled}>
			{icon && <i className={`button-icon bi ${icon}`} />}
			{label && <span className='button-label'>{label}</span>}
		</button>
	);
}
