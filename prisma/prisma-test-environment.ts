import NodeEnvironment from 'jest-environment-node';
import * as child from 'child_process';
import { JestEnvironmentConfig } from '@jest/environment';

class PrismaTestEnvironment extends NodeEnvironment {
  constructor(config: JestEnvironmentConfig) {
    super(config, null);

    // Generate a unique coakroachdb identifier for this test context
    process.env.DATABASE_URL = '';
    this.global.process.env.DATABASE_URL = '';
  }

  async setup() {
    // Run the migrations to ensure our schema has the required structure
    child.exec(`npm run migration`);

    return super.setup();
  }
}

module.exports = PrismaTestEnvironment;
