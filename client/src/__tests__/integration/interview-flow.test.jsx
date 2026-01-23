import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import InterviewPage from '../../pages/InterviewPage';
import interviewReducer from '../../store/slices/interviewSlice';
import authReducer from '../../store/slices/authSlice';

// Mock API
vi.mock('../../api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

const createMockStore = () => {
  return configureStore({
    reducer: {
      interview: interviewReducer,
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: { id: 1, email: 'test@example.com' },
        token: 'test-token',
        isAuthenticated: true,
      },
    },
  });
};

const renderWithProviders = (component) => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('Interview Flow Integration Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should complete full interview flow', async () => {
    renderWithProviders(<InterviewPage />);

    // 1. Start interview setup should be visible
    expect(screen.getByText(/start interview/i)).toBeInTheDocument();

    // 2. Fill in interview details
    const roleInput = screen.getByPlaceholderText(/role/i);
    fireEvent.change(roleInput, { target: { value: 'Frontend Developer' } });

    // 3. Start the interview
    const startButton = screen.getByRole('button', { name: /start/i });
    fireEvent.click(startButton);

    // 4. Wait for first question to appear
    await waitFor(() => {
      expect(screen.getByText(/question/i)).toBeInTheDocument();
    });

    // 5. Type and send a message
    const messageInput = screen.getByPlaceholderText(/type your answer/i);
    fireEvent.change(messageInput, { 
      target: { value: 'I have experience with React and Redux' } 
    });

    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    // 6. Verify message was sent
    await waitFor(() => {
      expect(screen.getByText(/I have experience with React and Redux/i)).toBeInTheDocument();
    });
  });

  it('should handle voice input', async () => {
    renderWithProviders(<InterviewPage />);

    // Mock speech recognition
    const mockRecognition = {
      start: vi.fn(),
      stop: vi.fn(),
      addEventListener: vi.fn(),
    };

    global.webkitSpeechRecognition = vi.fn(() => mockRecognition);

    const micButton = screen.getByRole('button', { name: /mic/i });
    fireEvent.click(micButton);

    expect(mockRecognition.start).toHaveBeenCalled();
  });

  it('should end session and show score', async () => {
    renderWithProviders(<InterviewPage />);

    // Simulate having 4+ messages
    localStorage.setItem('messageCount', '5');

    await waitFor(() => {
      const endButton = screen.getByText(/end session/i);
      expect(endButton).toBeInTheDocument();
    });

    const endButton = screen.getByText(/end session/i);
    fireEvent.click(endButton);

    // Should show score modal
    await waitFor(() => {
      expect(screen.getByText(/score/i)).toBeInTheDocument();
      expect(screen.getByText(/feedback/i)).toBeInTheDocument();
    });
  });
});
