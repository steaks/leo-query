# React Native

Leo Query requires one extra step to work with React Native. React Native environments do not have access to `crypto.randomUUID` by default. Leo Query uses v4 uuids to uniquely identify queries and effects. So it needs a v4 uuid generator. Pass in a v4 uuid generator to the global config.

## Examples

### UUID Generator with React Native

#### React Native
```typescript
//Vanilla React Native
import {configure} from "leo-query";
import uuid from "react-native-uuid"; // https://www.npmjs.com/package/react-native-uuid

configure({
  uuidv4: uuid.v4
});
```

```typescript
//React Native with Expo
import {configure} from "leo-query";
import {randomUUID} from 'expo-crypto';

configure({
  uuidv4: randomUUID
});
```