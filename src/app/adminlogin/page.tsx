"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Login failed" }));
        setError(data.error || "Login failed");
        setIsLoading(false);
        return;
      }

      // Successful login - redirect using window.location for hard refresh
      window.location.href = "/admin";
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please check if the server is running.");
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.shell}>
      <img
        src="https://github.com/Surbee001/webimg/blob/main/Artboard%201.png?raw=true"
        alt="Office of International Academic Affairs"
        className={styles.logo}
      />

      <div className={styles.card}>
        <div className={styles.header}>
          <h1>Admin Portal</h1>
          <p>Sign in to manage applications</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ajman.ac.ae"
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className={styles.backLink}>
          <Link href="/">← Back to application form</Link>
        </div>
      </div>
    </div>
  );
}
