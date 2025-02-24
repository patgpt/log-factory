import { afterAll, afterEach, beforeAll } from "bun:test";
import * as fs from "fs";
import * as path from "path";

const TEST_LOG_DIR = "./src/__tests__/logs";

// Recursive function to remove directory contents
const removeDirectoryContents = (dirPath: string) => {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const currentPath = path.join(dirPath, file);
      fs.rmSync(currentPath, { recursive: true, force: true });
    });
  }
};

// Create test log directory before all tests
beforeAll(() => {
  if (!fs.existsSync(TEST_LOG_DIR)) {
    fs.mkdirSync(TEST_LOG_DIR, { recursive: true });
  }
});

// Clean up log files after each test
afterEach(() => {
  removeDirectoryContents(TEST_LOG_DIR);
});

// Remove test log directory after all tests
afterAll(() => {
  if (fs.existsSync(TEST_LOG_DIR)) {
    removeDirectoryContents(TEST_LOG_DIR);
    fs.rmdirSync(TEST_LOG_DIR);
  }
}); 