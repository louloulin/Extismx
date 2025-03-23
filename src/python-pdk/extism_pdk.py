"""
Extism Plugin Development Kit (PDK) for Python

This module provides a Python interface for developing Extism plugins.
"""

import json
import sys
from typing import Any, Dict, List, Optional, Union

# Import WASM functions from the host
# Note: These are defined as external imports by the Extism runtime
def extism_input_length() -> int:
    """Get the length of the input data"""
    ...

def extism_input_load(offset: int, length: int) -> int:
    """Load input data into memory"""
    ...

def extism_output_set(offset: int, length: int) -> int:
    """Set the output data"""
    ...

def extism_error_set(offset: int, length: int) -> int:
    """Set an error message"""
    ...

def extism_length(id: int) -> int:
    """Get the length of a memory block"""
    ...

def extism_alloc(length: int) -> int:
    """Allocate memory"""
    ...

def extism_free(offset: int) -> None:
    """Free memory"""
    ...

def extism_store_u8(offset: int, value: int) -> None:
    """Store a byte in memory"""
    ...

def extism_load_u8(offset: int) -> int:
    """Load a byte from memory"""
    ...

def extism_http_request(request: int, request_length: int) -> int:
    """Make an HTTP request"""
    ...

def extism_http_status_code() -> int:
    """Get the HTTP status code from the last request"""
    ...

def extism_config_get(key: int, key_length: int) -> int:
    """Get a configuration value"""
    ...

def extism_var_get(key: int, key_length: int) -> int:
    """Get a variable value"""
    ...

def extism_var_set(key: int, key_length: int, value: int, value_length: int) -> int:
    """Set a variable value"""
    ...

def extism_log_info(msg: int, msg_length: int) -> None:
    """Log an info message"""
    ...

def extism_log_debug(msg: int, msg_length: int) -> None:
    """Log a debug message"""
    ...

def extism_log_warn(msg: int, msg_length: int) -> None:
    """Log a warning message"""
    ...

def extism_log_error(msg: int, msg_length: int) -> None:
    """Log an error message"""
    ...

class Memory:
    """
    Helper class for memory management
    """
    @staticmethod
    def alloc(data: bytes) -> int:
        """
        Allocate memory and store data
        
        Args:
            data: The data to store
            
        Returns:
            The memory offset
        """
        length = len(data)
        offset = extism_alloc(length)
        
        for i, b in enumerate(data):
            extism_store_u8(offset + i, b)
            
        return offset
    
    @staticmethod
    def free(offset: int) -> None:
        """
        Free memory
        
        Args:
            offset: The memory offset to free
        """
        extism_free(offset)
    
    @staticmethod
    def get(offset: int, length: int) -> bytes:
        """
        Get data from memory
        
        Args:
            offset: The memory offset
            length: The length of data to get
            
        Returns:
            The data as bytes
        """
        data = bytearray(length)
        for i in range(length):
            data[i] = extism_load_u8(offset + i)
        return bytes(data)


class Host:
    """
    The main interface for interacting with the host environment
    """
    
    def get_input(self) -> bytes:
        """
        Get the input data as bytes
        
        Returns:
            The input data
        """
        length = extism_input_length()
        if length == 0:
            return b""
        
        offset = extism_input_load(0, length)
        return Memory.get(offset, length)
    
    def get_input_string(self) -> str:
        """
        Get the input data as a string
        
        Returns:
            The input data as a string
        """
        try:
            return self.get_input().decode('utf-8')
        except UnicodeDecodeError:
            return ""
    
    def get_input_json(self) -> Any:
        """
        Get the input data as JSON
        
        Returns:
            The parsed JSON data
        """
        try:
            return json.loads(self.get_input_string())
        except json.JSONDecodeError:
            return None
    
    def set_output(self, data: bytes) -> None:
        """
        Set the output data
        
        Args:
            data: The output data
        """
        offset = Memory.alloc(data)
        extism_output_set(offset, len(data))
        Memory.free(offset)
    
    def set_output_string(self, data: str) -> None:
        """
        Set the output data as a string
        
        Args:
            data: The output string
        """
        self.set_output(data.encode('utf-8'))
    
    def set_output_json(self, data: Any) -> None:
        """
        Set the output data as JSON
        
        Args:
            data: The data to serialize as JSON
        """
        self.set_output_string(json.dumps(data))
    
    def set_error(self, error: str) -> None:
        """
        Set an error message
        
        Args:
            error: The error message
        """
        data = error.encode('utf-8')
        offset = Memory.alloc(data)
        extism_error_set(offset, len(data))
        Memory.free(offset)
    
    def log_info(self, message: str) -> None:
        """
        Log an informational message
        
        Args:
            message: The message to log
        """
        data = message.encode('utf-8')
        offset = Memory.alloc(data)
        extism_log_info(offset, len(data))
        Memory.free(offset)
    
    def log_debug(self, message: str) -> None:
        """
        Log a debug message
        
        Args:
            message: The message to log
        """
        data = message.encode('utf-8')
        offset = Memory.alloc(data)
        extism_log_debug(offset, len(data))
        Memory.free(offset)
    
    def log_warn(self, message: str) -> None:
        """
        Log a warning message
        
        Args:
            message: The message to log
        """
        data = message.encode('utf-8')
        offset = Memory.alloc(data)
        extism_log_warn(offset, len(data))
        Memory.free(offset)
    
    def log_error(self, message: str) -> None:
        """
        Log an error message
        
        Args:
            message: The message to log
        """
        data = message.encode('utf-8')
        offset = Memory.alloc(data)
        extism_log_error(offset, len(data))
        Memory.free(offset)
    
    def http_request(self, 
                     url: str, 
                     method: str = "GET", 
                     headers: Optional[Dict[str, str]] = None, 
                     body: Optional[str] = None) -> Dict[str, Any]:
        """
        Make an HTTP request
        
        Args:
            url: The URL to request
            method: The HTTP method
            headers: Optional HTTP headers
            body: Optional request body
            
        Returns:
            The HTTP response as a dictionary
        """
        request = {
            "url": url,
            "method": method
        }
        
        if headers:
            request["headers"] = headers
            
        if body:
            request["body"] = body
            
        request_json = json.dumps(request).encode('utf-8')
        request_offset = Memory.alloc(request_json)
        
        response_offset = extism_http_request(request_offset, len(request_json))
        Memory.free(request_offset)
        
        if response_offset == 0:
            return {"status": 0, "body": ""}
            
        response_length = extism_length(response_offset)
        response_data = Memory.get(response_offset, response_length)
        
        try:
            response = json.loads(response_data.decode('utf-8'))
            response["status"] = extism_http_status_code()
            return response
        except (UnicodeDecodeError, json.JSONDecodeError):
            return {"status": extism_http_status_code(), "body": ""}
    
    def get_config(self, key: str) -> str:
        """
        Get a configuration value
        
        Args:
            key: The configuration key
            
        Returns:
            The configuration value
        """
        key_bytes = key.encode('utf-8')
        key_offset = Memory.alloc(key_bytes)
        
        result_offset = extism_config_get(key_offset, len(key_bytes))
        Memory.free(key_offset)
        
        if result_offset == 0:
            return ""
            
        result_length = extism_length(result_offset)
        result_data = Memory.get(result_offset, result_length)
        
        try:
            return result_data.decode('utf-8')
        except UnicodeDecodeError:
            return ""
    
    def get_var(self, key: str) -> str:
        """
        Get a variable value
        
        Args:
            key: The variable key
            
        Returns:
            The variable value
        """
        key_bytes = key.encode('utf-8')
        key_offset = Memory.alloc(key_bytes)
        
        result_offset = extism_var_get(key_offset, len(key_bytes))
        Memory.free(key_offset)
        
        if result_offset == 0:
            return ""
            
        result_length = extism_length(result_offset)
        result_data = Memory.get(result_offset, result_length)
        
        try:
            return result_data.decode('utf-8')
        except UnicodeDecodeError:
            return ""
    
    def set_var(self, key: str, value: str) -> bool:
        """
        Set a variable value
        
        Args:
            key: The variable key
            value: The variable value
            
        Returns:
            Whether the operation was successful
        """
        key_bytes = key.encode('utf-8')
        key_offset = Memory.alloc(key_bytes)
        
        value_bytes = value.encode('utf-8')
        value_offset = Memory.alloc(value_bytes)
        
        result = extism_var_set(key_offset, len(key_bytes), value_offset, len(value_bytes))
        
        Memory.free(key_offset)
        Memory.free(value_offset)
        
        return result == 1


# Create a global host instance for easier access
host = Host() 