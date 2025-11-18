import { useState } from "react";
import { api } from "@/lib/api";

export default function Home() {
  const [response, setResponse] = useState("");

  const testConnection = async () => {
    try {
      const res = await api.get("/test");
      setResponse(res.data.msg || "Success!");
    } catch (error) {
      setResponse("❌ Failed to connect to backend");
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Appointly is LIVE 🔥</h1>

      <button
        onClick={testConnection}
        className="px-4 py-2 bg-black text-white rounded-lg hover:opacity-80 transition"
      >
        Test Backend Connection
      </button>

      <p className="mt-4 text-lg">{response}</p>
    </div>
  );
}
