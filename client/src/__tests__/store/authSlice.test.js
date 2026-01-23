import { describe, it, expect } from "vitest";
import authReducer, {
  setCredentials,
  logout,
} from "../../store/slices/authSlice";

describe("authSlice", () => {
  const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
  };

  it("should handle setCredentials", () => {
    const payload = {
      user: { id: 1, email: "test@example.com", fullName: "Test User" },
      token: "test-token",
    };

    const actual = authReducer(initialState, setCredentials(payload));
    expect(actual.user).toEqual(payload.user);
    expect(actual.token).toBe(payload.token);
    expect(actual.isAuthenticated).toBe(true);
  });

  it("should handle logout", () => {
    const authenticatedState = {
      user: { id: 1, email: "test@example.com" },
      token: "test-token",
      isAuthenticated: true,
    };

    const actual = authReducer(authenticatedState, logout());
    expect(actual.isAuthenticated).toBe(false);
  });
});
