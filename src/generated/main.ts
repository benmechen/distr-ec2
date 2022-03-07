/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { util, configure } from 'protobufjs/minimal';
import * as Long from 'long';
import { Observable } from 'rxjs';
import {
	ReflectMethodResponse,
	GetResponse,
	StatusResponse,
	UsageResponse,
	CreateResponse,
	UpdateResponse,
	DeleteResponse,
	ReflectMethodRequest,
	GetRequest,
	StatusRequest,
	UsageRequest,
	CreateRequest,
	UpdateRequest,
	DeleteRequest,
} from './co/mechen/distr/common/v1';

export const protobufPackage = 'sqs';

export const SQS_PACKAGE_NAME = 'sqs';

export interface MainServiceClient {
	reflect(request: ReflectMethodRequest): Observable<ReflectMethodResponse>;

	get(request: GetRequest): Observable<GetResponse>;

	status(request: StatusRequest): Observable<StatusResponse>;

	usage(request: UsageRequest): Observable<UsageResponse>;

	create(request: CreateRequest): Observable<CreateResponse>;

	update(request: UpdateRequest): Observable<UpdateResponse>;

	delete(request: DeleteRequest): Observable<DeleteResponse>;
}

export interface MainServiceController {
	reflect(
		request: ReflectMethodRequest,
	):
		| Promise<ReflectMethodResponse>
		| Observable<ReflectMethodResponse>
		| ReflectMethodResponse;

	get(
		request: GetRequest,
	): Promise<GetResponse> | Observable<GetResponse> | GetResponse;

	status(
		request: StatusRequest,
	): Promise<StatusResponse> | Observable<StatusResponse> | StatusResponse;

	usage(
		request: UsageRequest,
	): Promise<UsageResponse> | Observable<UsageResponse> | UsageResponse;

	create(
		request: CreateRequest,
	): Promise<CreateResponse> | Observable<CreateResponse> | CreateResponse;

	update(
		request: UpdateRequest,
	): Promise<UpdateResponse> | Observable<UpdateResponse> | UpdateResponse;

	delete(
		request: DeleteRequest,
	): Promise<DeleteResponse> | Observable<DeleteResponse> | DeleteResponse;
}

export function MainServiceControllerMethods() {
	return function (constructor: Function) {
		const grpcMethods: string[] = [
			'reflect',
			'get',
			'status',
			'usage',
			'create',
			'update',
			'delete',
		];
		for (const method of grpcMethods) {
			const descriptor: any = Reflect.getOwnPropertyDescriptor(
				constructor.prototype,
				method,
			);
			GrpcMethod('MainService', method)(
				constructor.prototype[method],
				method,
				descriptor,
			);
		}
		const grpcStreamMethods: string[] = [];
		for (const method of grpcStreamMethods) {
			const descriptor: any = Reflect.getOwnPropertyDescriptor(
				constructor.prototype,
				method,
			);
			GrpcStreamMethod('MainService', method)(
				constructor.prototype[method],
				method,
				descriptor,
			);
		}
	};
}

export const MAIN_SERVICE_NAME = 'MainService';

// If you get a compile-error about 'Constructor<Long> and ... have no overlap',
// add '--ts_proto_opt=esModuleInterop=true' as a flag when calling 'protoc'.
if (util.Long !== Long) {
	util.Long = Long as any;
	configure();
}
