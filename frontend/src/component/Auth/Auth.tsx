import "./Auth.css";

import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const Auth = () => {
  const [isSignup, setIsSignup] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const { signUp, signIn, isLoading } = useAuth();

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  const handleSubmit = async () => {
    try {
      if (isSignup) {
        await signUp(email, password);
        alert("確認メールを送信しました！");
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 入力欄の変更が保持されるように更新関数を更新する
  const inputed_email = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  const inputed_password = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  // サインアップ/サインインの切り替え
  const changeSignup = () => {
    setIsSignup(!isSignup);
  };

  return (
    <div className="signup-container">
      <h2>学習記録アプリ 「PomoLog」</h2>
      {/* <h2>{isSignup ? "サインアップ" : "サインイン"}</h2> */}
      <div className="note">
        新規作成以外に、下記でお試しログインもできます。
        <br />
        メールアドレス：dum25303@gmail.com
        <br />
        パスワード：test1234
      </div>
      <div>
        <form action="" className="signup-form">
          <input
            type="email"
            placeholder="メールアドレスを入力"
            className="email"
            value={email}
            onChange={inputed_email}
            required
          />
          <input
            type="password"
            placeholder="パスワードを入力"
            className="password"
            value={password}
            onChange={inputed_password}
            required
          />
          <button
            type="button"
            onClick={handleSubmit}
            className="button-signup"
          >
            {isSignup ? "新規登録" : "ログイン"}
          </button>
        </form>
        <button onClick={changeSignup}>
          {isSignup ? "ログインに切り替え" : "新規登録に切り替え"}
        </button>
      </div>
    </div>
  );
};

export default Auth;
