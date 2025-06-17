<template>
  <div class="VPNavBarMenuGroup">
    <button type="button" class="VPNavBarMenuButton" :aria-expanded="isOpen" @click="isOpen = !isOpen">
      <span class="VPNavBarMenuButtonText">
        <span>{{ selectedVersion.version }}</span>
        <span class="VPNavBarMenuButtonIcon"><i class="vpi-chevron-down" /></span>
      </span>
    </button>
    <div v-show="isOpen" class="VPNavBarMenu">
      <div class="VPNavBarMenuLink" v-if="versions.next">
          <a class="VPNavBarMenuLinkText" :class="{ active: selectedVersion.type === 'next' }" href="/next/" @click="isOpen = false">
            {{ versions.next }} (next)
          </a>
        </div>
      <div class="VPNavBarMenuItems">
        <div class="VPNavBarMenuLink" v-if="versions.latest">
          <a class="VPNavBarMenuLinkText" :class="{ active: selectedVersion.type === 'latest' }" href="/latest/" @click="isOpen = false">
            {{ versions.latest }} (latest)
          </a>
        </div>
        <div class="VPNavBarMenuLink" v-if="versions.prev">
          <a class="VPNavBarMenuLinkText" :class="{ active: selectedVersion.type === 'prev' }" href="/prev/" @click="isOpen = false">
            {{ versions.prev }}
          </a>
        </div> 
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useVersion } from '../composables/useVersion';

const isOpen = ref<boolean>(false);
const {selectedVersion, versions} = useVersion();
</script>

<style scoped>
/* Layout */
.VPNavBarMenuGroup {
  position: relative;
}

.VPNavBarMenu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 50;
  min-width: 128px;
  padding: 6px 0;
  border-radius: 8px;
}

.VPNavBarMenuItems {
  padding: 0 4px;
}

.VPNavBarMenuLink {
  padding: 0 12px;
}

/* Button styles */
.VPNavBarMenuButton {
  display: flex;
  align-items: center;
  height: var(--vp-nav-height);
  padding: 0 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.VPNavBarMenuButton:hover {
  color: var(--vp-c-brand);
}

.VPNavBarMenuButtonText {
  display: flex;
  align-items: center;
  gap: 4px;
}

.VPNavBarMenuButtonIcon {
  display: flex;
  align-items: center;
  transition: transform 0.25s;
}

.VPNavBarMenuButton[aria-expanded="true"] .VPNavBarMenuButtonIcon {
  transform: rotate(180deg);
}

/* Menu styles */
.VPNavBarMenu {
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  box-shadow: var(--vp-shadow-3);
}

.VPNavBarMenuLinkText {
  display: block;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  transition: color 0.25s;
}

.VPNavBarMenuLinkText:hover {
  color: var(--vp-c-brand);
}

.VPNavBarMenuLinkText.active {
  color: var(--vp-c-brand);
}
</style>