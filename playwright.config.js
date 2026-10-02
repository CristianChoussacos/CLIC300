import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir:'./tests/browser',
  timeout:35000,
  expect:{timeout:12000},
  fullyParallel:false,
  workers:2,
  reporter:'list',
  use:{baseURL:'http://127.0.0.1:4173',browserName:'chromium',channel:process.platform === 'win32' ? 'msedge' : undefined,headless:true,trace:'retain-on-failure',viewport:{width:1365,height:900}},
  webServer:{command:'node scripts/serve.mjs',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI,timeout:15000}
});
