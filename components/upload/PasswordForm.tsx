import React from "react";

interface PasswordFormProps {
  password: string;
  setPassword: (pw: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const PasswordForm: React.FC<PasswordFormProps> = ({ password, setPassword, onSubmit }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <input
      type="password"
      placeholder="Wachtwoord"
      value={password}
      onChange={e => setPassword(e.target.value)}
      className="block w-full border rounded p-2"
      autoFocus
    />
    <button
      type="submit"
      className="bg-primary text-white px-4 py-2 rounded w-full flex items-center justify-center"
      disabled={!password}
    >
      Doorgaan
    </button>
  </form>
);

export default PasswordForm;
