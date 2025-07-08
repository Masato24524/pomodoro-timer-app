import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach, afterEach } from "vitest";
import Timer from "../Timer/Timer";
import userEvent from "@testing-library/user-event";
import { act } from "react";

beforeEach(() => {
  // fetchをモック化
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            { subtask_name: "mock data1", subtask_totaltime: 300 },
            { subtask_name: "mock data2", subtask_totaltime: 600 },
          ],
        }),
    })
  ) as any;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Timer", () => {
  test("タイマーコンポーネントが正常にレンダリングされる", () => {
    render(<Timer />);
    // screen.debug();
    expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("サブタスクを追加する")
    ).toBeInTheDocument();
  });

  test("ボタンの存在確認", () => {
    render(<Timer />);
    // Startボタンを探す（複数の方法で）
    const startButton1 = screen.queryByText("Start");
    const startButton2 = screen.queryByRole("button", { name: "Start" });
    const allButtons = screen.getAllByRole("button");

    // console.log("Start (text):", startButton1);
    // console.log("Start (role):", startButton2);
    console.log(
      "全ボタン:",
      allButtons.map((btn) => btn.textContent)
    );
  });
});

test("Startボタンを押すと、タイマーがスタートする", async () => {
  render(<Timer />);

  expect(screen.getByText("Start")).toBeInTheDocument();

  // 初期状態を確認
  expect(screen.getByText("25:00")).toBeInTheDocument();

  const startButton = screen.getByText("Start");
  fireEvent.click(startButton);

  // 短時間で複数回チェック
  await new Promise((resolve) => setTimeout(resolve, 1100));
  expect(screen.getByText("24:59")).toBeInTheDocument();

  await new Promise((resolve) => setTimeout(resolve, 1000));
  expect(screen.getByText("24:58")).toBeInTheDocument();

  screen.debug();
});

// タイマーをリセット
vi.useRealTimers();
