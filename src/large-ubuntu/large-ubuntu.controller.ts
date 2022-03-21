import { Controller } from '@nestjs/common';
import {
	ReflectMethodRequest,
	ReflectMethodResponse,
	GetRequest,
	GetResponse,
	StatusRequest,
	StatusResponse,
	UsageResponse,
	CreateRequest,
	CreateResponse,
	UpdateRequest,
	UpdateResponse,
	DeleteRequest,
	DeleteResponse,
	UsageRequest,
} from '../generated/co/mechen/distr/common/v1';
import {
	MainServiceController,
	MainServiceControllerMethods,
} from '../generated/main';
import { MainController } from '../main.controller';
import { HelperService } from '../shared/helper/helper.service';

@Controller()
@MainServiceControllerMethods()
export class LargeUbuntuController implements MainServiceController {
	constructor(
		private readonly helperService: HelperService,
		private readonly mainController: MainController,
	) {}

	reflect(request: ReflectMethodRequest): ReflectMethodResponse {
		return this.mainController.reflect(request);
	}

	async get(request: GetRequest): Promise<GetResponse> {
		return this.mainController.get(request);
	}

	async status(request: StatusRequest): Promise<StatusResponse> {
		return this.mainController.status(request);
	}

	async usage(request: UsageRequest): Promise<UsageResponse> {
		return this.mainController.usage(request);
	}

	async create(request: CreateRequest): Promise<CreateResponse> {
		return this.mainController.create({
			...request,
			payload: [
				...request.payload,
				{
					name: 'instanceType',
					value: {
						stringValue: 't3.xlarge',
						numberValue: undefined,
						boolValue: undefined,
						structValue: undefined,
					},
				},
				{
					name: 'image',
					value: {
						stringValue: this.helperService.get('UBUNTU'),
						numberValue: undefined,
						boolValue: undefined,
						structValue: undefined,
					},
				},
			],
		});
	}

	async update(request: UpdateRequest): Promise<UpdateResponse> {
		return this.mainController.update(request);
	}

	async delete(request: DeleteRequest): Promise<DeleteResponse> {
		return this.mainController.delete(request);
	}
}
