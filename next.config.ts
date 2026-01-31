/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'file.recapboxx.com', // 🔥 ဒါလေး ထပ်ထည့်ပေးလိုက်ပါ
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
    ],
  },
};

export default nextConfig;