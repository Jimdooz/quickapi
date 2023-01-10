import type { API_DECLARATION, DeepKeys, ParametersAPI, ValuesAPI } from "./api.ts";

/**
 * Initialize the API with a callback function that will handle the communication
 * @param job - Callback function that will handle the communication
 * @returns - A function that can be used to call the API
 */
export function initAPI<A extends API_DECLARATION>(job: (key: string, ...params: any[]) => any) {
    return {
        /**
         * Call the API with a key and parameters
         * @param key - The key of the endpoint to call
         * @param params - The parameters to pass to the endpoint
         * @returns A promise that resolves with the result of the API call
         */
        callAPI<K extends DeepKeys<A>, P extends ParametersAPI<K, A>>(key: K, ...params: P): Promise<ValuesAPI<K, A>> {
            return job(key, ...params);
        }
    }
}