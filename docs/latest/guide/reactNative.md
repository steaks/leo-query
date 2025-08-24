# React Native

Leo Query works with React Native with one additional setup step. 

Leo Query uses v4 uuids. Since React Native environments don't typically have access to `crypto.randomUUID`, it requires that you provide a V4 UUID generator. 

Follow the normal [getting started](/latest/introduction/gettingStarted). When you come to the `Connect your store` step first provide a `uuidv4` function to the global configuration. See examples below.

### Examples of UUID config

V4 UUID function with `react-native-uuid`

```typescript
//Vanilla React Native
import {configure} from "leo-query";
import uuid from "react-native-uuid"; // https://www.npmjs.com/package/react-native-uuid

configure({
  uuidv4: uuid.v4
});
```

V4 UUID function with Expo

```typescript
//React Native with Expo
import {configure} from "leo-query";
import {randomUUID} from 'expo-crypto';

configure({
  uuidv4: randomUUID
});
```