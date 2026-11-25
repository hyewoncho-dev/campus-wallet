import { useState } from "react";
import "./App.css";

function App() {
  // 입력값 관리
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("식비");
  const [description, setDescription] = useState("");

  // 지출 목록과 오류 메시지 관리
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState("");

  // 월 예산
  const monthlyBudget = 300000;

  // 총지출과 남은 예산 계산
  const totalExpense = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );

  const remainingBudget = monthlyBudget - totalExpense;

  // 금액을 원 단위로 표시
  const formatWon = (value) => {
    return value.toLocaleString("ko-KR") + "원";
  };

  // 지출 추가 함수
  const handleAddExpense = (event) => {
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

    const newExpense = {
      id: crypto.randomUUID(),
      amount: expenseAmount,
      category: category,
      description: description.trim(),
    };

    setExpenses((prevExpenses) => [newExpense, ...prevExpenses]);

    // 입력창 초기화
    setAmount("");
    setDescription("");
    setError("");
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

      <h2>지출 추가하기</h2>

      <form onSubmit={handleAddExpense}>
        <div>
          <label htmlFor="amount">지출 금액</label>
          <br />
          <input
            id="amount"
            type="number"
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

        <button type="submit">+ 지출 추가하기</button>
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
              {formatWon(expense.amount)}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default App;
