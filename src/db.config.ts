import { MySqlDriver } from '@mikro-orm/mysql';
import {
	MikroOrmModuleOptions,
	MikroOrmOptionsFactory,
} from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EC2 } from './ec2/ec2.entity';

@Injectable()
export class DBConfig implements MikroOrmOptionsFactory<MySqlDriver> {
	constructor(private configService: ConfigService) {}

	createMikroOrmOptions() {
		const config: MikroOrmModuleOptions<MySqlDriver> = {
			type: 'mysql',
			host: this.configService.get('DB_HOST'),
			dbName: this.configService.get('DB_NAME'),
			port: +(this.configService.get<number>('DB_PORT') ?? 3306),
			user: this.configService.get('DB_USER'),
			password: this.configService.get('DB_PASSWORD'),
			entities: [EC2],
		};

		// if (migration) config.
		// else config.autoLoadEntities = true;

		return config;
	}
}
