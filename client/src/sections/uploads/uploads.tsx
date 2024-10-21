import Section from 'components/section/section';
import SubSection from 'components/section/sub-section';
import { PrimaryOutletContextType } from 'pages/primary/primary-context';
import { useOutletContext } from 'react-router-dom';
import Error from 'sections/error/error';

import './uploads.scss';
import ButtonInput from 'components/base/inputs/button/button-input';
import PathInput from 'components/base/inputs/path/path-input';
import { FileBrowserMode } from 'types/file-browser';
import { useRef, useState } from 'react';

export default function UploadsSection() {
	const { config, serverURL } = useOutletContext<PrimaryOutletContextType>();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [uploadPath, setUploadPath] = useState(config.upload['default-upload-path']);

	const onUpload = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		// Make form data (have to do this because of mix of controlled/uncontrolled components)
		const form = event.currentTarget;
		const data = new FormData();
		data.append('upload-path', uploadPath);
		if (
			fileInputRef.current &&
			fileInputRef.current.files &&
			fileInputRef.current.files.length > 0
		) {
			data.append('file-upload', fileInputRef.current.files[0]);
		}

		// Send post request with form data
		try {
			const request = fetch(form.action, {
				method: 'POST',
				body: data,
			});

			const response = await request;

			console.log(response);
		} catch (error) {
			console.error(error);
		}
	};

	// Show error if uploads are disabled
	if (!config.upload['allow-uploads']) {
		return <Error />;
	}

	return (
		<Section title='Uploads' id='uploads-section'>
			<SubSection title='New File' id='upload-file'>
				<form
					action={`${serverURL}upload`}
					encType='multipart/form-data'
					method='post'
					onSubmit={onUpload}
				>
					<input
						ref={fileInputRef}
						className='file-upload'
						type='file'
						id='upload-file-input'
						name='file-upload'
					/>
					<PathInput
						id='upload-path-input'
						name='upload-path'
						label='Upload Path'
						rootPath={config.upload['default-upload-path']}
						startPath={config.upload['default-upload-path']}
						mode={FileBrowserMode.Directory}
						allowCreate={true}
						value={uploadPath}
						onConfirm={(item) => setUploadPath(item.path)}
					/>
					<ButtonInput label='Upload' icon='bi-upload' onClick={() => {}} />
				</form>
			</SubSection>
		</Section>
	);
}
