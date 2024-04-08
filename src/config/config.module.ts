import { Global, Module, Provider } from '@nestjs/common';
import { loadParameters } from '../lib/loadParameters';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

const parametersProvider: Provider = {
  provide: 'AWS_PARAMETERS',
  useFactory: async () => {
    if (process.env.NODE_ENV === 'test') {
      if (fs.existsSync('.env.test')) {
        dotenv.config({ path: '.env.test' });
      }
      return process.env;
    }
    const parameters = await loadParameters();
    return parameters;
  },
};

@Global()
@Module({
  providers: [parametersProvider],
  exports: [parametersProvider],
})
export class ParametersModule {}
