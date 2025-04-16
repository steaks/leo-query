<template>
  <a class="VPLink link VPNavBarMenuLink" :href="fullLink" tabindex="0">
    <span>{{ text }}</span>
  </a>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useVersion } from '../composables/useVersion';

const props = defineProps<{prevLink: string, nextLink: string, latestLink: string, text: string}>();
const {selectedVersion} = useVersion();

const fullLink = computed(() => {
  if (selectedVersion.value.type === 'next') {
    return props.nextLink;
  } else if (selectedVersion.value.type === 'prev') {
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