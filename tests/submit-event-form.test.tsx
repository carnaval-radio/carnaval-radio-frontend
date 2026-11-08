// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import SubmitEventForm from "@/components/Events/SubmitEventForm";
import { useEffect } from "react";

vi.mock("next/script", () => ({
  default: function MockScript({ onReady, onError }: { onReady: () => void; onError: () => void }) {
    useEffect(() => { onReady(); }, [onReady]);
    return <button type="button" onClick={onError}>Simulate script error</button>;
  },
}));

let complete: (token: string) => void;
let expire: () => void;
let challengeError: () => void;

beforeEach(() => {
  window.turnstile = {
    render: vi.fn((_container, options) => {
      complete = options.callback;
      expire = options["expired-callback"];
      challengeError = options["error-callback"];
      return "widget";
    }),
    reset: vi.fn(),
    remove: vi.fn(),
  };
});

function fillForm() {
  fireEvent.change(screen.getByLabelText("Naam evenement"), { target: { value: "Feestavond" } });
  fireEvent.change(screen.getByLabelText("Datum en begintijd"), { target: { value: "2027-01-23T19:30" } });
  fireEvent.change(screen.getByLabelText("Locatie en plaats"), { target: { value: "Brikke Oave, Brunssum" } });
}

it("shows a contact fallback when configuration is missing", () => {
  render(<SubmitEventForm siteKey={undefined} />);
  expect(screen.getByRole("link", { name: "Neem contact op" })).toHaveAttribute("href", "/contact");
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});

it("requires a challenge, submits fields and shows moderation confirmation", async () => {
  vi.mocked(fetch).mockResolvedValueOnce(Response.json({ ok: true }, { status: 201 }));
  const { unmount } = render(<SubmitEventForm siteKey="public-site-key" />);
  const button = screen.getByRole("button", { name: "Verstuur ter beoordeling" });
  expect(button).toBeDisabled();
  fillForm();
  fireEvent.click(button);
  expect(fetch).not.toHaveBeenCalled();
  act(() => complete("valid-token"));
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("als concept ontvangen"));
  expect(fetch).toHaveBeenCalledWith("/api/events/submit", expect.objectContaining({
    body: JSON.stringify({
      title: "Feestavond", localDateTime: "2027-01-23T19:30",
      address: "Brikke Oave, Brunssum", link: "", turnstileToken: "valid-token",
    }),
  }));
  expect(window.turnstile?.reset).toHaveBeenCalledWith("widget");
  unmount();
  expect(window.turnstile?.remove).toHaveBeenCalledWith("widget");
});

it("disables submission when the challenge expires", async () => {
  render(<SubmitEventForm siteKey="public-site-key" />);
  act(() => complete("valid"));
  await waitFor(() => expect(screen.getByRole("button", { name: "Verstuur ter beoordeling" })).toBeEnabled());
  act(() => expire());
  await waitFor(() => expect(screen.getByRole("button", { name: "Verstuur ter beoordeling" })).toBeDisabled());
});

it.each([false, true])("preserves fields and reports an unsuccessful submission (network=%s)", async (network) => {
  if (network) vi.mocked(fetch).mockRejectedValueOnce(new Error("offline"));
  else vi.mocked(fetch).mockResolvedValueOnce(Response.json({ ok: false, error: "Opslaan mislukt." }, { status: 502 }));
  render(<SubmitEventForm siteKey="public-site-key" />);
  fillForm();
  act(() => complete("valid"));
  await waitFor(() => expect(screen.getByRole("button", { name: "Verstuur ter beoordeling" })).toBeEnabled());
  fireEvent.click(screen.getByRole("button", { name: "Verstuur ter beoordeling" }));
  await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  expect(screen.getByLabelText("Naam evenement")).toHaveValue("Feestavond");
  expect(screen.getByRole("button", { name: "Verstuur ter beoordeling" })).toBeDisabled();
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});

it("does not send a directly submitted form without a challenge", () => {
  render(<SubmitEventForm siteKey="public-site-key" />);
  const form = screen.getByLabelText("Naam evenement").closest("form");
  if (!form) throw new Error("Missing form");
  fireEvent.submit(form);
  expect(fetch).not.toHaveBeenCalled();
});

it.each(["widget", "script"])("reports %s loading errors", (source) => {
  render(<SubmitEventForm siteKey="public-site-key" />);
  if (source === "widget") act(() => challengeError());
  else fireEvent.click(screen.getByRole("button", { name: "Simulate script error" }));
  expect(screen.getByRole("alert")).toHaveTextContent("spamcontrole kon niet laden");
  expect(screen.getByRole("button", { name: "Verstuur ter beoordeling" })).toBeDisabled();
});
