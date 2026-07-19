import { describe, it, expect, vi, beforeEach } from 'vitest';
import { populate } from './populate';
import * as firestore from 'firebase/firestore';

// Mock firebase/firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
}));

// Mock the firebase module
vi.mock('./firebase', () => ({
  db: {},
}));

describe('populate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(firestore.collection).mockReturnValue(
      {} as unknown as ReturnType<typeof firestore.collection>
    );
    vi.mocked(firestore.addDoc).mockResolvedValue({ id: 'test-id' } as unknown as Awaited<
      ReturnType<typeof firestore.addDoc>
    >);
  });

  it('should add mock data to Firestore', async () => {
    const mockCol = {};
    vi.mocked(firestore.collection).mockReturnValue(
      mockCol as unknown as ReturnType<typeof firestore.collection>
    );

    await populate();

    expect(firestore.collection).toHaveBeenCalledWith({}, 'items');
    expect(firestore.addDoc).toHaveBeenCalledTimes(2);
    expect(firestore.addDoc).toHaveBeenCalledWith(mockCol, {
      title: 'First item',
      createdAt: expect.any(Number),
    });
    expect(firestore.addDoc).toHaveBeenCalledWith(mockCol, {
      title: 'Second item',
      createdAt: expect.any(Number),
    });
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('Firestore error');
    vi.mocked(firestore.addDoc).mockRejectedValue(error);

    await expect(populate()).rejects.toThrow('Firestore error');
  });
});
