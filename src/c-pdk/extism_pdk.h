/**
 * Extism C/C++ Plugin Development Kit (PDK)
 * This header provides the necessary definitions and functions for creating Extism plugins in C/C++.
 */

#ifndef EXTISM_PDK_H
#define EXTISM_PDK_H

#include <stdint.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

/**
 * Memory allocation functions
 */
extern void *extism_alloc(size_t size);
extern void extism_free(void *ptr);

/**
 * Input/output buffer management
 */
extern const uint8_t *extism_input_get(size_t *length);
extern void extism_output_set(const uint8_t *data, size_t length);

/**
 * Variable operations
 */
extern const uint8_t *extism_var_get(const char *name, size_t *length);
extern void extism_var_set(const char *name, const uint8_t *data, size_t length);

/**
 * HTTP operations
 */
typedef struct {
    const char *url;
    const char *method;
    const char **headers;
    size_t headers_count;
    const uint8_t *body;
    size_t body_length;
} extism_http_request;

typedef struct {
    int status;
    const char **headers;
    size_t headers_count;
    const uint8_t *body;
    size_t body_length;
} extism_http_response;

extern extism_http_response *extism_http_request(const extism_http_request *request);
extern void extism_http_free(extism_http_response *response);

/**
 * Plugin export macro
 */
#ifdef _WIN32
#define EXTISM_EXPORT __declspec(dllexport)
#else
#define EXTISM_EXPORT __attribute__((visibility("default")))
#endif

#ifdef __cplusplus
}
#endif

#endif /* EXTISM_PDK_H */ 