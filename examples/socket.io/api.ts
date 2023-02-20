import type { API_DECLARATION } from "https://deno.land/x/quickapi/mod.ts";

export default {
    add(req, a: number, b: number) {
        return a + b;
    },
    advanced: {
        multiply(req, c: number, d: number) {
            return c * d;
        }
    }
} as const satisfies API_DECLARATION;