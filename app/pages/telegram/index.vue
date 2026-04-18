<script setup lang="ts">
definePageMeta({
  layout:     'default',
  middleware: 'auth',
})

useHead({ title: 'Telegram — Stickr' })

const supabase  = useSupabaseClient()
const user      = useSupabaseUser()
const profile   = ref<any>(null)
const isLoading = ref(true)
const isSaving  = ref(false)
const error     = ref('')
const success   = ref('')

// Bot token input
const botToken  = ref('')
const telegramId = ref('')

const setupSteps = [
  'Open Telegram and search for <strong class="text-foreground">@BotFather</strong>',
  'Send <strong class="text-foreground">/newbot</strong> and follow the instructions',
  'Copy the bot token BotFather gives you',
  'Get your Telegram user ID from <strong class="text-foreground">@userinfobot</strong>',
  'Paste both below and click Connect',
]

async function fetchProfile() {
  const userId = getUserId(user.value)
  if (!userId) return

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  profile.value   = data
  isLoading.value = false

  if (data?.telegram_bot_token) {
    botToken.value  = data.telegram_bot_token
  }
  if (data?.telegram_id) {
    telegramId.value = data.telegram_id
  }
}

async function saveTelegramSettings() {
  const userId = getUserId(user.value)
  if (!userId) return

  error.value   = ''
  success.value = ''
  isSaving.value = true

  try {
    // Verify bot token by calling Telegram API
    const verifyRes = await $fetch<any>('/api/telegram/verify-bot', {
      method: 'POST',
      body:   { botToken: botToken.value.trim() },
    })

    if (!verifyRes.ok) {
      throw new Error('Invalid bot token. Please check and try again.')
    }

    // Save to profile
    const { error: dbError } = await supabase
      .from('profiles')
      .update({
        telegram_bot_token: botToken.value.trim(),
        telegram_id:        telegramId.value.trim() || null,
      })
      .eq('id', userId)

    if (dbError) throw dbError

    profile.value = { ...profile.value, telegram_bot_token: botToken.value }
    success.value = 'Telegram settings saved successfully!'

  } catch (e: any) {
    error.value = e.data?.message ?? e.message ?? 'Something went wrong'
  } finally {
    isSaving.value = false
  }
}

async function disconnect() {
  const userId = getUserId(user.value)
  if (!userId) return

  await supabase
    .from('profiles')
    .update({
      telegram_bot_token: null,
      telegram_id:        null,
      telegram_username:  null,
    })
    .eq('id', userId)

  profile.value    = { ...profile.value, telegram_bot_token: null }
  botToken.value   = ''
  telegramId.value = ''
  success.value    = 'Telegram disconnected.'
}

watch(user, (u) => { if (u) fetchProfile() }, { immediate: true })
</script>

<template>
  <div class="max-w-2xl space-y-6">

    <!-- Header -->
    <div>
      <h1 class="text-2xl font-medium tracking-heading">Telegram</h1>
      <p class="text-muted-foreground text-sm mt-1">
        Connect your Telegram bot to push sticker packs directly to Telegram.
      </p>
    </div>

    <div v-if="isLoading">
      <Skeleton class="h-64 rounded-xl" />
    </div>

    <template v-else>

      <!-- Connected state -->
      <div
        v-if="profile?.telegram_bot_token"
        class="glass-card p-5 space-y-4"
      >
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-sky-400/10 flex items-center justify-center">
            <Icon name="ri:telegram-fill" class="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <p class="font-medium text-sm">Telegram Connected</p>
            <p class="text-xs text-muted-foreground">
              Bot token ending in ...{{ profile.telegram_bot_token.slice(-8) }}
            </p>
          </div>
          <div class="ml-auto">
            <Badge class="bg-green-500/10 text-green-400 border-green-500/20">
              Active
            </Badge>
          </div>
        </div>

        <Separator />

        <div class="flex gap-2">
          <NuxtLink to="/packs" class="flex-1">
            <Button class="w-full" variant="outline">
              <Icon name="ri:folder-line" class="w-4 h-4 mr-2" />
              Manage Packs
            </Button>
          </NuxtLink>
          <Button
            variant="destructive"
            class="flex-1"
            @click="disconnect"
          >
            <Icon name="ri:link-unlink" class="w-4 h-4 mr-2" />
            Disconnect
          </Button>
        </div>
      </div>

      <!-- Setup form -->
      <div v-else class="glass-card p-5 space-y-5">

        <!-- How to get bot token -->
        <div class="space-y-3">
          <p class="text-sm font-medium">How to connect</p>

          <div class="space-y-2">
            <div
              v-for="(step, i) in setupSteps"
              :key="i"
              class="flex gap-3 items-start"
            >
              <div
                class="w-5 h-5 rounded-full bg-framer-blue/10 text-framer-blue
                       text-xs flex items-center justify-center shrink-0 mt-0.5"
              >
                {{ i + 1 }}
              </div>
              <p class="text-sm text-muted-foreground" v-html="step" />
            </div>
          </div>
        </div>

        <Separator />

        <!-- Token input -->
        <div class="space-y-4">
          <div
            v-if="error"
            class="text-xs text-destructive bg-destructive/10
                   border border-destructive/20 rounded-lg px-3 py-2"
          >
            {{ error }}
          </div>
          <div
            v-if="success"
            class="text-xs text-green-400 bg-green-400/10
                   border border-green-400/20 rounded-lg px-3 py-2"
          >
            {{ success }}
          </div>

          <div class="space-y-2">
            <Label for="bot-token">Bot Token</Label>
            <Input
              id="bot-token"
              v-model="botToken"
              placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
              type="password"
            />
            <p class="text-xs text-muted-foreground">
              Get this from @BotFather on Telegram
            </p>
          </div>

          <div class="space-y-2">
            <Label for="telegram-id">Your Telegram User ID</Label>
            <Input
              id="telegram-id"
              v-model="telegramId"
              placeholder="123456789"
            />
            <p class="text-xs text-muted-foreground">
              Get your ID from @userinfobot on Telegram
            </p>
          </div>

          <Button
            class="w-full"
            :disabled="!botToken.trim() || !telegramId.trim() || isSaving"
            @click="saveTelegramSettings"
          >
            <Icon
              v-if="isSaving"
              name="ri:loader-4-line"
              class="w-4 h-4 mr-2 animate-spin"
            />
            <Icon v-else name="ri:telegram-line" class="w-4 h-4 mr-2" />
            Connect Telegram
          </Button>
        </div>
      </div>

    </template>
  </div>
</template>