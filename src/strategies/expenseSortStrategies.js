/**
 * Strategy 패턴
 * 지출 내역을 정렬하는 여러 알고리즘을 분리한다.
 */

// 정렬 전략 모음
export const expenseSortStrategies = {
  // 최신 날짜순
  newest: (a, b) => b.date.localeCompare(a.date),

  // 오래된 날짜순
  oldest: (a, b) => a.date.localeCompare(b.date),

  // 금액 높은 순
  highest: (a, b) => b.amount - a.amount,

  // 금액 낮은 순
  lowest: (a, b) => a.amount - b.amount,
};

// 사용자가 선택한 전략으로 정렬
export function sortExpenses(expenses, strategy = "newest") {
  const compare =
    expenseSortStrategies[strategy] ?? expenseSortStrategies.newest;

  // 원본 배열을 변경하지 않고 정렬
  return [...expenses].sort(compare);
}
