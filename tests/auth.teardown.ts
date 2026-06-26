import { test as teardown } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Authentication Teardown
 *
 * This file runs after all tests complete to clean up authentication state.
 * It ensures no sensitive auth data persists between test runs.
 */

const ENV = (process.env.ENV || 'staging').toLowerCase();
const authFile = `playwright/.auth/${ENV}.json`;

teardown('cleanup auth state', async () => {
  // Clean up the auth file if it exists
  if (fs.existsSync(authFile)) {
    try {
      fs.unlinkSync(authFile);
      console.log('🧹 Auth state cleaned up');
    } catch (error) {
      console.warn('⚠️  Could not clean up auth state:', error);
    }
  }

  // Clean up the auth directory if empty
  const authDir = path.dirname(authFile);
  if (fs.existsSync(authDir)) {
    const files = fs.readdirSync(authDir);
    if (files.length === 0) {
      try {
        fs.rmdirSync(authDir);
      } catch (error) {
        // Ignore errors when removing directory
      }
    }
  }
});
