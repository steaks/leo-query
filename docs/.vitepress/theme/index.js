import DefaultTheme from 'vitepress/theme';
import VersionSwitcher from './components/VersionSwitcher.vue';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('VersionSwitcher', VersionSwitcher)
  }
} 