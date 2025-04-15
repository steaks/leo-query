<style>
.blog-post {
    border: 1px solid #efefef;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 24px;
}
.blog-post .post-meta {
    color: #666;
    margin: 0;
}
.blog-post h1 {
    font-size: 2.5em;
    margin-bottom: 0px;
}
.blog-post h3 {
    margin: 0;
}
.blog-post p:last-child {
    margin-bottom: 0;
}
.blog-post .read-more {
    color: #666;
    font-style: italic;
    text-decoration: none;
}
.blog-post .read-more:hover {
    text-decoration: underline;
}
</style>

# Blog

Welcome to the Leo Query blog! Here you'll find articles about state management, data fetching, and more.

## Latest Posts

<div class="blog-post">
    <h3><a href="/blog/implementingRetryLogic">Implementing Retry Logic</a></h3>
    <p class="post-meta">By Steven Wexler • Dec 1, 2024</p>
    <p>
        Lots of things can go wrong when you're making HTTP requests. Wifi can cut out. Servers can overload. Apps need to have a retry strategy for good UX. Leo Query implements a nuanced retry strategy using an exponential backoff...
        <a href="/blog/implementingRetryLogic" class="read-more">read more</a>
    </p>
</div>

<div class="blog-post">
    <h3><a href="/blog/delayingExecutionWithWait">Delaying Execution with Wait</a></h3>
    <p class="post-meta">By Steven Wexler • Dec 1, 2024</p>
    <p>
        Sometimes I want to delay execution in Leo Query. This may be to delay a retry or wait for a React render. I prefer the async / await syntax over `setTimeout`. So I wrote a small `wait` utility function to use in the Leo Query code...
        <a href="/blog/delayingExecutionWithWait" class="read-more">read more</a>
    </p>
</div>