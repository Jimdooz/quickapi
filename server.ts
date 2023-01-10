import { API_DECLARATION, API_FUNCTION } from "./api.ts";

type ContextUnpack = {
    key: string,
    parent: API_DECLARATION,
    allBefore: API_FUNCTION[],
    allAfter: API_FUNCTION[],
}

/**
 * Recursively unpack API structure and execute a callback function for each function found
 * @param api API_DECLARATION object
 * @param callback Function to execute for each API function found
 * @param context Current context of unpacking
 */
function recursiveUnpack<A extends API_DECLARATION>(api: A, callback: (fun: API_FUNCTION, context: ContextUnpack) => void, context: ContextUnpack = { key: "", allAfter: [], allBefore: [], parent: api }) {
    if (!api) return;

    if (api.$beforeAll) context.allBefore.push(api.$beforeAll);
    if (api.$afterAll) context.allAfter = [api.$afterAll, ...context.allAfter];

    context.parent = api;

    for (const key in api as API_DECLARATION) {
        const toCall = api[key];
        if (!toCall) continue;

        if (typeof toCall == "function") {
            callback(toCall, {
                key: `${context.key}${key}`,
                allBefore: api.$before ? [...context.allBefore, api.$before] : context.allBefore,
                allAfter: api.$after ? [api.$after, ...context.allAfter] : context.allAfter,
                parent: context.parent,
            });
        } else {
            recursiveUnpack(toCall, callback, {
                key: `${context.key}${key}.`,
                allAfter: context.allAfter,
                allBefore: context.allBefore,
                parent: context.parent,
            })
        }
    }
}

/**
 * Unpack an API_DECLARATION and execute a callback function for each function found
 * @param api API_DECLARATION object
 * @param callback Function to execute for each API function found
 */
export function unpackAPI<A extends API_DECLARATION>(api: A, callback: (fun: API_FUNCTION, context: ContextUnpack) => void) {
    recursiveUnpack(api, callback, { key: "", allAfter: [], allBefore: [], parent: api });
}

export type API_FLAT = { [key: string]: API_FUNCTION };

/**
 * Flatten an API_DECLARATION and returns a map of functions that can be easily consumed from the server
 * @param api API_DECLARATION object
 */
export function flatAPI<A extends API_DECLARATION>(api: A) {
    const flat: { [key: string]: API_FUNCTION } = {};
    unpackAPI(api, (fun, context) => {
        flat[context.key] = async (requester, ...params) => {
            for (let i = 0; i < context.allBefore.length; i++) { await context.allBefore[i](requester, ...params) }
            const result = await fun(requester, ...params);
            for (let i = 0; i < context.allAfter.length; i++) { await context.allAfter[i](requester, result, ...params) }
            return result;
        }
    });
    return flat;
}