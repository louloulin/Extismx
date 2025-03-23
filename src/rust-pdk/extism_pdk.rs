//! Extism Plugin Development Kit (PDK) for Rust
//! 
//! This module provides the Rust interface for developing Extism plugins.

use std::alloc::{alloc, dealloc, Layout};
use std::ffi::{c_void, CStr, CString};
use std::mem;
use std::slice;

// External Extism functions
extern "C" {
    fn extism_input_length() -> u64;
    fn extism_input_load_u8(offset: u64, len: u64, buf: *mut u8);
    fn extism_output_set(data: *const u8, len: u64);
    fn extism_error_set(data: *const u8, len: u64);
    fn extism_alloc(n: u64) -> u64;
    fn extism_free(pointer: u64);
    fn extism_length(pointer: u64) -> u64;
    fn extism_store_u8(pointer: u64, offset: u64, buf: *const u8, len: u64);
    fn extism_load_u8(pointer: u64, offset: u64, len: u64, buf: *mut u8);
    fn extism_http_request(req: u64, out: *mut u64) -> i32;
    fn extism_http_status_code(resp: u64) -> i32;
    fn extism_config_get(key: *const u8, key_len: u64) -> u64;
    fn extism_var_get(name: *const u8, name_len: u64) -> u64;
    fn extism_var_set(name: *const u8, name_len: u64, value: *const u8, value_len: u64);
    fn extism_log_info(msg: *const u8, msg_len: u64);
    fn extism_log_debug(msg: *const u8, msg_len: u64);
    fn extism_log_warn(msg: *const u8, msg_len: u64);
    fn extism_log_error(msg: *const u8, msg_len: u64);
}

/// Memory allocation in the Extism runtime
#[derive(Debug)]
pub struct Memory {
    /// The memory pointer
    pub offset: u64,
    /// The memory length
    pub length: u64,
}

impl Memory {
    /// Allocate memory in the Extism runtime
    pub fn new(size: u64) -> Self {
        let offset = unsafe { extism_alloc(size) };
        Self {
            offset,
            length: size,
        }
    }

    /// Get the byte length of memory
    pub fn len(&self) -> u64 {
        unsafe { extism_length(self.offset) }
    }

    /// Check if memory is empty
    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }

    /// Store bytes into memory
    pub fn store(&mut self, data: &[u8], offset: u64) {
        unsafe {
            extism_store_u8(
                self.offset,
                offset,
                data.as_ptr(),
                data.len() as u64,
            );
        }
    }

    /// Store bytes into memory at offset 0
    pub fn store_from_start(&mut self, data: &[u8]) {
        self.store(data, 0);
    }

    /// Load bytes from memory
    pub fn load(&self, offset: u64, length: u64) -> Vec<u8> {
        let mut data = vec![0u8; length as usize];
        unsafe {
            extism_load_u8(
                self.offset,
                offset,
                length,
                data.as_mut_ptr(),
            );
        }
        data
    }

    /// Load all bytes from memory
    pub fn load_all(&self) -> Vec<u8> {
        self.load(0, self.len())
    }

    /// Create a Memory object from a string
    pub fn from_string(s: &str) -> Self {
        let bytes = s.as_bytes();
        let mut mem = Self::new(bytes.len() as u64);
        mem.store_from_start(bytes);
        mem
    }

    /// Create a Memory object from JSON
    pub fn from_json<T: serde::Serialize>(data: &T) -> Result<Self, serde_json::Error> {
        let json = serde_json::to_string(data)?;
        Ok(Self::from_string(&json))
    }

    /// Get a string from memory
    pub fn to_string(&self) -> Result<String, std::string::FromUtf8Error> {
        String::from_utf8(self.load_all())
    }

    /// Parse JSON from memory
    pub fn to_json<T: serde::de::DeserializeOwned>(&self) -> Result<T, serde_json::Error> {
        let s = self.to_string().map_err(|e| {
            serde_json::Error::custom(format!("Invalid UTF-8: {}", e))
        })?;
        serde_json::from_str(&s)
    }
}

impl Drop for Memory {
    fn drop(&mut self) {
        unsafe {
            extism_free(self.offset);
        }
    }
}

/// HTTP Request method
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum HttpMethod {
    Get,
    Post,
    Put,
    Delete,
    Patch,
    Head,
    Options,
}

impl ToString for HttpMethod {
    fn to_string(&self) -> String {
        match self {
            HttpMethod::Get => "GET".to_string(),
            HttpMethod::Post => "POST".to_string(),
            HttpMethod::Put => "PUT".to_string(),
            HttpMethod::Delete => "DELETE".to_string(),
            HttpMethod::Patch => "PATCH".to_string(),
            HttpMethod::Head => "HEAD".to_string(),
            HttpMethod::Options => "OPTIONS".to_string(),
        }
    }
}

/// HTTP Request structure
pub struct HttpRequest {
    /// The request method
    pub method: HttpMethod,
    /// The request URL
    pub url: String,
    /// HTTP headers
    pub headers: Vec<(String, String)>,
    /// Request body
    pub body: Option<Vec<u8>>,
}

/// HTTP Response structure
pub struct HttpResponse {
    /// The response pointer
    ptr: u64,
}

impl HttpResponse {
    /// Get the HTTP status code
    pub fn status(&self) -> i32 {
        unsafe { extism_http_status_code(self.ptr) }
    }

    /// Get the response body
    pub fn body(&self) -> Vec<u8> {
        let body_ptr = unsafe { extism_var_get("response:body\0".as_ptr(), 14) };
        if body_ptr == 0 {
            return Vec::new();
        }

        let len = unsafe { extism_length(body_ptr) };
        let mut data = vec![0u8; len as usize];
        unsafe {
            extism_load_u8(body_ptr, 0, len, data.as_mut_ptr());
            extism_free(body_ptr);
        }
        data
    }

    /// Get a specific header from the response
    pub fn header(&self, name: &str) -> Option<String> {
        let header_var = format!("response:header:{}\0", name);
        let header_ptr = unsafe { 
            extism_var_get(header_var.as_ptr(), header_var.len() as u64 - 1) 
        };
        
        if header_ptr == 0 {
            return None;
        }

        let len = unsafe { extism_length(header_ptr) };
        let mut data = vec![0u8; len as usize];
        unsafe {
            extism_load_u8(header_ptr, 0, len, data.as_mut_ptr());
            extism_free(header_ptr);
        }
        
        String::from_utf8(data).ok()
    }
}

impl Drop for HttpResponse {
    fn drop(&mut self) {
        unsafe {
            extism_free(self.ptr);
        }
    }
}

/// The Plugin Host interface for interacting with the Extism host
pub struct Host;

impl Host {
    /// Get the plugin input
    pub fn input() -> Vec<u8> {
        let len = unsafe { extism_input_length() };
        let mut input = vec![0u8; len as usize];
        unsafe {
            extism_input_load_u8(0, len, input.as_mut_ptr());
        }
        input
    }

    /// Get the plugin input as a string
    pub fn input_string() -> Result<String, std::string::FromUtf8Error> {
        String::from_utf8(Self::input())
    }

    /// Parse JSON from the plugin input
    pub fn input_json<T: serde::de::DeserializeOwned>() -> Result<T, serde_json::Error> {
        let input = Self::input_string().map_err(|e| {
            serde_json::Error::custom(format!("Invalid UTF-8: {}", e))
        })?;
        serde_json::from_str(&input)
    }

    /// Set the plugin output
    pub fn output(data: &[u8]) {
        unsafe {
            extism_output_set(data.as_ptr(), data.len() as u64);
        }
    }

    /// Set the plugin output from a string
    pub fn output_string(s: &str) {
        Self::output(s.as_bytes());
    }

    /// Set the plugin output from JSON
    pub fn output_json<T: serde::Serialize>(data: &T) -> Result<(), serde_json::Error> {
        let json = serde_json::to_string(data)?;
        Self::output_string(&json);
        Ok(())
    }

    /// Set an error
    pub fn error(message: &str) {
        unsafe {
            extism_error_set(message.as_ptr(), message.len() as u64);
        }
    }

    /// Get a configuration value
    pub fn config(key: &str) -> Option<String> {
        let key_cstr = CString::new(key).unwrap();
        let ptr = unsafe { extism_config_get(key_cstr.as_ptr() as *const u8, key.len() as u64) };
        if ptr == 0 {
            return None;
        }

        let len = unsafe { extism_length(ptr) };
        let mut data = vec![0u8; len as usize];
        unsafe {
            extism_load_u8(ptr, 0, len, data.as_mut_ptr());
            extism_free(ptr);
        }
        
        String::from_utf8(data).ok()
    }

    /// Get a variable
    pub fn var_get(name: &str) -> Option<Vec<u8>> {
        let name_cstr = CString::new(name).unwrap();
        let ptr = unsafe { extism_var_get(name_cstr.as_ptr() as *const u8, name.len() as u64) };
        if ptr == 0 {
            return None;
        }

        let len = unsafe { extism_length(ptr) };
        let mut data = vec![0u8; len as usize];
        unsafe {
            extism_load_u8(ptr, 0, len, data.as_mut_ptr());
            extism_free(ptr);
        }
        
        Some(data)
    }

    /// Set a variable
    pub fn var_set(name: &str, value: &[u8]) {
        let name_cstr = CString::new(name).unwrap();
        unsafe {
            extism_var_set(
                name_cstr.as_ptr() as *const u8, 
                name.len() as u64, 
                value.as_ptr(), 
                value.len() as u64
            );
        }
    }

    /// Set a variable from a string
    pub fn var_set_string(name: &str, value: &str) {
        Self::var_set(name, value.as_bytes());
    }

    /// Log an info message
    pub fn log_info(message: &str) {
        unsafe {
            extism_log_info(message.as_ptr(), message.len() as u64);
        }
    }

    /// Log a debug message
    pub fn log_debug(message: &str) {
        unsafe {
            extism_log_debug(message.as_ptr(), message.len() as u64);
        }
    }

    /// Log a warning message
    pub fn log_warn(message: &str) {
        unsafe {
            extism_log_warn(message.as_ptr(), message.len() as u64);
        }
    }

    /// Log an error message
    pub fn log_error(message: &str) {
        unsafe {
            extism_log_error(message.as_ptr(), message.len() as u64);
        }
    }

    /// Make an HTTP request
    pub fn http_request(request: &HttpRequest) -> Result<HttpResponse, String> {
        // Convert the request to JSON
        let method = request.method.to_string();
        
        // Set request variables
        Self::var_set_string("request:method", &method);
        Self::var_set_string("request:url", &request.url);
        
        // Set headers
        for (key, value) in &request.headers {
            let header_name = format!("request:header:{}", key);
            Self::var_set_string(&header_name, value);
        }
        
        // Set body if present
        if let Some(body) = &request.body {
            Self::var_set("request:body", body);
        }
        
        // Make the request
        let mut response_ptr: u64 = 0;
        let status = unsafe {
            extism_http_request(0, &mut response_ptr as *mut u64)
        };
        
        if status != 0 {
            return Err("HTTP request failed".to_string());
        }
        
        Ok(HttpResponse { ptr: response_ptr })
    }
}

/// Macro for exporting Extism plugin functions
#[macro_export]
macro_rules! export_plugin {
    ($(fn $name:ident($($arg:ident: $argty:ty),*) -> $ret:ty $body:block)*) => {
        $(
            #[no_mangle]
            pub extern "C" fn $name() -> i32 {
                match (|| -> Result<$ret, String> {
                    $body
                })() {
                    Ok(result) => {
                        if let Err(e) = $crate::Host::output_json(&result) {
                            $crate::Host::error(&format!("Failed to serialize output: {}", e));
                            1
                        } else {
                            0
                        }
                    }
                    Err(e) => {
                        $crate::Host::error(&e);
                        1
                    }
                }
            }
        )*
    };
} 