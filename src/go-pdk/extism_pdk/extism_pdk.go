// Package extism_pdk provides a Go interface for developing Extism plugins
package extism_pdk

import (
	"encoding/json"
	"fmt"
)

// Memory operations - these are imported from the host environment
//
//export extism_input_length
func extism_input_length() uint64

//export extism_input_load
func extism_input_load(offset uint64, length uint64) uint64

//export extism_output_set
func extism_output_set(offset uint64, length uint64) uint64

//export extism_error_set
func extism_error_set(offset uint64, length uint64) uint64

//export extism_length
func extism_length(id uint64) uint64

//export extism_alloc
func extism_alloc(length uint64) uint64

//export extism_free
func extism_free(offset uint64)

//export extism_store_u8
func extism_store_u8(offset uint64, value uint8)

//export extism_store_u64
func extism_store_u64(offset uint64, value uint64)

//export extism_load_u8
func extism_load_u8(offset uint64) uint8

//export extism_load_u64
func extism_load_u64(offset uint64) uint64

// Host functions - these are functions provided by the host
//
//export extism_http_request
func extism_http_request(request uint64, request_length uint64) uint64

//export extism_http_status_code
func extism_http_status_code() uint64

//export extism_config_get
func extism_config_get(key uint64, key_length uint64) uint64

//export extism_var_get
func extism_var_get(key uint64, key_length uint64) uint64

//export extism_var_set
func extism_var_set(key uint64, key_length uint64, value uint64, value_length uint64) uint64

//export extism_log_info
func extism_log_info(msg uint64, msg_length uint64)

//export extism_log_debug
func extism_log_debug(msg uint64, msg_length uint64)

//export extism_log_warn
func extism_log_warn(msg uint64, msg_length uint64)

//export extism_log_error
func extism_log_error(msg uint64, msg_length uint64)

// Host is the main interface for interacting with the host environment
type Host struct{}

// GetInput returns the input data provided to the plugin
func (h Host) GetInput() []byte {
	length := extism_input_length()
	if length == 0 {
		return []byte{}
	}

	memory := make([]byte, length)
	ptr := extism_input_load(0, length)

	// Copy from host memory to Go slice
	for i := uint64(0); i < length; i++ {
		memory[i] = extism_load_u8(ptr + i)
	}

	return memory
}

// GetInputString returns the input data as a string
func (h Host) GetInputString() string {
	return string(h.GetInput())
}

// GetInputJSON unmarshals the input JSON into the provided interface
func (h Host) GetInputJSON(v interface{}) error {
	data := h.GetInput()
	return json.Unmarshal(data, v)
}

// SetOutput sets the output data for the plugin
func (h Host) SetOutput(data []byte) error {
	length := uint64(len(data))
	ptr := extism_alloc(length)

	// Copy from Go slice to host memory
	for i := uint64(0); i < length; i++ {
		extism_store_u8(ptr+i, data[i])
	}

	extism_output_set(ptr, length)
	extism_free(ptr)
	return nil
}

// SetOutputString sets the output string for the plugin
func (h Host) SetOutputString(s string) error {
	return h.SetOutput([]byte(s))
}

// SetOutputJSON marshals the provided interface to JSON and sets it as output
func (h Host) SetOutputJSON(v interface{}) error {
	data, err := json.Marshal(v)
	if err != nil {
		return err
	}
	return h.SetOutput(data)
}

// SetError sets an error message for the plugin
func (h Host) SetError(msg string) error {
	data := []byte(msg)
	length := uint64(len(data))
	ptr := extism_alloc(length)

	// Copy from Go slice to host memory
	for i := uint64(0); i < length; i++ {
		extism_store_u8(ptr+i, data[i])
	}

	extism_error_set(ptr, length)
	extism_free(ptr)
	return nil
}

// LogInfo logs an informational message
func (h Host) LogInfo(msg string) {
	data := []byte(msg)
	length := uint64(len(data))
	ptr := extism_alloc(length)

	// Copy from Go slice to host memory
	for i := uint64(0); i < length; i++ {
		extism_store_u8(ptr+i, data[i])
	}

	extism_log_info(ptr, length)
	extism_free(ptr)
}

// LogDebug logs a debug message
func (h Host) LogDebug(msg string) {
	data := []byte(msg)
	length := uint64(len(data))
	ptr := extism_alloc(length)

	// Copy from Go slice to host memory
	for i := uint64(0); i < length; i++ {
		extism_store_u8(ptr+i, data[i])
	}

	extism_log_debug(ptr, length)
	extism_free(ptr)
}

// LogWarn logs a warning message
func (h Host) LogWarn(msg string) {
	data := []byte(msg)
	length := uint64(len(data))
	ptr := extism_alloc(length)

	// Copy from Go slice to host memory
	for i := uint64(0); i < length; i++ {
		extism_store_u8(ptr+i, data[i])
	}

	extism_log_warn(ptr, length)
	extism_free(ptr)
}

// LogError logs an error message
func (h Host) LogError(msg string) {
	data := []byte(msg)
	length := uint64(len(data))
	ptr := extism_alloc(length)

	// Copy from Go slice to host memory
	for i := uint64(0); i < length; i++ {
		extism_store_u8(ptr+i, data[i])
	}

	extism_log_error(ptr, length)
	extism_free(ptr)
}

// HTTPRequest makes an HTTP request to the host
type HTTPRequest struct {
	Method  string            `json:"method"`
	URL     string            `json:"url"`
	Headers map[string]string `json:"headers,omitempty"`
	Body    string            `json:"body,omitempty"`
}

// HTTPResponse is the response from an HTTP request
type HTTPResponse struct {
	Status  int               `json:"status"`
	Headers map[string]string `json:"headers,omitempty"`
	Body    string            `json:"body"`
}

// HTTP makes an HTTP request
func (h Host) HTTP(req HTTPRequest) (*HTTPResponse, error) {
	data, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}

	length := uint64(len(data))
	ptr := extism_alloc(length)

	// Copy from Go slice to host memory
	for i := uint64(0); i < length; i++ {
		extism_store_u8(ptr+i, data[i])
	}

	resultPtr := extism_http_request(ptr, length)
	extism_free(ptr)

	if resultPtr == 0 {
		return nil, fmt.Errorf("HTTP request failed")
	}

	resultLength := extism_length(resultPtr)
	result := make([]byte, resultLength)

	// Copy from host memory to Go slice
	for i := uint64(0); i < resultLength; i++ {
		result[i] = extism_load_u8(resultPtr + i)
	}

	status := extism_http_status_code()

	var response HTTPResponse
	err = json.Unmarshal(result, &response)
	if err != nil {
		return nil, err
	}

	response.Status = int(status)
	return &response, nil
}

// GetConfig gets a configuration value by key
func (h Host) GetConfig(key string) string {
	data := []byte(key)
	length := uint64(len(data))
	ptr := extism_alloc(length)

	// Copy from Go slice to host memory
	for i := uint64(0); i < length; i++ {
		extism_store_u8(ptr+i, data[i])
	}

	resultPtr := extism_config_get(ptr, length)
	extism_free(ptr)

	if resultPtr == 0 {
		return ""
	}

	resultLength := extism_length(resultPtr)
	result := make([]byte, resultLength)

	// Copy from host memory to Go slice
	for i := uint64(0); i < resultLength; i++ {
		result[i] = extism_load_u8(resultPtr + i)
	}

	return string(result)
}

// GetVar gets a variable value by key
func (h Host) GetVar(key string) string {
	data := []byte(key)
	length := uint64(len(data))
	ptr := extism_alloc(length)

	// Copy from Go slice to host memory
	for i := uint64(0); i < length; i++ {
		extism_store_u8(ptr+i, data[i])
	}

	resultPtr := extism_var_get(ptr, length)
	extism_free(ptr)

	if resultPtr == 0 {
		return ""
	}

	resultLength := extism_length(resultPtr)
	result := make([]byte, resultLength)

	// Copy from host memory to Go slice
	for i := uint64(0); i < resultLength; i++ {
		result[i] = extism_load_u8(resultPtr + i)
	}

	return string(result)
}

// SetVar sets a variable value by key
func (h Host) SetVar(key string, value string) bool {
	keyData := []byte(key)
	keyLength := uint64(len(keyData))
	keyPtr := extism_alloc(keyLength)

	// Copy key from Go slice to host memory
	for i := uint64(0); i < keyLength; i++ {
		extism_store_u8(keyPtr+i, keyData[i])
	}

	valueData := []byte(value)
	valueLength := uint64(len(valueData))
	valuePtr := extism_alloc(valueLength)

	// Copy value from Go slice to host memory
	for i := uint64(0); i < valueLength; i++ {
		extism_store_u8(valuePtr+i, valueData[i])
	}

	result := extism_var_set(keyPtr, keyLength, valuePtr, valueLength)

	extism_free(keyPtr)
	extism_free(valuePtr)

	return result == 1
}

// CreateHost creates a new Host instance
func CreateHost() Host {
	return Host{}
}
