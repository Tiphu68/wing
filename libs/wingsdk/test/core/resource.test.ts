import { Construct } from "constructs";
import { describe, test, expect } from "vitest";
import { Resource } from "../../src/std";
import { SimApp } from "../sim-app";

describe("resource _addOnLift", () => {
  const inflightOps = ["op1", "op2"];
  class Example extends Resource {
    public _supportedOps() {
      return inflightOps;
    }
    public _toInflight() {
      return "inflight";
    }
  }
  class ExampleAbstract extends Resource {
    constructor(scope: Construct, id: string) {
      if (new.target === ExampleAbstract) {
        Resource._newFromFactory("fqn", scope, id);
      }
      super(scope, id);
    }
  }
  test("adding supported ops to host should succeed", () => {
    const app = new SimApp();
    const example = new Example(app, "example");
    expect(
      // @ts-expect-error - accessing private method
      example._addOnLift(new Example(app, "host"), ["op1"])
    ).toBeUndefined();
  });

  test("adding non supported op to host should cause an error", () => {
    const app = new SimApp();
    const example = new Example(app, "example");

    expect(() =>
      // @ts-expect-error - accessing private method
      example._addOnLift(new Example(app, "host"), ["nonExistentOp"])
    ).toThrow(
      `Resource root/example does not support inflight operation nonExistentOp (requested by root/host).\nIt might not be implemented yet.`
    );
  });

  test("creating a resource outside an app should cause an error", () => {
    const notApp = new Construct(undefined as any, "notApp");

    expect(() => new ExampleAbstract(notApp, "example")).toThrow(
      `This is an abstract class and can only be instantiated in the scope of a Wing App`
    );
  });
});
