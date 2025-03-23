/**
 * Extism Plugin Development Kit (PDK) for C/C++
 * 
 * This header provides the C/C++ interface for developing Extism plugins.
 */

#ifndef EXTISM_PDK_H
#define EXTISM_PDK_H

#include <stdint.h>
#include <stddef.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

/**
 * Get the length of the plugin input
 */
uint64_t extism_input_length();

/**
 * Load input bytes into a buffer
 */
void extism_input_load_u8(uint64_t offset, uint64_t length, uint8_t* buffer);

/**
 * Set the plugin output
 */
void extism_output_set(const uint8_t* data, uint64_t length);

/**
 * Set an error message
 */
void extism_error_set(const uint8_t* data, uint64_t length);

/**
 * Allocate memory in the Extism runtime
 */
uint64_t extism_alloc(uint64_t size);

/**
 * Free memory in the Extism runtime
 */
void extism_free(uint64_t pointer);

/**
 * Get the length of memory at a pointer
 */
uint64_t extism_length(uint64_t pointer);

/**
 * Store bytes into memory
 */
void extism_store_u8(uint64_t pointer, uint64_t offset, const uint8_t* data, uint64_t length);

/**
 * Load bytes from memory
 */
void extism_load_u8(uint64_t pointer, uint64_t offset, uint64_t length, uint8_t* buffer);

/**
 * Make an HTTP request
 */
int32_t extism_http_request(uint64_t request, uint64_t* response);

/**
 * Get the HTTP status code from a response
 */
int32_t extism_http_status_code(uint64_t response);

/**
 * Get a configuration value
 */
uint64_t extism_config_get(const uint8_t* key, uint64_t key_length);

/**
 * Get a variable
 */
uint64_t extism_var_get(const uint8_t* name, uint64_t name_length);

/**
 * Set a variable
 */
void extism_var_set(const uint8_t* name, uint64_t name_length, const uint8_t* value, uint64_t value_length);

/**
 * Log an info message
 */
void extism_log_info(const uint8_t* message, uint64_t message_length);

/**
 * Log a debug message
 */
void extism_log_debug(const uint8_t* message, uint64_t message_length);

/**
 * Log a warning message
 */
void extism_log_warn(const uint8_t* message, uint64_t message_length);

/**
 * Log an error message
 */
void extism_log_error(const uint8_t* message, uint64_t message_length);

#ifdef __cplusplus
}
#endif

/**
 * C++ wrapper for the Extism PDK (only included in C++ mode)
 */
#ifdef __cplusplus

#include <string>
#include <vector>
#include <optional>
#include <stdexcept>
#include <functional>
#include <memory>
#include <map>

namespace extism {

/**
 * Memory allocation in the Extism runtime
 */
class Memory {
public:
    /**
     * Create a new memory allocation
     */
    explicit Memory(uint64_t size) {
        offset = extism_alloc(size);
        length = size;
    }

    /**
     * Get the byte length of memory
     */
    uint64_t len() const {
        return extism_length(offset);
    }

    /**
     * Check if memory is empty
     */
    bool empty() const {
        return len() == 0;
    }

    /**
     * Store bytes into memory
     */
    void store(const std::vector<uint8_t>& data, uint64_t offset_val) {
        extism_store_u8(offset, offset_val, data.data(), data.size());
    }

    /**
     * Store bytes into memory at offset 0
     */
    void store_from_start(const std::vector<uint8_t>& data) {
        store(data, 0);
    }

    /**
     * Store a string into memory
     */
    void store_string(const std::string& str, uint64_t offset_val) {
        extism_store_u8(offset, offset_val, 
                        reinterpret_cast<const uint8_t*>(str.data()), 
                        str.size());
    }

    /**
     * Store a string into memory at offset 0
     */
    void store_string_from_start(const std::string& str) {
        store_string(str, 0);
    }

    /**
     * Load bytes from memory
     */
    std::vector<uint8_t> load(uint64_t offset_val, uint64_t length_val) const {
        std::vector<uint8_t> data(length_val);
        extism_load_u8(offset, offset_val, length_val, data.data());
        return data;
    }

    /**
     * Load all bytes from memory
     */
    std::vector<uint8_t> load_all() const {
        return load(0, len());
    }

    /**
     * Create a Memory object from a string
     */
    static Memory from_string(const std::string& str) {
        Memory mem(str.size());
        mem.store_string_from_start(str);
        return mem;
    }

    /**
     * Get a string from memory
     */
    std::string to_string() const {
        auto data = load_all();
        return std::string(data.begin(), data.end());
    }

    // Memory offset in the Extism runtime
    uint64_t offset;
    // Memory length
    uint64_t length;

    ~Memory() {
        extism_free(offset);
    }

    // Prevent copying
    Memory(const Memory&) = delete;
    Memory& operator=(const Memory&) = delete;

    // Allow moving
    Memory(Memory&& other) noexcept : offset(other.offset), length(other.length) {
        other.offset = 0;
        other.length = 0;
    }
    
    Memory& operator=(Memory&& other) noexcept {
        if (this != &other) {
            if (offset != 0) {
                extism_free(offset);
            }
            offset = other.offset;
            length = other.length;
            other.offset = 0;
            other.length = 0;
        }
        return *this;
    }
};

/**
 * HTTP request method
 */
enum class HttpMethod {
    Get,
    Post,
    Put,
    Delete,
    Patch,
    Head,
    Options
};

/**
 * Convert HttpMethod to string
 */
inline std::string http_method_to_string(HttpMethod method) {
    switch (method) {
        case HttpMethod::Get: return "GET";
        case HttpMethod::Post: return "POST";
        case HttpMethod::Put: return "PUT";
        case HttpMethod::Delete: return "DELETE";
        case HttpMethod::Patch: return "PATCH";
        case HttpMethod::Head: return "HEAD";
        case HttpMethod::Options: return "OPTIONS";
        default: return "GET";
    }
}

/**
 * HTTP request structure
 */
struct HttpRequest {
    HttpMethod method = HttpMethod::Get;
    std::string url;
    std::map<std::string, std::string> headers;
    std::optional<std::vector<uint8_t>> body;
};

/**
 * HTTP response structure
 */
class HttpResponse {
public:
    explicit HttpResponse(uint64_t ptr) : ptr(ptr) {}

    /**
     * Get the HTTP status code
     */
    int32_t status() const {
        return extism_http_status_code(ptr);
    }

    /**
     * Get the response body
     */
    std::vector<uint8_t> body() const {
        auto body_ptr = extism_var_get(
            reinterpret_cast<const uint8_t*>("response:body"), 13);
        
        if (body_ptr == 0) {
            return {};
        }

        auto len = extism_length(body_ptr);
        std::vector<uint8_t> data(len);
        extism_load_u8(body_ptr, 0, len, data.data());
        extism_free(body_ptr);
        return data;
    }

    /**
     * Get the response body as a string
     */
    std::string body_string() const {
        auto body_data = body();
        return std::string(body_data.begin(), body_data.end());
    }

    /**
     * Get a specific header from the response
     */
    std::optional<std::string> header(const std::string& name) const {
        std::string header_var = "response:header:" + name;
        auto header_ptr = extism_var_get(
            reinterpret_cast<const uint8_t*>(header_var.c_str()), 
            header_var.size());
        
        if (header_ptr == 0) {
            return std::nullopt;
        }

        auto len = extism_length(header_ptr);
        std::vector<uint8_t> data(len);
        extism_load_u8(header_ptr, 0, len, data.data());
        extism_free(header_ptr);
        
        return std::string(data.begin(), data.end());
    }

    ~HttpResponse() {
        extism_free(ptr);
    }

    // Prevent copying
    HttpResponse(const HttpResponse&) = delete;
    HttpResponse& operator=(const HttpResponse&) = delete;

    // Allow moving
    HttpResponse(HttpResponse&& other) noexcept : ptr(other.ptr) {
        other.ptr = 0;
    }
    
    HttpResponse& operator=(HttpResponse&& other) noexcept {
        if (this != &other) {
            if (ptr != 0) {
                extism_free(ptr);
            }
            ptr = other.ptr;
            other.ptr = 0;
        }
        return *this;
    }

private:
    uint64_t ptr;
};

/**
 * The Plugin Host interface for interacting with the Extism host
 */
class Host {
public:
    /**
     * Get the plugin input as raw bytes
     */
    static std::vector<uint8_t> input() {
        auto len = extism_input_length();
        std::vector<uint8_t> input(len);
        extism_input_load_u8(0, len, input.data());
        return input;
    }

    /**
     * Get the plugin input as a string
     */
    static std::string input_string() {
        auto input_data = input();
        return std::string(input_data.begin(), input_data.end());
    }

    /**
     * Set the plugin output from bytes
     */
    static void output(const std::vector<uint8_t>& data) {
        extism_output_set(data.data(), data.size());
    }

    /**
     * Set the plugin output from a string
     */
    static void output_string(const std::string& str) {
        extism_output_set(
            reinterpret_cast<const uint8_t*>(str.c_str()), 
            str.size());
    }

    /**
     * Set an error
     */
    static void error(const std::string& message) {
        extism_error_set(
            reinterpret_cast<const uint8_t*>(message.c_str()), 
            message.size());
    }

    /**
     * Get a configuration value
     */
    static std::optional<std::string> config(const std::string& key) {
        auto ptr = extism_config_get(
            reinterpret_cast<const uint8_t*>(key.c_str()), 
            key.size());
        
        if (ptr == 0) {
            return std::nullopt;
        }

        auto len = extism_length(ptr);
        std::vector<uint8_t> data(len);
        extism_load_u8(ptr, 0, len, data.data());
        extism_free(ptr);
        
        return std::string(data.begin(), data.end());
    }

    /**
     * Get a variable as bytes
     */
    static std::optional<std::vector<uint8_t>> var_get(const std::string& name) {
        auto ptr = extism_var_get(
            reinterpret_cast<const uint8_t*>(name.c_str()), 
            name.size());
        
        if (ptr == 0) {
            return std::nullopt;
        }

        auto len = extism_length(ptr);
        std::vector<uint8_t> data(len);
        extism_load_u8(ptr, 0, len, data.data());
        extism_free(ptr);
        
        return data;
    }

    /**
     * Get a variable as string
     */
    static std::optional<std::string> var_get_string(const std::string& name) {
        auto data_opt = var_get(name);
        if (!data_opt) {
            return std::nullopt;
        }
        
        auto& data = *data_opt;
        return std::string(data.begin(), data.end());
    }

    /**
     * Set a variable from bytes
     */
    static void var_set(const std::string& name, const std::vector<uint8_t>& value) {
        extism_var_set(
            reinterpret_cast<const uint8_t*>(name.c_str()), 
            name.size(),
            value.data(),
            value.size());
    }

    /**
     * Set a variable from a string
     */
    static void var_set_string(const std::string& name, const std::string& value) {
        extism_var_set(
            reinterpret_cast<const uint8_t*>(name.c_str()), 
            name.size(),
            reinterpret_cast<const uint8_t*>(value.c_str()),
            value.size());
    }

    /**
     * Log an info message
     */
    static void log_info(const std::string& message) {
        extism_log_info(
            reinterpret_cast<const uint8_t*>(message.c_str()), 
            message.size());
    }

    /**
     * Log a debug message
     */
    static void log_debug(const std::string& message) {
        extism_log_debug(
            reinterpret_cast<const uint8_t*>(message.c_str()), 
            message.size());
    }

    /**
     * Log a warning message
     */
    static void log_warn(const std::string& message) {
        extism_log_warn(
            reinterpret_cast<const uint8_t*>(message.c_str()), 
            message.size());
    }

    /**
     * Log an error message
     */
    static void log_error(const std::string& message) {
        extism_log_error(
            reinterpret_cast<const uint8_t*>(message.c_str()), 
            message.size());
    }

    /**
     * Make an HTTP request
     */
    static std::unique_ptr<HttpResponse> http_request(const HttpRequest& request) {
        // Set request variables
        var_set_string("request:method", http_method_to_string(request.method));
        var_set_string("request:url", request.url);
        
        // Set headers
        for (const auto& [key, value] : request.headers) {
            std::string header_name = "request:header:" + key;
            var_set_string(header_name, value);
        }
        
        // Set body if present
        if (request.body) {
            var_set("request:body", *request.body);
        }
        
        // Make the request
        uint64_t response_ptr = 0;
        int32_t status = extism_http_request(0, &response_ptr);
        
        if (status != 0) {
            throw std::runtime_error("HTTP request failed");
        }
        
        return std::make_unique<HttpResponse>(response_ptr);
    }
};

} // namespace extism

#endif // __cplusplus

#endif // EXTISM_PDK_H 