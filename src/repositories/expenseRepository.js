import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/config";

// 로그인한 사용자별 지출 컬렉션
const getExpenseCollection = (userId) => {
  return collection(db, "users", userId, "transactions");
};

// Repository 패턴
export const expenseRepository = {
  // 1. 지출 내역 조회
  async getAll(userId) {
    const snapshot = await getDocs(getExpenseCollection(userId));

    return snapshot.docs.map((document) => ({
      ...document.data(),
      id: document.id,
    }));
  },

  // 2. 지출 내역 추가
  async add(userId, expense) {
    const docRef = await addDoc(getExpenseCollection(userId), {
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expense.date,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  },

  // 3. 지출 내역 수정
  async update(userId, expenseId, expense) {
    const docRef = doc(db, "users", userId, "transactions", expenseId);

    await updateDoc(docRef, {
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expense.date,
    });
  },

  // 4. 지출 내역 삭제
  async remove(userId, expenseId) {
    const docRef = doc(db, "users", userId, "transactions", expenseId);

    await deleteDoc(docRef);
  },
};
