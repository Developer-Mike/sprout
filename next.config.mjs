import nextTranslate from 'next-translate-plugin'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { }) => {
    config.module.rules.push({
      test: /\.sprout$/,
      use: ['raw-loader'],
    })

    return config
  },
}

export default nextTranslate(nextConfig)
