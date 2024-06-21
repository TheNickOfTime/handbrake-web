import { HandbrakeOutputExtensions } from '../../../../../types/file-extensions';
import '../../';

export type SplitFileName = {
	name: string;
	extension: string;
};

export type SplitFileNames = SplitFileName[];

export type SplitFilePath = {
	path: string;
} & SplitFileName;

export type SplitFilePaths = SplitFilePath[];

export function SplitName(name: string) {
	const splitRegex = /^(.+)(\.[\w\d]+)$/;
	const splitResult = name.match(splitRegex);
	if (splitResult) {
		const result: SplitFileName = {
			name: splitResult[1],
			extension: splitResult[2],
		};
		return result;
	} else {
		console.error(`[client] [error] Could not split the name '${name}'.`);
	}
}

export function SplitPath(path: string) {
	const splitRegex = /^\/.+\/(.+)(\.[\w\d]+)$/;
	const splitResult = path.match(splitRegex);
	if (splitResult) {
		const result: SplitFilePath = {
			path: path.replace('/' + splitResult[1] + splitResult[2], ''),
			name: splitResult[1],
			extension: splitResult[2],
		};
		return result;
	} else {
		console.error(`[client] [error] Could not split the path '${path}'.`);
	}
}

export function GenerateOutputFilesFromInputFiles(
	inputFiles: SplitFileName[],
	extension: HandbrakeOutputExtensions
) {
	const deepCopyInputFiles: SplitFileName[] = JSON.parse(JSON.stringify(inputFiles));
	const newOutputFiles: SplitFileName[] = deepCopyInputFiles.map((child) => {
		const result: SplitFileName = {
			name: child.name,
			extension: extension,
		};
		return result;
	});

	return newOutputFiles;
}
