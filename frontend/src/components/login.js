import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export default function Login() {
  const [loginCred, setLoginCred] = useState({
    email: "",
    password: ""
  });
  const [status, setStatus] = useState("");

  const navigate = useNavigate();

  function updateForm(jsonObj) {
    return setLoginCred((prevJsonObj) => {
      return { ...prevJsonObj, ...jsonObj};
    });
  }

  useEffect(() => {
    async function run() {
      const response = await fetch(`http://localhost:5001/session_get`,
        {
          method: "GET",
          credentials: 'include'
        }
      );
      const sessionUsername = await response.json();
      if (sessionUsername.username) {
        navigate("/");
      }
    }
    run()
    return;
  },[]);

  async function onSubmit(e) {
    e.preventDefault();
    setStatus(""); // reset error message
    const loginInfo = {...loginCred};
    const response = await fetch(`http://localhost:5001/account/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginInfo),
    })
    .catch(error => {
      window.alert(error);
      return;
    })

    const checkResponse = await response.json();
    if (!checkResponse.check) {
      setStatus("Error: Incorrect password or username.");
    } else {
      const response = await fetch(`http://localhost:5001/session_set/${loginInfo.email}`,
        {
          method: "GET",
          credentials: 'include'
        }
      );
      // if (!response.ok) {
      //   const messge = `An error occured: ${response.statusText}`;
      //   window.alert(messge);
      //   return;
      // }
      const statusResponse = await response.json();
      setStatus(statusResponse.status);
      navigate("/");
    }
    setLoginCred({ email: "", password: ""});
  }

  return (
    <div>
      <div className="topnav">
        <a href="/create_account">Create Account</a>
      </div>
      <h3>Login</h3>
      <form onSubmit={onSubmit}>
        <div>
          <label>Username: </label>
          <input
            type="text"
            id="email"
            value={loginCred.email}
            onChange={(e) => updateForm({ email: e.target.value })}
          />
        </div>
        <div>
          <label>Password: </label>
          <input
            type="text"
            id="password"
            value={loginCred.password}
            onChange={(e) => updateForm({ password: e.target.value })}
          />
        </div>
        <br/>
        <div>
          <input
            type="submit"
            value="Login"
          />
        </div>
        <div>
          <h3 style={{color: "red"}}>{status}</h3>
        </div>
      </form>
    </div>
  );
}