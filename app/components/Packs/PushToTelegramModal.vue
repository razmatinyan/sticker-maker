<script setup lang="ts">
const props = defineProps<{
  open:    boolean
  pack:    any
  stickers: any[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  pushed:        [packUrl: string]
}>()

const supabase  = useSupabaseClient()
const user      = useSupabaseUser()
const isPushing = ref(false)
const isDone    = ref(false)
const error     = ref('')
const packUrl   = ref('')
const progress  = ref(0)
const status    = ref('')

async function handlePush() {
  const userId = getUserId(user.value)
  if (!userId) return

  // Get profile for bot token
  const { data: profile } = await supabase
    .from('profiles')
    .select('telegram_bot_token, telegram_id')
    .eq('id', userId)
    .single()

  if (!profile?.telegram_bot_token || !profile?.telegram_id) {
    error.value = 'Please connect your Telegram account first.'
    return
  }

  isPushing.value = true
  error.value     = ''
  progress.value  = 0
  status.value    = 'Preparing stickers...'

  try {
    // Slugify pack name for Telegram
    const packName = props.pack.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 32)

    status.value   = 'Creating sticker pack on Telegram...'
    progress.value = 20

    const res = await $fetch<any>('/api/telegram/create-pack', {
      method: 'POST',
      body: {
        botToken:       profile.telegram_bot_token,
        telegramUserId: profile.telegram_id,
        packName,
        packTitle:      props.pack.name,
        stickers:       props.stickers.map(s => ({ url: s.processed_path })),
      },
    })

    progress.value = 90
    status.value   = 'Finalizing...'

    // Save pack name to DB
    await supabase
      .from('sticker_packs')
      .update({ telegram_pack_name: res.packName })
      .eq('id', props.pack.id)

    packUrl.value  = `https://t.me/addstickers/${res.packName}`
    progress.value = 100
    isDone.value   = true

    emit('pushed', packUrl.value)

  } catch (e: any) {
    error.value = e.data?.message ?? e.message ?? 'Push failed'
  } finally {
    isPushing.value = false
  }
}

function close() {
  emit('update:open', false)
  isDone.value   = false
  error.value    = ''
  progress.value = 0
}
</script>

<template>
  <Dialog :open="open" @update:open="close">
    <DialogContent class="sm:max-w-md">

      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Icon name="ri:telegram-fill" class="w-4 h-4 text-sky-400" />
          Push to Telegram
        </DialogTitle>
        <DialogDescription>
          Send "{{ pack?.name }}" directly to your Telegram sticker library.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">

        <!-- Success -->
        <div v-if="isDone" class="text-center space-y-4 py-2">
          <div class="w-12 h-12 rounded-full bg-sky-400/10 flex items-center justify-center mx-auto">
            <Icon name="ri:check-line" class="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <p class="font-medium">Pack pushed successfully!</p>
            <p class="text-sm text-muted-foreground mt-1">
              Add it to Telegram using the link below.
            </p>
          </div>
          <a
            :href="packUrl"
            target="_blank"
            rel="noopener"
            class="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg
                   bg-sky-400/10 text-sky-400 text-sm font-medium
                   hover:bg-sky-400/20 transition-colors"
          >
            <Icon name="ri:external-link-line" class="w-4 h-4" />
            Add sticker pack in Telegram
          </a>
          <Button variant="outline" class="w-full" @click="close">Done</Button>
        </div>

        <!-- Pushing progress -->
        <div v-else-if="isPushing" class="space-y-3 py-2">
          <div class="flex items-center gap-3">
            <Icon name="ri:loader-4-line" class="w-5 h-5 text-sky-400 animate-spin shrink-0" />
            <p class="text-sm">{{ status }}</p>
          </div>
          <div class="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              class="h-full bg-sky-400 rounded-full transition-all duration-500"
              :style="{ width: `${progress}%` }"
            />
          </div>
        </div>

        <!-- Confirm -->
        <template v-else>
          <div
            v-if="error"
            class="text-xs text-destructive bg-destructive/10
                   border border-destructive/20 rounded-lg px-3 py-2"
          >
            {{ error }}
            <NuxtLink
              v-if="error.includes('connect')"
              to="/telegram"
              class="text-framer-blue hover:underline ml-1"
            >
              Connect now →
            </NuxtLink>
          </div>

          <!-- Sticker count warning -->
          <div class="glass-card p-3 space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Stickers in pack</span>
              <span class="font-medium">{{ stickers.length }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Pack name</span>
              <span class="font-medium">{{ pack?.name }}</span>
            </div>
          </div>

          <p class="text-xs text-muted-foreground">
            This will create a new sticker set on Telegram using your connected bot.
            You can add it to Telegram immediately after.
          </p>

          <div class="flex gap-2">
            <Button variant="outline" class="flex-1" @click="close">
              Cancel
            </Button>
            <Button
              class="flex-1 bg-sky-500 hover:bg-sky-600 text-white"
              :disabled="stickers.length === 0"
              @click="handlePush"
            >
              <Icon name="ri:telegram-line" class="w-4 h-4 mr-2" />
              Push Pack
            </Button>
          </div>
        </template>

      </div>
    </DialogContent>
  </Dialog>
</template>