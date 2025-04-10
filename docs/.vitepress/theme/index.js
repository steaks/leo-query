import DefaultTheme from 'vitepress/theme';
import VersionSwitcher from './components/VersionSwitcher.vue';
import NavLink from './components/NavLink.vue';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('VersionSwitcher', VersionSwitcher)
    app.component('NavLink', NavLink)
  }
} 