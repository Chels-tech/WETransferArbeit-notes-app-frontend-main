import React, { useState } from "react";
import axios from "axios";
import { API } from "../config";

const Auth = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const API_URL = API.auth;

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await axios.post(`${API_URL}/register`, {
          email,
          password,
        });
        alert("Registrierung erfolgreich! Bitte einloggen.");
        setIsRegister(false);
      } else {
        await onLogin(email, password);
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert(
        isRegister
          ? `Registrierung fehlgeschlagen: ${
              (error.response?.data || error.message).error
            }`
          : `Login fehlgeschlagen: ${
              (error.response?.data || error.message).error
            }`
      );
    }
  };

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="row w-100">
        <div className="col-md-6 col-lg-4 mx-auto">
          <div className="p-4 shadow">
            <h3 className="card-title text-center mb-3">
              {isRegister ? "Registrieren" : "Login"}
            </h3>
            <form onSubmit={submit}>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Passwort</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">
                {isRegister ? "Registrieren" : "Einloggen"}
              </button>
            </form>
            <div className="mt-3 text-center">
              <button
                className="btn btn-link"
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister
                  ? "Bereits ein Konto? Login"
                  : "Kein Konto? Registrieren"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
