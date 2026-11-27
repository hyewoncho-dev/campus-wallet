import {
  collection,
  doc,
  getDocs,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/config";

// 로그인한 사용자의 월별 예산 저장 공간
const getBudgetCollection = (userId) => {
  return collection(db, "users", userId, "budgets");
};

// Repository 패턴: 예산 데이터 관리
export const budgetRepository = {
  // 1. 저장된 모든 월별 예산 불러오기
  async getAll(userId) {
    const snapshot = await getDocs(getBudgetCollection(userId));

    const budgets = {};

    snapshot.docs.forEach((document) => {
      budgets[document.id] = document.data().amount;
    });

    return budgets;
  },

  // 2. 월별 예산 저장 또는 수정
  async save(userId, month, amount) {
    const budgetDoc = doc(db, "users", userId, "budgets", month);

    await setDoc(budgetDoc, {
      amount,
      updatedAt: serverTimestamp(),
    });
  },
};
