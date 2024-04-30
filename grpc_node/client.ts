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
