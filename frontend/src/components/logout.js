import React, { useState } from "react";
import { useNavigate } from "react-router";

export default function Logout() {

  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    const response = await fetch(`http://localhost:5001/session_delete`,
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
    navigate("/login");
  }

  return (
    <div>
      <h3>Logout of Account</h3>
      <form onSubmit={onSubmit}>
        <div>
          <input
            type="submit"
            value="Logout"
          />
        </div>
      </form>
    </div>
  );
}