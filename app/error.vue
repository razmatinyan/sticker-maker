<script setup lang="ts">
const props  = defineProps<{ error: any }>()
const handle = useError()

const isNotFound = computed(() => props.error?.statusCode === 404)

function goHome() {
  handle.clearError({ redirect: '/' })
}

function goBack() {
  handle.clearError()
  history.back()
}
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-8">
    <div class="auth-glow" />

    <div class="relative text-center space-y-6 max-w-md">

      <!-- Icon -->
      <div class="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
        <Icon
          :name="isNotFound ? 'ri:ghost-line' : 'ri:error-warning-line'"
          class="w-8 h-8 text-muted-foreground"
        />
      </div>

      <!-- Message -->
      <div class="space-y-2">
        <h1 class="text-5xl font-medium tracking-display text-foreground">
          {{ props.error?.statusCode ?? '?' }}
        </h1>
        <p class="text-lg font-medium">
          {{ isNotFound ? 'Page not found' : 'Something went wrong' }}
        </p>
        <p class="text-sm text-muted-foreground">
          {{ isNotFound
              ? "The page you're looking for doesn't exist or has been moved."
              : props.error?.message ?? 'An unexpected error occurred.'
          }}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 justify-center">
        <Button variant="outline" @click="goBack">
          <Icon name="ri:arrow-left-line" class="w-4 h-4 mr-2" />
          Go back
        </Button>
        <Button @click="goHome">
          <Icon name="ri:home-line" class="w-4 h-4 mr-2" />
          Home
        </Button>
      </div>

    </div>
  </div>
</template>