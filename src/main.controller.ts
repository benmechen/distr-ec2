import { Controller } from '@nestjs/common';
import { Observable } from 'rxjs';
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
import { S3Service } from './s3/s3.service';

@Controller()
@MainServiceControllerMethods()
export class MainController implements MainServiceController {
  constructor(private readonly s3Service: S3Service) {}

  reflect(request: ReflectMethodRequest): ReflectMethodResponse {
    switch (request.method) {
      case Method.CREATE:
        return {
          method: Method.CREATE,
          inputs: [
            {
              name: 'name',
              description: 'Bucket name (must be globally unique)',
              type: InputField_Type.STRING,
              fields: {},
            },
            {
              name: 'credentials',
              description: 'AWS Credentials',
              type: InputField_Type.STRING,
              fields: {},
            },
          ],
        };
    }
  }

  create(request: CreateRequest): CreateResponse {
    console.log('Create:', request.payload, request.credentials);
    return {
      status: true,
    };
  }
}
