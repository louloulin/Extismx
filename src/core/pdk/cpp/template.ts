/**
 * C++ plugin template generator implementation
 */
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

import { PluginTemplateGenerator } from '../common/template';
import { PDKError, PDKErrorCode } from '../../errors/pdk';
import { GenerateResult } from '../common/types';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

/**
 * Options specific to C++ template generation
 */
export interface CppTemplateOptions {
  /**
   * Whether to use CMake for building
   */
  useCMake?: boolean;
  
  /**
   * Whether to include a test suite
   */
  includeTests?: boolean;
  
  /**
   * Test framework to use
   */
  testFramework?: 'catch2' | 'googletest' | 'doctest';
  
  /**
   * Name of the plugin
   */
  pluginName?: string;
  
  /**
   * Description of the plugin
   */
  pluginDescription?: string;
  
  /**
   * Author of the plugin
   */
  pluginAuthor?: string;
  
  /**
   * Whether to include a basic example
   */
  includeExample?: boolean;
}

/**
 * C++ plugin template generator implementation
 */
export class CppTemplateGenerator extends PluginTemplateGenerator {
  /**
   * Default C++ template options
   */
  private defaultCppOptions: CppTemplateOptions = {
    useCMake: true,
    includeTests: true,
    testFramework: 'catch2',
    includeExample: true
  };

  /**
   * C++ template options
   */
  private cppOptions: CppTemplateOptions;

  /**
   * Constructor
   * 
   * @param targetDir - Directory to generate the plugin template in
   * @param cppOptions - C++-specific template options
   */
  constructor(targetDir: string, cppOptions?: CppTemplateOptions) {
    super(targetDir);
    this.cppOptions = { ...this.defaultCppOptions, ...cppOptions };
    
    // Derive plugin name from directory if not provided
    if (!this.cppOptions.pluginName) {
      this.cppOptions.pluginName = path.basename(targetDir);
    }
  }

  /**
   * Generate the C++ plugin template
   * 
   * @returns A promise that resolves to the generation result
   */
  async generate(): Promise<GenerateResult> {
    try {
      // Create the target directory if it doesn't exist
      await mkdir(this.targetDir, { recursive: true });
      
      // Create include directory
      await mkdir(path.join(this.targetDir, 'include'), { recursive: true });
      
      // Create src directory
      await mkdir(path.join(this.targetDir, 'src'), { recursive: true });
      
      // Create tests directory if including tests
      if (this.cppOptions.includeTests) {
        await mkdir(path.join(this.targetDir, 'tests'), { recursive: true });
      }
      
      // Generate project files
      await this.generateMainHeader();
      await this.generatePluginImplementation();
      
      // Generate build files
      if (this.cppOptions.useCMake) {
        await this.generateCMakeLists();
      } else {
        await this.generateMakefile();
      }
      
      // Generate test files if including tests
      if (this.cppOptions.includeTests) {
        await this.generateTestFiles();
      }
      
      // Generate example if including example
      if (this.cppOptions.includeExample) {
        await this.generateExampleFile();
      }
      
      // Generate README
      await this.generateReadme();
      
      return {
        success: true,
        files: await this.getGeneratedFiles(),
        message: `Successfully generated C++ plugin template in ${this.targetDir}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get a list of files that were generated
   */
  private async getGeneratedFiles(): Promise<string[]> {
    const files: string[] = [
      path.join(this.targetDir, 'include', `${this.cppOptions.pluginName}.h`),
      path.join(this.targetDir, 'src', `${this.cppOptions.pluginName}.cpp`),
      path.join(this.targetDir, 'README.md')
    ];
    
    if (this.cppOptions.useCMake) {
      files.push(path.join(this.targetDir, 'CMakeLists.txt'));
    } else {
      files.push(path.join(this.targetDir, 'Makefile'));
    }
    
    if (this.cppOptions.includeTests) {
      files.push(path.join(this.targetDir, 'tests', 'test_main.cpp'));
    }
    
    if (this.cppOptions.includeExample) {
      files.push(path.join(this.targetDir, 'src', 'example.cpp'));
    }
    
    return files;
  }

  /**
   * Generate the main header file
   */
  private async generateMainHeader(): Promise<void> {
    const headerFile = path.join(this.targetDir, 'include', `${this.cppOptions.pluginName}.h`);
    
    const content = `/**
 * ${this.cppOptions.pluginName} - Extism Plugin
 * ${this.cppOptions.pluginDescription || 'A WebAssembly plugin built with Extism'}
 * 
 * ${this.cppOptions.pluginAuthor ? `Author: ${this.cppOptions.pluginAuthor}` : ''}
 */
#ifndef ${this.cppOptions.pluginName.toUpperCase()}_H
#define ${this.cppOptions.pluginName.toUpperCase()}_H

#include <cstdint>
#include <string>
#include <vector>
#include <memory>

// Export functions as required by WebAssembly
#define WASM_EXPORT __attribute__((visibility("default")))

namespace extism {

/**
 * Memory management utilities for the plugin
 */
class Memory {
public:
    /**
     * Allocate memory for an output value
     *
     * @param size The size of the memory to allocate
     * @return The offset of the allocated memory
     */
    static uint64_t allocate(size_t size);

    /**
     * Free memory previously allocated
     *
     * @param offset The offset of the memory to free
     */
    static void free(uint64_t offset);
    
    /**
     * Get a pointer to memory at a given offset
     *
     * @param offset The offset to get a pointer to
     * @return A pointer to the memory
     */
    static uint8_t* get_pointer(uint64_t offset);
};

/**
 * Plugin input/output handling
 */
class PluginIO {
public:
    /**
     * Get the plugin input as a string
     *
     * @return The input string
     */
    static std::string get_input_string();
    
    /**
     * Get the plugin input as bytes
     *
     * @return The input bytes
     */
    static std::vector<uint8_t> get_input_bytes();
    
    /**
     * Set the plugin output as a string
     *
     * @param output The output string
     * @return The offset of the output in memory
     */
    static uint64_t set_output_string(const std::string& output);
    
    /**
     * Set the plugin output as bytes
     *
     * @param output The output bytes
     * @return The offset of the output in memory
     */
    static uint64_t set_output_bytes(const std::vector<uint8_t>& output);
};

}  // namespace extism

#endif  // ${this.cppOptions.pluginName.toUpperCase()}_H
`;
    
    await writeFile(headerFile, content);
  }

  /**
   * Generate the plugin implementation file
   */
  private async generatePluginImplementation(): Promise<void> {
    const implFile = path.join(this.targetDir, 'src', `${this.cppOptions.pluginName}.cpp`);
    
    const content = `/**
 * ${this.cppOptions.pluginName} - Extism Plugin Implementation
 */
#include "${this.cppOptions.pluginName}.h"
#include <cstring>

// External functions imported from the Extism host
extern "C" {
    // Memory allocation/free
    extern uint64_t __extism_memory_alloc(uint64_t size);
    extern void __extism_memory_free(uint64_t offset);
    
    // Memory access
    extern uint8_t* __extism_memory_data(uint64_t offset);
    
    // Host functions
    extern uint64_t __extism_input_length();
    extern uint64_t __extism_input_offset();
    extern uint64_t __extism_length_output(uint64_t offset, uint64_t length);
}

namespace extism {

uint64_t Memory::allocate(size_t size) {
    return __extism_memory_alloc(size);
}

void Memory::free(uint64_t offset) {
    __extism_memory_free(offset);
}

uint8_t* Memory::get_pointer(uint64_t offset) {
    return __extism_memory_data(offset);
}

std::string PluginIO::get_input_string() {
    uint64_t offset = __extism_input_offset();
    uint64_t length = __extism_input_length();
    
    uint8_t* data = Memory::get_pointer(offset);
    return std::string(reinterpret_cast<char*>(data), length);
}

std::vector<uint8_t> PluginIO::get_input_bytes() {
    uint64_t offset = __extism_input_offset();
    uint64_t length = __extism_input_length();
    
    uint8_t* data = Memory::get_pointer(offset);
    return std::vector<uint8_t>(data, data + length);
}

uint64_t PluginIO::set_output_string(const std::string& output) {
    uint64_t length = output.length();
    uint64_t offset = Memory::allocate(length);
    
    uint8_t* data = Memory::get_pointer(offset);
    std::memcpy(data, output.data(), length);
    
    return __extism_length_output(offset, length);
}

uint64_t PluginIO::set_output_bytes(const std::vector<uint8_t>& output) {
    uint64_t length = output.size();
    uint64_t offset = Memory::allocate(length);
    
    uint8_t* data = Memory::get_pointer(offset);
    std::memcpy(data, output.data(), length);
    
    return __extism_length_output(offset, length);
}

}  // namespace extism

/**
 * Example plugin function that greets a person
 */
extern "C" WASM_EXPORT uint64_t greet() {
    // Get the input JSON
    std::string input = extism::PluginIO::get_input_string();
    
    // Simple greeting (in a real plugin, you'd parse the JSON)
    std::string name = input.length() > 0 ? input : "world";
    if (name.front() == '{' && name.back() == '}') {
        // Very simplistic JSON parsing - in real code use a proper JSON library
        size_t start = name.find("name");
        if (start != std::string::npos) {
            start = name.find(":", start);
            if (start != std::string::npos) {
                start = name.find("\"", start);
                if (start != std::string::npos) {
                    start += 1;
                    size_t end = name.find("\"", start);
                    if (end != std::string::npos) {
                        name = name.substr(start, end - start);
                    }
                }
            }
        } else {
            name = "world";
        }
    }
    
    // Create greeting
    std::string output = "Hello, " + name + "!";
    
    // Set the output
    return extism::PluginIO::set_output_string(output);
}
`;
    
    await writeFile(implFile, content);
  }

  /**
   * Generate the CMakeLists.txt file
   */
  private async generateCMakeLists(): Promise<void> {
    const cmakeFile = path.join(this.targetDir, 'CMakeLists.txt');
    
    const content = `cmake_minimum_required(VERSION 3.13)
project(${this.cppOptions.pluginName} VERSION 0.1.0 LANGUAGES CXX)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Check if we're using Emscripten
if(DEFINED EMSCRIPTEN)
    # Emscripten compiler flags
    set(CMAKE_EXECUTABLE_SUFFIX ".wasm")
    set(CMAKE_CXX_FLAGS "\${CMAKE_CXX_FLAGS} -s WASM=1 -s STANDALONE_WASM=1")
    set(CMAKE_CXX_FLAGS "\${CMAKE_CXX_FLAGS} -s EXPORTED_RUNTIME_METHODS=[] -s EXPORTED_FUNCTIONS=['_malloc','_free']")
    set(CMAKE_CXX_FLAGS "\${CMAKE_CXX_FLAGS} -s ALLOW_MEMORY_GROWTH=1 -s NO_EXIT_RUNTIME=1")
    set(CMAKE_CXX_FLAGS "\${CMAKE_CXX_FLAGS} -s ERROR_ON_UNDEFINED_SYMBOLS=1")
endif()

# Include directory
include_directories(include)

# Add the main library
add_library(\${PROJECT_NAME} SHARED
    src/${this.cppOptions.pluginName}.cpp
)

# If we have an example, add it
if(EXISTS "\${CMAKE_CURRENT_SOURCE_DIR}/src/example.cpp")
    add_library(example SHARED
        src/example.cpp
    )
endif()

# If configured to build tests
if(BUILD_TESTING)
    # Add test framework
    ${this.getTestFrameworkCMakeConfig()}
    
    # Add test executable
    add_executable(tests
        tests/test_main.cpp
    )
    
    # Link test dependencies
    target_link_libraries(tests PRIVATE ${this.getTestFrameworkLinkLibs()})
endif()
`;
    
    await writeFile(cmakeFile, content);
  }

  /**
   * Get the CMake configuration for the selected test framework
   */
  private getTestFrameworkCMakeConfig(): string {
    switch (this.cppOptions.testFramework) {
      case 'catch2':
        return 'find_package(Catch2 REQUIRED)\ninclude(Catch2::Catch2)';
      case 'googletest':
        return 'find_package(GTest REQUIRED)';
      case 'doctest':
        return 'find_package(doctest REQUIRED)';
      default:
        return '# No test framework specified';
    }
  }

  /**
   * Get the CMake link libraries for the selected test framework
   */
  private getTestFrameworkLinkLibs(): string {
    switch (this.cppOptions.testFramework) {
      case 'catch2':
        return 'Catch2::Catch2';
      case 'googletest':
        return 'GTest::GTest GTest::Main';
      case 'doctest':
        return 'doctest::doctest';
      default:
        return '';
    }
  }

  /**
   * Generate the Makefile
   */
  private async generateMakefile(): Promise<void> {
    const makeFile = path.join(this.targetDir, 'Makefile');
    
    const content = `# Makefile for ${this.cppOptions.pluginName} Extism plugin

# Compiler settings
CXX = emcc
CXXFLAGS = -std=c++17 -O2 -Wall -Wextra
INCLUDES = -Iinclude
WASM_FLAGS = -s WASM=1 -s STANDALONE_WASM=1 \\
             -s EXPORTED_RUNTIME_METHODS=[] \\
             -s EXPORTED_FUNCTIONS=['_malloc','_free'] \\
             -s ALLOW_MEMORY_GROWTH=1 \\
             -s NO_EXIT_RUNTIME=1 \\
             -s ERROR_ON_UNDEFINED_SYMBOLS=1

# Directories
BUILD_DIR = build
DIST_DIR = dist
SRC_DIR = src
INCLUDE_DIR = include
TEST_DIR = tests

# Source files
SRCS = $(SRC_DIR)/${this.cppOptions.pluginName}.cpp
OBJS = $(SRCS:%.cpp=$(BUILD_DIR)/%.o)

# Output files
WASM_OUTPUT = $(DIST_DIR)/${this.cppOptions.pluginName}.wasm

# Targets
.PHONY: all clean dist test

all: $(WASM_OUTPUT)

$(BUILD_DIR)/%.o: %.cpp
	@mkdir -p $(@D)
	$(CXX) $(CXXFLAGS) $(INCLUDES) $(WASM_FLAGS) -c $< -o $@

$(WASM_OUTPUT): $(OBJS)
	@mkdir -p $(DIST_DIR)
	$(CXX) $(CXXFLAGS) $(WASM_FLAGS) $(OBJS) -o $(WASM_OUTPUT)

clean:
	rm -rf $(BUILD_DIR) $(DIST_DIR)

dist: $(WASM_OUTPUT)

${this.cppOptions.includeTests ? this.getMakefileTestRules() : ''}
`;
    
    await writeFile(makeFile, content);
  }

  /**
   * Get the Makefile test rules
   */
  private getMakefileTestRules(): string {
    return `# Test setup
TEST_CXX = g++
TEST_CXXFLAGS = -std=c++17 -g -Wall -Wextra
TEST_INCLUDES = -Iinclude -I${this.getTestFrameworkIncludePath()}

TEST_SRCS = $(TEST_DIR)/test_main.cpp
TEST_OBJS = $(TEST_SRCS:%.cpp=$(BUILD_DIR)/%.o)
TEST_LIBS = ${this.getTestFrameworkLibs()}

TEST_OUTPUT = $(BUILD_DIR)/tests

$(BUILD_DIR)/$(TEST_DIR)/%.o: $(TEST_DIR)/%.cpp
	@mkdir -p $(@D)
	$(TEST_CXX) $(TEST_CXXFLAGS) $(TEST_INCLUDES) -c $< -o $@

$(TEST_OUTPUT): $(TEST_OBJS)
	@mkdir -p $(@D)
	$(TEST_CXX) $(TEST_CXXFLAGS) $(TEST_OBJS) -o $(TEST_OUTPUT) $(TEST_LIBS)

test: $(TEST_OUTPUT)
	$(TEST_OUTPUT)

`;
  }

  /**
   * Get the test framework include path
   */
  private getTestFrameworkIncludePath(): string {
    switch (this.cppOptions.testFramework) {
      case 'catch2':
        return '/usr/include/catch2';
      case 'googletest':
        return '/usr/include/gtest';
      case 'doctest':
        return '/usr/include/doctest';
      default:
        return '';
    }
  }

  /**
   * Get the test framework libs
   */
  private getTestFrameworkLibs(): string {
    switch (this.cppOptions.testFramework) {
      case 'catch2':
        return '-lcatch2';
      case 'googletest':
        return '-lgtest -lgtest_main -lpthread';
      case 'doctest':
        return '';  // doctest is header-only
      default:
        return '';
    }
  }

  /**
   * Generate test files
   */
  private async generateTestFiles(): Promise<void> {
    const testFile = path.join(this.targetDir, 'tests', 'test_main.cpp');
    
    const content = this.getTestFileContent();
    await writeFile(testFile, content);
  }

  /**
   * Get the content for the test file based on the framework
   */
  private getTestFileContent(): string {
    switch (this.cppOptions.testFramework) {
      case 'catch2':
        return this.getCatch2TestContent();
      case 'googletest':
        return this.getGoogleTestContent();
      case 'doctest':
        return this.getDocTestContent();
      default:
        return this.getCatch2TestContent();  // Default to Catch2
    }
  }

  /**
   * Get Catch2 test content
   */
  private getCatch2TestContent(): string {
    return `/**
 * ${this.cppOptions.pluginName} - Tests
 * Using Catch2 framework
 */
#define CATCH_CONFIG_MAIN
#include <catch2/catch.hpp>
#include <string>
#include <vector>
#include "${this.cppOptions.pluginName}.h"

// Mock the Extism functions for testing
extern "C" {
    uint8_t test_memory[1024];
    std::string test_input;
    std::string test_output;
    
    uint64_t __extism_memory_alloc(uint64_t size) {
        return 0;  // Always return offset 0 for testing
    }
    
    void __extism_memory_free(uint64_t offset) {
        // Do nothing in tests
    }
    
    uint8_t* __extism_memory_data(uint64_t offset) {
        return test_memory;
    }
    
    uint64_t __extism_input_length() {
        return test_input.length();
    }
    
    uint64_t __extism_input_offset() {
        std::memcpy(test_memory, test_input.data(), test_input.length());
        return 0;
    }
    
    uint64_t __extism_length_output(uint64_t offset, uint64_t length) {
        test_output = std::string(reinterpret_cast<char*>(test_memory), length);
        return 0;
    }
}

TEST_CASE("Plugin basics", "[plugin]") {
    SECTION("Memory allocation") {
        uint64_t offset = extism::Memory::allocate(100);
        REQUIRE(offset == 0);
        
        // This should not crash
        extism::Memory::free(offset);
    }
    
    SECTION("Get memory pointer") {
        uint64_t offset = 0;
        uint8_t* ptr = extism::Memory::get_pointer(offset);
        REQUIRE(ptr == test_memory);
    }
    
    SECTION("Input/Output") {
        test_input = "test input";
        
        std::string input = extism::PluginIO::get_input_string();
        REQUIRE(input == "test input");
        
        std::vector<uint8_t> bytes = extism::PluginIO::get_input_bytes();
        REQUIRE(bytes.size() == 10);
        REQUIRE(std::string(bytes.begin(), bytes.end()) == "test input");
        
        extism::PluginIO::set_output_string("test output");
        REQUIRE(test_output == "test output");
    }
}

// Add more tests as needed for your specific plugin functionality
`;
  }

  /**
   * Get Google Test content
   */
  private getGoogleTestContent(): string {
    return `/**
 * ${this.cppOptions.pluginName} - Tests
 * Using Google Test framework
 */
#include <gtest/gtest.h>
#include <string>
#include <vector>
#include "${this.cppOptions.pluginName}.h"

// Mock the Extism functions for testing
extern "C" {
    uint8_t test_memory[1024];
    std::string test_input;
    std::string test_output;
    
    uint64_t __extism_memory_alloc(uint64_t size) {
        return 0;  // Always return offset 0 for testing
    }
    
    void __extism_memory_free(uint64_t offset) {
        // Do nothing in tests
    }
    
    uint8_t* __extism_memory_data(uint64_t offset) {
        return test_memory;
    }
    
    uint64_t __extism_input_length() {
        return test_input.length();
    }
    
    uint64_t __extism_input_offset() {
        std::memcpy(test_memory, test_input.data(), test_input.length());
        return 0;
    }
    
    uint64_t __extism_length_output(uint64_t offset, uint64_t length) {
        test_output = std::string(reinterpret_cast<char*>(test_memory), length);
        return 0;
    }
}

class PluginTest : public ::testing::Test {
protected:
    void SetUp() override {
        // Reset test data
        std::memset(test_memory, 0, sizeof(test_memory));
        test_input.clear();
        test_output.clear();
    }
};

TEST_F(PluginTest, MemoryAllocation) {
    uint64_t offset = extism::Memory::allocate(100);
    EXPECT_EQ(offset, 0);
    
    // This should not crash
    extism::Memory::free(offset);
}

TEST_F(PluginTest, GetMemoryPointer) {
    uint64_t offset = 0;
    uint8_t* ptr = extism::Memory::get_pointer(offset);
    EXPECT_EQ(ptr, test_memory);
}

TEST_F(PluginTest, InputOutput) {
    test_input = "test input";
    
    std::string input = extism::PluginIO::get_input_string();
    EXPECT_EQ(input, "test input");
    
    std::vector<uint8_t> bytes = extism::PluginIO::get_input_bytes();
    EXPECT_EQ(bytes.size(), 10);
    EXPECT_EQ(std::string(bytes.begin(), bytes.end()), "test input");
    
    extism::PluginIO::set_output_string("test output");
    EXPECT_EQ(test_output, "test output");
}

// Add more tests as needed for your specific plugin functionality
`;
  }

  /**
   * Get DocTest content
   */
  private getDocTestContent(): string {
    return `/**
 * ${this.cppOptions.pluginName} - Tests
 * Using doctest framework
 */
#define DOCTEST_CONFIG_IMPLEMENT_WITH_MAIN
#include <doctest/doctest.h>
#include <string>
#include <vector>
#include "${this.cppOptions.pluginName}.h"

// Mock the Extism functions for testing
extern "C" {
    uint8_t test_memory[1024];
    std::string test_input;
    std::string test_output;
    
    uint64_t __extism_memory_alloc(uint64_t size) {
        return 0;  // Always return offset 0 for testing
    }
    
    void __extism_memory_free(uint64_t offset) {
        // Do nothing in tests
    }
    
    uint8_t* __extism_memory_data(uint64_t offset) {
        return test_memory;
    }
    
    uint64_t __extism_input_length() {
        return test_input.length();
    }
    
    uint64_t __extism_input_offset() {
        std::memcpy(test_memory, test_input.data(), test_input.length());
        return 0;
    }
    
    uint64_t __extism_length_output(uint64_t offset, uint64_t length) {
        test_output = std::string(reinterpret_cast<char*>(test_memory), length);
        return 0;
    }
}

TEST_CASE("Plugin basics") {
    // Reset test data before each subcase
    std::memset(test_memory, 0, sizeof(test_memory));
    test_input.clear();
    test_output.clear();
    
    SUBCASE("Memory allocation") {
        uint64_t offset = extism::Memory::allocate(100);
        CHECK(offset == 0);
        
        // This should not crash
        extism::Memory::free(offset);
    }
    
    SUBCASE("Get memory pointer") {
        uint64_t offset = 0;
        uint8_t* ptr = extism::Memory::get_pointer(offset);
        CHECK(ptr == test_memory);
    }
    
    SUBCASE("Input/Output") {
        test_input = "test input";
        
        std::string input = extism::PluginIO::get_input_string();
        CHECK(input == "test input");
        
        std::vector<uint8_t> bytes = extism::PluginIO::get_input_bytes();
        CHECK(bytes.size() == 10);
        CHECK(std::string(bytes.begin(), bytes.end()) == "test input");
        
        extism::PluginIO::set_output_string("test output");
        CHECK(test_output == "test output");
    }
}

// Add more tests as needed for your specific plugin functionality
`;
  }

  /**
   * Generate example file
   */
  private async generateExampleFile(): Promise<void> {
    const exampleFile = path.join(this.targetDir, 'src', 'example.cpp');
    
    const content = `/**
 * ${this.cppOptions.pluginName} - Example Usage
 * 
 * This file demonstrates how to use the plugin functions.
 */
#include "${this.cppOptions.pluginName}.h"
#include <string>
#include <iostream>

/**
 * Example function that reverses a string
 */
extern "C" WASM_EXPORT uint64_t reverse_string() {
    // Get the input string
    std::string input = extism::PluginIO::get_input_string();
    
    // Reverse the string
    std::string output(input.rbegin(), input.rend());
    
    // Set the output
    return extism::PluginIO::set_output_string(output);
}

/**
 * Example function that counts characters in a string
 */
extern "C" WASM_EXPORT uint64_t count_chars() {
    // Get the input string
    std::string input = extism::PluginIO::get_input_string();
    
    // Count characters
    size_t count = input.length();
    
    // Create JSON response
    std::string output = "{\\"count\\":" + std::to_string(count) + "}";
    
    // Set the output
    return extism::PluginIO::set_output_string(output);
}
`;
    
    await writeFile(exampleFile, content);
  }

  /**
   * Generate README file
   */
  private async generateReadme(): Promise<void> {
    const readmeFile = path.join(this.targetDir, 'README.md');
    
    const content = `# ${this.cppOptions.pluginName}

${this.cppOptions.pluginDescription || 'A WebAssembly plugin built with Extism'}

${this.cppOptions.pluginAuthor ? `Author: ${this.cppOptions.pluginAuthor}` : ''}

## Overview

This is a C++ plugin for Extism. It provides a simple interface to build WebAssembly plugins that can be loaded and run by the Extism runtime.

## Building

### Prerequisites

- Emscripten (for compiling to WebAssembly)
- CMake (if using CMake build)
- Make (if using Makefile build)
${this.cppOptions.includeTests ? `- ${this.getTestFrameworkName()} (for running tests)` : ''}

### Building with ${this.cppOptions.useCMake ? 'CMake' : 'Make'}

${this.cppOptions.useCMake ? this.getCMakeBuildInstructions() : this.getMakeBuildInstructions()}

## Running Tests

${this.cppOptions.includeTests ? this.getTestInstructions() : 'No tests included in this project template.'}

## Plugin Functions

- **greet**: A simple greeting function that takes a name as input and returns a greeting message.
${this.cppOptions.includeExample ? `
- **reverse_string**: Reverses the input string.
- **count_chars**: Counts the number of characters in the input string.
` : ''}

## Usage with Extism

Once built, you can use this plugin with any Extism host SDK:

\`\`\`js
// JavaScript example
import { Plugin } from '@extism/extism';

const plugin = new Plugin(fs.readFileSync('dist/${this.cppOptions.pluginName}.wasm'));
const result = plugin.call('greet', '{"name":"Extism"}');
console.log(result.toString()); // "Hello, Extism!"
\`\`\`
`;
    
    await writeFile(readmeFile, content);
  }

  /**
   * Get the test framework name
   */
  private getTestFrameworkName(): string {
    switch (this.cppOptions.testFramework) {
      case 'catch2':
        return 'Catch2';
      case 'googletest':
        return 'Google Test';
      case 'doctest':
        return 'doctest';
      default:
        return 'Testing framework';
    }
  }

  /**
   * Get CMake build instructions
   */
  private getCMakeBuildInstructions(): string {
    return `\`\`\`bash
# Create a build directory
mkdir -p build
cd build

# Configure CMake with Emscripten
emcmake cmake ..

# Build the project
emmake cmake --build .

# The output will be in the build directory
\`\`\``;
  }

  /**
   * Get Make build instructions
   */
  private getMakeBuildInstructions(): string {
    return `\`\`\`bash
# Build the plugin
make

# The output will be in the dist directory
\`\`\``;
  }

  /**
   * Get test instructions
   */
  private getTestInstructions(): string {
    if (this.cppOptions.useCMake) {
      return `\`\`\`bash
# Configure CMake with testing enabled
mkdir -p build
cd build
cmake -DBUILD_TESTING=ON ..

# Build and run the tests
cmake --build . --target test
./tests
\`\`\``;
    } else {
      return `\`\`\`bash
# Build and run the tests
make test
\`\`\``;
    }
  }
} 