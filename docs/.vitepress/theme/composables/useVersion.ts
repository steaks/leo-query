import { ref, computed } from 'vue'
import { useRoute } from 'vitepress'

export function useVersion() {
  const route = useRoute()

  const versions = {
    prev: 'v0.2.0',
    latest: 'v0.3.0',
    next: ''
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