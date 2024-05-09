cmake_minimum_required(VERSION 3.2)

project(grpc_example)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++20 -O3")

# https://github.com/protocolbuffers/protobuf/issues/12185
set(ABSL_ENABLE_INSTALL ON)
include(FetchContent)

# find_package()
FetchContent_Declare(
    gRPC
    GIT_REPOSITORY https://github.com/grpc/grpc
    GIT_TAG v1.63.0
)
set(FETCHCONTENT_QUIET OFF)
FetchContent_MakeAvailable(gRPC)

get_filename_component(rg_proto "../../proto/people.proto" ABSOLUTE)
get_filename_component(rg_proto_path "${rg_proto}" PATH)

set(_GRPC_CPP_PLUGIN_EXECUTABLE $<TARGET_FILE:grpc_cpp_plugin>)
set(_PROTOBUF_PROTOC $<TARGET_FILE:protoc>)

set(_PROTOBUF_LIBPROTOBUF libprotobuf)
set(_REFLECTION grpc++_reflection)

set(proto_srcs "${CMAKE_CURRENT_BINARY_DIR}/people.pb.cc")
set(proto_hdrs "${CMAKE_CURRENT_BINARY_DIR}/people.pb.h")
set(grpc_srcs "${CMAKE_CURRENT_BINARY_DIR}/people.grpc.pb.cc")
set(grpc_hdrs "${CMAKE_CURRENT_BINARY_DIR}/people.grpc.pb.h")
add_custom_command(
    OUTPUT "${proto_srcs}" "${proto_hdrs}" "${grpc_srcs}" "${grpc_hdrs}"
    COMMAND ${_PROTOBUF_PROTOC}
    ARGS --grpc_out "${CMAKE_CURRENT_BINARY_DIR}"
    --cpp_out "${CMAKE_CURRENT_BINARY_DIR}"
    -I "${rg_proto_path}"
    --plugin=protoc-gen-grpc="${_GRPC_CPP_PLUGIN_EXECUTABLE}"
    "${rg_proto}"
    DEPENDS "${rg_proto}")

add_library(people_grpc_proto
    ${grpc_srcs}
    ${grpc_hdrs}
    ${proto_srcs}
    ${proto_hdrs})
target_link_libraries(people_grpc_proto
    ${_REFLECTION}
    ${_GRPC_GRPCPP}
    ${_PROTOBUF_LIBPROTOBUF})

add_executable(grpc_server server.cpp)
target_link_libraries(grpc_server grpc++ people_grpc_proto)

# target_link_libraries(grpc_server
# people_grpc_proto
# ${_REFLECTION}
# ${_GRPC_GRPCPP}
# ${_PROTOBUF_LIBPROTOBUF})
