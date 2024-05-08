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
왜하는지? 몰겠슴다
### service
call 될 함수를 정의합니다.
PeopleId을 입력으로 받고, PeopleData 를 출력으로 받는 GetData 함수를 지정하였습니다.
### message
struct를 정의합니다.

## protobuf compile
proto 파일을 언어에 맞게 컴파일 합니다.
```bash
protoc --plugin=protoc-gen-ts_proto=./node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=. ./people.proto --ts_proto_opt=outputServices=grpc-js,env=node,esModuleInterop=true
```
위 내용을 실행하면 people.proto를 읽고 people.ts를 생성합니다.
## unary 서버 / 클라이언트 통신
### server 코드
```js
import { Server, ServerCredentials, ServerUnaryCall, sendUnaryData,ServerWritableStream  } from '@grpc/grpc-js';
import { PeopleServiceService } from './people';
import { PeopleId, PeopleData, PeopleIdList } from './people';

const peopleDataBase:PeopleData[] = [
    { name: 'Otonose Kanade', address: "seoul, korea",  age: 20 },
    { name: 'Ichijou Ririka', address: "tokyo, japan",  age: 23 },
    { name: 'Hiodoshi Ao', address: "tokyo, japan",  age: 22 },
    { name: 'Juufuutei Raden', address: "tokyo, japan",  age: 22 },
    { name: 'Todoroki Hajime', address: "tokyo, japan",  age: 21 },
]

const GetData = (call: ServerUnaryCall<PeopleId, PeopleData>, callback: sendUnaryData<PeopleData>) => {
    let id = call.request.id;
    console.log(id);
    const data:PeopleData = peopleDataBase[id];
    callback(null, data);
}

const server = new Server();

server.addService(PeopleServiceService, { getData: GetData }); 

server.bindAsync('localhost:8080', ServerCredentials.createInsecure(), () => {console.log("server start");});
```

### client 코드
```js
import { ServiceError, credentials } from '@grpc/grpc-js';
import { PeopleServiceClient, PeopleData, PeopleId } from './people';

const peopleId: PeopleId = {
    id: 0
};

const client = new PeopleServiceClient(
  'localhost:8080',
  credentials.createInsecure()
);

client.getData(
    peopleId,
    (err: ServiceError | null, response: PeopleData) => {
    console.log(JSON.stringify(response));
    }
);

```
## 실행
```
npm run dev:server
npm run dev:client
```



# server stream
https://floydfajones.medium.com/creating-your-grpc-service-in-nodejs-typescript-part-2-19464c73320b

## proto file
stream을 테스트 하기 위해서 입력을 list로 받고, 리스트의 각 항목을 하나씩 스트림으로 보내주게 만들어 보겠습니다.
```proto
service PeopleService {
    rpc GetData(PeopleId) returns (PeopleData) {}
    rpc GetListData(PeopleIdList) returns (stream PeopleData) {}
}

message PeopleIdList {
    repeated int32 id = 1;
}
```
* message에서 repeated 명령어를 사용하면 리스트 자료형을 사용하는것을 의미합니다.
* service 에서 rpc를 새로 정의합니다. 리스트를 입력으로 받고, stream을 리턴합니다.
## server
서버쪽 스크립트에 아래와 같이 rpc GetListData에 대응하는 함수를 추가하고
```js
const GetListData = (call: ServerWritableStream<PeopleIdList, PeopleData>) => {
    // console.log(call.request.id);
    call.request.id.forEach(element => {
        console.log(`send data: ${element}`);
        call.write(peopleDataBase[element]);
    });
    call.end();
}
```
기존에 있던 import에서 PeopleIdList 추가, addService 에 getListData를 추가해줍니다.
```js

import { PeopleServiceClient, PeopleData, PeopleId, PeopleIdList } from './people';

server.addService(PeopleServiceService, { getData: GetData, getListData: GetListData}); 
```
기존에는 unary는 call, callback 두개를 사용했지만, stream의 경우 call: ServerWritableStream 만 사용합니다. 이때 streaming 하는 데이터는 call.write로 보내 지는 것을 볼 수 있습니다.

## client
기존에 있던 import에서 PeopleIdList 추가해줍니다.
```js
import { PeopleServiceClient, PeopleData, PeopleId, PeopleIdList } from './people';
```
```js
const peopleStream = client.getListData(
  peopleIdList
);
// 시작할때 동작하는것 같은데 확실하진않아서 주석처리해둠
// peopleStream.on('metadata', () => {
// console.log('get stream data peopleIdList: [0,1,2]');
// });

peopleStream.on('data', (data: PeopleData) => {
  console.log(JSON.stringify(data));
});
peopleStream.on('end', () => {
  console.log('stream end');
}
);
```
클라이언트 코드엔 위와 같이 `client.getListData(peopleIdList)` 에 대해서 확인하고, getListData에 대한 이벤트를 추가합니다.  data는 stream chunk가 들어왔을때, end는 스트림이 종료되었을때에 대한 이벤트입니다.

