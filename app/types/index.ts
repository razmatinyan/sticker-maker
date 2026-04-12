import type { Database } from './database.types'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type StickerPack = Database['public']['Tables']['sticker_packs']['Row']
export type Sticker = Database['public']['Tables']['stickers']['Row']
export type Template = Database['public']['Tables']['templates']['Row']

export type StickerInsert = Database['public']['Tables']['stickers']['Insert']
export type StickerPackInsert =
	Database['public']['Tables']['sticker_packs']['Insert']
