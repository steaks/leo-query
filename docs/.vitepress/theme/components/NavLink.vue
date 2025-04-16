<template>
  <a class="VPLink link VPNavBarMenuLink" :href="fullLink" tabindex="0">
    <span>{{ text }}</span>
  </a>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vitepress';

const props = defineProps<{prevLink: string, nextLink?: string, latestLink: string, text: string}>();
const route = useRoute();
const selectedVersion = computed(() => {
  if (route.path.startsWith('/next')) {
    return 'next';
  } else if (route.path.startsWith('/prev')) {
    return 'prev';
  }
  return 'latest';
});
const fullLink = computed(() => {
  if (selectedVersion.value === 'next') {
    return props.nextLink;
  } else if (selectedVersion.value === 'prev') {
    return props.prevLink;
  }
  return props.latestLink;
});
</script>

<style scoped>
.VPNavBarMenuLink {
    display: flex;
    align-items: center;
    padding: 0 12px;
    line-height: var(--vp-nav-height);
    font-size: 14px;
    font-weight: 500;
    color: var(--vp-c-text-1);
    transition: color 0.25s;
}

.VPNavBarMenuLink:hover {
  color: var(--vp-c-brand);
}

.VPNavBarMenuLink.active {
  color: var(--vp-c-brand);
}
</style>