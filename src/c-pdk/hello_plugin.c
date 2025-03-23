/**
 * Hello World Plugin for Extism
 * A simple C example plugin
 */

#include "extism_pdk.h"
#include <string.h>
#include <stdio.h>

EXTISM_EXPORT int32_t hello(void) {
    size_t input_length;
    const uint8_t *input = extism_input_get(&input_length);
    
    // Default greeting if no input
    const char *name = "World";
    
    // If we have input, use it as the name
    char name_buf[256] = {0};
    if (input_length > 0) {
        size_t max_len = input_length < 255 ? input_length : 255;
        memcpy(name_buf, input, max_len);
        name_buf[max_len] = '\0';
        name = name_buf;
    }
    
    // Format greeting
    char output[512];
    snprintf(output, sizeof(output), "{\"greeting\":\"Hello, %s!\"}", name);
    
    // Set output
    extism_output_set((const uint8_t *)output, strlen(output));
    
    return 0;
} 