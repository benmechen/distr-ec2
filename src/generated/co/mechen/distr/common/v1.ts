/* eslint-disable */
import { util, configure } from 'protobufjs/minimal';
import * as Long from 'long';
import { Any } from '../../../../google/protobuf/any';

export const protobufPackage = 'co.mechen.distr.common.v1';

export enum Method {
  CREATE = 0,
  UPDATE = 1,
  DELETE = 2,
  UNRECOGNIZED = -1,
}

export interface Property {
  name: string;
  type: Property_Type;
  value: Any | undefined;
}

export enum Property_Type {
  STRING = 0,
  NUMBER = 1,
  BOOLEAN = 2,
  ENUM = 3,
  UNRECOGNIZED = -1,
}

export interface Input {
  name: string;
  description?: string | undefined;
  type: Input_Type;
}

export enum Input_Type {
  STRING = 0,
  NUMBER = 1,
  BOOLEAN = 2,
  ENUM = 3,
  UNRECOGNIZED = -1,
}

export interface ReflectMethodRequest {
  method: Method;
}

export interface ReflectMethodResponse {
  method: Method;
  inputs: Input[];
}

export const CO_MECHEN_DISTR_COMMON_V1_PACKAGE_NAME =
  'co.mechen.distr.common.v1';

// If you get a compile-error about 'Constructor<Long> and ... have no overlap',
// add '--ts_proto_opt=esModuleInterop=true' as a flag when calling 'protoc'.
if (util.Long !== Long) {
  util.Long = Long as any;
  configure();
}
