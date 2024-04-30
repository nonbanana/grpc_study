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


