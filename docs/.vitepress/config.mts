import { defineConfig } from "vitepress"

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Leo Query",
  description: "A simple library to connect async queries to Zustand stores.",
  head: [
    [
      "script",
      { async: "", src: "https://www.googletagmanager.com/gtag/js?id=G-7MTJ6KE6QJ" }
    ],
    [
      "script",
      {},
      `window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag("js", new Date());
        gtag("config", "G-7MTJ6KE6QJ");`
    ],
    ["link", { rel: "icon", href: "/favicon.ico" }]
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Getting Started", link: "/gettingStarted" },
      { text: "Guide", link: "/query" },
      { text: "Examples", link: "/examples" }
    ],
    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "Why Leo Query?", link: "/why" },
          { text: "Getting Started", link: "/gettingStarted" },
        ]
      },
      {
        text: "Guide",
        items: [
          { text: "Query Usage", link: "/query" },
          { text: "Effect Usage", link: "/effect" },
          { text: "Hook Usage", link: "/hook" },
          { text: "Without Suspense Usage", link: "/withoutSuspense" },
        ]
      },
      {
        text: "Examples",
        items: [
          { text: "Examples", link: "/examples" },
        ]
      }
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/steaks/leo-query" },
      { icon: "discord", link: "https://discord.gg/aucYm6hMsJ" }
    ],
    search: {
      provider: "local"
    }
  }
})
