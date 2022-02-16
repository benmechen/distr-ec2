import { Injectable } from '@nestjs/common';
import { Validator } from 'class-validator';
import { Input } from '../generated/co/mechen/distr/common/v1';

@Injectable()
export class HelperService {
	private validator = new Validator();

	async payloadToDTO<T extends object>(
		DTO: { new (): T },
		payload: Input[],
	): Promise<T> {
		const dto = new DTO();
		payload.forEach((input) => {
			dto[input.name] =
				input.value.stringValue ??
				input.value.numberValue ??
				input.value.boolValue ??
				input.value.structValue;
		});
		await this.validator.validateOrReject(dto);
		return dto;
	}
}
