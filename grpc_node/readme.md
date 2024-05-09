# gRPC tutorial
ref: https://medium.com/@yujso66/%EB%B2%88%EC%97%AD-node-js%EC%97%90%EC%84%9C-grpc-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0-4521604d8852

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
위 내용을 실행하면 proto 디렉터리에 있는 people.proto를 읽고 people.ts를 생성합니다.
## unary 서버 구현
[server.ts](server.ts)
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
위와 같이 GetData를 구현하는 부분을 만들고 아래와 같이 gRPC 서버에 등록합니다. 
```js
server.addService(PeopleServiceService, {
  getData: GetData,
});
```

## 실행
```shell
npm run dev:server
npm run dev:client
```



# server stream
https://floydfajones.medium.com/creating-your-grpc-service-in-nodejs-typescript-part-2-19464c73320b

## proto file
stream을 테스트 하기 위해서 clientData 를 입력으로 받고, eventData를 보내주는 rpc를 서비스로 정의합니다. eventData는 eventPayloadData를 가질**수도** 있으며, eventPayloadData는 payloadString과 PeopleData중 하나를 가집니다. 
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
* message에서 다른 message 를 데이터로 가질 수 있습니다. 
* import 를 사용하면 다른 proto 파일에서 정의된 메시지를 사용할 수 있습니다.
* oneof 를 사용하면 여러개의 필드중 하나만 가지게 됩니다. (union과 비슷)
* 인자가 optional 로 지정된 경우 선택적 인자라는 뜻입니다.
* server에서 RPC의 실제 구현을 정의합니다.
## server
서버쪽 스크립트에 아래와 같이 rpc GetEventStream 대응하는 함수를 추가하고
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
기존에 addService 에 getEventStream을 추가해줍니다.
```js
server.addService(eventStreamServiceService, {
  getEventStream: eventStreamFunction,
});
```

기존에는 unary는 call, callback 두개를 사용했지만, stream의 경우 call: ServerWritableStream 만 사용합니다. 이때 streaming 하는 데이터는 call.write로 보내 지는 것을 볼 수 있습니다.

## client
```js
// 이벤트 스트림을 받아옴
const client_data: clientData = { clientId: 123 };
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
클라이언트 코드에서는 위와 같이 eventStream을 받아오고, 이벤트 스트림의 이벤트들에 대한 콜백함수를 등록합니다. data는 stream chunk가 들어왔을때, end는 스트림이 종료되었을때에 대한 이벤트입니다.

