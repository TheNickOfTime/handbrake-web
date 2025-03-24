import './badge-info.scss';

type Params = {
	info: string;
};

export default function BadgeInfo({ info }: Params) {
	return <i className='badge-info bi bi-info-circle-fill' title={info} />;
}
