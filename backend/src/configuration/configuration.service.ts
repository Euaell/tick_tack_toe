// src/configuration/configuration.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConfigurationService {
	constructor(private readonly configService: ConfigService) {}

	get(key: string, defaultValue: string | number | boolean = null): string {
		if (defaultValue) {
			// TODO: return this.configService.get<string>(key, defaultValue);
		}
		return this.configService.get<string>(key);
	}
}
