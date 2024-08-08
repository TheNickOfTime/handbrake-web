import ffprobe from 'ffprobe';
import ffprobeStatic from 'ffprobe-static';

export async function GetMediaInfo(mediaPath: string) {
	const mediaInfo = await ffprobe(mediaPath, { path: ffprobeStatic.path });
	return mediaInfo;
}

export function ConvertBitsToKilobits(bytes: number) {
	return bytes / Math.pow(10, 3);
}

export function ConvertBytesToMegabytes(bytes: number) {
	return bytes / Math.pow(10, 6);
}
