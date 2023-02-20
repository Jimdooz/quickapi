# ⚡ QuickAPI

A typed API for server/client communication, making it easy to structure your API calls and ensure type safety.


*This package helps you organize and structure your API calls. However, it doesn't handle communication between the client and server directly. You'll need to handle this aspect on your own or with the help of other packages* 😊

## Server-side Usage

### 📝 Declaring your API

First, create a file called `API.ts` and import the `API_DECLARATION` type from `quickapi/api.ts`. Your API should be an object containing functions that represent the different endpoints of your API. Each function should take a `requester` parameter, which can contain information about the requester. 

```ts
import type { API_DECLARATION } from "https://deno.land/x/quickapi/mod.ts";

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

Next, import your API object and use the `compileAPI` function from `quickapi/server.ts` to distribute it. This creates a handy object to call your api from your communication system.

```ts
import API from "./API.ts"
import { compileAPI, type Requester } from "https://deno.land/x/quickapi/mod.ts"

const api = compileAPI(API);

/**
 * Here, you'll need to manage the way you communicate to call the API.
 * Think about it from the perspective of a client who wants to use your API.
 */
const requester: Requester = { uid : crypto.randomUUID() };
api.call("add", requester, 10, 5);
```

## Client-side Usage

Use the `initAPI` function from `quickapi/client.ts` to initialize your API on the client side. This function takes a generic type that should match the type of your API, and a callback function that will be used to communicate with the server.

```ts
import { initAPI } from "https://deno.land/x/quickapi/client.ts";
import type API from "<backend>/API.ts";

const { callAPI } = initAPI<typeof API>((key, ...params) => {
    // Insert your communication code here
});

callAPI("add", 10, 5);
//Or nested call
callAPI("advanced.multiply", 2, 6);
```

You can now use the `callAPI` function to call any endpoint of your API, with the added benefit of type checking for the parameters at compile time.

🎉 Give it a try and let us know how it goes!

## Advanced case

🔍 Requester: The requester parameter can be used to store information about the user making the request. It is up to you to define the fields of this object and handle the communication accordingly

You can append custom properties this way :

```ts
// You can add shortcut if you define an importmap
declare module "https://deno.land/x/quickapi/mod.ts" {
    export interface Requester {
        // Your custom properties
    }
}
```

### Special keys

In addition to the endpoint functions, Quick API also supports special keys `$before`, `$beforeAll`, `$after`, and `$afterAll`. These keys do not serve as endpoints, and `compileAPI` uses them automatically.

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