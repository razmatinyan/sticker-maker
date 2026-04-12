// app/utils/auth.ts
export function getUserId(user: any): string | null {
	return user?.id ?? user?.sub ?? null
}
