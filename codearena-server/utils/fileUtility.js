const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/**
 * FileUtility
 * Responsibility: Securely managing temporary code workspaces.
 *
 * Features:
 * 1. Unique Workspace: Each execution gets its own UUID folder.
 * 2. Automated Cleanup: Logic to ensure files are deleted after run.
 * 3. Ghost Cleanup: Sweeps 'sandbox/temp' on startup or via interval to catch files
 *    left behind by sudden server crashes.
 */

// In Docker: SANDBOX_TEMP_PATH must be a HOST directory that both the server
// container and spawned sandbox containers can access (shared bind mount).
// Locally: defaults to ./sandbox/temp relative to this file.
const TEMP_BASE_PATH =
  process.env.SANDBOX_TEMP_PATH || path.join(__dirname, "../sandbox/temp");

// Ensure base temp directory exists
if (!fs.existsSync(TEMP_BASE_PATH)) {
  fs.mkdirSync(TEMP_BASE_PATH, { recursive: true });
}

/**
 * Creates a unique workspace directory for a job.
 */
const createWorkspace = () => {
  const jobId = crypto.randomUUID();
  const workspacePath = path.join(TEMP_BASE_PATH, jobId);

  if (!fs.existsSync(workspacePath)) {
    fs.mkdirSync(workspacePath, { recursive: true });
  }

  return { jobId, workspacePath };
};

/**
 * Writes code and optional input files to the workspace.
 */
const writeFiles = (workspacePath, fileName, code, input = "") => {
  const codePath = path.join(workspacePath, fileName);
  const inputPath = path.join(workspacePath, "input.txt");

  fs.writeFileSync(codePath, code);
  fs.writeFileSync(inputPath, input);

  return { codePath, inputPath };
};

/**
 * Safely removes a workspace directory and all its contents.
 * Designed to be called in a 'finally' block.
 */
const cleanupWorkspace = (workspacePath) => {
  try {
    // Validation: Ensure we are only deleting subfolders of our designated temp path
    if (!workspacePath || !workspacePath.startsWith(TEMP_BASE_PATH)) {
      console.warn(
        `[FileUtility] Blocked dangerous cleanup request for: ${workspacePath}`,
      );
      return;
    }

    if (fs.existsSync(workspacePath)) {
      fs.rmSync(workspacePath, { recursive: true, force: true });
      // console.log(`[FileUtility] Cleaned up workspace: ${path.basename(workspacePath)}`);
    }
  } catch (error) {
    console.error(`[FileUtility] Sync Cleanup Failed: ${workspacePath}`, error);
  }
};

/**
 * Global Cleanup Sweep
 * Deletes all subfolders in sandbox/temp.
 * Run this on server startup or periodically.
 */
const clearAllTemp = () => {
  console.log(`[FileUtility] Starting global temp cleanup...`);
  try {
    const files = fs.readdirSync(TEMP_BASE_PATH);
    for (const file of files) {
      if (file === ".gitkeep") continue;
      const fullPath = path.join(TEMP_BASE_PATH, file);
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
    console.log(`[FileUtility] Global cleanup complete.`);
  } catch (error) {
    console.error(`[FileUtility] Global cleanup failed:`, error);
  }
};

module.exports = {
  createWorkspace,
  writeFiles,
  cleanupWorkspace,
  clearAllTemp,
};
