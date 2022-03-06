import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Validator } from 'class-validator';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { Input, Property } from '../generated/co/mechen/distr/common/v1';

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
		const errors = await this.validator.validate(dto, {
			validationError: { target: false },
			stopAtFirstError: true,
		});
		if (errors.length > 0)
			throw new RpcException({
				code: GrpcStatus.FAILED_PRECONDITION,
				message: Object.values(errors[0].constraints).join(', '),
			});
		return dto;
	}

	dtoToPayload<T extends object>(dto: T): Property[] {
		return Object.entries(dto).map(([key, value]) => ({
			name: key,
			value: {
				stringValue: typeof value === 'string' ? value : undefined,
				numberValue: typeof value === 'number' ? value : undefined,
				boolValue: typeof value === 'boolean' ? value : undefined,
				structValue:
					typeof value === 'object'
						? {
								fields: value,
						  }
						: undefined,
			},
		}));
	}
}
