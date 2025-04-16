import { defineConfig } from "vitepress";
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs'


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
      {
        component: "NavLink", 
        props: {text: "Home", prevLink: "/prev/", latestLink: "/latest/", nextLink: "/next/"}
      },
      {
        component: "NavLink", 
        props: {text: "Docs", prevLink: "/prev/query", latestLink: "/latest/query", nextLink: "/next/introduction/why"}
      },
      {
        component: "NavLink", 
        props: {text: "Examples", prevLink: "/prev/examples", latestLink: "/latest/examples", nextLink: "/next/examples/examples"}
      },
      {
        component: "NavLink", 
        props: {text: "Blog", prevLink: "/prev/blog", latestLink: "/latest/blog", nextLink: "/next/blog"}
      },
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
            { text: "Query (fetching data)", link: "/next/guide/query" },
            { text: "Effect (mutating data)", link: "/next/guide/effect" },
            { text: "Hook", link: "/next/guide/hook" },
            { text: "Global Config", link: "/next/guide/globalConfig" },
            { text: "Initial Data", link: "/next/guide/initialData" },
            { text: "Persisting Data", link: "/next/guide/persistingData" },
            { text: "Optimistic Updates", link: "/next/guide/optimisticUpdates" },
            { text: "Setup with Next.js", link: "/next/guide/setupWithNextJs" },
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
            { text: "Optimistic Updates", link: "https://codesandbox.io/p/sandbox/hcfp9y" },
            { text: "Persisting Data", link: "https://codesandbox.io/p/sandbox/xtq66z" },
            { text: "Next.js Integration", link: "https://codesandbox.io/p/devbox/next-js-example-0-3-0-y6w29t" },
            { text: "Todos", link: "https://codesandbox.io/p/sandbox/todos-0-3-0-d75vj5" },
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
      "/latest/": [
        {
          text: "Introduction",
          items: [
            { text: "Why Leo Query?", link: "/latest/why" },
            { text: "Getting Started", link: "/latest/gettingStarted" },
          ]
        },
        {
          text: "Guide",
          items: [
            { text: "Query", link: "/latest/query" },
            { text: "Effect", link: "/latest/effect" },
            { text: "Hook", link: "/latest/hook" },
            { text: "Global Config", link: "/latest/globalConfig" },
          ]
        },
        {
          text: "Advanced Concepts",
          items: [
            { text: "Caching", link: "/latest/caching" },
            { text: "Optimistic Updates", link: "/latest/optimisticUpdates" },
            { text: "Retries", link: "/latest/retries" },
          ]
        },
        {
          text: "Examples",
          items: [
            { text: "All Examples", link: "/latest/examples" },
            { text: "Dogs JS", link: "https://codesandbox.io/p/sandbox/leo-query-dogs-demo-js-wmwlgt?file=%2Fsrc%2FApp.jsx" },
            { text: "Dogs TS", link: "https://codesandbox.io/p/sandbox/leo-query-dogs-demo-ts-7f2c34?file=%2Fsrc%2FApp.tsx" },
            { text: "Task Manager", link: "https://xsh8c4.csb.app/" },
          ]
        },
        {
          text: "Blog",
          items: [
            { text: "Recent Posts", link: "/latest/blog" },
            { text: "Implementing Retry Logic", link: "/latest/blog/implementingRetryLogic" },
            { text: "Delaying Execution with Wait", link: "/latest/blog/delayingExecutionWithWait" },
          ]
        }
      ], 
      "/prev/": [
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
  },
  markdown: {
    config(md) {
      md.use(tabsMarkdownPlugin)
    }
  }
});