import { SSMClient, GetParametersByPathCommand } from '@aws-sdk/client-ssm';

const client = new SSMClient({
  region: process.env.RABBLE_AWS_REGION,
  credentials: {
    accessKeyId: process.env.RABBLE_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.RABBLE_AWS_SECRET_ACCESS_KEY,
  },
});

const getEnv = () => {
  const env = process.env.APP_ENV ?? 'dev';
  switch (env) {
    case 'production':
    case 'prod':
      return 'prod';
    case 'staging':
      return 'staging';
    case 'development':
    case 'dev':
      return 'dev';
    case 'local':
      return 'local';
    default:
      return 'dev';
  }
};

export const loadParameters = async () => {
  let env = getEnv();
  if (env === 'local') {
    env = 'dev';
  }

  const inputParams = {
    Path: `/api/${env}`,
    WithDecryption: true,
  };

  const command = new GetParametersByPathCommand(inputParams);

  const config: Record<string, string> = {};

  let data = await client.send(command);
  let Parameters = data.Parameters;
  Parameters.forEach((Parameter) => {
    config[Parameter.Name.split('/').at(-1)] = Parameter.Value;
  });

  while (data.NextToken) {
    const nextCommand = new GetParametersByPathCommand({
      ...inputParams,
      NextToken: data.NextToken,
    });
    data = await client.send(nextCommand);

    Parameters = data.Parameters;

    Parameters.forEach((Parameter) => {
      const key = Parameter.Name.split('/').at(-1);
      config[key] = Parameter.Value;
    });
  }
  return config;
};
