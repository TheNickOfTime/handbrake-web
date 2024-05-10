type Params = {
	name: string;
	icon: string;
	onClick: () => void;
};

export default function DirectoryItem({ name, icon, onClick }: Params) {
	return (
		<button className='directory-item' onClick={onClick}>
			<i className={`icon bi ${icon}`} />
			<span>{name}</span>
		</button>
	);
}
