# ⚡ QuickAPI

A typed API for server/client communication, making it easy to structure your API calls and ensure type safety.

## Server-side Usage

### 📝 Declaring your API

First, create a file called `API.ts` and import the `API_DECLARATION` type from `@quickapi/api.ts`. Your API should be an object containing functions that represent the different endpoints of your API. Each function should take a `requester` parameter, which can contain information about the requester. 

```ts
import type { API_DECLARATION } from "@quickapi/mod.ts";

export default {
    add(req, a: number, b: number){
        return a + b;
    },
    advanced: {
        multiply(req, c: number, d: number){
            return c * d;
        }
    }
} as const satisfies API_DECLARATION;
```

### 📦 Distributing your API

Next, import your API object and use the `flatAPI` function from `@quickapi/server.ts` to distribute it. This creates a flat map of functions that can be used by clients.

```ts
import API from "./API.ts"
import { flatAPI } from "@quickapi/mod.ts"

const api = flatAPI(API);
```

## Client-side Usage

Use the `initAPI` function from `@quickapi/client.ts` to initialize your API on the client side. This function takes a generic type that should match the type of your API, and a callback function that will be used to communicate with the server.

```ts
import { initAPI } from "@quickapi/client.ts";
import type API from "<backend>/API.ts";

const { callAPI } = initAPI<typeof API>((key, ...params) => {
    // Insert your communication code here
});

callAPI("add", 10, 5);
```

You can now use the `callAPI` function to call any endpoint of your API, with the added benefit of type checking for the parameters at compile time.

🎉 Give it a try and let us know how it goes!

💡 **Note**: *This package focuses on structuring the API calls, it's not focused on the communication between client and server. You'll have to handle the communication by yourself or with other packages.*

## Advanced case

🔍 Requester: The requester parameter is optional and can be used to store information about the user making the request. It is up to you to define the fields of this object and handle the communication accordingly

```ts
declare module "@quickapi/mod.ts" {
    export interface Requester {
        sessionID: string,
    }
}
```

## Special keys

In addition to the endpoint functions, Quick API also supports special keys `$before`, `$beforeAll`, `$after`, and `$afterAll`.

- `$before` and `$after` can be used to define actions that should be performed before and after the endpoint functions within the same level of the API structure.

- `$beforeAll` and `$afterAll` can be used to define actions that should be performed before and after all endpoint functions, regardless of the level of the API structure. These functions are called recursively for all sub-objects within the API.

For example, the following API declaration would call `$beforeAll` at the top level, and `$before` and `$after` within the `deep` object, but not the top level `$before`:

```ts
export default {
    $beforeAll(){
        //Is called before all
    },
    $before(){
        //Not called
    },
    deep : {
        $before() {
            //Is called before
        },
        endPoint() {
            console.log("EndPoint called !");
        },
        $after() {
            //Is called after
        },
        $afterAll() {
            //Is called after all of this level
        }
    },
    $afterAll() {
        //Is called after all
    }
} as const satisfies API_DECLARATION
```