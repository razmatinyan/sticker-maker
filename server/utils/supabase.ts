import { createClient } from '@supabase/supabase-js'
import type { Database } from '~~/app/types/database.types'

export function useSupabaseAdmin() {
	const config = useRuntimeConfig()

	return createClient<Database>(
		config.public.supabaseUrl,
		config.supabaseServiceKey, // Server-only key — never sent to browser
		{
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		},
	)
}
