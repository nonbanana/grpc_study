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

## protobuf compile
proto 파일을 언어에 맞게 컴파일 합니다.
```bash
protoc --plugin=protoc-gen-ts_proto=./node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=. ./people.proto --ts_proto_opt=outputServices=grpc-js,env=node,esModuleInterop=true
```

## node 서버 / 클라이언트 생성
### server 코드
```js
import { Server, ServerCredentials, ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';
import { PeopleServiceService } from './people';
import { PeopleId, PeopleData } from './people';

const GetData = (call: ServerUnaryCall<PeopleId, PeopleData>, callback: sendUnaryData<PeopleData>) => {
    console.log(call.request.id);
    const data:PeopleData = { address: "tokyo, japan", name: 'Otonose Kanade', age: 21 };
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
    id: 1
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
npx ts-node ./server.ts
npx ts-node ./client.ts
```






