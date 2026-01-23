import { describe, it, expect } from 'vitest';
import authReducer, { setUser, setToken, logout } from '../../store/slices/authSlice';

describe('authSlice', () => {
  const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
  };

  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setUser', () => {
    const user = {
      id: 1,
      email: 'test@example.com',
      fullName: 'Test User',
    };

    const actual = authReducer(initialState, setUser(user));
    expect(actual.user).toEqual(user);
    expect(actual.isAuthenticated).toBe(true);
  });

  it('should handle setToken', () => {
    const token = 'test-jwt-token';
    const actual = authReducer(initialState, setToken(token));
    expect(actual.token).toBe(token);
  });

  it('should handle logout', () => {
    const authenticatedState = {
      user: { id: 1, email: 'test@example.com' },
      token: 'test-token',
      isAuthenticated: true,
    };

    const actual = authReducer(authenticatedState, logout());
    expect(actual).toEqual(initialState);
  });

  it('should maintain state immutability', () => {
    const state = { ...initialState };
    const user = { id: 1, email: 'test@example.com' };
    
    authReducer(state, setUser(user));
    
    // Original state should not be modified
    expect(state).toEqual(initialState);
  });
});
