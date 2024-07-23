export enum PictureCropMode {
	Automatic,
	Conservative,
	None,
	Custom,
}

export enum VideoQualityType {
	AvgBitrate = 1,
	ConstantQuality = 2,
}

export type HandbrakePresetDataType = {
	AlignAVStart: boolean;
	AudioCopyMask: string[];
	AudioEncoderFallback: string;
	AudioLanguageList: string[];
	AudioList: [
		{
			AudioBitrate: number;
			AudioCompressionLevel: number;
			AudioEncoder: string;
			AudioMixdown: string;
			AudioNormalizeMixLevel: boolean;
			AudioSamplerate: string;
			AudioTrackQualityEnable: boolean;
			AudioTrackQuality: number;
			AudioTrackGainSlider: number;
			AudioTrackDRCSlider: number;
		}
	];
	AudioSecondaryEncoderMode: boolean;
	AudioTrackSelectionBehavior: 'none' | 'first' | 'all';
	ChapterMarkers: boolean;
	// 'ChildrenArray': [];
	// 'Default': false;
	FileFormat: string;
	// 'Folder': false;
	// 'FolderOpen': false;
	Optimize: boolean;
	Mp4iPodCompatible: boolean;
	PictureCropMode: PictureCropMode;
	PictureBottomCrop: number;
	PictureLeftCrop: number;
	PictureRightCrop: number;
	PictureTopCrop: number;
	PictureDARWidth: number;
	PictureDeblockPreset:
		| 'off'
		| 'custom'
		| 'ultralight'
		| 'light'
		| 'medium'
		| 'strong'
		| 'stronger'
		| 'very strong';
	PictureDeblockTune: 'small' | 'medium' | 'large';
	PictureDeblockCustom: string;
	PictureDeinterlaceFilter: 'off' | 'yadif' | 'decomb' | 'custom';
	PictureDeinterlacePreset: 'custom' | 'default' | 'skip-spatial' | 'bob';
	PictureDeinterlaceCustom: string;
	PictureCombDetectPreset: 'custom' | 'default' | 'bob' | 'eedi2' | 'eedi2bob';
	PictureCombDetectCustom: string;
	PictureDenoiseCustom: string;
	PictureDenoiseFilter: 'off' | 'hqdn3d' | 'nlmeans';
	PictureDenoisePreset: string;
	PictureSharpenCustom: string;
	PictureSharpenFilter: 'off' | 'unsharp' | 'lapsharp';
	PictureSharpenPreset: 'custom' | 'light' | 'medium' | 'strong' | 'stronger' | 'verystrong';
	PictureSharpenTune: 'none' | 'ultrafine' | 'fine' | 'medium' | 'coarse' | 'verycoarse';
	PictureDetelecine: 'off' | 'custom' | 'default';
	PictureDetelecineCustom: string;
	PictureColorspacePreset: 'off' | 'custom' | 'bt2020' | 'bt709' | 'bt601-6-525' | 'bt601-6-625';
	PictureColorspaceCustom: string;
	PictureChromaSmoothPreset:
		| 'off'
		| 'custom'
		| 'ultralight'
		| 'light'
		| 'medium'
		| 'strong'
		| 'stronger'
		| 'very strong';
	PictureChromaSmoothTune: 'none' | 'tiny' | 'small' | 'medium' | 'wide' | 'verywide';
	PictureChromaSmoothCustom: string;
	PictureItuPAR: boolean;
	PictureKeepRatio: boolean;
	PicturePAR: 'none' | 'automatic' | 'custom';
	PicturePARWidth: number;
	PicturePARHeight: number;
	PictureRotate?: string;
	PictureWidth: number;
	PictureHeight: number;
	PictureUseMaximumSize: boolean;
	PictureAllowUpscaling: boolean;
	PictureForceHeight: number;
	PictureForceWidth: number;
	PicturePadMode: 'none' | 'custom';
	PicturePadTop: number;
	PicturePadBottom: number;
	PicturePadLeft: number;
	PicturePadRight: number;
	PicturePadColor: 'black' | 'white' | string;
	PresetName: string;
	// 'Type': 1;
	SubtitleAddCC: boolean;
	SubtitleAddForeignAudioSearch: boolean;
	SubtitleAddForeignAudioSubtitle: boolean;
	SubtitleBurnBehavior: 'none' | 'first' | 'foreign' | 'foreign_first';
	SubtitleBurnBDSub: boolean;
	SubtitleBurnDVDSub: boolean;
	SubtitleLanguageList: string[];
	SubtitleTrackSelectionBehavior: 'none' | 'first' | 'all';
	VideoAvgBitrate: number;
	VideoColorMatrixCode: number;
	VideoEncoder: 'x265_10bit' | string;
	VideoFrameRate?: string;
	VideoFramerateMode: 'vfr' | 'cfr' | 'pfr';
	VideoGrayScale: boolean;
	VideoScaler: string;
	VideoPreset: string;
	VideoTune: string;
	VideoProfile: string;
	VideoLevel: string;
	VideoOptionExtra: string;
	VideoQualityType: VideoQualityType;
	VideoQualitySlider: number;
	VideoMultiPass: boolean;
	VideoTurboMultiPass: boolean;
	x264UseAdvancedOptions: boolean;
	// 'PresetDisabled': false;
	MetadataPassthrough: boolean;
};

export type HandbrakePresetType = {
	PresetList: HandbrakePresetDataType[];
};

export type HandbrakePresetListType = {
	[index: string]: HandbrakePresetType;
};
