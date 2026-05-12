#!/usr/bin/env node

/**
 * Post-compilation script to fix ES module imports for Node.js ESM
 * Fixes:
 * 1. TypeScript path aliases ($lib/*, $server/*, $tools/*) → relative paths
 * 2. Duplicate quotes from TypeScript compilation artifacts
 * 3. Missing .js extensions on relative imports
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');

function getRelativePath(from, to) {
  // Convert path.relative output to use forward slashes (for ESM compatibility)
  let rel = path.relative(from, to);
  // Ensure it starts with . for relative imports
  if (!rel.startsWith('.')) {
    rel = './' + rel;
  }
  // Convert backslashes to forward slashes for ES modules
  return rel.replace(/\\/g, '/');
}

function resolveAlias(importPath, filePath) {
  // Resolve TypeScript path aliases to relative paths
  const fileDir = path.dirname(filePath);

  if (importPath.startsWith('$lib/')) {
    const targetPath = path.join(distDir, 'lib', importPath.slice(5));
    return getRelativePath(fileDir, targetPath);
  }
  if (importPath.startsWith('$server/')) {
    const targetPath = path.join(distDir, 'server', importPath.slice(8));
    return getRelativePath(fileDir, targetPath);
  }
  if (importPath.startsWith('$tools/')) {
    const targetPath = path.join(distDir, 'lib', 'tools', importPath.slice(7));
    return getRelativePath(fileDir, targetPath);
  }
  return importPath;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;

  // Step 1: Clean up duplicate quotes (TypeScript artifact)
  // Only replace in regular strings, not in template literals to avoid breaking code
  // Skip this step as it's causing more harm than good
  // content = content.replace(/""/g, '"');
  // content = content.replace(/''/g, "'");

  // Step 2: Resolve TypeScript path aliases to relative paths
  content = content.replace(
    /(from|import)\s+["'](\$(?:lib|server|tools)\/[^"']+)["'](;?)/g,
    (match, keyword, importPath, endStatement) => {
      const resolved = resolveAlias(importPath, filePath);
      return `${keyword} "${resolved}"${endStatement}`;
    }
  );

  // Step 3: Add .js extension to relative imports without extensions
  content = content.replace(
    /(from|import)\s+["'](\.[^"']+)["'](;?)/g,
    (match, keyword, importPath, endStatement) => {
      // Only add .js if no extension already present
      if (/\.[a-z0-9]+$/.test(importPath)) {
        return match;
      }
      return `${keyword} "${importPath}.js"${endStatement}`;
    }
  );

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Fixed: ${path.relative(distDir, filePath)}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.js') && !file.endsWith('.d.js')) {
      processFile(filePath);
    }
  }
}

if (fs.existsSync(distDir)) {
  console.log('🔧 Fixing ESM imports in dist/...');
  walkDir(distDir);
  console.log('✨ Done!');
} else {
  console.error('❌ dist/ directory not found');
  process.exit(1);
}
