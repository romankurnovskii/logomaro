import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from './test/utils';
import userEvent from '@testing-library/user-event';
import App from './App';
import { mockQuerySnapshot } from './test/mocks/firebase';
import * as firestore from 'firebase/firestore';
import * as populateModule from './helpers/populate';

// Mock firebase/firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
}));

// Mock the firebase helpers
vi.mock('./helpers/firebase', () => ({
  db: {},
}));

vi.mock('./helpers/populate', () => ({
  populate: vi.fn(() => Promise.resolve()),
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the app with header', () => {
    vi.mocked(firestore.getDocs).mockResolvedValue(
      mockQuerySnapshot([]) as unknown as Awaited<ReturnType<typeof firestore.getDocs>>
    );

    render(<App />);

    expect(screen.getByText('Firestore Items')).toBeInTheDocument();
    expect(
      screen.getByText('Seed mock data and view your collection below.')
    ).toBeInTheDocument();
  });

  it('should show loading state initially', async () => {
    // Delay the response to test loading state
    vi.mocked(firestore.getDocs).mockImplementation(
      () =>
        new Promise<Awaited<ReturnType<typeof firestore.getDocs>>>((resolve) => {
          setTimeout(
            () =>
              resolve(
                mockQuerySnapshot([]) as unknown as Awaited<
                  ReturnType<typeof firestore.getDocs>
                >
              ),
            100
          );
        })
    );

    render(<App />);

    // Should show loading message when fetching and no items
    await waitFor(() => {
      expect(screen.getByText('Loading items…')).toBeInTheDocument();
    });
  });

  it('should display "No items yet" when collection is empty', async () => {
    vi.mocked(firestore.getDocs).mockResolvedValue(
      mockQuerySnapshot([]) as unknown as Awaited<ReturnType<typeof firestore.getDocs>>
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('No items yet.')).toBeInTheDocument();
    });
  });

  it('should display items when they exist', async () => {
    const mockItems = [
      {
        id: '1',
        data: { title: 'First item', createdAt: Date.now() },
      },
      {
        id: '2',
        data: { title: 'Second item', createdAt: Date.now() },
      },
    ];

    vi.mocked(firestore.getDocs).mockResolvedValue(
      mockQuerySnapshot(mockItems) as unknown as Awaited<ReturnType<typeof firestore.getDocs>>
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('First item')).toBeInTheDocument();
      expect(screen.getByText('Second item')).toBeInTheDocument();
    });
  });

  it('should call populate when seed button is clicked', async () => {
    const user = userEvent.setup();

    vi.mocked(firestore.getDocs).mockResolvedValue(
      mockQuerySnapshot([]) as unknown as Awaited<ReturnType<typeof firestore.getDocs>>
    );

    render(<App />);

    const seedButton = screen.getByRole('button', { name: /seed mock data/i });
    await user.click(seedButton);

    await waitFor(() => {
      expect(populateModule.populate).toHaveBeenCalled();
    });
  });

  it('should disable seed button while seeding', async () => {
    const user = userEvent.setup();

    // Make populate take some time
    let resolvePopulate: () => void;
    const populatePromise = new Promise<void>((resolve) => {
      resolvePopulate = resolve;
    });
    vi.mocked(populateModule.populate).mockImplementation(() => populatePromise);

    vi.mocked(firestore.getDocs).mockResolvedValue(
      mockQuerySnapshot([]) as unknown as Awaited<ReturnType<typeof firestore.getDocs>>
    );

    render(<App />);

    const seedButton = screen.getByRole('button', { name: /seed mock data/i });
    await user.click(seedButton);

    // Button should be disabled and show "Seeding…" while populate is running
    await waitFor(() => {
      expect(seedButton).toBeDisabled();
      expect(screen.getByText('Seeding…')).toBeInTheDocument();
    });

    // Resolve populate to complete the test
    resolvePopulate!();
    await populatePromise;
  });

  it('should fetch items after populating', async () => {
    const user = userEvent.setup();

    // Set up mocks: first call returns empty, subsequent calls return with item
    let callCount = 0;
    vi.mocked(firestore.getDocs).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(
          mockQuerySnapshot([]) as unknown as Awaited<ReturnType<typeof firestore.getDocs>>
        );
      }
      return Promise.resolve(
        mockQuerySnapshot([
          { id: '1', data: { title: 'New item', createdAt: Date.now() } },
        ]) as unknown as Awaited<ReturnType<typeof firestore.getDocs>>
      );
    });

    render(<App />);

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(screen.getByText('No items yet.')).toBeInTheDocument();
    });

    const seedButton = screen.getByRole('button', { name: /seed mock data/i });
    await user.click(seedButton);

    await waitFor(
      () => {
        expect(screen.getByText('New item')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should handle fetch errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(firestore.getDocs).mockRejectedValue(new Error('Fetch failed'));

    render(<App />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });
});
