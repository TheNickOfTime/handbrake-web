export type HandbrakePreset = {
	PresetList: [
		{
			// 'AlignAVStart': false;
			// 'AudioCopyMask': [
			// 	'copy:aac',
			// 	'copy:ac3',
			// 	'copy:eac3',
			// 	'copy:truehd',
			// 	'copy:dts',
			// 	'copy:dtshd'
			// ];
			// 'AudioEncoderFallback': 'av_aac';
			// 'AudioLanguageList': ['eng'];
			// 'AudioList': [
			// 	{
			// 		'AudioBitrate': 160;
			// 		'AudioCompressionLevel': 0;
			// 		'AudioEncoder': 'copy';
			// 		'AudioMixdown': 'dpl2';
			// 		'AudioNormalizeMixLevel': false;
			// 		'AudioSamplerate': '48';
			// 		'AudioTrackQualityEnable': false;
			// 		'AudioTrackQuality': 3;
			// 		'AudioTrackGainSlider': 0;
			// 		'AudioTrackDRCSlider': 0;
			// 	}
			// ];
			// 'AudioSecondaryEncoderMode': true;
			// 'AudioTrackSelectionBehavior': 'first';
			// 'ChapterMarkers': true;
			// 'ChildrenArray': [];
			// 'Default': false;
			FileFormat: string;
			// 'Folder': false;
			// 'FolderOpen': false;
			// 'Optimize': false;
			// 'Mp4iPodCompatible': false;
			// 'PictureCropMode': 0;
			// 'PictureBottomCrop': 0;
			// 'PictureLeftCrop': 0;
			// 'PictureRightCrop': 0;
			// 'PictureTopCrop': 0;
			// 'PictureDARWidth': 720;
			// 'PictureDeblockPreset': 'off';
			// 'PictureDeblockTune': 'medium';
			// 'PictureDeblockCustom': 'strength=strong:thresh=20:blocksize=8';
			// 'PictureDeinterlaceFilter': 'off';
			// 'PictureCombDetectPreset': 'off';
			// 'PictureCombDetectCustom': '';
			// 'PictureDenoiseCustom': '';
			// 'PictureDenoiseFilter': 'off';
			// 'PictureSharpenCustom': '';
			// 'PictureSharpenFilter': 'off';
			// 'PictureSharpenPreset': 'medium';
			// 'PictureSharpenTune': 'none';
			// 'PictureDetelecine': 'off';
			// 'PictureDetelecineCustom': '';
			// 'PictureColorspacePreset': 'off';
			// 'PictureColorspaceCustom': '';
			// 'PictureChromaSmoothPreset': 'off';
			// 'PictureChromaSmoothTune': 'none';
			// 'PictureChromaSmoothCustom': '';
			// 'PictureItuPAR': false;
			// 'PictureKeepRatio': true;
			// 'PicturePAR': 'none';
			// 'PicturePARWidth': 1;
			// 'PicturePARHeight': 1;
			PictureWidth: number;
			PictureHeight: number;
			// 'PictureUseMaximumSize': true;
			// 'PictureAllowUpscaling': false;
			// 'PictureForceHeight': 0;
			// 'PictureForceWidth': 0;
			// 'PicturePadMode': 'none';
			// 'PicturePadTop': 0;
			// 'PicturePadBottom': 0;
			// 'PicturePadLeft': 0;
			// 'PicturePadRight': 0;
			PresetName: string;
			// 'Type': 1;
			// 'SubtitleAddCC': false;
			// 'SubtitleAddForeignAudioSearch': false;
			// 'SubtitleAddForeignAudioSubtitle': false;
			// 'SubtitleBurnBehavior': 'none';
			// 'SubtitleBurnBDSub': false;
			// 'SubtitleBurnDVDSub': false;
			// 'SubtitleLanguageList': ['eng'];
			// 'SubtitleTrackSelectionBehavior': 'first';
			VideoAvgBitrate: number;
			// 'VideoColorMatrixCode': 0;
			VideoEncoder: string;
			// 'VideoFramerateMode': 'vfr';
			// 'VideoGrayScale': false;
			// 'VideoScaler': 'swscale';
			VideoPreset: string;
			// 'VideoTune': '';
			VideoProfile: string;
			// 'VideoLevel': 'auto';
			VideoOptionExtra: string;
			VideoQualityType: number;
			VideoQualitySlider: number;
			// 'VideoMultiPass': true;
			// 'VideoTurboMultiPass': false;
			// 'x264UseAdvancedOptions': false;
			// 'PresetDisabled': false;
			// 'MetadataPassthrough': true;
		}
	];
};
