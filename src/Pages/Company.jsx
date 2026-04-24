import { useState, useEffect } from "react";
import { addCompany, getCompanies } from "../services/db";

export default function Company() {
  const [name, setName] = useState("");
  const [companies, setCompanies] = useState([]);

  const handleAdd = async () => {
    await addCompany({
      name,
      since: "2020",
      timings: "9am-5pm",
      address: "Karachi",
      tokensLimit: 0,
      currentToken: 0
    });

    loadCompanies();
  };

  const loadCompanies = async () => {
    const data = await getCompanies();
    setCompanies(data);
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  return (
    <div>
      <h2>Company Dashboard</h2>

      <input
        placeholder="Company Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button onClick={handleAdd}>+ Add Company</button>

      <h3>Company List:</h3>
      {companies.map((c) => (
        <div key={c.id}>
          <p>{c.name}</p>
        </div>
      ))}
    </div>
  );
}