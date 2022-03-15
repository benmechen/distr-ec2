import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Validator } from 'class-validator';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { customAlphabet } from 'nanoid';
import { alphanumeric } from 'nanoid-dictionary';
import { ConfigService } from '@nestjs/config';
import {
	Input,
	Property,
	Value,
} from '../../generated/co/mechen/distr/common/v1';

const nanoid = customAlphabet(alphanumeric);

@Injectable()
export class HelperService {
	constructor(private readonly configService: ConfigService) {}

	private validator = new Validator();

	async payloadToDTO<T extends object>(
		DTO: { new (): T },
		payload: Input[],
	): Promise<T> {
		const dto = new DTO();
		payload.forEach((input) => {
			dto[input.name] =
				input.value.numberValue ??
				input.value.stringValue ??
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

	value(value: string | number | boolean | object): Value {
		switch (typeof value) {
			case 'boolean':
				return {
					boolValue: value,
					numberValue: undefined,
					stringValue: undefined,
					structValue: undefined,
				};
			case 'string':
				return {
					boolValue: undefined,
					numberValue: undefined,
					stringValue: value,
					structValue: undefined,
				};
			case 'number':
				return {
					boolValue: undefined,
					numberValue: value,
					stringValue: undefined,
					structValue: undefined,
				};
			case 'object':
				return {
					boolValue: undefined,
					numberValue: undefined,
					stringValue: undefined,
					structValue: {
						fields: value as Record<string, Value>,
					},
				};
			default:
				return {
					boolValue: undefined,
					numberValue: undefined,
					stringValue: undefined,
					structValue: undefined,
				};
		}
	}

	random(length = 6) {
		return nanoid(length);
	}

	get(key: string) {
		const value = this.configService.get(key);

		if (!value) throw new Error(`Value for ${key} not provided`);

		return value;
	}
}
