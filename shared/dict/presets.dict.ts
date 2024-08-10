import { ClientLookupDict } from '../types/dict';

export const PresetFormatDict: ClientLookupDict = {
	av_mp4: '.mp4',
	av_mkv: '.mkv',
	av_webm: '.webm',
};

export const PresetEncoderDict: ClientLookupDict = {
	svt_av1: 'AV1 (SVT)',
	svt_av1_10bit: 'AV1 10-bit (SVT)',
	x264: 'H.264 (x264)',
	x264_10bit: 'H.264 10-bit (x264)',
	nvenc_h264: 'H.264 (NVEnc)',
	x265: 'H.256 (x265)',
	x265_10bit: 'H.256 10-bit (x265)',
	x265_12bit: 'H.256 12-bit (x265)',
	nvenc_h265: 'H.256 (NVEnc)',
	nvenc_h265_10bit: 'H.256 (NVEnc)',
	mpeg4: 'MPEG-4',
	mpeg2: 'MPEG-2',
	VP8: 'VP8',
	VP9: 'VP9',
	VP9_10bit: 'VP9 10-bit',
	theora: 'theora',
};

export const PresetAudioEncoderDict: ClientLookupDict = {
	copy: 'Auto Passthru',
	'copy:aac': 'AAC Passthru',
	'copy:ac3': 'AC3 Passthru',
	'copy:eac3': 'E-AC3 Passthru',
	'copy:truehd': 'TrueHD Passthru',
	'copy:dts': 'DTS Passthru',
	'copy:dtshd': 'DTS-HD Passthru',
	'copy:mp2': 'MP2 Passthru',
	'copy:mp3': 'MP3 Passthru',
	'copy:flac': 'FLAC Passthru',
	'copy:opus': 'Opus Passthru',
	ac3: 'AC3',
	av_aac: 'AAC (avcodec)',
	eac3: 'E-AC3',
};

export const PresetPropertiesDict: ClientLookupDict = {
	// general
	off: 'Off',
	none: 'None',
	default: 'Default',
	auto: 'Automatic',
	custom: 'Custom',

	// filter properties
	ultralight: 'Ultralight',
	light: 'Light',
	medium: 'Medium',
	strong: 'Strong',
	stronger: 'Stronger',
	verystrong: 'Very Strong',
	ultrafine: 'Ultrafine',
	fine: 'Fine',
	coarse: 'Coarse',
	verycoarse: 'Very Coarse',
	tiny: 'Tiny',
	small: 'Small',
	large: 'Large',
	wide: 'Wide',
	verywide: 'Very Wide',

	// filter names
	bob: 'Bob',
	bt2020: 'BT.2020',
	'bt601-6-525': 'BT.601 SMPTE-C',
	'bt601-6-625': 'BT.601 EBU',
	bt709: 'BT.709',
	chroma_smooth: 'Chroma Smooth',
	deblock: 'Deblock',
	decomb: 'Decomb',
	detelecine: 'Detelecine',
	eedi2: 'EEDI2',
	eedi2bob: 'EEDI2 Bob',
	grayscale: 'Grayscale',
	lapsharp: 'LapSharp',
	nlmeans: 'NLMeans',
	'skip-spatial': 'Skip Spatial Check',
	unsharp: 'UnSharp',
	yadif: 'Yadif',

	//encoder profiles
	main: 'Main',
	main10: 'Main 10',
	baseline: 'Baseline',
	high: 'High',
};
