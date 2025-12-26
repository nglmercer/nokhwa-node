#!/usr/bin/env node

/**
 * Test runner that handles musl targets
 * 
 * On musl targets (Alpine Linux), @oxc-node/core doesn't provide prebuilt binaries.
 * We compile TypeScript with tsc, then run Ava on compiled files.
 */

import { spawn } from 'child_process'
import { rm } from 'fs/promises'

// Check if we're on a musl system
async function isMusl() {
  try {
    // Check environment variables that indicate Alpine/musl first (fastest)
    if (process.env.NODE_ENV === 'alpine' || process.env.MUSL === '1') {
      return true
    }
    
    // Try to read /usr/bin/env to check for musl
    const fs = await import('fs')
    if (fs.existsSync('/usr/bin/env')) {
      const content = fs.readFileSync('/usr/bin/env', 'binary')
      if (content.includes('musl') || content.includes('libc.musl')) {
        return true
      }
    }
  } catch (e) {
    // Ignore errors
  }
  
  return false
}

async function main() {
  const useMuslFallback = process.env.USE_MUSL_FALLBACK === '1' || await isMusl()
  
  console.log('Test runner configuration:')
  console.log('  Musl fallback:', useMuslFallback ? 'enabled' : 'disabled')
  
  const args = process.argv.slice(2)
  
  if (useMuslFallback) {
    // For musl targets: compile TypeScript first, then run Ava on compiled files
    console.log('  Compiling TypeScript with tsc...')
    
    // Compile TypeScript
    const tsc = spawn('npx', ['tsc', '-p', '__test__/tsconfig.json'], {
      stdio: 'inherit'
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
    
    // Run Ava on compiled JavaScript files
    console.log('  Running tests with ava...')
    const testArgs = args.length > 0 ? args : ['__test__/lib/**/*.js']
    const ava = spawn('npx', ['ava', ...testArgs], {
      stdio: 'inherit'
    })
    
    return new Promise((resolve, reject) => {
      ava.on('exit', (code) => {
        // Clean up compiled files
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
  } else {
    // Use standard ava with @oxc-node/core for non-musl targets
    console.log('  Running with ava...')
    const ava = spawn('npx', ['ava', ...args], {
      stdio: 'inherit',
      env: {
        ...process.env,
        OXC_TSCONFIG_PATH: './__test__/tsconfig.json'
      }
    })
    
    return new Promise((resolve, reject) => {
      ava.on('exit', (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`ava exited with code ${code}`))
        }
      })
      
      ava.on('error', (err) => {
        reject(err)
      })
    })
  }
}

main().catch(err => {
  console.error('Test runner error:', err)
  process.exit(1)
})
