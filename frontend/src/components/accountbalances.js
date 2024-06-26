import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";

export default function AccountBalances() {
  const [account, setAccount] = useState({
    email: "",
    savings: 0,
    checking: 0
  });
  const [amount, setAmount] = useState({
    checking: "",
    savings: "",
  });
  const [status, setStatus] = useState("");
  const [transaction, setTransaction] = useState("");

  const navigate = useNavigate();

  function updateAmount(jsonObj) {
    return setAmount((prevJsonObj) => {
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
      if (!sessionUsername.username) {
        navigate("/login");
      } else {
        const accountResponse = await fetch(`http://localhost:5001/account/${sessionUsername.username}`)
        const accountJson = await accountResponse.json();
        setAccount(accountJson);
      }
    }
    run()
    return;
  },[]);

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("");

    let formatedAmount = {};

    // Check if floating point number.
    if (/^\d+(?:\.\d{0,2})$/.test(amount.checking) && /^\d+(?:\.\d{0,2})$/.test(amount.savings)) {
      formatedAmount = {
        checking: ((parseFloat(amount.checking) * 100).toString()),
        savings: ((parseFloat(amount.savings) * 100).toString())
      };
    } else {
      setStatus("ERROR: Must be in format XX.XX (40.50).");
      return;
    }

    if (transaction === "deposit") {
      const response = await fetch(`http://localhost:5001/account/deposit/${account.email}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formatedAmount)
      })
      .catch(error => {
        window.alert(error);
        return;
      });
      const checkResponse = await response.json();
      if (!checkResponse.check) {
        setStatus(checkResponse.errorMessage);
      } else {
        navigate("/");
      }
    } else if (transaction === "withdraw") {
      const response = await fetch(`http://localhost:5001/account/withdraw/${account.email}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formatedAmount)
      })
      .catch(error => {
        window.alert(error);
        return;
      });
      const checkResponse = await response.json();
      if (!checkResponse.check) {
        setStatus(checkResponse.errorMessage);
      } else {
        navigate("/");
      }
    } else {
      setStatus("Error: Must click transaction type.");
    }
  }

  return (
    <div>
      <div className="topnav">
        <a href="/logout">Logout</a>
        <a href="/">Home</a>
        <a href="/account_balances">Account Balances</a>
      </div>
      <h3>Account Balances</h3>
      <p>Checking: {`$${(parseFloat(account.checking) / 100).toFixed(2)}`}</p>
      <p>Savings: {`$${(parseFloat(account.savings) / 100).toFixed(2)}`}</p>
      <hr/>
      <form onSubmit={onSubmit}>
        <div>
          <p>Transaction Type: </p>
          <input 
            type="radio" 
            id="deposit" 
            name="transaction_type" 
            value="deposit" 
            onChange={(e) => setTransaction(e.target.value)}
          />
          <label htmlFor="deposit">Deposit</label><br/>
          <input 
            type="radio" 
            id="withdraw" 
            name="transaction_type" 
            value="withdraw"
            onChange={(e) => setTransaction(e.target.value)}
          />
          <label htmlFor="withdraw">Withdraw</label><br/>
        </div>
        <br/>
        <div>
          <label>Checking: </label>
          <input
            type="text"
            id="checking"
            // onChange={(e) => updateAmount({ checking: "10"})}
            onChange={(e) => updateAmount({ checking: e.target.value })}
          />
        </div>
        <div>
          <label>Savings: </label>
          <input
            type="text"
            id="savings"
            onChange={(e) => updateAmount({ savings: e.target.value })}
          />
        </div>
        <br/>
        <div>
          <input
            type="submit"
            value="Submit Transaction"
          />
        </div>
        <div>
          <p style={{color: "red"}}>{status}</p>
        </div>
      </form>
    </div>
  );
}