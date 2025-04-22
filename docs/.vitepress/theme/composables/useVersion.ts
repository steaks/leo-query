import { ref, computed } from 'vue'
import { useRoute } from 'vitepress'

export function useVersion() {
  const route = useRoute()

  const versions = {
    prev: '',
    latest: 'v0.2.0',
    next: 'v0.3.0-rc.7'
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