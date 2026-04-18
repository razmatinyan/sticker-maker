<script setup lang="ts">
definePageMeta({
  layout:     'default',
  middleware: 'auth',
})

useHead({ title: 'My Stickers — Stickr' })

const supabase   = useSupabaseClient()
const user       = useSupabaseUser()
const stickers   = ref<any[]>([])
const isLoading  = ref(true)
const isDeleting = ref<string | null>(null)
const selected   = ref<Set<string>>(new Set())

async function fetchStickers() {
  const userId = getUserId(user.value)
  if (!userId) return

  isLoading.value = true

  const { data, error } = await supabase
    .from('stickers')
    .select('*, sticker_packs(id, name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (!error) stickers.value = data ?? []
  isLoading.value = false
}

async function deleteSticker(id: string) {
  const sticker = stickers.value.find(s => s.id === id)
  if (!sticker) return

  isDeleting.value = id

  // Delete from storage
  const userId = getUserId(user.value)
  if (userId) {
    const stickerPath = sticker.processed_path?.split('/stickers/')[1]
    const thumbPath   = sticker.thumbnail_path?.split('/thumbnails/')[1]

    if (stickerPath) {
      await supabase.storage.from('stickers').remove([stickerPath])
    }
    if (thumbPath) {
      await supabase.storage.from('thumbnails').remove([thumbPath])
    }
  }

  // Delete from DB
  await supabase.from('stickers').delete().eq('id', id)

  stickers.value   = stickers.value.filter(s => s.id !== id)
  selected.value.delete(id)
  isDeleting.value = null
}

async function deleteSelected() {
  for (const id of selected.value) {
    await deleteSticker(id)
  }
  selected.value = new Set()
}

function toggleSelect(id: string) {
  const next = new Set(selected.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selected.value = next
}

watch(user, (u) => { if (u) fetchStickers() }, { immediate: true })
</script>

<template>
  <div class="space-y-6 max-w-5xl">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-medium tracking-heading">My Stickers</h1>
        <p class="text-muted-foreground text-sm mt-1">
          {{ stickers.length }} sticker{{ stickers.length !== 1 ? 's' : '' }}
        </p>
      </div>

      <div class="flex items-center gap-2">
        <!-- Bulk delete -->
        <Button
          v-if="selected.size > 0"
          variant="destructive"
          size="sm"
          @click="deleteSelected"
        >
          <Icon name="ri:delete-bin-line" class="w-3.5 h-3.5 mr-1.5" />
          Delete {{ selected.size }} selected
        </Button>

        <NuxtLink to="/editor">
          <Button size="sm">
            <Icon name="ri:add-line" class="w-3.5 h-3.5 mr-1.5" />
            New Sticker
          </Button>
        </NuxtLink>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
      <Skeleton
        v-for="i in 16"
        :key="i"
        class="aspect-square rounded-xl"
      />
    </div>

    <!-- Empty -->
    <div
      v-else-if="stickers.length === 0"
      class="glass-card p-16 flex flex-col items-center gap-4 text-center"
    >
      <div class="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
        <Icon name="ri:emoji-sticker-line" class="w-7 h-7 text-muted-foreground" />
      </div>
      <div>
        <p class="font-medium">No stickers yet</p>
        <p class="text-sm text-muted-foreground mt-1">
          Create your first sticker in the editor
        </p>
      </div>
      <NuxtLink to="/editor">
        <Button>
          <Icon name="ri:magic-line" class="w-4 h-4 mr-2" />
          Open Editor
        </Button>
      </NuxtLink>
    </div>

    <!-- Grid -->
    <div
      v-else
      class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3"
    >
      <div
        v-for="sticker in stickers"
        :key="sticker.id"
        class="group relative aspect-square rounded-xl overflow-hidden
               glass-card cursor-pointer transition-all duration-150"
        :class="{
          'ring-2 ring-framer-blue': selected.has(sticker.id),
          'opacity-50':              isDeleting === sticker.id,
        }"
        @click="toggleSelect(sticker.id)"
      >
        <!-- Image -->
        <img
          v-if="sticker.thumbnail_path"
          :src="sticker.thumbnail_path"
          alt="Sticker"
          class="w-full h-full object-contain p-1
                 group-hover:scale-105 transition-transform duration-150"
        />
        <div
          v-else
          class="w-full h-full flex items-center justify-center bg-muted"
        >
          <Icon name="ri:image-line" class="w-6 h-6 text-muted-foreground" />
        </div>

        <!-- Hover overlay -->
        <div
          class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100
                 transition-opacity duration-150 flex items-center justify-center gap-2"
        >
          <!-- Delete -->
          <button
            class="w-7 h-7 rounded-lg bg-destructive/90 flex items-center
                   justify-center text-white hover:bg-destructive transition-colors"
            @click.stop="deleteSticker(sticker.id)"
          >
            <Icon name="ri:delete-bin-line" class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Selected indicator -->
        <div
          v-if="selected.has(sticker.id)"
          class="absolute top-1.5 right-1.5 w-4 h-4 rounded-full
                 bg-framer-blue flex items-center justify-center"
        >
          <Icon name="ri:check-line" class="w-2.5 h-2.5 text-white" />
        </div>
      </div>
    </div>

  </div>
</template>