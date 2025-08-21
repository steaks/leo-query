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
        props: {text: "Docs", prevLink: "/prev/introduction/why", latestLink: "/latest/introduction/why", nextLink: "/next/introduction/why"}
      },
      {
        component: "NavLink", 
        props: {text: "Examples", prevLink: "/prev/examples/examples", latestLink: "/latest/examples/examples", nextLink: "/next/examples/examples"}
      },
      {
        component: "NavLink", 
        props: {text: "Blog", prevLink: "/prev/blog", latestLink: "/latest/blog", nextLink: "/next/blog"}
      },
      {component: "VersionSwitcher"},
    ],
    sidebar: {
      "/prev/": [
        {
          text: "Introduction",
          items: [
            { text: "Why Leo Query?", link: "/prev/introduction/why" },
            { text: "Getting Started", link: "/prev/introduction/gettingStarted" },
          ]
        }, 
        {
          text: "Guide",
          items: [
            { text: "Query (fetching data)", link: "/prev/guide/query" },
            { text: "Effect (mutating data)", link: "/prev/guide/effect" },
            { text: "Hook", link: "/prev/guide/hook" },
            { text: "Global Config", link: "/prev/guide/globalConfig" },
            { text: "Initial Data", link: "/prev/guide/initialData" },
            { text: "Persisting Data", link: "/prev/guide/persistingData" },
            { text: "Optimistic Updates", link: "/prev/guide/optimisticUpdates" },
            { text: "Setup with Next.js", link: "/prev/guide/setupWithNextJs" },
            { text: "Error Handling", link: "/prev/guide/errorHandling" },
          ]
        },
        {
          text: "Advanced Concepts",
          items: [
            { text: "Caching", link: "/prev/advancedConcepts/caching" },
            { text: "Retries", link: "/prev/advancedConcepts/retries" },
            { text: "Manual Updates", link: "/prev/advancedConcepts/manualUpdates" },
            { text: "Timestamped Values", link: "/prev/advancedConcepts/timestampedValues" },
          ]
        },
        {
          text: "Examples",
          items: [
            { text: "All Examples", link: "/prev/examples/examples" },
            { text: "Dogs JS", link: "https://codesandbox.io/p/devbox/leo-query-dogs-demo-js-forked-tt6tq6?workspaceId=ws_CTu2uAaf7QNEGg4Jxmo6VN" },
            { text: "Dogs TS", link: "https://codesandbox.io/p/devbox/leo-query-dogs-demo-ts-forked-wnxn3w?workspaceId=ws_CTu2uAaf7QNEGg4Jxmo6VN" },
            { text: "Optimistic Updates", link: "https://codesandbox.io/p/sandbox/hcfp9y" },
            { text: "Persisting Data", link: "https://codesandbox.io/p/sandbox/xtq66z" },
            { text: "Next.js Integration", link: "https://codesandbox.io/p/devbox/next-js-example-0-3-0-y6w29t" },
            { text: "Next.js and Persist", link: "https://codesandbox.io/p/devbox/next-js--persist-example-0-3-0-forked-tcssj5" },
            { text: "Todos", link: "https://codesandbox.io/p/sandbox/todos-0-3-0-d75vj5" },
            { text: "Task Manager", link: "https://stackblitz.com/edit/leo-query-task-manager?file=src%2FApp.tsx" },
          ]
        },
        {
          text: "Blog",
          items: [
            { text: "Recent Posts", link: "/prev/blog" },
            { text: "Implementing Retry Logic", link: "/prev/blog/implementingRetryLogic" },
            { text: "Delaying Execution with Wait", link: "/prev/blog/delayingExecutionWithWait" },
          ]
        }
      ],
      "/latest/": [
        {
          text: "Introduction",
          items: [
            { text: "Why Leo Query?", link: "/latest/introduction/why" },
            { text: "Getting Started", link: "/latest/introduction/gettingStarted" },
          ]
        }, 
        {
          text: "Guide",
          items: [
            { text: "Query (fetching data)", link: "/latest/guide/query" },
            { text: "Effect (mutating data)", link: "/latest/guide/effect" },
            { text: "Hook", link: "/latest/guide/hook" },
            { text: "Global Config", link: "/latest/guide/globalConfig" },
            { text: "Initial Data", link: "/latest/guide/initialData" },
            { text: "Persisting Data", link: "/latest/guide/persistingData" },
            { text: "Optimistic Updates", link: "/latest/guide/optimisticUpdates" },
            { text: "Setup with Next.js", link: "/latest/guide/setupWithNextJs" },
            { text: "Error Handling", link: "/latest/guide/errorHandling" },
            { text: "Parallel Queries", link: "/latest/guide/parallelQueries" },
            { text: "Slices", link: "/latest/guide/slices" },
          ]
        },
        {
          text: "Advanced Concepts",
          items: [
            { text: "Caching", link: "/latest/advancedConcepts/caching" },
            { text: "Retries", link: "/latest/advancedConcepts/retries" },
            { text: "Manual Updates", link: "/latest/advancedConcepts/manualUpdates" },
            { text: "Timestamped Values", link: "/latest/advancedConcepts/timestampedValues" },
          ]
        },
        {
          text: "Examples",
          items: [
            { text: "All Examples", link: "/latest/examples/examples" },
            { text: "Dogs JS", link: "https://codesandbox.io/p/devbox/leo-query-dogs-demo-js-forked-tt6tq6?workspaceId=ws_CTu2uAaf7QNEGg4Jxmo6VN" },
            { text: "Dogs TS", link: "https://codesandbox.io/p/devbox/leo-query-dogs-demo-ts-forked-wnxn3w?workspaceId=ws_CTu2uAaf7QNEGg4Jxmo6VN" },
            { text: "Optimistic Updates", link: "https://codesandbox.io/p/sandbox/hcfp9y" },
            { text: "Persisting Data", link: "https://codesandbox.io/p/sandbox/xtq66z" },
            { text: "Next.js Integration", link: "https://codesandbox.io/p/devbox/next-js-example-0-3-0-y6w29t" },
            { text: "Next.js and Persist", link: "https://codesandbox.io/p/devbox/next-js--persist-example-0-3-0-forked-tcssj5" },
            { text: "Parallel Queries", link: "https://codesandbox.io/p/sandbox/vy9292" },
            { text: "Slices", link: "https://codesandbox.io/p/sandbox/gsfqs3" },
            { text: "Todos", link: "https://codesandbox.io/p/sandbox/todos-0-3-0-d75vj5" },
            { text: "Task Manager", link: "https://stackblitz.com/edit/leo-query-task-manager?file=src%2FApp.tsx" },
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
            { text: "Error Handling", link: "/next/guide/errorHandling" },
            { text: "Parallel Queries", link: "/next/guide/parallelQueries" },
            { text: "Slices", link: "/next/guide/slices" },
            { text: "Events", link: "/next/guide/events" },
            { text: "React Native", link: "/next/guide/reactNative" },
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
            { text: "Next.js and Persist", link: "https://codesandbox.io/p/devbox/next-js--persist-example-0-3-0-forked-tcssj5" },
            { text: "Parallel Queries", link: "https://codesandbox.io/p/sandbox/vy9292" },
            { text: "Slices", link: "https://codesandbox.io/p/sandbox/gsfqs3" },
            { text: "Todos", link: "https://codesandbox.io/p/sandbox/todos-0-3-0-d75vj5" },
            { text: "Task Manager", link: "https://stackblitz.com/edit/leo-query-task-manager?file=src%2FApp.tsx" },
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