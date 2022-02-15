/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { util, configure } from 'protobufjs/minimal';
import * as Long from 'long';
import { Observable } from 'rxjs';
import {
  ReflectMethodResponse,
  CreateResponse,
  ReflectMethodRequest,
  CreateRequest,
} from './co/mechen/distr/common/v1';

export const protobufPackage = 's3';

export interface Bucket {
  name: string;
}

export interface BucketById {
  id: string;
}

export interface DeleteBucketRequest {
  id: string;
}

export interface CreateBucketRequest {
  name: string;
  region: string;
}

export const S3_PACKAGE_NAME = 's3';

export interface MainServiceClient {
  reflect(request: ReflectMethodRequest): Observable<ReflectMethodResponse>;

  create(request: CreateRequest): Observable<CreateResponse>;
}

export interface MainServiceController {
  reflect(
    request: ReflectMethodRequest,
  ):
    | Promise<ReflectMethodResponse>
    | Observable<ReflectMethodResponse>
    | ReflectMethodResponse;

  create(
    request: CreateRequest,
  ): Promise<CreateResponse> | Observable<CreateResponse> | CreateResponse;
}

export function MainServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ['reflect', 'create'];
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
