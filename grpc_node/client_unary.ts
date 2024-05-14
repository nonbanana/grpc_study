import { ServiceError, credentials } from '@grpc/grpc-js';
import { PeopleServiceClient, PeopleData, PeopleId } from './proto/people';

import { logger } from './tools/tools';

const unary_log = new logger('unary');

const client = new PeopleServiceClient(
  'localhost:8080',
  credentials.createInsecure(),
);

for (let i = 0; i < 5; i++) {
  const peopleId: PeopleId = { id: i };
  //unary call 예시
  unary_log.log(`Try to get unary data peopleId: ${peopleId.id}`);
  client.getData(peopleId, (err: ServiceError | null, response: PeopleData) => {
    unary_log.log(`Response data: ${JSON.stringify(response)}`);
  });
}
