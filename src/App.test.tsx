/**
 * @file App.test.tsx
 * @description Test suite for the App component (Logomaro logo generator).
 *
 * @features
 * - Tests rendering of header, filter tabs, and AI input
 * - Tests filter tab switching
 * - Tests logo grid rendering
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from './test/utils';
import userEvent from '@testing-library/user-event';
import { App } from './App';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Props = { children?: any; [key: string]: any };

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    div: ({ children, layout, ...props }: Props) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: Props) => <span {...props}>{children}</span>,
    path: ({ children, ...props }: Props) => <path {...props}>{children}</path>,
    circle: ({ children, ...props }: Props) => <circle {...props}>{children}</circle>,
    polygon: ({ children, ...props }: Props) => <polygon {...props}>{children}</polygon>,
    rect: ({ children, ...props }: Props) => <rect {...props}>{children}</rect>,
    g: ({ children, ...props }: Props) => <g {...props}>{children}</g>,
  },
  AnimatePresence: ({ children }: Props) => <>{children}</>,
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the app with header', () => {
    render(<App />);
    expect(screen.getByText('Logomaro')).toBeInTheDocument();
    expect(screen.getByText(/Brand Mark Exploration/)).toBeInTheDocument();
  });

  it('should render filter tabs', () => {
    render(<App />);
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Static')).toBeInTheDocument();
    expect(screen.getByText('Dynamic')).toBeInTheDocument();
    expect(screen.getByText('AI Gen')).toBeInTheDocument();
  });

  it('should render AI input field', () => {
    render(<App />);
    expect(
      screen.getByPlaceholderText(/enter words to steer ai synthesis/i)
    ).toBeInTheDocument();
  });

  it('should render the GENERATE button', () => {
    render(<App />);
    expect(screen.getByText('GENERATE')).toBeInTheDocument();
  });

  it('should render logo cards', () => {
    render(<App />);
    // Should render at least some logo cards (the initial 30)
    const conceptLabels = screen.getAllByText(/Concept/i);
    expect(conceptLabels.length).toBeGreaterThan(0);
  });

  it('should switch filter when tab is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    const staticTab = screen.getByText('Static');
    await user.click(staticTab);

    // After clicking Static, the section header should show "Static Iterations"
    await waitFor(() => {
      expect(screen.getByText('Static Iterations')).toBeInTheDocument();
    });
  });

  it('should display memory buffer info', () => {
    render(<App />);
    expect(screen.getByText(/MEMORY BUFFER/i)).toBeInTheDocument();
  });

  it('should display footer', () => {
    render(<App />);
    expect(screen.getByText(/Logo for Crypto/i)).toBeInTheDocument();
  });
});
