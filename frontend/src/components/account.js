import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";

export default function Account() {
  // const [status, setStatus] = useState("");
  // const [firstname, setFirstname] = useState("");
  // const [lastname, setLastname] = useState("");
  // const [email, setEmail] = useState("");
  // const [phonenumber, setPhonenumber] = useState("");
  const [account, setAccount] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    async function run() {
      const response = await fetch(`http://localhost:5001/session_get`,
        {
          method: "GET",
          credentials: 'include'
        }
      );
      const sessionUsername = await response.json();
      if (!sessionUsername.username) {
        navigate("/login");
      } else {
        // TODO: use fetch on /account/:email route to get account information
        const accountResponse = await fetch(`http://localhost:5001/account/${sessionUsername.username}`)
        const accountJson = await accountResponse.json();
        setAccount(accountJson);
      }
    }
    run()
    return;
  },[]);

  return (
    <div>
      <div className="topnav">
        <a href="/logout">Logout</a>
        <a href="/">Home</a>
        <a href="/account_balances">Account Balances</a>
      </div>
      <h3>Account Summary</h3>
      <p>First Name: {account.firstName}</p>
      <p>Last Name: {account.lastName}</p>
      <p>Email: {account.email}</p>
      <p>Phone Number: {account.phone}</p>
    </div>
  );
}