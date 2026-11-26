import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase/config";
import AuthForm from "./AuthForm";
import App from "./App";

function AuthGate() {
  // 현재 로그인한 사용자
  const [user, setUser] = useState(null);

  // 로그인 상태 확인 중인지 관리
  const [loading, setLoading] = useState(true);

  // 오류 메시지
  const [error, setError] = useState("");

  // Firebase 로그인 상태 확인
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      },
      () => {
        setError("로그인 상태를 확인하지 못했습니다.");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  // 로그아웃
  const handleLogout = async () => {
    try {
      setError("");
      await signOut(auth);
    } catch {
      setError("로그아웃에 실패했습니다.");
    }
  };

  // 로그인 상태 확인 중
  if (loading) {
    return <p>로그인 상태를 확인하고 있습니다...</p>;
  }

  // 인증 오류 발생
  if (error && !user) {
    return <p role="alert">{error}</p>;
  }

  // 로그인하지 않은 사용자
  if (!user) {
    return <AuthForm />;
  }

  // 로그인한 사용자
  return (
    <>
      <header
        style={{
          maxWidth: "900px",
          margin: "20px auto",
          padding: "0 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <span>👤 {user.email}</span>

        <button type="button" onClick={handleLogout}>
          로그아웃
        </button>
      </header>

      {error && <p role="alert">{error}</p>}

      <App />
    </>
  );
}

export default AuthGate;
