<script setup lang="ts">
definePageMeta({
  layout:     'default',
  middleware: 'auth',
})

useHead({ title: 'Sticker Packs — Stickr' })

const supabase  = useSupabaseClient()
const user      = useSupabaseUser()
const packs     = ref<any[]>([])
const isLoading = ref(true)
const showNew   = ref(false)

async function fetchPacks() {
  const userId = getUserId(user.value)
  if (!userId) return

  isLoading.value = true

  const { data, error } = await supabase
    .from('sticker_packs')
    .select('*, stickers(id, thumbnail_path)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (!error) packs.value = data ?? []
  isLoading.value = false
}

async function deletePack(id: string) {
  await supabase.from('sticker_packs').delete().eq('id', id)
  packs.value = packs.value.filter(p => p.id !== id)
}

watch(user, (u) => { if (u) fetchPacks() }, { immediate: true })
</script>

<template>
  <div class="space-y-6 max-w-5xl">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-medium tracking-heading">Sticker Packs</h1>
        <p class="text-muted-foreground text-sm mt-1">
          {{ packs.length }} pack{{ packs.length !== 1 ? 's' : '' }}
        </p>
      </div>
      <Button size="sm" @click="showNew = true">
        <Icon name="ri:add-line" class="w-3.5 h-3.5 mr-1.5" />
        New Pack
      </Button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <Skeleton v-for="i in 6" :key="i" class="h-40 rounded-xl" />
    </div>

    <!-- Empty -->
    <div
      v-else-if="packs.length === 0"
      class="glass-card p-16 flex flex-col items-center gap-4 text-center"
    >
      <div class="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
        <Icon name="ri:folder-line" class="w-7 h-7 text-muted-foreground" />
      </div>
      <div>
        <p class="font-medium">No packs yet</p>
        <p class="text-sm text-muted-foreground mt-1">
          Group your stickers into packs
        </p>
      </div>
      <Button @click="showNew = true">
        <Icon name="ri:add-line" class="w-4 h-4 mr-2" />
        Create Pack
      </Button>
    </div>

    <!-- Packs grid -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
    >
      <NuxtLink
        v-for="pack in packs"
        :key="pack.id"
        :to="`/packs/${pack.id}`"
        class="glass-card p-4 space-y-3 hover:bg-white/5
               transition-all duration-150 cursor-pointer group"
      >
        <!-- Sticker preview grid -->
        <div class="grid grid-cols-4 gap-1 h-20">
          <template v-if="pack.stickers?.length">
            <div
              v-for="(s, i) in pack.stickers.slice(0, 4)"
              :key="s.id"
              class="rounded-lg overflow-hidden bg-muted"
            >
              <img
                v-if="s.thumbnail_path"
                :src="s.thumbnail_path"
                alt=""
                class="w-full h-full object-contain p-0.5"
              />
            </div>
            <!-- Fill empty slots -->
            <div
              v-for="i in Math.max(0, 4 - pack.stickers.slice(0, 4).length)"
              :key="`empty-${i}`"
              class="rounded-lg bg-muted/50"
            />
          </template>
          <template v-else>
            <div
              v-for="i in 4"
              :key="i"
              class="rounded-lg bg-muted/50"
            />
          </template>
        </div>

        <!-- Pack info -->
        <div class="flex items-start justify-between">
          <div class="min-w-0">
            <p class="font-medium text-sm truncate">{{ pack.name }}</p>
            <p class="text-xs text-muted-foreground mt-0.5">
              {{ pack.stickers?.length ?? 0 }} sticker{{ pack.stickers?.length !== 1 ? 's' : '' }}
            </p>
          </div>

          <!-- Telegram badge -->
          <Badge
            v-if="pack.is_telegram_pack"
            variant="secondary"
            class="text-[10px] shrink-0 ml-2"
          >
            <Icon name="ri:telegram-line" class="w-3 h-3 mr-1" />
            TG
          </Badge>
        </div>

        <!-- Actions on hover -->
        <div
          class="flex gap-2 opacity-0 group-hover:opacity-100
                 transition-opacity duration-150"
        >
          <Button
            variant="destructive"
            size="sm"
            class="flex-1 h-7 text-xs"
            @click.prevent="deletePack(pack.id)"
          >
            <Icon name="ri:delete-bin-line" class="w-3 h-3 mr-1" />
            Delete
          </Button>
        </div>
      </NuxtLink>
    </div>

    <!-- New Pack Modal -->
    <PacksNewModal
      :open="showNew"
      @update:open="showNew = $event"
      @created="fetchPacks"
    />

  </div>
</template>