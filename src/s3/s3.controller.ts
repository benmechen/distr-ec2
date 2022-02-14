import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { S3Service } from './s3.service';

@Controller()
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @GrpcMethod('S3Service', 'FindById')
  async findById(data: { id: string }) {
    return this.s3Service.findByID(data.id);
  }
}
