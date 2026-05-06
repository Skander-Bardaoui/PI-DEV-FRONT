#!/usr/bin/env node

/**
 * Script pour corriger automatiquement les problèmes courants dans les tests
 * Usage: node fix-common-test-issues.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns de correction
const fixes = [
  {
    name: 'Add missing vi import',
    pattern: /^(import { describe, it, expect)(, beforeEach)? } from 'vitest';)/gm,
    replacement: (match, p1, p2) => `${p1}, vi${p2 || ''} } from 'vitest';`,
    condition: (content) => !content.includes('import { describe, it, expect, vi') && content.includes('vi.mock')
  },
  {
    name: 'Add missing fireEvent import',
    pattern: /^(import { render, screen)(, waitFor)? } from '@testing-library\/react';)/gm,
    replacement: (match, p1, p2) => `${p1}, fireEvent${p2 || ''} } from '@testing-library/react';`,
    condition: (content) => !content.includes('fireEvent') && content.includes('fireEvent.')
  },
  {
    name: 'Fix number formatting with function matcher',
    pattern: /expect\(screen\.getByText\('(\d{1,3}[,\s]\d{3}[,\.]\d{3}\s*TND)'\)\)\.toBeInTheDocument\(\);/g,
    replacement: (match, number) => {
      const cleanNumber = number.replace(/[,\s]/g, ' ');
      return `expect(screen.getByText((content, element) => {
      return element?.textContent === '${cleanNumber}';
    })).toBeInTheDocument();`;
    }
  },
  {
    name: 'Add await before waitFor',
    pattern: /(\s+)waitFor\(/g,
    replacement: '$1await waitFor(',
    condition: (content) => content.includes('waitFor(') && !content.includes('await waitFor(')
  }
];

// Fonction pour appliquer les corrections
function applyFixes(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let appliedFixes = [];

  fixes.forEach(fix => {
    // Vérifier la condition si elle existe
    if (fix.condition && !fix.condition(content)) {
      return;
    }

    const newContent = content.replace(fix.pattern, fix.replacement);
    if (newContent !== content) {
      content = newContent;
      modified = true;
      appliedFixes.push(fix.name);
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${filePath}:`);
    appliedFixes.forEach(fix => console.log(`   - ${fix}`));
  }

  return modified;
}

// Trouver tous les fichiers de test
const testFiles = glob.sync('src/**/*.test.{ts,tsx}', {
  cwd: path.join(__dirname),
  absolute: true
});

console.log(`Found ${testFiles.length} test files\n`);

let fixedCount = 0;
testFiles.forEach(file => {
  if (applyFixes(file)) {
    fixedCount++;
  }
});

console.log(`\n✨ Fixed ${fixedCount} files out of ${testFiles.length}`);
