import { Injectable } from '@nestjs/common';

@Injectable()
export class S3Service {
  async findByID(id: string) {
    return {
      name: id,
    };
  }
}
