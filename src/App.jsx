import { useState } from "react";
import "./App.css";

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환
function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function App() {
  const today = getToday();

  // 조회할 월
  const [selectedMonth, setSelectedMonth] = useState(today.slice(0, 7));

  // 지출 입력값
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("식비");
  const [description, setDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState(today);

  // 지출 목록과 오류
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  // 월별 예산 관리
  const [budgets, setBudgets] = useState({});
  const [budgetInput, setBudgetInput] = useState("300000");
  const [budgetError, setBudgetError] = useState("");
  const [budgetMessage, setBudgetMessage] = useState("");

  // 선택한 월의 예산 (기본값 30만 원)
  const monthlyBudget = budgets[selectedMonth] ?? 300000;

  // 선택한 월에 해당하는 지출만 조회
  const monthlyExpenses = expenses
    .filter((expense) => expense.date.slice(0, 7) === selectedMonth)
    .sort((a, b) => b.date.localeCompare(a.date));

  // 선택한 월의 총지출
  const totalExpense = monthlyExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );

  // 남은 예산
  const remainingBudget = monthlyBudget - totalExpense;

  // 금액 표시
  const formatWon = (value) => {
    return value.toLocaleString("ko-KR") + "원";
  };

  // 입력창 초기화
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
    setBudgetInput(String(budgets[month] ?? 300000));
    setBudgetError("");
    setBudgetMessage("");
    resetForm(month);
  };

  // 월별 예산 저장
  const handleSaveBudget = (event) => {
    event.preventDefault();

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

    setBudgets((prevBudgets) => ({
      ...prevBudgets,
      [selectedMonth]: newBudget,
    }));

    setBudgetError("");
    setBudgetMessage("예산이 변경되었습니다.");
  };

  // 지출 추가 및 수정
  const handleSaveExpense = (event) => {
    event.preventDefault();

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

    if (editingId !== null) {
      // 기존 지출 수정
      setExpenses((prevExpenses) =>
        prevExpenses.map((expense) =>
          expense.id === editingId ? { ...expense, ...expenseData } : expense,
        ),
      );
    } else {
      // 새 지출 추가
      const newExpense = {
        id: crypto.randomUUID(),
        ...expenseData,
      };

      setExpenses((prevExpenses) => [newExpense, ...prevExpenses]);
    }

    resetForm();
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
  const handleDeleteExpense = (id) => {
    setExpenses((prevExpenses) =>
      prevExpenses.filter((expense) => expense.id !== id),
    );

    if (editingId === id) {
      resetForm();
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
      />

      <hr />

      <h2>{selectedMonth} 생활비 현황</h2>

      <p>월 예산: {formatWon(monthlyBudget)}</p>
      <p>월 지출: {formatWon(totalExpense)}</p>
      <p>남은 예산: {formatWon(remainingBudget)}</p>

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
          onChange={(event) => {
            setBudgetInput(event.target.value);
            setBudgetError("");
            setBudgetMessage("");
          }}
        />{" "}
        <button type="submit">예산 변경하기</button>
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

        <button type="submit">
          {editingId !== null ? "수정 저장" : "+ 지출 추가하기"}
        </button>

        {editingId !== null && (
          <>
            {" "}
            <button type="button" onClick={() => resetForm()}>
              수정 취소
            </button>
          </>
        )}
      </form>

      <hr />

      <h2>{selectedMonth} 지출 내역</h2>

      {monthlyExpenses.length === 0 ? (
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
              <button type="button" onClick={() => handleEditExpense(expense)}>
                수정
              </button>{" "}
              <button
                type="button"
                onClick={() => handleDeleteExpense(expense.id)}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default App;
