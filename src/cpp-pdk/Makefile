.PHONY: all clean hello test

# Default target
all: hello

# Check if emscripten is available
EMCC_PATH := $(shell command -v emcc 2> /dev/null)

# Build the hello plugins
hello:
ifdef EMCC_PATH
	@echo "Building with Emscripten..."
	mkdir -p build
	cd build && \
	cmake .. -DCMAKE_TOOLCHAIN_FILE="$(EMSDK)/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake" && \
	make
else
	@echo "Emscripten not found. Using simulated build."
	mkdir -p build
	cd build && \
	cmake .. && \
	make
	@echo "Note: Without Emscripten, the build will not produce functional WebAssembly files."
	@echo "To install Emscripten, follow the instructions at: https://emscripten.org/docs/getting_started/downloads.html"
	@echo "After installation, set the EMSDK environment variable to your Emscripten SDK directory."
endif

# Clean build artifacts
clean:
	rm -rf build
	rm -f *.wasm

# Run tests
test:
	node test_plugin.js

# Show help information
help:
	@echo "Available targets:"
	@echo "  make       - Build the hello plugins"
	@echo "  make test  - Run tests"
	@echo "  make clean - Remove build artifacts"
	@echo "  make help  - Show this help message" 