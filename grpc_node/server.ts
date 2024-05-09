import {
  Server as grpcServer,
  ServerCredentials,
  ServerUnaryCall,
  sendUnaryData,
  ServerWritableStream,
} from '@grpc/grpc-js';
import { PeopleServiceService } from './proto/people';
import { PeopleId, PeopleData } from './proto/people';
import {
  eventData,
  clientData,
  eventStreamServiceService,
  eventPayloadData,
} from './proto/event';
import { getRandomInt, sleep, logger } from './tools/tools';

const event_log = new logger('event');
const unary_log = new logger('unary');

const peopleDataBase: PeopleData[] = [
  { name: 'Otonose Kanade', address: 'seoul, korea', age: 20 },
  { name: 'Ichijou Ririka', address: 'tokyo, japan', age: 23 },
  { name: 'Hiodoshi Ao', address: 'tokyo, japan', age: 22 },
  { name: 'Juufuutei Raden', address: 'tokyo, japan', age: 22 },
  { name: 'Todoroki Hajime', address: 'tokyo, japan', age: 21 },
];

function GetData(
  call: ServerUnaryCall<PeopleId, PeopleData>,
  callback: sendUnaryData<PeopleData>,
) {
  const id = call.request.id;
  unary_log.log(`Client request ${id}`);
  const data: PeopleData = peopleDataBase[id];
  callback(null, data);
}

async function eventStreamFunction(
  call: ServerWritableStream<clientData, eventData>,
) {
  const client_id = call.request.clientId;
  event_log.log(`Client ${client_id} connected to eventStream`);
  for (let i = 0; i < 100; i++) {
    const ev_data = makeEventData(client_id);
    if (!call.writable) {
      event_log.log(`Client ${client_id} eventStream not writeable!`);
      break;
    }
    call.write(ev_data);
    event_log.log(`Send event to client ${client_id}`);
    await sleep(2000);
  }
  call.end();
  event_log.log(`Client ${client_id} eventStream end!`);
}

/**
 * @description eventData를 적당히 랜덤으로 만들어주는 함수. 50%확률로 payload도 붙임
 * @param id Client id
 * @returns eventData
 */
function makeEventData(id: number): eventData {
  const ev_data: eventData = {
    eventName: '',
    eventId: getRandomInt(10000),
  };

  if (getRandomInt(100) > 50) {
    // 50%는 str payload, 50%는 people payload
    if (getRandomInt(100) > 50) {
      const payload: eventPayloadData = {
        payloadString:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      };
      ev_data.eventName = `${id}_string`;
      ev_data.payload = payload;
    } else {
      //peopleDataBase 에서 아무거나 하나 뽑아서 보내기
      const index = getRandomInt(peopleDataBase.length - 1);
      const payload_data: eventPayloadData = {
        peopleData: peopleDataBase[index],
      };
      ev_data.eventName = `${id}_people`;
      ev_data.payload = payload_data;
    }
  } else {
    ev_data.eventName = `${id}_no_payload`;
  }
  return ev_data;
}

const server = new grpcServer({
  'grpc.keepalive_time_ms': 1000,
  'grpc.keepalive_timeout_ms': 5000,
});
server.addService(PeopleServiceService, {
  getData: GetData,
});
server.addService(eventStreamServiceService, {
  getEventStream: eventStreamFunction,
});

server.bindAsync(
  'localhost:8080',
  ServerCredentials.createInsecure(),
  (error, port) => {
    if (error) {
      console.error(`server starting error!: ${error}`);
    } else {
      console.log(`server start on port ${port}`);
    }
  },
);
