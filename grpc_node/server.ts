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
const GetListData = (call: ServerWritableStream<PeopleIdList, PeopleData>) => {
    // console.log(call.request.id);
    call.request.id.forEach(element => {
        console.log(`send data: ${element}`);
        call.write(peopleDataBase[element]);
    });
    call.end();
}

  
const server = new Server();
server.addService(PeopleServiceService, { getData: GetData, getListData: GetListData}); 
server.bindAsync('localhost:8080', ServerCredentials.createInsecure(), () => {console.log("server start");});


