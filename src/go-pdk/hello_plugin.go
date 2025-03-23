package main

import (
	"./extism_pdk"
)

//export hello
func hello() int32 {
	// Create a host interface
	host := extism_pdk.CreateHost()

	// Get input from host
	input := host.GetInputString()
	if input == "" {
		input = "World"
	}

	// Log debug message
	host.LogDebug("Hello plugin called with input: " + input)

	// Create greeting
	greeting := "Hello, " + input + "! This is an Extism plugin written in Go."

	// Set output
	err := host.SetOutputString(greeting)
	if err != nil {
		host.LogError("Failed to set output: " + err.Error())
		host.SetError("Failed to set output")
		return 1
	}

	// Return success
	return 0
}

// This function is required for Go plugins
func main() {}
