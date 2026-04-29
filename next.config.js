const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/**
 * A fork of 'next-pwa' that has app directory support
 * @see https://github.com/shadowwalker/next-pwa/issues/424#issuecomment-1332258575
 */
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})

// Add MDX support
const withMDX = require('@next/mdx')({
  extension: /\.(md|mdx)$/,
})

const nextConfig = {
  // Add pageExtensions to include md and mdx files
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  // uncomment the following snippet if using styled components
  // compiler: {
  //   styledComponents: true,
  // },
  reactStrictMode: true, // Recommended for the `pages` directory, default in `app`.
  images: {},
  output: 'standalone', // Optimizes the build for containerized environments like Railway
  eslint: {
    // Don't run ESLint during build, Railway is treating warnings as errors
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_GP_PRODUCT_ID: process.env.NEXT_PUBLIC_GP_PRODUCT_ID,
    NEXT_PUBLIC_GP_PRICE_MONTHLY: process.env.NEXT_PUBLIC_GP_PRICE_MONTHLY,
    NEXT_PUBLIC_GP_PRICE_ANNUAL: process.env.NEXT_PUBLIC_GP_PRICE_ANNUAL,
    NEXT_PUBLIC_GP_PRICE_SETUP: process.env.NEXT_PUBLIC_GP_PRICE_SETUP,
  },
  // Disable static generation and prerendering for certain paths
  experimental: {
    // Allow more time for the build process
    workerThreads: true,
    cpus: 4
  },
  webpack(config, { isServer }) {
    // Configure cache to handle missing directories gracefully
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
      // Ensure cache directories are created properly
      compression: 'gzip',
    }

    if (!isServer) {
      // We're in the browser build, so we can safely exclude the sharp module
      config.externals.push('sharp')
    }
    // audio support
    config.module.rules.push({
      test: /\.(ogg|mp3|wav|mpe?g)$/i,
      exclude: config.exclude,
      use: [
        {
          loader: require.resolve('url-loader'),
          options: {
            limit: config.inlineImageLimit,
            fallback: require.resolve('file-loader'),
            publicPath: `${config.assetPrefix}/_next/static/images/`,
            outputPath: `${isServer ? '../' : ''}static/images/`,
            name: '[name]-[hash].[ext]',
            esModule: config.esModule || false,
          },
        },
      ],
    })

    // shader support
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: ['raw-loader', 'glslify-loader'],
    })

    return config
  },
}

const KEYS_TO_OMIT = ['webpackDevMiddleware', 'configOrigin', 'target', 'analyticsId', 'webpack5', 'amp', 'assetPrefix']

module.exports = (_phase, { defaultConfig }) => {
  // Add withMDX to the plugins array
  const plugins = [[withPWA], [withBundleAnalyzer, {}], [withMDX]]

  const wConfig = plugins.reduce((acc, [plugin, config]) => plugin({ ...acc, ...config }), {
    ...defaultConfig,
    ...nextConfig,
  })

  const finalConfig = {}
  Object.keys(wConfig).forEach((key) => {
    if (!KEYS_TO_OMIT.includes(key)) {
      finalConfig[key] = wConfig[key]
    }
  })

  return finalConfig
}
