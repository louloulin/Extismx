/**
 * Extism Hello World Plugin (C)
 * 
 * This is a simple "Hello World" plugin implemented in C.
 */

#include "extism_pdk.h"
#include <stdlib.h>
#include <string.h>
#include <stdio.h>

/**
 * Hello function implementation
 */
int32_t hello() {
    // Log the function call
    const char* debug_msg = "Hello function called";
    extism_log_debug((const uint8_t*)debug_msg, strlen(debug_msg));

    // Get the input length
    uint64_t input_len = extism_input_length();
    
    // Determine the name
    char* name = NULL;
    
    if (input_len == 0) {
        // Default name
        name = strdup("World");
    } else {
        // Allocate buffer for input
        uint8_t* input_buf = (uint8_t*)malloc(input_len + 1);
        if (!input_buf) {
            const char* error_msg = "Memory allocation failed";
            extism_error_set((const uint8_t*)error_msg, strlen(error_msg));
            return 1;
        }
        
        // Load input
        extism_input_load_u8(0, input_len, input_buf);
        input_buf[input_len] = '\0';  // Null terminate
        
        // Check if input looks like JSON
        if (input_len > 2 && input_buf[0] == '{' && strstr((char*)input_buf, "\"name\"")) {
            // Very basic JSON parsing for demonstration
            // In a real plugin, you'd use a proper JSON parser library
            char* name_start = strstr((char*)input_buf, "\"name\"");
            if (name_start) {
                name_start = strchr(name_start, ':');
                if (name_start) {
                    name_start = strchr(name_start, '"');
                    if (name_start) {
                        name_start++; // Move past the quote
                        char* name_end = strchr(name_start, '"');
                        if (name_end) {
                            size_t name_len = name_end - name_start;
                            name = (char*)malloc(name_len + 1);
                            if (name) {
                                memcpy(name, name_start, name_len);
                                name[name_len] = '\0';
                            } else {
                                name = strdup("World");
                            }
                        } else {
                            name = strdup("World");
                        }
                    } else {
                        name = strdup("World");
                    }
                } else {
                    name = strdup("World");
                }
            } else {
                name = strdup("World");
            }
        } else {
            // Just use the input as is
            name = strdup((char*)input_buf);
        }
        
        free(input_buf);
    }
    
    if (!name) {
        const char* error_msg = "Memory allocation failed";
        extism_error_set((const uint8_t*)error_msg, strlen(error_msg));
        return 1;
    }

    // Create the greeting
    char greeting_log[256];
    snprintf(greeting_log, sizeof(greeting_log), "Created greeting: Hello, %s!", name);
    extism_log_info((const uint8_t*)greeting_log, strlen(greeting_log));
    
    // Create the JSON result
    char result[256];
    snprintf(result, sizeof(result), "{\"greeting\":\"Hello, %s!\"}", name);
    
    // Set the output
    extism_output_set((const uint8_t*)result, strlen(result));
    
    // Clean up
    free(name);
    
    return 0;
} 