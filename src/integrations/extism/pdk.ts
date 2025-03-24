/**
 * Mock Extism Plugin Development Kit (PDK) for TypeScript
 * This is a simplified version of the Extism PDK for demonstration purposes
 */

// Mock state for the plugin execution
const mockState: {
  input: string;
  output: string;
} = {
  input: "",
  output: ""
};

/**
 * Host namespace provides functions to interact with the host environment
 */
export namespace Host {
  /**
   * Read input from the host as a string
   * @returns The input string provided by the host
   */
  export function inputString(): string {
    // In a real PDK, this would read from Wasm memory
    return mockState.input || "";
  }

  /**
   * Write output to the host as a string
   * @param output The string to output to the host
   */
  export function outputString(output: string): void {
    // In a real PDK, this would write to Wasm memory for the host to read
    mockState.output = output;
  }

  /**
   * Log a message to the host's console
   * @param message The message to log
   */
  export function logString(message: string): void {
    // In a real PDK, this would use the host's logging mechanism
    console.log(`[Plugin Log] ${message}`);
  }

  /**
   * Call a host function
   * @param name The name of the host function to call
   * @param data The data to pass to the host function
   * @returns The result from calling the host function
   */
  export function callHostFunction(name: string, data: Uint8Array): Uint8Array {
    // In a real PDK, this would invoke a host function
    console.log(`Called host function: ${name}`);
    return new Uint8Array();
  }

  /**
   * Set mock input for testing
   * @param input The input string to set
   */
  export function setMockInput(input: string): void {
    mockState.input = input;
  }

  /**
   * Get mock output for testing
   * @returns The current output string
   */
  export function getMockOutput(): string {
    return mockState.output;
  }
  
  /**
   * Reset the mock state
   */
  export function resetMockState(): void {
    mockState.input = "";
    mockState.output = "";
  }
} 