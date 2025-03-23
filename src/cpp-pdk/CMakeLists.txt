cmake_minimum_required(VERSION 3.10)
project(extism_cpp_pdk)

# Set the C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Setup Emscripten compiler if not already set
if(NOT DEFINED ENV{EMSDK})
    message(WARNING "EMSDK environment variable not set. Using native compiler.")
    message(STATUS "For WebAssembly output, please install and activate Emscripten.")
else()
    message(STATUS "Using Emscripten SDK: $ENV{EMSDK}")
endif()

# Compiler flags for WASM target
set(WASM_FLAGS "-s WASM=1 -s SIDE_MODULE=1 -Os -s EXPORTED_FUNCTIONS=['_hello'] -s STANDALONE_WASM")

# C++ Hello Plugin
add_executable(hello_cpp hello_plugin.cpp)
set_target_properties(hello_cpp PROPERTIES 
    SUFFIX ".wasm"
    LINK_FLAGS "${WASM_FLAGS}"
)

# C Hello Plugin
add_executable(hello_c hello_plugin.c)
set_target_properties(hello_c PROPERTIES 
    SUFFIX ".wasm"
    LINK_FLAGS "${WASM_FLAGS}"
)

# Create a custom target for building both plugins
add_custom_target(hello ALL
    DEPENDS hello_cpp hello_c
)

# Installation
install(TARGETS hello_cpp hello_c
    DESTINATION ${CMAKE_CURRENT_SOURCE_DIR}
)

# Add a custom command to run tests
add_custom_target(test
    COMMAND node test_plugin.js
    WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
    DEPENDS hello
)

# Add a custom command to clean up generated files
add_custom_target(clean_all
    COMMAND ${CMAKE_COMMAND} -E remove
        ${CMAKE_CURRENT_SOURCE_DIR}/hello_cpp.wasm
        ${CMAKE_CURRENT_SOURCE_DIR}/hello_c.wasm
    COMMAND ${CMAKE_COMMAND} -E remove_directory
        ${CMAKE_CURRENT_BINARY_DIR}
)

# Add a help message
add_custom_target(help
    COMMAND ${CMAKE_COMMAND} -E echo 
        "Available targets:\\n"
        "  make       - Build all plugins\\n"
        "  make test  - Run tests\\n"
        "  make clean - Remove build artifacts\\n"
        "  make help  - Show this help message"
) 