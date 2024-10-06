import { defineConfig } from "vitepress"

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Leo Query",
  description: "A simple library to connect async queries to Zustand stores.",
  base: "/leo-query/",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    head: [["link", { rel: "icon", href: "/favicon.ico" }]],
    nav: [
      { text: "Home", link: "/" },
      { text: "Getting Started", link: "/gettingStarted" },
      { text: "Guide", link: "/query" },
      { text: "Examples", link: "/examples" }
    ],
    sidebar: [
      {
        text: "Getting Started",
        items: [
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
      { icon: "github", link: "https://github.com/steaks/leo-query" }
    ],
    search: {
      provider: "local"
    }
  }
})
