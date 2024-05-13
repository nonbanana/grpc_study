# gRPC tutorial
ref: https://medium.com/@yujso66/%EB%B2%88%EC%97%AD-node-js%EC%97%90%EC%84%9C-grpc-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0-4521604d8852

# Unary 예제
## 준비물
protoc 설치
## proto specification file 생성
protobuffer에 맞게 specification 파일을 생성합니다.
```proto
syntax = "proto3";

package PeoplePackage;

service PeopleService {
    rpc GetData(PeopleId) returns (PeopleData) {}
}

message PeopleData {
    string name = 1;
    int32 age = 2;
    string address = 3;
}

message PeopleId {
    int32 id = 1;
}
``` 
위 파일의 내용을 people.proto로 저장하였습니다.
### syntax
파일의 맨 위에 `syntax = "proto3";` 로 protobuffer 3 버전에 맞게 작성하였다고 선언합니다. 작성시점에서는 2와 3 버전을 사용할 수 있는데 하위호환성 이슈가 있지 않다면(새로 도입한다면) 3버전을 사용하는게 좋습니다.
### package
message 타입간의 이름 충돌 방지를 위한 네임스페이스로 사용됩니다. 
### service
call 될 함수를 정의합니다.
PeopleId을 입력으로 받고, PeopleData 를 출력으로 받는 GetData 함수를 지정하였습니다.
### message
struct를 정의합니다.

## protobuf compile
proto 파일을 언어에 맞게 컴파일 합니다.
```bash
npm run build:proto
```
위 내용을 실행하면 proto 디렉터리에 있는 proto 파일들을 읽고 타입스크립트 파일(ts)을 생성합니다. npm run 스크립트 안에서는 protoc를 호출해서 proto 파일을 ts로 컴파일합니다. 자세한 protoc 컴파일 옵션은 [package.json](package.json) 파일을 참조하세요. 
## unary 서버 구현
```js
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
```
위 코드가 [server_unary.ts](server_unary.ts) unary 서버의 구현입니다. 
중요한 부분만 따로 떼어서 설명하자면...

```js
function GetData(
  call: ServerUnaryCall<PeopleId, PeopleData>,
  callback: sendUnaryData<PeopleData>,
) {
  const id = call.request.id;
  unary_log.log(`Client request ${id}`);
  const data: PeopleData = peopleDataBase[id];
  callback(null, data);
}
```
위와 같이 GetData를 구현하는 부분을 만듭니다. GetData 함수에서 받은 `call`인자는 클라이언트가 unary호출을 할때 보낸 인자(이 예제의 경우 `PeopleId` 메시지) 와 정보들을 담고 있습니다. 
여기서 함수 인자로 받은 callback은 클라이언트에게 응답을 돌려줄때 사용할 함수로, 위의 예제처럼 클라이언트에게 돌려줄 데이터를 만들어서 callback에 넣고 호출하면 됩니다. 
```js
server.addService(PeopleServiceService, {
  getData: GetData,
});
```
이렇게 만든 `getData` 구현 함수를 addService 로 등록하면 클라이언트가 unary 호출을 할때 `getData`함수를 사용해 처리하게 됩니다.

## unary 클라이언트 구현
```js
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
```
[client_unary.ts](client_unary.ts) 파일이 unary 클라이언트 구현입니다. 
중요한 부분만 설명하면, client.getData() 함수의 첫번째 인자는 unary호출을 하면서 보낼 인자고, 두번째 인자는 서버에서 응답이 돌아왔을때 응답을 처리할 콜백 함수입니다. 
여기서는 간단한 예시기 때문에 콜백함수로 화살표함수 (익명함수)를 사용했지만, 복잡해 지는 경우 따로 선언하는 것이 좋습니다. 

## 실행
```shell
npm run dev:server_unary
npm run dev:client_unary
```



# server stream 예제
ref: https://floydfajones.medium.com/creating-your-grpc-service-in-nodejs-typescript-part-2-19464c73320b

## proto file
stream을 테스트 하기 위해서 `clientData` 를 입력으로 받고, `eventData` 를 보내주는 rpc를 서비스로 정의해 보겠습니다. 
```proto
syntax = "proto3";

package eventStream;
import "proto/people.proto";

service eventStreamService {
    rpc GetEventStream(clientData) returns (stream eventData){}
}

message clientData {
    int32 clientId = 1;
}

message eventPayloadData {
    oneof data {
        string payloadString = 1;
        PeoplePackage.PeopleData people_data = 2;
    }
}

message eventData {
    string eventName = 1;
    int32 eventId = 2;
    optional eventPayloadData payload = 3;
}
```
eventData는 eventPayloadData를 가질수도 있으며(선택적 필드), eventPayloadData는 payloadString과 PeopleData중 하나(oneof) 를 가집니다.  

위 프로토콜 정의에 대해서 조금 더 자세히 설명하자면... 
- message 정의에서 다른 message 를 필드로 가질 수 있습니다.  
- 또한 import 를 사용하면 다른 proto 파일에서 정의된 메시지 타입을 가져와서 사용할 수 있습니다.  
- oneof 를 사용하면 여러개의 필드중 하나만 가지게 된다는 뜻입니다. (C의 union과 비슷).  
- 인자가 optional 로 지정된 경우 선택적 인자라는 뜻입니다. 이 경우 인자가 있을수도 있고, 없을수도 있다는 뜻입니다. 

## stream 서버 구현

```js
import {
  Server as grpcServer,
  ServerCredentials,
  ServerWritableStream,
} from '@grpc/grpc-js';
import { PeopleData } from './proto/people';
import {
  eventData,
  clientData,
  eventStreamServiceService,
  eventPayloadData,
} from './proto/event';
import { getRandomInt, sleep, logger } from './tools/tools';

const event_log = new logger('event');

const peopleDataBase: PeopleData[] = [
  { name: 'Otonose Kanade', address: 'seoul, korea', age: 20 },
  { name: 'Ichijou Ririka', address: 'tokyo, japan', age: 23 },
  { name: 'Hiodoshi Ao', address: 'tokyo, japan', age: 22 },
  { name: 'Juufuutei Raden', address: 'tokyo, japan', age: 22 },
  { name: 'Todoroki Hajime', address: 'tokyo, japan', age: 21 },
];

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
```
stream 서버 구현은 [server_stream.ts](server_stream.ts) 입니다. 
중요한 부분만 따로 뽑아서 설명하면...  

서버쪽 코드에 아래와 같이 rpc GetEventStream 을 실제로 구현하는 함수를 추가해야 합니다. 
```js
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
```
기존에는 unary는 call, callback 두개를 사용했지만, stream의 경우 call: ServerWritableStream 만 사용합니다. 
이때 streaming 하는 데이터는 call.write로 보내 지는 것을 볼 수 있습니다.  
  
그리고 addService 를 사용해서 getEventStream의 구현을 새로 만든 구현함수로 등록해 줍니다. 
```js
server.addService(eventStreamServiceService, {
  getEventStream: eventStreamFunction,
});
```


## stream 클라이언트 구현
```js
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
```
stream 클라이언트는 [client_stream.ts](client_stream.ts) 에 구현되어 있습니다.  
스트림은 함수를 호출하면 끝나는게 아니라, 서버가 스트림을 명시적으로 종료할 때까지 서버가 데이터를 보낼때마다 클라이언트에서 등록한 콜백함수가 실행되어야 합니다. 
클라이언트 코드에서는 위와 같이 `getEventStream` 를 호출해서 `eventStream` 을 받아오고, 이벤트 스트림의 각 이벤트들을 처리할 콜백함수를 등록합니다. 
eventStream.on('이벤트_이름', 콜백함수) 같은 형식으로 등록하면 됩니다.  
예를 들어, 'data' 는  stream으로 데이터가 들어왔을때, 'end' 는 스트림이 종료 되었을때 발생하는 이벤트입니다.

## 실행
```shell
npm run dev:server_stream
npm run dev:client_stream
```

