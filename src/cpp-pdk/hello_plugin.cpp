/**
 * Extism Hello World Plugin (C++)
 * 
 * This is a simple "Hello World" plugin implemented in C++.
 */

#include "extism_pdk.h"
#include <string>
#include <optional>
#include <memory>

// Import the Extism PDK
using namespace extism;

extern "C" {
    // Hello function implementation
    int32_t hello() {
        try {
            // Log the function call
            Host::log_debug("Hello function called");

            // Parse the input
            std::string name;
            std::string input = Host::input_string();
            
            if (input.empty()) {
                name = "World";
            } else {
                // Try to parse as JSON with a name field
                // For simplicity in this example, we'll just check for a basic JSON pattern
                if (input.find("{") != std::string::npos && 
                    input.find("\"name\"") != std::string::npos) {
                    // Extract name between quotes after "name":
                    size_t pos = input.find("\"name\"");
                    pos = input.find(":", pos);
                    pos = input.find("\"", pos);
                    if (pos != std::string::npos) {
                        size_t end = input.find("\"", pos + 1);
                        if (end != std::string::npos) {
                            name = input.substr(pos + 1, end - pos - 1);
                        } else {
                            name = "World";
                        }
                    } else {
                        name = "World";
                    }
                } else {
                    // Treat as plain string
                    name = input;
                }
            }

            // Create the greeting
            std::string greeting = "Hello, " + name + "!";
            
            // Log the greeting
            Host::log_info("Created greeting: " + greeting);
            
            // Create the JSON result
            std::string result = "{\"greeting\":\"" + greeting + "\"}";
            
            // Set the output
            Host::output_string(result);
            
            return 0;
        } catch (const std::exception& e) {
            Host::error(std::string("Error in hello function: ") + e.what());
            return 1;
        }
    }
} 