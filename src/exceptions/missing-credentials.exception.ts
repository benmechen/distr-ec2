export class MissingCredentialsException extends Error {
	constructor(credential: 'AWS' | 'Azure' | 'Other') {
		super(`Missing ${credential} credentials for operation`);
	}
}
