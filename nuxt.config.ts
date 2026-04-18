// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',

	devtools: { enabled: true },

	modules: [
		'@nuxtjs/tailwindcss',
		'@nuxtjs/supabase',
		'@pinia/nuxt',
		'shadcn-nuxt',
		'@pinia/nuxt',
		'@vueuse/nuxt',
		'@nuxt/fonts',
		'@nuxt/icon',
	],

	supabase: {
		url: process.env.NUXT_PUBLIC_SUPABASE_URL,
		key: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
		serviceKey: process.env.NUXT_SUPABASE_SECRET_KEY,
		redirect: false, // We handle auth redirects manually
		cookiePrefix: 'stickr-auth',
		cookieOptions: {
			maxAge: 60 * 60 * 24 * 7, // 1 week
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
		},
	},

	shadcn: {
		prefix: '',
		componentDir: './app/components/ui',
	},
	fonts: {
		families: [
			{ name: 'Geist', provider: 'bunny' },
			{ name: 'Geist Mono', provider: 'bunny' },
		],
		priority: ['bunny'],
		processCSSVariables: true,
		experimental: {
			disableLocalFallbacks: true,
		},
	},

	css: ['~/assets/css/main.css'],

	// Security — never expose these to client
	runtimeConfig: {
		supabaseServiceKey: '', // Server-only
		stabilityApiKey: '', // Server-only (AI generation)
		removeBgApiKey: '', // Server-only (background removal)
		telegramBotToken: '', // Server-only
		public: {
			supabaseUrl: '', // Safe to expose
			supabaseAnonKey: '', // Safe to expose
		},
	},
	vite: {
		optimizeDeps: {
			include: ['@vue/devtools-core', '@vue/devtools-kit'],
		},
	},

	// SSR best practice — canvas editor must be client-only
	ssr: true,

	app: {
		pageTransition: { name: 'page', mode: 'out-in' },
		head: {
			titleTemplate: '%s — Stickr',
			meta: [
				{ name: 'description', content: 'Create, export and share stickers. Upload images, draw, or generate with AI.' },
				{ name: 'theme-color', content: '#000000' },
			],
			link: [
				{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
			],
		},
	},
})
