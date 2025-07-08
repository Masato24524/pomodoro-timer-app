import { http, HttpResponse } from "msw";

const mockData = {
  subtask_name: "test",
  subtask_totalTime: 100,
};

export const handlers = [
  http.get("https://api/timer-routing/", () => {
    if (mockData) {
      return HttpResponse.json({ mockData, status: 200 });
    } else {
      return HttpResponse.json({ message: "Not Found" }, { status: 404 });
    }
  }),
];
