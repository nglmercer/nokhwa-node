#!/usr/bin/env node

/**
 * Test runner that compiles TypeScript then runs tests
 * 
 * This works on all platforms including musl (Alpine Linux) without requiring
 * @oxc-node/core or any other TypeScript loaders.
 */

import { spawn } from 'child_process'
import { rm } from 'fs/promises'
import { dirname, resolve, join } from 'path'

async function main() {
  const originalDir = process.cwd()
  
  console.log('Test runner configuration:')
  console.log('  Compiling TypeScript with tsc...')
  
  // Compile TypeScript files
  const tsc = spawn('npx', ['tsc', '-p', '__test__/tsconfig.json'], {
    stdio: 'inherit',
    shell: true
  })
  
  await new Promise((resolve, reject) => {
    tsc.on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`tsc exited with code ${code}`))
      }
    })
    
    tsc.on('error', (err) => {
      reject(err)
    })
  })
  
  // Run Ava on compiled JavaScript files from root directory
  console.log('  Running tests with ava...')
  const args = process.argv.slice(2)
  
  // Run from root to avoid import resolution issues
  // Add NODE_PATH to help with module resolution
  const testArgs = args.length > 0 ? args : ['__test__/lib/**/*.js']
  const ava = spawn('npx', ['ava', ...testArgs], {
    stdio: 'inherit',
    shell: true,
    cwd: originalDir,
    env: {
      ...process.env,
      NODE_PATH: originalDir
    }
  })
  
  return new Promise((resolve, reject) => {
    ava.on('exit', (code) => {
      // Clean up compiled files
      console.log('  Cleaning up compiled files...')
      rm('__test__/lib', { recursive: true, force: true }).catch(() => {})
      
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`ava exited with code ${code}`))
      }
    })
    
    ava.on('error', (err) => {
      rm('__test__/lib', { recursive: true, force: true }).catch(() => {})
      reject(err)
    })
  })
}

main().catch(err => {
  console.error('Test runner error:', err)
  process.exit(1)
})
