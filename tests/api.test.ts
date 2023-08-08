import { assertEquals } from "https://deno.land/std@0.197.0/testing/asserts.ts";
import { API_DECLARATION, apiHead } from "../api.ts";

Deno.test("apiHead", () => {

    const api = {
        func1: () => { },
        $beforeAll: () => { },
        group1: {
            func2: () => { },
        },
    } as const satisfies API_DECLARATION;

    assertEquals(apiHead(api), ["func1", "$beforeAll", "group1.func2"]);

});