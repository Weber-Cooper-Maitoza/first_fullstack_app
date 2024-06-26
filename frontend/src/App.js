import React from "react";
import { Route, Routes } from "react-router-dom";

import Account from "./components/account.js";
import Login from "./components/login.js";
import Logout from "./components/logout.js";
import CreateAccount from "./components/createaccount.js";
import AccountBalances from "./components/accountbalances.js";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Account />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/create_account" element={<CreateAccount />} />
        <Route path="/account_balances" element={<AccountBalances />} />
      </Routes>
    </div>
  );
}

export default App;
