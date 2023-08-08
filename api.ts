/**
 * Purpose : A deep api that resolve Socket.IO Communication
 */

export interface Requester {
    uid: string,
}

// Represents a function in the API
export type API_FUNCTION = ((requester: Requester, ...params: any[]) => Promise<any> | any);

/**
 * Execution order
 *  $beforeAll
 *      $before
 *          -- exec
 *      $after
 *  $afterAll
 */
// Represents the structure of the API, containing special keys for execution order and API functions
export type API_DECLARATION = {
    $before?: API_FUNCTION,
    $beforeAll?: API_FUNCTION,
    $after?: API_FUNCTION,
    $afterAll?: API_FUNCTION,
    [key: string]: undefined | API_FUNCTION | API_DECLARATION,
}

// A type that represents the deep keys of an API_DECLARATION
export type DeepKeys<K extends API_DECLARATION> = { [E in keyof K]: E extends string ?
    K[E] extends API_DECLARATION ? `${E}.${DeepKeys<K[E]>}` : (E extends `$${string}` ? never : K[E] extends API_FUNCTION ? E : never)
    : never
}[keyof K];

// A type that represents the deep value of an API_DECLARATION based on a given key
export type DeepValue<K extends string, G extends API_DECLARATION> = K extends `${infer Head}.${infer Tail}` ?
    G[Head] extends API_DECLARATION ? DeepValue<Tail, G[Head]> : never
    : (G[K] extends API_FUNCTION ? G[K] : never);

export type FlatAPI<K extends API_DECLARATION> = {
    [E in DeepKeys<K>]: DeepValue<E, K>
}

// A type that removes the first element from a tuple
type OmitFirst<T extends unknown[]> = T extends [unknown, ...infer R] ? R : never;

// A type that represents the parameters of an API function based on a given key
export type ParametersAPI<K extends DeepKeys<A>, A extends API_DECLARATION> = OmitFirst<Parameters<DeepValue<K, A>>>;
// A type that represents the return value of an API function based on a given key
export type ValuesAPI<K extends DeepKeys<A>, A extends API_DECLARATION> = ReturnType<DeepValue<K, A>>;

// Recursively loads the head of an API
function loadApiHeadRecursive<A extends API_DECLARATION>(api: A, path = ""){
    const toReturn : string[] = [];
    
    for(const key in api){
        const next = api[key];
        if (typeof next == "function") toReturn.push(`${path}${key}`);
        else if (typeof next == "object") toReturn.push(...loadApiHeadRecursive(next, `${path}${key}.`));
    }

    return toReturn as DeepKeys<A>[];
}

// Get all nested key for api given
export function apiHead<A extends API_DECLARATION>(api: A): DeepKeys<A>[] {
    return loadApiHeadRecursive(api);
}