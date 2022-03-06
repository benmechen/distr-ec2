import { Controller, Get, Header } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';

@Controller()
export class AppController {
	constructor() {}

	@Get('_introspect')
	@Header('content-type', 'application/x-protobuf')
	async getProto(): Promise<string> {
		const proto = await new Promise((resolve, reject) => {
			fs.readFile(
				join(__dirname, '../../protos/main.proto'),
				(err, data) => {
					if (err) return reject(err);
					return resolve(data);
				},
			);
		});
		return proto.toString();
	}
}
