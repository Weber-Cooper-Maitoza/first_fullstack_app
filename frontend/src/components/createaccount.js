import React, { useState } from "react";
import { useNavigate } from "react-router";

export default function CreateAccount() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: ""
  });
  const [status, setStatus] = useState("");

  const navigate = useNavigate();

  function updateForm(jsonObj) {
    return setForm((prevJsonObj) => {
      return { ...prevJsonObj, ...jsonObj};
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("");
    const newAccount = {...form};
    if (newAccount.email == "" || newAccount.password == "") {
      setStatus("Error: Must include both email and password.");
      return;
    }
    const response = await fetch(`http://localhost:5001/account/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newAccount),
    })
    .catch(error => {
      window.alert(error);
      return;
    })
    const checkResponse = await response.json();
    if (!checkResponse.check) {
      // error message
      setStatus("Email already in use.");
    } else {
      // TODO: set session info
      const response = await fetch(`http://localhost:5001/session_set/${form.email}`,
        {
          method: "GET",
          credentials: 'include'
        }
      );
      if (!response.ok) {
        const messge = `An error occured: ${response.statusText}`;
        window.alert(messge);
        return;
      }
      const statusResponse = await response.json();
      setStatus(statusResponse.status);
      // TODO: go to account summary
      navigate("/");
    }
    setForm({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  }

  return (
    <div>
      <div className="topnav">
        <a href="/login">Login</a>
      </div>
      <h3>Create New Account</h3>
      <form onSubmit={onSubmit}>
        <div>
          <label>First Name: </label>
          <input
            type="text"
            id="firstName"
            value={form.firstName}
            onChange={(e) => updateForm({ firstName: e.target.value })}
          />
        </div>
        <div>
          <label>Last Name: </label>
          <input
            type="text"
            id="lastName"
            value={form.lastName}
            onChange={(e) => updateForm({ lastName: e.target.value })}
          />
        </div>
        <div>
          <label>Email (will be used as username): </label>
          <input
            type="text"
            id="email"
            value={form.email}
            onChange={(e) => updateForm({ email: e.target.value })}
          />
        </div>
        <div>
          <label>Phone Number: </label>
          <input
            type="text"
            id="phone"
            value={form.phone}
            onChange={(e) => updateForm({ phone: e.target.value })}
          />
        </div>
        <div>
          <label>Password: </label>
          <input
            type="text"
            id="password"
            value={form.password}
            onChange={(e) => updateForm({ password: e.target.value })}
          />
        </div>
        <br/>
        <div>
          <input
            type="submit"
            value="Create Account"
          />
        </div>
        <div>
          <p style={{color: "red"}}>{status}</p>
        </div>
      </form>
    </div>
  );
}