import { Controller } from '@nestjs/common';
import { Observable } from 'rxjs';
import { MissingCredentialsException } from './exceptions/missing-credentials.exception';
import {
	CreateRequest,
	CreateResponse,
	DeleteRequest,
	DeleteResponse,
	Field_Type,
	GetRequest,
	GetResponse,
	Method,
	ReflectMethodRequest,
	ReflectMethodResponse,
	Status,
	StatusRequest,
	StatusResponse,
	UpdateRequest,
	UpdateResponse,
	UsageRequest,
	UsageResponse,
	UsageType,
} from './generated/co/mechen/distr/common/v1';
import {
	MainServiceController,
	MainServiceControllerMethods,
} from './generated/main';
import { HelperService } from './helper/helper.service';
import { CreateBucketDTO } from './s3/dto/create-bucket.dto';
import { UpdateBucketDTO } from './s3/dto/update-bucket.dto';
import { S3Service } from './s3/s3.service';

@Controller()
@MainServiceControllerMethods()
export class MainController implements MainServiceController {
	constructor(
		private readonly s3Service: S3Service,
		private readonly helperService: HelperService,
	) {}

	reflect(request: ReflectMethodRequest): ReflectMethodResponse {
		switch (request.method) {
			case Method.GET:
				return {
					method: Method.GET,
					inputs: [],
					outputs: [
						{
							name: 'name',
							description: 'Bucket name (globally unique)',
							type: Field_Type.STRING,
							required: true,
							fields: {},
						},
						{
							name: 'public',
							description: 'Are the objects publically visible?',
							type: Field_Type.BOOLEAN,
							required: true,
							fields: {},
						},
						{
							name: 'location',
							description: 'Region the bucket is hosted in',
							type: Field_Type.STRING,
							required: false,
							fields: {},
						},
					],
				};
			case Method.CREATE:
				return {
					method: Method.CREATE,
					inputs: [
						{
							name: 'name',
							description:
								'Bucket name (must be globally unique)',
							type: Field_Type.STRING,
							required: true,
							fields: {},
						},
						{
							name: 'access',
							description:
								'ACL Access Level (private, public-read, public-read-write, authenticated-read)',
							type: Field_Type.STRING,
							required: false,
							fields: {},
						},
					],
					outputs: [],
				};
			case Method.UPDATE:
				return {
					method: Method.UPDATE,
					inputs: [
						{
							name: 'access',
							description:
								'ACL Access Level (private, public-read, public-read-write, authenticated-read)',
							type: Field_Type.STRING,
							required: false,
							fields: {},
						},
					],
					outputs: [],
				};
		}
	}

	async get(request: GetRequest): Promise<GetResponse> {
		const credentials = request.credentials.aws;
		if (!credentials) throw new MissingCredentialsException('AWS');

		const details = await this.s3Service.findByID(
			credentials,
			request.resourceId,
		);

		return {
			properties: this.helperService.dtoToPayload(details),
		};
	}

	async status(request: StatusRequest): Promise<StatusResponse> {
		const credentials = request.credentials.aws;
		if (!credentials) throw new MissingCredentialsException('AWS');

		const status = await this.s3Service.getStatus(
			credentials,
			request.resourceId,
		);

		return {
			status,
		};
	}

	async usage(): Promise<UsageResponse> {
		return {
			type: UsageType.UNLIMITED,
		};
	}

	async create(request: CreateRequest): Promise<CreateResponse> {
		const credentials = request.credentials.aws;
		if (!credentials) throw new MissingCredentialsException('AWS');
		const input = await this.helperService.payloadToDTO(
			CreateBucketDTO,
			request.payload,
		);

		const status = await this.s3Service.create(
			credentials,
			request.resourceId,
			input,
		);

		return {
			status,
		};
	}

	async update(request: UpdateRequest): Promise<UpdateResponse> {
		const credentials = request.credentials.aws;
		if (!credentials) throw new MissingCredentialsException('AWS');
		const input = await this.helperService.payloadToDTO(
			UpdateBucketDTO,
			request.payload,
		);

		const status = await this.s3Service.update(
			credentials,
			request.resourceId,
			input,
		);

		return {
			status,
		};
	}

	async delete(request: DeleteRequest): Promise<DeleteResponse> {
		const credentials = request.credentials.aws;
		if (!credentials) throw new MissingCredentialsException('AWS');

		const status = await this.s3Service.delete(
			credentials,
			request.resourceId,
		);

		return {
			status,
		};
	}
}
