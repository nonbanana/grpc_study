cmake_minimum_required(VERSION 3.20)

project(grpc_example)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++20 -O3")

# https://github.com/protocolbuffers/protobuf/issues/12185
set(ABSL_ENABLE_INSTALL ON)
include(FetchContent)

# find_package()
set(FETCHCONTENT_QUIET OFF)
FetchContent_Declare(
    protobuf
    GIT_REPOSITORY https://github.com/protocolbuffers/protobuf
    GIT_TAG 2434ef2adf0c74149b9d547ac5fb545a1ff8b6b5
)
FetchContent_Declare(
    gRPC
    GIT_REPOSITORY https://github.com/grpc/grpc
    GIT_TAG v1.63.0
)
# FetchContent_MakeAvailable(protobuf)
FetchContent_MakeAvailable(gRPC)
# FIXME https://cmake.org/cmake/help/latest/module/FindProtobuf.html

function(grpc_compile proto_file_path target_lib_name)
    # cmake_path(SET proto_file_abs "")
    cmake_path(ABSOLUTE_PATH proto_file_path)
    cmake_path(GET proto_file_path PARENT_PATH proto_file_parent_path)
    cmake_path(GET proto_file_path STEM LAST_ONLY proto_file_name)

    set(_GRPC_CPP_PLUGIN_EXECUTABLE $<TARGET_FILE:grpc_cpp_plugin>)
    set(_PROTOBUF_PROTOC $<TARGET_FILE:protoc>)

    # set(_PROTOBUF_LIBPROTOBUF libprotobuf)
    # set(_REFLECTION grpc++_reflection)
    set(proto_srcs "${CMAKE_CURRENT_BINARY_DIR}/people.pb.cc")
    set(proto_hdrs "${CMAKE_CURRENT_BINARY_DIR}/people.pb.h")
    set(grpc_srcs "${CMAKE_CURRENT_BINARY_DIR}/people.grpc.pb.cc")
    set(grpc_hdrs "${CMAKE_CURRENT_BINARY_DIR}/people.grpc.pb.h")

    add_custom_command(
        OUTPUT "${proto_srcs}" "${proto_hdrs}" "${grpc_srcs}" "${grpc_hdrs}"
        COMMAND ${_PROTOBUF_PROTOC}
        ARGS --grpc_out "${CMAKE_CURRENT_BINARY_DIR}"
        --cpp_out "${CMAKE_CURRENT_BINARY_DIR}"
        -I "${proto_file_parent_path}"
        --plugin=protoc-gen-grpc="${_GRPC_CPP_PLUGIN_EXECUTABLE}"
        "${proto_file_path}"
        DEPENDS "${proto_file_path}")

    add_library("${target_lib_name}"
        ${grpc_srcs}
        ${grpc_hdrs}
        ${proto_srcs}
        ${proto_hdrs})
endfunction()

# grpc_compile("../../proto/people.proto" "people_grpc_proto")


# https://stackoverflow.com/questions/74844369/how-to-i-use-the-cmake-command-protobuf-generate-when-installing-protobuf-throug
FetchContent_GetProperties(gRPC SOURCE_DIR gRPC_SOURCE_DIR)
include(${gRPC_SOURCE_DIR}/third_party/protobuf/cmake/protobuf-generate.cmake)

add_library(proto-objects OBJECT "${CMAKE_CURRENT_LIST_DIR}/../../proto/people.proto")

target_link_libraries(proto-objects PUBLIC protobuf::libprotobuf grpc++)

set(PROTO_BINARY_DIR "${CMAKE_CURRENT_BINARY_DIR}/generated")
add_custom_target(make_proto_directory ALL
    COMMAND ${CMAKE_COMMAND} -E make_directory ${PROTO_BINARY_DIR})
set(PROTO_IMPORT_DIRS "${CMAKE_CURRENT_LIST_DIR}/../../proto")

protobuf_generate(
    TARGET proto-objects
    OUT_VAR PROTO_GENERATED_FILES
    IMPORT_DIRS ${PROTO_IMPORT_DIRS}
    PROTOC_OUT_DIR "${PROTO_BINARY_DIR}")
set_source_files_properties(${PROTO_GENERATED_FILES} PROPERTIES SKIP_UNITY_BUILD_INCLUSION on)

protobuf_generate(
    TARGET proto-objects
    OUT_VAR PROTO_GENERATED_FILES
    LANGUAGE grpc
    GENERATE_EXTENSIONS .grpc.pb.h .grpc.pb.cc
    PLUGIN "protoc-gen-grpc=\$<TARGET_FILE:grpc_cpp_plugin>"
    IMPORT_DIRS ${PROTO_IMPORT_DIRS}
    PROTOC_OUT_DIR "${PROTO_BINARY_DIR}")
set_source_files_properties(${PROTO_GENERATED_FILES} PROPERTIES SKIP_UNITY_BUILD_INCLUSION on)

target_include_directories(proto-objects PUBLIC "$<BUILD_INTERFACE:${PROTO_BINARY_DIR}>")


# add_custom_target(generate_protos ALL DEPENDS ${PROTO_GENERATED_FILES})
# add_dependencies(proto-objects generate_protos)
add_executable(grpc_server server.cpp)
# add_dependencies(grpc_server generate_protos)
target_link_libraries(grpc_server grpc++ proto-objects )

add_executable(grpc_client client.cpp)
target_link_libraries(grpc_client grpc++ proto-objects)

# target_link_libraries(grpc_server
# people_grpc_proto
# ${_REFLECTION}
# ${_GRPC_GRPCPP}
# ${_PROTOBUF_LIBPROTOBUF})
