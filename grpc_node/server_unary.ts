import {
  Server as grpcServer,
  ServerCredentials,
  ServerUnaryCall,
  sendUnaryData,
} from '@grpc/grpc-js';
import { PeopleServiceService } from './proto/people';
import { PeopleId, PeopleData } from './proto/people';
import { logger } from './tools/tools';

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

const server = new grpcServer({
  'grpc.keepalive_time_ms': 1000,
  'grpc.keepalive_timeout_ms': 5000,
});
server.addService(PeopleServiceService, {
  getData: GetData,
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
