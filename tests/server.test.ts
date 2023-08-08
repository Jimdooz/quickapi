import { assertEquals } from "https://deno.land/std@0.197.0/testing/asserts.ts";
import { flatAPI, compileAPI } from "../server.ts";
import { API_DECLARATION } from "../api.ts";

Deno.test("flatAPI", async () => {

    const API = {
        add: (_, a: number, b: number) => a + b,
        group1: {
            mul: (_, a: number, b: number) => a * b,
        },
    } satisfies API_DECLARATION;

    const flatApi = flatAPI(API);

    assertEquals(Object.keys(flatApi), ["add", "group1.mul"]);
    assertEquals(await flatApi["add"]({ uid: '0' }, 1, 2), 3);
    assertEquals(await flatApi["group1.mul"]({ uid: '0' }, 1, 2), 2);

});

Deno.test("compileAPI", async () => {

    const API = {
        add: (_, a: number, b: number) => a + b,
        group1: {
            mul: (_, a: number, b: number) => a * b,
        },
    } satisfies API_DECLARATION;

    const api = compileAPI(API);
    
    assertEquals(await api.call("add", { uid: '0' }, 1, 2), 3);
    assertEquals(await api.call("group1.mul", { uid: '0' }, 1, 2), 2);

});

Deno.test("compileAPI call order", async () => {

    const callStack: string[] = [];

    const API = {
        $beforeAll(_){
            callStack.push("$beforeAll_0");
        },
        $before(_) {
            callStack.push("$before_0");
        },
        stack0: (_) => {
            callStack.push("STACK_0");
            return callStack;
        },
        layer0: {
            $beforeAll(_) {
                callStack.push("$beforeAll_1");
            },
            $before(_) {
                callStack.push("$before_1");
            },
            stack1: (_) => {
                callStack.push("STACK_1");
                return callStack;
            },
            $after(_) {
                callStack.push("$after_1");
            },
            $afterAll(_) {
                callStack.push("$afterAll_1");
            },
        },
        $after(_) {
            callStack.push("$after_0");
        },
        $afterAll(_) {
            callStack.push("$afterAll_0");
        },
    } satisfies API_DECLARATION;

    const api = compileAPI(API);

    assertEquals(await api.call("stack0", { uid: '0' }), ["$beforeAll_0", "$before_0", "STACK_0", "$after_0", "$afterAll_0"]);

    callStack.length = 0; // Reset
    assertEquals(await api.call("layer0.stack1", { uid: '0' }), ["$beforeAll_0", "$beforeAll_1", "$before_1", "STACK_1", "$after_1", "$afterAll_1", "$afterAll_0"]);

});