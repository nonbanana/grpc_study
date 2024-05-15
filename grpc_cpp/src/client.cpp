
#include <grpc/grpc.h>
#include <grpcpp/channel.h>
#include <grpcpp/client_context.h>
#include <grpcpp/create_channel.h>
#include <grpcpp/security/credentials.h>
#include <people.grpc.pb.h>

using grpc::Channel;
using grpc::ClientContext;
using grpc::ClientReader;
using grpc::ClientReaderWriter;
using grpc::ClientWriter;
using grpc::Status;

using PeoplePackage::PeopleService;
using PeoplePackage::PeopleData;
using PeoplePackage::PeopleId;
using PeoplePackage::PeopleIdList;

class PeopleServiecClient {
public:
  PeopleServiecClient(std::shared_ptr<Channel> channel)
 : stub_(PeopleService::NewStub(channel)) {
  }
  void getPeopleData(int id) {
    PeopleId request;
    request.set_id(id);
    PeopleData reply;
    ClientContext context;
    Status status = stub_->GetData(&context, request, &reply);
    if (status.ok()) {
      std::cout << "Name: " << reply.name() << " Age: " << reply.age() << " Address: " << reply.address() << std::endl;
    } else {
      std::cout << status.error_code() << ": " << status.error_message() << std::endl;
    }
  }
  void getPoepleListData() {
    PeopleIdList request;
    // request.set_id(1);
    PeopleData reply;
    ClientContext context;
    std::unique_ptr<ClientReader<PeopleData>> reader(stub_->GetListData(&context, request));
    while (reader->Read(&reply)) {
      std::cout << "Name: " << reply.name() << " Age: " << reply.age() << " Address: " << reply.address() << std::endl;
    }
    Status status = reader->Finish();
    if (!status.ok()) {
      std::cout << "RouteChat rpc failed." << std::endl;
    }
  }
  private:

  std::unique_ptr<PeopleService::Stub> stub_;
};


int main(int argc, char** argv) {
  PeopleServiecClient client(grpc::CreateChannel("localhost:50051", grpc::InsecureChannelCredentials()));
  client.getPeopleData(1);
  client.getPoepleListData();
  return 0;
}

