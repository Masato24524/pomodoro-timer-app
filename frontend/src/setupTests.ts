import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { APIServer } from "./component/__tests__/server";

beforeAll(() => APIServer.listen());
afterAll(() => APIServer.close());
afterEach(() => APIServer.resetHandlers());
