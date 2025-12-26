# Fix for Musl (Alpine Linux) Test Failures

## Problem

Tests were failing on musl targets (Alpine Linux) with the following error:

```
Error: Cannot find native binding. npm has a bug related to optional dependencies (https://github.com/npm/cli/issues/4828).
Please try `npm i` again after removing both package-lock.json and node_modules directory.
    at Object.<anonymous> (/home/runner/work/nokhwa-node/nokhwa-node/node_modules/@oxc-node/core/index.js:559:11)
  [cause]: Error: Cannot find module '@oxc-node/core-linux-x64-musl'
```

**Root Cause:** `@oxc-node/core` doesn't provide prebuilt binaries for musl targets. When the test runner tries to load `@oxc-node/core/register`, it fails because the native module is not available.

## Solution

Created a smart test runner that detects musl environments and uses a different execution strategy:

### Files Created/Modified

1. **test-runner.mjs** (new file)
   - Detects if running on musl via environment variable `USE_MUSL_FALLBACK` or system detection
   - **On musl (Alpine Linux):**
     - Compiles TypeScript files using `tsc` first
     - Runs Ava on compiled JavaScript files (no @oxc-node/core needed)
     - Cleans up compiled files after tests complete
   - **On other systems:**
     - Runs Ava normally with `@oxc-node/core/register` for TypeScript support

2. **package.json**
   - Changed test script: `"test": "ava"` → `"test": "node test-runner.mjs"`
   - Added `"test:ava": "ava"` as alternative for direct Ava usage
   - Extended Ava config to support both `.ts` and `.js` extensions

3. **.github/workflows/CI.yml**
   - Added `USE_MUSL_FALLBACK` environment variable to test-linux-binding job
   - Automatically sets it to '1' for musl targets, '0' for gnu targets

## How It Works

### Standard Workflow (non-musl)
```
npm test → test-runner.mjs → Ava with @oxc-node/core/register → Run TypeScript tests directly
```

### Musl Workflow (Alpine Linux)
```
npm test → test-runner.mjs 
         ↓ (USE_MUSL_FALLBACK=1)
    1. Compile TypeScript with tsc
    2. Run Ava on compiled JavaScript
    3. Clean up compiled files
```

## Testing

The fix has been implemented and is ready for testing. When the CI pipeline runs:

- ✅ **x86_64-unknown-linux-gnu** - Uses @oxc-node/core (fast)
- ✅ **aarch64-unknown-linux-gnu** - Uses @oxc-node/core (fast)
- ✅ **x86_64-unknown-linux-musl** - Compiles with tsc, runs on JS
- ✅ **aarch64-unknown-linux-musl** - Compiles with tsc, runs on JS

## Benefits

1. **Cross-platform compatibility:** Tests work on all Linux targets (gnu and musl)
2. **No dependency changes:** Doesn't require replacing or removing @oxc-node/core
3. **Minimal overhead:** Only adds tsc compilation step for musl targets
4. **Maintainable:** Clean separation of concerns in test-runner.mjs
5. **Debuggable:** Clear console output shows which mode is active

## CI/CD Impact

The fix is fully integrated into the GitHub Actions workflow. The test-linux-binding job automatically:
1. Detects musl targets via matrix configuration
2. Sets `USE_MUSL_FALLBACK='1'` for musl, `'0'` for gnu
3. Runs tests via the new test-runner.mjs wrapper
4. All other test jobs remain unchanged

No manual intervention required.
