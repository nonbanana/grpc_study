import { credentials } from '@grpc/grpc-js';

import { clientData, eventData, eventStreamServiceClient } from './proto/event';
import { getRandomInt, logger } from './tools/tools';

const event_log = new logger('event');

const eventClient = new eventStreamServiceClient(
  'localhost:8080',
  credentials.createInsecure(),
);

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
