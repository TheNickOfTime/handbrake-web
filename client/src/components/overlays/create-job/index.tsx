import { useContext, useState } from 'react';
import Overlay from '~components/root/overlay';
import { PrimaryContext } from '~layouts/primary/context';
import { DirectoryItemType, DirectoryItemsType } from '~types/directory';
import { HandbrakeOutputExtensions } from '~types/file-extensions';
import { QueueRequestType } from '~types/queue';
import { CreateJobContext, CreateJobContextType } from './context';
import { FilterVideoFiles, GetOutputItemsFromInputItems, RequestDirectory } from './funcs';
import ButtonsSection from './sections/buttons-section';
import InputSection from './sections/input-section';
import ModeSection from './sections/mode-section';
import OutputSection from './sections/output-section';
import PresetSection from './sections/preset-section';
import ResultSection from './sections/result-section';
import styles from './styles.module.scss';

interface Properties {
	onClose: () => void;
}

export enum JobFrom {
	FromFile,
	FromDirectory,
}

export default function CreateJob({ onClose }: Properties) {
	const { socket, config } = useContext(PrimaryContext)!;
	const [extensions] = useState<string[]>(Object.values(HandbrakeOutputExtensions));
	const [jobFrom, setJobFrom] = useState(JobFrom.FromFile);

	// Input -------------------------------------------------------------------
	const [inputPath, setInputPath] = useState('');
	const [inputFiles, setInputFiles] = useState<DirectoryItemsType>([]);
	const [isRecursive, setIsRecursive] = useState(false);

	// Output ------------------------------------------------------------------
	const [outputPath, setOutputPath] = useState('');
	const [outputFiles, setOutputFiles] = useState<DirectoryItemsType>([]);
	const [outputExtension, setOutputExtension] = useState(HandbrakeOutputExtensions.mkv);
	const [nameCollision, setNameCollision] = useState(false);
	const [outputChanged, setOutputChanged] = useState(false);
	const [allowCollision, setAllowCollision] = useState(false);

	// Preset ------------------------------------------------------------------
	const [presetCategory, setPresetCategory] = useState('');
	const [preset, setPreset] = useState('');
	const [isDefaultPreset, setIsDefaultPreset] = useState(false);

	// Results -----------------------------------------------------------------
	const [seeMore, setSeeMore] = useState(false);

	const canSubmit =
		inputPath != '' &&
		inputFiles.length > 0 &&
		outputPath != '' &&
		outputFiles.length > 0 &&
		preset != '' &&
		((!nameCollision && !allowCollision) || (nameCollision && allowCollision));
	// noExistingCollision;

	const handleJobFromChange = (newJobFrom: JobFrom) => {
		if (jobFrom != newJobFrom) {
			setJobFrom(newJobFrom);
			setInputPath('');
			setInputFiles([]);
			setIsRecursive(false);
			setOutputPath('');
			setOutputFiles([]);
			setNameCollision(false);
		}
	};

	const handleCancel = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();
		onClose();
	};

	const handleSubmit = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();

		console.log(inputFiles, outputFiles);

		inputFiles.forEach((file, index) => {
			const outputFile = outputFiles[index];
			const newJob: QueueRequestType = {
				input: file.path,
				output: outputFile.path,
				category: presetCategory,
				preset: preset,
			};
			socket.emit('add-job', newJob);
			console.log(`[client] New job sent to the server.\n${newJob}`);
		});

		onClose();
	};

	const handleFileInputConfirm = async (item: DirectoryItemType) => {
		const prevPath =
			inputFiles.length > 0
				? inputFiles[0].path.replace(inputFiles[0].name + inputFiles[0].extension, '')
				: undefined;
		console.log(prevPath == outputPath);

		// Set input variables
		setInputPath(item.path);
		setInputFiles([item]);

		// Set the output variables if the path is not set
		if (!outputPath || !outputChanged) {
			// const parentPath = item.path.replace(item.name + item.extension, '');
			const newOutputPath = config.paths['output-path']
				? config.paths['output-path']
				: item.path.replace(`/${item.name}${item.extension}`, '');
			setOutputPath(newOutputPath);

			const newOutputFiles: DirectoryItemsType = [
				{
					path: `${newOutputPath}/${item.name}${outputExtension}`,
					name: item.name,
					extension: outputExtension,
					isDirectory: false,
				},
			];
			const dedupedOutputFiles = await socket.emitWithAck(
				'check-name-collision',
				newOutputPath,
				newOutputFiles
			);
			setOutputFiles(dedupedOutputFiles);
		}
	};

	const handleDirectoryInputConfirm = async (item: DirectoryItemType) => {
		// Get input/output variables
		const inputPathItems: DirectoryItemsType = FilterVideoFiles(
			(await RequestDirectory(socket, item.path, isRecursive)).items
		);

		const newOutputPath = outputChanged
			? outputPath
			: config.paths['output-path']
			? config.paths['output-path']
			: item.path;
		const newOutputFiles: DirectoryItemsType = inputPathItems.map((inputItem) => {
			return {
				path: `${newOutputPath}/${inputItem.name}${outputExtension}`,
				name: inputItem.name,
				extension: outputExtension,
				isDirectory: inputItem.isDirectory,
			};
		});
		const dedupedOutputFiles = await socket.emitWithAck(
			'check-name-collision',
			newOutputPath,
			newOutputFiles
		);

		// Set input/output states
		setInputPath(item.path);
		if (outputPath != newOutputPath) {
			setOutputPath(newOutputPath);
		}

		setInputFiles(inputPathItems);
		setOutputFiles(dedupedOutputFiles);
	};

	const handleInputConfirm = async (item: DirectoryItemType) => {
		switch (jobFrom) {
			case JobFrom.FromFile:
				handleFileInputConfirm(item);
				break;
			case JobFrom.FromDirectory:
				handleDirectoryInputConfirm(item);
				break;
		}
	};

	const handleRecursiveChange = async (value: boolean) => {
		if (inputPath) {
			const newInputFiles = FilterVideoFiles(
				(await RequestDirectory(socket, inputPath, value)).items
			);
			const newOutputFiles = await socket.emitWithAck(
				'check-name-collision',
				outputPath,
				GetOutputItemsFromInputItems(newInputFiles, outputExtension)
			);
			setInputFiles(newInputFiles);
			setOutputFiles(newOutputFiles);
		}
	};

	const handleOutputConfirm = async (item: DirectoryItemType) => {
		setOutputPath(item.path);
		const newOutputFiles = inputFiles.map((inputItem) => {
			return {
				path: item.path + '/' + inputItem.name + outputExtension,
				name: inputItem.name,
				extension: outputExtension,
				isDirectory: inputItem.isDirectory,
			};
		});
		const dedupedOutputFiles = await socket.emitWithAck(
			'check-name-collision',
			item.path,
			newOutputFiles
		);
		setOutputFiles(dedupedOutputFiles);
		setOutputChanged(true);
	};

	const handleAllowOverwriteSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const value = event.target.value;
		setAllowCollision({ yes: true, no: false }[value]!);
	};

	const handleOutputNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const name = event.target.value;

		if (outputFiles.length > 0) {
			(async function () {
				const newOutputFiles = [...outputFiles];
				newOutputFiles[0].path = outputPath + '/' + name + outputExtension;
				newOutputFiles[0].name = name;
				setOutputFiles(newOutputFiles);
				setOutputChanged(true);

				const existingFiles: DirectoryItemsType = (
					await RequestDirectory(socket, outputPath)
				).items;
				if (
					existingFiles
						.map((item) => item.name + item.extension)
						.includes(newOutputFiles[0].name + newOutputFiles[0].extension)
				) {
					setNameCollision(true);
				} else if (nameCollision) {
					setNameCollision(false);
					setAllowCollision(false);
				}
			})();
		}
	};

	const handleExtensionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const extension = event.target.value;

		setOutputExtension(extension as HandbrakeOutputExtensions);
		setOutputChanged(true);
		const newOutputFiles = outputFiles.map((file) => {
			const oldFileName = file.name + file.extension;

			file.extension = extension;

			const newFileName = file.name + file.extension;
			file.path = file.path.replace(new RegExp(`${oldFileName}$`), newFileName);
			return file;
		});

		console.log(newOutputFiles);

		(async function () {
			const existingFiles: DirectoryItemsType = (await RequestDirectory(socket, outputPath))
				.items;
			if (jobFrom == JobFrom.FromFile) {
				if (
					existingFiles
						.map((item) => item.name + item.extension)
						.includes(newOutputFiles[0].name + newOutputFiles[0].extension)
				) {
					setNameCollision(true);
				} else if (nameCollision) {
					setNameCollision(false);
				}
				setOutputFiles(newOutputFiles);
			} else {
				const dedupedOutputFiles = await socket.emitWithAck(
					'check-name-collision',
					outputPath,
					newOutputFiles
				);
				setOutputFiles(dedupedOutputFiles);
			}
		})();
	};

	const handlePresetCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const category = event.target.value;
		setPresetCategory(category);
		setIsDefaultPreset(category.includes('Default: '));
	};

	const handlePresetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const preset = event.target.value;
		setPreset(preset);
	};

	const handleSeeMore = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();
		setSeeMore(!seeMore);
	};

	const contextValue: CreateJobContextType = {
		extensions,
		jobFrom,
		inputPath,
		setInputPath,
		inputFiles,
		setInputFiles,
		isRecursive,
		setIsRecursive,
		outputPath,
		setOutputPath,
		outputFiles,
		setOutputFiles,
		outputExtension,
		setOutputExtension,
		nameCollision,
		setNameCollision,
		outputChanged,
		setOutputChanged,
		allowCollision,
		setAllowCollision,
		presetCategory,
		setPresetCategory,
		preset,
		setPreset,
		isDefaultPreset,
		setIsDefaultPreset,
		seeMore,
		setSeeMore,
		canSubmit,
		handleJobFromChange,
		handleCancel,
		handleSubmit,
		handleFileInputConfirm,
		handleDirectoryInputConfirm,
		handleInputConfirm,
		handleRecursiveChange,
		handleOutputConfirm,
		handleAllowOverwriteSelect,
		handleOutputNameChange,
		handleExtensionChange,
		handlePresetCategoryChange,
		handlePresetChange,
		handleSeeMore,
	};

	return (
		<Overlay className={styles['create-job-overlay']}>
			<h1 className={styles['heading']}>Create New Job</h1>
			<CreateJobContext value={contextValue}>
				<ModeSection />
				<form action='' className={styles['job-form']}>
					<InputSection />
					<OutputSection />
					<PresetSection />
					{inputFiles.length > 0 && outputFiles.length > 0 && <ResultSection />}
					<ButtonsSection />
				</form>
			</CreateJobContext>
		</Overlay>
	);
}
