import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

type MockItem = { title: string; createdAt: number };

const MOCK_DATA: MockItem[] = [
  { title: 'First item', createdAt: Date.now() },
  { title: 'Second item', createdAt: Date.now() },
];

export async function populate() {
  const col = collection(db, 'items');
  for (const item of MOCK_DATA) {
    await addDoc(col, item);
  }
  console.log('✅ Mock data populated');
}
