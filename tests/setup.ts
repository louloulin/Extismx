/**
 * Global test setup file
 * This file runs before all tests
 */

// Increase timeout for all tests
jest.setTimeout(10000);

// Add custom matchers if needed
expect.extend({
  // Example custom matcher
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Global test utilities
global.waitFor = async (condition: () => boolean | Promise<boolean>, timeout = 5000): Promise<void> => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Condition not met within ${timeout}ms`);
};

// Clean up function to run after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
}); 