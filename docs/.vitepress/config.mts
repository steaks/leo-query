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
      { text: "Guide", link: "/query" },
      { text: "Examples", link: "/examples" },
      { text: "Blog", link: "/blog" }
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
          { text: "Query", link: "/query" },
          { text: "Effect", link: "/effect" },
          { text: "Hook", link: "/hook" },
          { text: "Global Config", link: "/globalConfig" },
        ]
      },
      {
        text: "Advanced Concepts",
        items: [
          { text: "Caching", link: "/caching" },
          { text: "Optimistic Updates", link: "/optimisticUpdates" },
          { text: "Retries", link: "/retries" }
        ]
      },
      {
        text: "Examples",
        items: [
          { text: "All Examples", link: "/examples" },
          { text: "Bears JS", link: "https://codesandbox.io/p/sandbox/leo-query-bears-demo-js-wmwlgt?file=%2Fsrc%2FApp.jsx" },
          { text: "Bears TS", link: "https://codesandbox.io/p/sandbox/leo-query-bears-demo-ts-7f2c34?file=%2Fsrc%2FApp.tsx" },
          { text: "Task Manager", link: "https://xsh8c4.csb.app/" },
        ]
      },
      {
        text: "Blog",
        items: [
          { text: "Recent Posts", link: "/blog" },
          { text: "Implementing Retry Logic", link: "/blog/implementingRetryLogic" },
          { text: "Delaying Execution with Wait", link: "/blog/delayingExecutionWithWait" },
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
  },
  sitemap: {
    hostname: "https://leoquery.com"
  }
})
