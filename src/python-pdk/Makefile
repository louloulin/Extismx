# Makefile for Extism Python PDK and plugins

.PHONY: all hello clean

# Default target builds all plugins
all: hello

# Python WASM compiler - we're using Javy as an example here
# In a real implementation, you might use other tools like Emscripten, etc.
JAVY ?= javy

# Build the hello plugin
hello: hello_plugin.py extism_pdk.py
	$(JAVY) --input hello_plugin.py --output hello_plugin.wasm

# Clean build artifacts
clean:
	rm -f *.wasm

# Display help
help:
	@echo "Extism Python Plugin Development Kit Makefile"
	@echo ""
	@echo "Targets:"
	@echo "  all     - Build all plugins (default)"
	@echo "  hello   - Build hello plugin"
	@echo "  clean   - Remove built artifacts"
	@echo "  help    - Display this help message"
	@echo ""
	@echo "Variables:"
	@echo "  JAVY    - Path to Javy compiler (default: javy)"
	@echo ""
	@echo "Note: This is a simplified Makefile. In practice, compiling Python"
	@echo "      to WebAssembly requires more complex tooling like Emscripten,"
	@echo "      Pyodide, or other solutions." 