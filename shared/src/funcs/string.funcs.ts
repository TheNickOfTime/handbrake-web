export function FirstLetterUpperCase(text: string) {
	return text.charAt(0).toUpperCase() + text.slice(1);
}

export function BooleanToConfirmation(bool: boolean) {
	return bool ? 'Yes' : 'No';
}

export function EndWithColon(text: string) {
	return text.replace(/[:\s]+$/, '') + ':';
}
