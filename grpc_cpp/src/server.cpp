// #include <pr

#include <vector>
#include <map>
#include <string>

#include <grpc/grpc.h>
#include <grpcpp/security/server_credentials.h>
#include <grpcpp/server.h>
#include <grpcpp/server_builder.h>
#include <grpcpp/server_context.h>
#include <people.grpc.pb.h>
using grpc::Server;
using grpc::ServerBuilder;
using grpc::ServerContext;
using grpc::ServerReader;
using grpc::ServerReaderWriter;
using grpc::ServerWriter;
using grpc::Status;

using PeoplePackage::PeopleService;
using PeoplePackage::PeopleData;
using PeoplePackage::PeopleId;
using PeoplePackage::PeopleIdList;
// using PeoplePackage:;
// using PeoplePackage::GetPeopleResponse;

using namespace std;
class People {
    public:
        People(string name, string address, int age) : name(name), address(address), age(age) {}
        string name;
        string address;
        int age;
};
vector<People> people_db{
       { "Otonose Kanade", "seoul, korea", 20 },
       { "Ichijou Ririka", "tokyo, japan", 23 },
       { "Hiodoshi Ao", "tokyo, japan", 22 },
       { "Juufuutei Raden", "tokyo, japan", 22 },
       { "Todoroki Hajime", "tokyo, japan", 21 }
};
class PeopleServiceImpl final : public PeopleService::Service {
    public:
        PeopleServiceImpl() = default;
        Status GetData(ServerContext* context, const PeopleId* request, PeopleData* reply) override {
            int id = request->id();
            reply->set_name(people_db[id].name);
            reply->set_age(people_db[id].age);
            reply->set_address(people_db[id].address);
            return Status::OK;
        }
        Status GetListData(ServerContext* context, const PeopleIdList* request, ServerWriter<PeopleData>* writer) override {
            // int id = request->id();
            std::string name = "John Doe";
            int age = 30;
            std::string address = "123 Main St, Anytown, USA";
            // PeopleData data;
            for (auto& people : people_db) {
                PeopleData data;
                data.set_name(people.name);
                data.set_age(people.age);
                data.set_address(people.address);
                writer->Write(data);
            }
            return Status::OK;
        }
};

void RunServer() {
  std::string server_address("0.0.0.0:50051");
  PeopleServiceImpl service{};

  ServerBuilder builder;
  builder.AddListeningPort(server_address, grpc::InsecureServerCredentials());
  builder.RegisterService(&service);
  std::unique_ptr<Server> server(builder.BuildAndStart());
  std::cout << "Server listening on " << server_address << std::endl;
  server->Wait();
}
int main(int argc, char** argv) {
  RunServer();

  return 0;
}
