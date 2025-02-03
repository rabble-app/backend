import Rollbar, { Configuration } from 'rollbar';
import { Global, Module, Provider } from '@nestjs/common';

const env = process.env.APP_ENV ?? 'development';
const isLocal = env === 'local';
const rollbar = new Rollbar({
  enabled: true,
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  captureUncaught: !isLocal,
  captureUnhandledRejections: !isLocal,
  environment: env,
  nodeSourceMaps: true,
  verbose: true,
  payload: {
    environment: env,
    client: {
      javascript: {
        source_map_enabled: true,
        // code_version: '{CODE_VERSION}',
        guess_uncaught_frames: true,
      },
    },
  },
});

const options: Configuration = {
  enabled: !isLocal,
};

const rollbarProvider: Provider = {
  provide: 'ROLLBAR',
  useFactory: () => {
    return rollbar.configure(options);
  },
};

@Global()
@Module({
  providers: [rollbarProvider],
  exports: [rollbarProvider],
})
export class RollbarModule {}
