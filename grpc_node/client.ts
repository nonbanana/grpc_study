import { ServiceError, credentials } from '@grpc/grpc-js';
import { PeopleServiceClient, PeopleData, PeopleId } from './proto/people';

import { clientData, eventData, eventStreamServiceClient } from './proto/event';
import { getRandomInt, logger } from './tools/tools';

const peopleId: PeopleId = { id: 0 };
const event_log = new logger('event');
const unary_log = new logger('unary');

const eventClient = new eventStreamServiceClient(
  'localhost:8080',
  credentials.createInsecure(),
);
const client = new PeopleServiceClient(
  'localhost:8080',
  credentials.createInsecure(),
);

//unary call 예시
client.getData(peopleId, (err: ServiceError | null, response: PeopleData) => {
  unary_log.log(`get unary data peopleId: ${peopleId.id}`);
  unary_log.log(`Response data: ${JSON.stringify(response)}`);
});

// 이벤트 스트림을 받아옴
const client_data: clientData = { clientId: getRandomInt(10000) };
const eventStream = eventClient.getEventStream(client_data);

//이벤트 스트림의 콜백함수들 등록
eventStream.on('close', () => {
  event_log.log('eventStream closed!');
});
eventStream.on('data', (data: eventData) => {
  event_log.log(`Event: ${JSON.stringify(data)}`);
});
eventStream.on('metadata', (meta) => {
  event_log.log(`Meta: ${JSON.stringify(meta)}`);
});
