import { useEffect, useState } from "react";
import { getCompanies } from "../services/db";

export default function User() {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await getCompanies();
      setCompanies(data);
    };
    load();
  }, []);

  return (
    <div>
      <h2>User Dashboard</h2>

      {companies.map((c) => (
        <div key={c.id}>
          <h4>{c.name}</h4>
          <button>Buy Token</button>
        </div>
      ))}
    </div>
  );
}