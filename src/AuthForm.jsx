import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./firebase/config";

// Firebase 오류 메시지 변환
function getErrorMessage(code) {
  switch (code) {
    case "auth/email-already-in-use":
      return "이미 가입된 이메일입니다.";
    case "auth/invalid-email":
      return "올바른 이메일을 입력해주세요.";
    case "auth/weak-password":
      return "비밀번호는 6자 이상 입력해주세요.";
    case "auth/invalid-credential":
      return "이메일 또는 비밀번호를 확인해주세요.";
    case "auth/too-many-requests":
      return "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
    case "auth/network-request-failed":
      return "인터넷 연결을 확인해주세요.";
    case "auth/operation-not-allowed":
      return "Firebase 로그인 설정을 확인해주세요.";
    default:
      return "인증 중 오류가 발생했습니다. 다시 시도해주세요.";
  }
}

function AuthForm() {
  // 로그인 또는 회원가입 구분
  const [isLogin, setIsLogin] = useState(true);

  // 입력값
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 오류 및 로딩 상태
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 로그인 및 회원가입 처리
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    if (!isLogin && password.length < 6) {
      setError("비밀번호는 6자 이상 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // 로그인
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        // 회원가입
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>💰 Campus Wallet</h1>
      <p>대학생을 위한 생활비 관리 서비스</p>

      <hr />

      <h2>{isLogin ? "로그인" : "회원가입"}</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">이메일</label>
          <br />
          <input
            id="email"
            type="email"
            placeholder="example@email.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <br />

        <div>
          <label htmlFor="password">비밀번호</label>
          <br />
          <input
            id="password"
            type="password"
            placeholder="비밀번호 입력"
            autoComplete={isLogin ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <br />

        {error && (
          <p role="alert" style={{ color: "red" }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "처리 중..." : isLogin ? "로그인" : "회원가입"}
        </button>
      </form>

      <hr />

      <p>{isLogin ? "아직 계정이 없으신가요?" : "이미 계정이 있으신가요?"}</p>

      <button
        type="button"
        disabled={loading}
        onClick={() => {
          setIsLogin(!isLogin);
          setError("");
          setPassword("");
        }}
      >
        {isLogin ? "회원가입으로 이동" : "로그인으로 이동"}
      </button>
    </main>
  );
}

export default AuthForm;
