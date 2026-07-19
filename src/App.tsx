import { useState, useEffect } from 'react';
import { db } from './helpers/firebase';
import { populate } from './helpers/populate';
import { collection, getDocs } from 'firebase/firestore';

interface Item {
  id: string;
  title: string;
  createdAt: number;
}

export default function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [isFetching, setFetching] = useState(true);
  const [isSeeding, setSeeding] = useState(false);

  const fetchItems = async (showLoading = true) => {
    console.log('⏳ fetchItems start');
    if (showLoading) setFetching(true);
    try {
      const snap = await getDocs(collection(db, 'items'));
      console.log('✅ fetchItems got docs:', snap.docs.length);
      setItems(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Item, 'id'>),
        }))
      );
    } catch (err) {
      console.error('❌ fetchItems error', err);
    } finally {
      setFetching(false);
      console.log('⏹️ fetchItems end, isFetching =', false);
    }
  };

  const handlePopulate = async () => {
    console.log('⏳ populate start');
    setSeeding(true);
    try {
      await populate();
      console.log('✅ populate done, now re-fetching');
      await fetchItems();
    } catch (err) {
      console.error('❌ populate error', err);
    } finally {
      setSeeding(false);
      console.log('⏹️ populate end, isSeeding =', false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      fetchItems(false);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <header className="w-full max-w-2xl mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Firestore Items</h1>
        <p className="text-gray-600">Seed mock data and view your collection below.</p>
      </header>

      <main className="w-full max-w-2xl">
        <button
          onClick={handlePopulate}
          disabled={isSeeding}
          className="mb-4 inline-block bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded transition"
        >
          {isSeeding ? 'Seeding…' : 'Seed Mock Data'}
        </button>

        {/* Show a loading message when fetching and no items yet */}
        {isFetching && items.length === 0 && (
          <p className="text-center text-gray-500">Loading items…</p>
        )}

        {/* Once fetch is done, render the list or a “no items” message */}
        {!isFetching && items.length === 0 && (
          <p className="text-center text-gray-500">No items yet.</p>
        )}

        {!isFetching && items.length > 0 && (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center bg-white shadow-sm rounded-lg p-4 hover:shadow-md transition"
              >
                <span className="font-medium text-gray-800">{item.title}</span>
                <span className="text-sm text-gray-500">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
