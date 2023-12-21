import { Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { loadParameters } from './lib/loadParameters';

const parametersProvider: Provider = {
  provide: 'AWS_PARAMETERS',
  useFactory: async () => {
    const parameters = await loadParameters();
    return parameters;
  },
};

@Module({
  imports: [ConfigModule],
  providers: [parametersProvider],
  exports: [parametersProvider],
})
export class ParametersModule {}
