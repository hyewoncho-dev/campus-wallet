import { useState } from "react";
import "./App.css";

function App() {
  // 입력값 관리
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("식비");
  const [description, setDescription] = useState("");

  // 지출 목록과 오류 메시지
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState("");

  // 수정 중인 지출 ID
  const [editingId, setEditingId] = useState(null);

  // 월 예산 (임시 고정값)
  const monthlyBudget = 300000;

  // 총지출 계산
  const totalExpense = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );

  // 남은 예산 계산
  const remainingBudget = monthlyBudget - totalExpense;

  // 원화 표시 함수
  const formatWon = (value) => {
    return value.toLocaleString("ko-KR") + "원";
  };

  // 입력창 초기화 함수
  const resetForm = () => {
    setAmount("");
    setCategory("식비");
    setDescription("");
    setEditingId(null);
    setError("");
  };

  // 지출 추가 및 수정 함수
  const handleSaveExpense = (event) => {
    event.preventDefault();

    const expenseAmount = Number(amount);

    // 금액 검사
    if (
      amount.trim() === "" ||
      !Number.isSafeInteger(expenseAmount) ||
      expenseAmount <= 0
    ) {
      setError("올바른 지출 금액을 입력해주세요.");
      return;
    }

    // 내용 검사
    if (description.trim() === "") {
      setError("지출 내용을 입력해주세요.");
      return;
    }

    const expenseData = {
      amount: expenseAmount,
      category: category,
      description: description.trim(),
    };

    if (editingId !== null) {
      // 기존 지출 수정
      setExpenses((prevExpenses) =>
        prevExpenses.map((expense) =>
          expense.id === editingId ? { ...expense, ...expenseData } : expense,
        ),
      );
    } else {
      // 새로운 지출 추가
      const newExpense = {
        id: crypto.randomUUID(),
        ...expenseData,
      };

      setExpenses((prevExpenses) => [newExpense, ...prevExpenses]);
    }

    resetForm();
  };

  // 수정 버튼 클릭 시 실행
  const handleEditExpense = (expense) => {
    setEditingId(expense.id);
    setAmount(String(expense.amount));
    setCategory(expense.category);
    setDescription(expense.description);
    setError("");
  };

  // 삭제 버튼 클릭 시 실행
  const handleDeleteExpense = (id) => {
    setExpenses((prevExpenses) =>
      prevExpenses.filter((expense) => expense.id !== id),
    );

    // 수정 중인 지출을 삭제하면 입력창 초기화
    if (editingId === id) {
      resetForm();
    }
  };

  return (
    <main>
      <h1>💰 Campus Wallet</h1>
      <p>대학생을 위한 생활비 관리 서비스</p>

      <hr />

      <h2>이번 달 생활비 현황</h2>

      <p>이번 달 예산: {formatWon(monthlyBudget)}</p>
      <p>이번 달 지출: {formatWon(totalExpense)}</p>
      <p>남은 예산: {formatWon(remainingBudget)}</p>

      <hr />

      <h2>{editingId !== null ? "지출 수정하기" : "지출 추가하기"}</h2>

      <form onSubmit={handleSaveExpense}>
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
            <button type="button" onClick={resetForm}>
              수정 취소
            </button>
          </>
        )}
      </form>

      <hr />

      <h2>지출 내역</h2>

      {expenses.length === 0 ? (
        <p>아직 등록된 지출 내역이 없습니다.</p>
      ) : (
        <ul>
          {expenses.map((expense) => (
            <li key={expense.id}>
              {expense.category} - {expense.description}
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
