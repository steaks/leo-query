import { defineConfig } from "vitepress";

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
      {component: "NavLink", props: {text: "Home", latestLink: "/", nextLink: "/next"}},
      {component: "NavLink", props: {text: "Docs", latestLink: "/query", nextLink: "/next/introduction/why"}},
      {component: "NavLink", props: {text: "Examples", latestLink: "/examples", nextLink: "/next/examples/examples"}},
      {component: "NavLink", props: {text: "Blog", latestLink: "/blog", nextLink: "/next/blog"}},
      {component: "VersionSwitcher"},
    ],
    sidebar: {
      "/next/": [
        {
          text: "Introduction",
          items: [
            { text: "Why Leo Query?", link: "/next/introduction/why" },
            { text: "Getting Started", link: "/next/introduction/gettingStarted" },
          ]
        }, 
        {
          text: "Guide",
          items: [
            { text: "Query (Fetches)", link: "/next/guide/query" },
            { text: "Effect (Mutations)", link: "/next/guide/effect" },
            { text: "Hook", link: "/next/guide/hook" },
            { text: "Global Config", link: "/next/guide/globalConfig" },
            { text: "Initial Data", link: "/next/guide/initialData" },
            { text: "Persisting Data", link: "/next/guide/persistingData" },
            { text: "Optimistic Updates", link: "/next/guide/optimisticUpdates" },
            { text: "Setup with Next", link: "/next/guide/setupWithNext" },
          ]
        },
        {
          text: "Advanced Concepts",
          items: [
            { text: "Caching", link: "/next/advancedConcepts/caching" },
            { text: "Retries", link: "/next/advancedConcepts/retries" },
            { text: "Manual Updates", link: "/next/advancedConcepts/manualUpdates" },
            { text: "Timestamped Values", link: "/next/advancedConcepts/timestampedValues" },
          ]
        },
        {
          text: "Examples",
          items: [
            { text: "All Examples", link: "/next/examples/examples" },
            { text: "Dogs JS", link: "https://codesandbox.io/p/devbox/leo-query-dogs-demo-js-forked-tt6tq6?workspaceId=ws_CTu2uAaf7QNEGg4Jxmo6VN" },
            { text: "Dogs TS", link: "https://codesandbox.io/p/devbox/leo-query-dogs-demo-ts-forked-wnxn3w?workspaceId=ws_CTu2uAaf7QNEGg4Jxmo6VN" },
            { text: "Task Manager", link: "https://zhzgv5.csb.app/" },
          ]
        },
        {
          text: "Blog",
          items: [
            { text: "Recent Posts", link: "/next/blog" },
            { text: "Implementing Retry Logic", link: "/next/blog/implementingRetryLogic" },
            { text: "Delaying Execution with Wait", link: "/next/blog/delayingExecutionWithWait" },
          ]
        }
      ],
      "/": [
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
            { text: "Retries", link: "/retries" },
          ]
        },
        {
          text: "Examples",
          items: [
            { text: "All Examples", link: "/examples" },
            { text: "Dogs JS", link: "https://codesandbox.io/p/sandbox/leo-query-dogs-demo-js-wmwlgt?file=%2Fsrc%2FApp.jsx" },
            { text: "Dogs TS", link: "https://codesandbox.io/p/sandbox/leo-query-dogs-demo-ts-7f2c34?file=%2Fsrc%2FApp.tsx" },
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
      ]
    },
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
});