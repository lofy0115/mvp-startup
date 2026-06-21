import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mvp.tool',
  appName: 'MVP创业工具',
  webDir: '.next',
  server: {
    // 部署后修改这个URL为你的Vercel/Netlify地址
    url: 'http://localhost:3000',
  },
};

export default config;
