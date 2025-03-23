# Makefile for Extism Go PDK and plugins

.PHONY: all hello clean

# Default target builds all plugins
all: hello

# TinyGo compiler for WebAssembly target
TINYGO ?= tinygo

# Build the hello plugin
hello: hello_plugin.go extism_pdk/extism_pdk.go
	$(TINYGO) build -o hello_plugin.wasm -target wasi hello_plugin.go

# Clean build artifacts
clean:
	rm -f *.wasm

# Display help
help:
	@echo "Extism Go Plugin Development Kit Makefile"
	@echo ""
	@echo "Targets:"
	@echo "  all     - Build all plugins (default)"
	@echo "  hello   - Build hello plugin"
	@echo "  clean   - Remove built artifacts"
	@echo "  help    - Display this help message"
	@echo ""
	@echo "Variables:"
	@echo "  TINYGO  - Path to TinyGo compiler (default: tinygo)" 