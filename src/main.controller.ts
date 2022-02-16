import { Controller } from '@nestjs/common';
import { MissingCredentialsException } from './exceptions/missing-credentials.exception';
import {
	CreateRequest,
	CreateResponse,
	InputField_Type,
	Method,
	ReflectMethodRequest,
	ReflectMethodResponse,
} from './generated/co/mechen/distr/common/v1';
import {
	MainServiceController,
	MainServiceControllerMethods,
} from './generated/main';
import { HelperService } from './helper/helper.service';
import { CreateBucketDTO } from './s3/dto/create-bucket.dto';
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
			case Method.CREATE:
				return {
					method: Method.CREATE,
					inputs: [
						{
							name: 'name',
							description:
								'Bucket name (must be globally unique)',
							type: InputField_Type.STRING,
							fields: {},
						},
						{
							name: 'access',
							description:
								'ACL Access Level (private, public-read, public-read-write, authenticated-read)',
							type: InputField_Type.STRING,
							fields: {},
						},
					],
				};
		}
	}

	async create(request: CreateRequest): Promise<CreateResponse> {
		const credentials = request.credentials.aws;
		if (!credentials) throw new MissingCredentialsException('AWS');
		const input = await this.helperService.payloadToDTO(
			CreateBucketDTO,
			request.payload,
		);

		const status = await this.s3Service.create(credentials, input);

		return {
			status,
		};
	}
}
