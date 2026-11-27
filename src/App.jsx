import { useEffect, useState } from "react";
import { expenseRepository } from "./repositories/expenseRepository";
import { budgetRepository } from "./repositories/budgetRepository";
import { sortExpenses } from "./strategies/expenseSortStrategies";
import "./App.css";

// 오늘 날짜 가져오기
function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function App({ user }) {
  const today = getToday();

  // 조회할 월
  const [selectedMonth, setSelectedMonth] = useState(today.slice(0, 7));

  // Strategy 패턴: 지출 정렬 방식
  const [sortOrder, setSortOrder] = useState("newest");

  // 지출 입력값
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("식비");
  const [description, setDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState(today);

  // Firestore 지출 데이터
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Firestore 월별 예산 데이터
  const [budgets, setBudgets] = useState({});
  const [budgetInput, setBudgetInput] = useState("300000");
  const [budgetLoading, setBudgetLoading] = useState(true);
  const [budgetSaving, setBudgetSaving] = useState(false);
  const [budgetError, setBudgetError] = useState("");
  const [budgetLoadError, setBudgetLoadError] = useState("");
  const [budgetMessage, setBudgetMessage] = useState("");

  // Firestore에서 지출 내역 불러오기
  useEffect(() => {
    let active = true;

    const loadExpenses = async () => {
      setLoading(true);
      setLoadError("");
      setExpenses([]);

      try {
        const data = await expenseRepository.getAll(user.uid);

        if (active) {
          setExpenses(data);
        }
      } catch (err) {
        console.error("지출 조회 실패:", err);

        if (active) {
          setLoadError(
            "지출 내역을 불러오지 못했습니다. Firebase 설정을 확인해주세요.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadExpenses();

    return () => {
      active = false;
    };
  }, [user.uid]);

  // Firestore에서 월별 예산 불러오기
  useEffect(() => {
    let active = true;

    const loadBudgets = async () => {
      setBudgetLoading(true);
      setBudgetLoadError("");

      try {
        const data = await budgetRepository.getAll(user.uid);

        if (active) {
          setBudgets(data);
        }
      } catch (err) {
        console.error("예산 조회 실패:", err);

        if (active) {
          setBudgetLoadError(
            "예산을 불러오지 못했습니다. Firebase 설정을 확인해주세요.",
          );
        }
      } finally {
        if (active) {
          setBudgetLoading(false);
        }
      }
    };

    loadBudgets();

    return () => {
      active = false;
    };
  }, [user.uid]);

  // 선택한 월의 예산을 입력창에 표시
  useEffect(() => {
    setBudgetInput(String(budgets[selectedMonth] ?? 300000));
  }, [selectedMonth, budgets]);

  // 선택한 월의 예산
  const monthlyBudget = budgets[selectedMonth] ?? 300000;

  // Strategy 패턴 적용: 선택한 정렬 방식으로 지출 정렬
  const monthlyExpenses = sortExpenses(
    expenses.filter((expense) => expense.date.slice(0, 7) === selectedMonth),
    sortOrder,
  );

  // 총지출 계산
  const totalExpense = monthlyExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );

  // 남은 예산 계산
  const remainingBudget = monthlyBudget - totalExpense;

  // 금액을 원화로 표시
  const formatWon = (value) => {
    return value.toLocaleString("ko-KR") + "원";
  };

  // 지출 입력창 초기화
  const resetForm = (month = selectedMonth) => {
    setAmount("");
    setCategory("식비");
    setDescription("");
    setExpenseDate(month === today.slice(0, 7) ? today : `${month}-01`);
    setEditingId(null);
    setError("");
  };

  // 조회할 월 변경
  const handleMonthChange = (event) => {
    const month = event.target.value;

    if (!month) return;

    setSelectedMonth(month);
    setBudgetError("");
    setBudgetMessage("");
    resetForm(month);
  };

  // 월별 예산 Firestore 저장
  const handleSaveBudget = async (event) => {
    event.preventDefault();

    if (budgetLoading || budgetSaving || budgetLoadError) {
      return;
    }

    const newBudget = Number(budgetInput);

    if (
      budgetInput.trim() === "" ||
      !Number.isSafeInteger(newBudget) ||
      newBudget <= 0
    ) {
      setBudgetError("올바른 예산 금액을 입력해주세요.");
      setBudgetMessage("");
      return;
    }

    setBudgetSaving(true);
    setBudgetError("");
    setBudgetMessage("");

    try {
      await budgetRepository.save(user.uid, selectedMonth, newBudget);

      setBudgets((prevBudgets) => ({
        ...prevBudgets,
        [selectedMonth]: newBudget,
      }));

      setBudgetMessage("예산이 Firebase에 저장되었습니다.");
    } catch (err) {
      console.error("예산 저장 실패:", err);
      setBudgetError(
        "예산 저장에 실패했습니다. Firebase 권한과 인터넷 연결을 확인해주세요.",
      );
    } finally {
      setBudgetSaving(false);
    }
  };

  // 지출 추가 및 수정
  const handleSaveExpense = async (event) => {
    event.preventDefault();

    if (saving || deletingId !== null || loading || loadError) {
      return;
    }

    const expenseAmount = Number(amount);

    if (
      amount.trim() === "" ||
      !Number.isSafeInteger(expenseAmount) ||
      expenseAmount <= 0
    ) {
      setError("올바른 지출 금액을 입력해주세요.");
      return;
    }

    if (description.trim() === "") {
      setError("지출 내용을 입력해주세요.");
      return;
    }

    if (!expenseDate || expenseDate.slice(0, 7) !== selectedMonth) {
      setError("선택한 월에 해당하는 날짜를 입력해주세요.");
      return;
    }

    const expenseData = {
      amount: expenseAmount,
      category,
      description: description.trim(),
      date: expenseDate,
    };

    setSaving(true);
    setError("");

    try {
      if (editingId !== null) {
        // 기존 지출 Firestore 수정
        await expenseRepository.update(user.uid, editingId, expenseData);

        setExpenses((prevExpenses) =>
          prevExpenses.map((expense) =>
            expense.id === editingId ? { ...expense, ...expenseData } : expense,
          ),
        );
      } else {
        // 새로운 지출 Firestore 추가
        const newId = await expenseRepository.add(user.uid, expenseData);

        setExpenses((prevExpenses) => [
          {
            id: newId,
            ...expenseData,
          },
          ...prevExpenses,
        ]);
      }

      resetForm();
    } catch (err) {
      console.error("지출 저장 실패:", err);
      setError("지출 저장에 실패했습니다. Firebase 설정을 확인해주세요.");
    } finally {
      setSaving(false);
    }
  };

  // 지출 수정 시작
  const handleEditExpense = (expense) => {
    setEditingId(expense.id);
    setAmount(String(expense.amount));
    setCategory(expense.category);
    setDescription(expense.description);
    setExpenseDate(expense.date);
    setError("");
  };

  // 지출 삭제
  const handleDeleteExpense = async (id) => {
    if (saving || deletingId !== null) return;

    setDeletingId(id);
    setError("");

    try {
      await expenseRepository.remove(user.uid, id);

      setExpenses((prevExpenses) =>
        prevExpenses.filter((expense) => expense.id !== id),
      );

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      console.error("지출 삭제 실패:", err);
      setError("지출 삭제에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main>
      <h1>💰 Campus Wallet</h1>
      <p>대학생을 위한 생활비 관리 서비스</p>
      <hr />
      <h2>조회할 월 선택</h2>
      <label htmlFor="selectedMonth">조회 월</label>
      <br />
      <input
        id="selectedMonth"
        type="month"
        value={selectedMonth}
        onChange={handleMonthChange}
        disabled={budgetSaving}
      />
      <hr />
      <h2>{selectedMonth} 생활비 현황</h2>
      {budgetLoading ? (
        <p>예산을 불러오는 중입니다...</p>
      ) : (
        <>
          <p>월 예산: {formatWon(monthlyBudget)}</p>
          <p>월 지출: {formatWon(totalExpense)}</p>
          <p>남은 예산: {formatWon(remainingBudget)}</p>
        </>
      )}
      <hr />
      <h2>월별 예산 설정</h2>
      <form onSubmit={handleSaveBudget}>
        <label htmlFor="budget">{selectedMonth} 예산</label>
        <br />
        <input
          id="budget"
          type="number"
          min="1"
          step="1"
          value={budgetInput}
          disabled={budgetLoading || budgetSaving || Boolean(budgetLoadError)}
          onChange={(event) => {
            setBudgetInput(event.target.value);
            setBudgetError("");
            setBudgetMessage("");
          }}
        />{" "}
        <button
          type="submit"
          disabled={budgetLoading || budgetSaving || Boolean(budgetLoadError)}
        >
          {budgetSaving ? "예산 저장 중..." : "예산 변경하기"}
        </button>
        {budgetLoadError && (
          <p role="alert" style={{ color: "red" }}>
            {budgetLoadError}
          </p>
        )}
        {budgetError && (
          <p role="alert" style={{ color: "red" }}>
            {budgetError}
          </p>
        )}
        {budgetMessage && (
          <p role="status" style={{ color: "green" }}>
            {budgetMessage}
          </p>
        )}
      </form>
      <hr />
      <h2>{editingId !== null ? "지출 수정하기" : "지출 추가하기"}</h2>
      <form onSubmit={handleSaveExpense}>
        <div>
          <label htmlFor="expenseDate">지출 날짜</label>

          <br />

          <input
            id="expenseDate"
            type="date"
            value={expenseDate}
            onChange={(event) => setExpenseDate(event.target.value)}
          />
        </div>

        <br />

        <div>
          <label htmlFor="amount">지출 금액</label>

          <br />

          <input
            id="amount"
            type="number"
            min="1"
            step="1"
            placeholder="예: 6000"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </div>

        <br />

        <div>
          <label htmlFor="category">카테고리</label>

          <br />

          <select
            id="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="식비">식비</option>
            <option value="카페">카페</option>
            <option value="교통">교통</option>
            <option value="쇼핑">쇼핑</option>
            <option value="기타">기타</option>
          </select>
        </div>

        <br />

        <div>
          <label htmlFor="description">지출 내용</label>

          <br />

          <input
            id="description"
            type="text"
            placeholder="예: 점심 식사"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <br />

        {error && (
          <p role="alert" style={{ color: "red" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={
            saving || deletingId !== null || loading || Boolean(loadError)
          }
        >
          {saving
            ? "저장 중..."
            : editingId !== null
              ? "수정 저장"
              : "+ 지출 추가하기"}
        </button>

        {editingId !== null && (
          <>
            {" "}
            <button type="button" disabled={saving} onClick={() => resetForm()}>
              수정 취소
            </button>
          </>
        )}
      </form>
      <hr />
      <h2>{selectedMonth} 지출 내역</h2>
      {/* Strategy 패턴: 정렬 방식 선택 */}
      <label htmlFor="sortOrder">정렬 방식</label>{" "}
      <select
        id="sortOrder"
        value={sortOrder}
        onChange={(event) => setSortOrder(event.target.value)}
      >
        <option value="newest">최신 날짜순</option>
        <option value="oldest">오래된 날짜순</option>
        <option value="highest">금액 높은 순</option>
        <option value="lowest">금액 낮은 순</option>
      </select>
      <br />
      <br />
      {loading ? (
        <p role="status">지출 내역을 불러오는 중입니다...</p>
      ) : loadError ? (
        <p role="alert" style={{ color: "red" }}>
          {loadError}
        </p>
      ) : monthlyExpenses.length === 0 ? (
        <p>해당 월에 등록된 지출 내역이 없습니다.</p>
      ) : (
        <ul>
          {monthlyExpenses.map((expense) => (
            <li key={expense.id}>
              {expense.date}
              {" | "}
              {expense.category}
              {" - "}
              {expense.description}
              {" : "}
              {formatWon(expense.amount)}{" "}
              <button
                type="button"
                disabled={saving || deletingId !== null}
                onClick={() => handleEditExpense(expense)}
              >
                수정
              </button>{" "}
              <button
                type="button"
                disabled={saving || deletingId !== null}
                onClick={() => handleDeleteExpense(expense.id)}
              >
                {deletingId === expense.id ? "삭제 중..." : "삭제"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default App;
