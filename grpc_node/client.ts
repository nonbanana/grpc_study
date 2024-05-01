import { ServiceError, credentials} from '@grpc/grpc-js';
import { PeopleServiceClient, PeopleData, PeopleId, PeopleIdList } from './people';

const peopleId: PeopleId = {
    id: 0
};

const peopleIdList: PeopleIdList = {
  id: [0, 1, 2]
};

const client = new PeopleServiceClient(
  'localhost:8080',
  credentials.createInsecure()
);

client.getData(
  peopleId,
  (err: ServiceError | null, response: PeopleData) => {
    console.log(`get unary data peopleId: ${peopleId.id}`);
    console.log(JSON.stringify(response));
    }
);


const peopleStream = client.getListData(
  peopleIdList
);
peopleStream.on('metadata', () => {
console.log('get stream data peopleIdList: [0,1,2]');
});

peopleStream.on('data', (data: PeopleData) => {
  console.log(JSON.stringify(data));
});
peopleStream.on('end', () => {
  console.log('stream end');
}
);

