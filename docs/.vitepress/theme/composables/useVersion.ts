import { ref, computed } from 'vue'
import { useRoute } from 'vitepress'

export function useVersion() {
  const route = useRoute()

  const versions = {
    prev: 'v0.4.1',
    latest: 'v0.5.0',
    next: 'v0.6.0'
  };
  
  const selectedVersion = computed(() => {
    if (route.path.startsWith('/next')) {
      return {type: 'next', version: versions.next};
    } else if (route.path.startsWith('/prev')) {
      return {type: 'prev', version: versions.prev};
    }
    return {type: 'latest', version: versions.latest};
  });

  return {selectedVersion, versions};
} 