import { Global, Module, Provider } from '@nestjs/common';
import { loadParameters } from '@/lib/loadParameters';

const parametersProvider: Provider = {
  provide: 'AWS_PARAMETERS',
  useFactory: async () => {
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
