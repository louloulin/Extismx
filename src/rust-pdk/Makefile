.PHONY: all clean hello

all: hello

# Build the hello plugin
hello: hello_plugin.rs extism_pdk.rs Cargo.toml
	cargo build --release
	cp target/release/extism_hello_plugin.wasm hello.wasm

# Clean build artifacts
clean:
	cargo clean
	rm -f hello.wasm

# Show help information
help:
	@echo "Available targets:"
	@echo "  make         - Build the hello plugin"
	@echo "  make hello   - Build the hello plugin"
	@echo "  make clean   - Remove build artifacts"
	@echo "  make help    - Show this help message" 