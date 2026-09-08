/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    'pdf-parse',
    '@napi-rs/canvas',
    '@napi-rs/canvas-win32-x64-msvc',
    'pdfjs-dist',
  ],
};

export default nextConfig;
