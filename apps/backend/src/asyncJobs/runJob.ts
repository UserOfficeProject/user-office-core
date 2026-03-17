// this is a dedicated CLI entrypoint script
/* eslint-disable no-console */
import 'reflect-metadata';
import { container } from 'tsyringe';

import '../config';
import { Tokens } from '../config/Tokens';
import { CallDataSource } from '../datasources/CallDataSource';
import checkAllCallsEndedJob from './jobs/checkAllCallsEnded';

async function main() {
  try {
    console.log('Running job: checkAllCallsEnded');
    const callDataSource = container.resolve<CallDataSource>(
      Tokens.CallDataSource
    );

    await checkAllCallsEndedJob.functionToRun(callDataSource);
    console.log('Job completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Job failed:', err);
    process.exit(1);
  }
}

main();
