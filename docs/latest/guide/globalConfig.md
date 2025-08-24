# Global Configuration

Configure default options that will apply to all queries in your application.

## Usage

### Basic Example
Use the `configure()` function to set default debounce and retry behavior:

```typescript
configure({
  query: {
    debounce: 500, // 500ms between queries instead of the default 300ms
    retry: 3 // Retry 3 times instead of the default 5
  }
});
```

## API Reference

```typescript
configure(options: GlobalOptions);
```

```typescript
/**
 * Global options for Leo Query.
 */
export interface GlobalOptions {
  /**
   * Global query options.
   */
  query?: GlobalQueryOptions;
  /**
   * A function that generates a v4 UUID. If no function is provided Leo Query will fallback to crypto.randomUUID. Browsers typically have access to crypto.randomUUID, so this option is not needed. 
   * React Native does not have access to crypto.randomUUID, so this option is usually required.
   */
  uuidv4?: () => string;
}
```

```typescript
interface QueryOptions {
    /** If set to `true`, the query will fetch data as needed. Default is `true`. */
    readonly lazy?: boolean;
    /** The delay (in ms) between query triggers. Default is 300ms. */
    readonly debounce?: number;
    /** Max number of retries or a function that overrides the default retry behavior. Default is 5. */
    readonly retry?: number | ((attempt: number, error: any) => boolean);
    /** A function that overrides the default retry delay behavior. */
    readonly retryDelay?: (attempt: number) => number;
    /** Time in ms before data is considered stale. */
    readonly staleTime?: number;
}
```