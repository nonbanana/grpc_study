cmake_minimum_required(VERSION 3.2)

project(gRPC-tutorial)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++20 -O3")
add_subdirectory(src)
