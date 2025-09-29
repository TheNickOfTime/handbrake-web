export function LanguageCodeToName(code: string) {
	return new Intl.DisplayNames(['en'], { type: 'language' }).of(code);
}
