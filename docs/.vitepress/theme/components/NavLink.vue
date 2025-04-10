<template>
  <a class="VPLink link VPNavBarMenuLink" :class="{ active: isActive }" :href="fullLink" tabindex="0">
    <span>{{ text }}</span>
  </a>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vitepress';

const props = defineProps<{latestLink: string, nextLink: string, text: string}>();
const route = useRoute();
const isNextVersionSelected = computed(() => route.path.startsWith('/next'));
const fullLink = computed(() => isNextVersionSelected.value ? props.nextLink : props.latestLink);
const isActive = computed(() => route.path === props.latestLink);
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