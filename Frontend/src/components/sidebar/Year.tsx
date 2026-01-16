import { useState } from "react";

export const Year = () => {
  const [year, setYear] = useState("");

  const years = [2022, 2023, 2024, 2025, 2026];

  return (
    <div>
      <label>Year</label>

      <select
        value={year}
        onChange={(e) => setYear(e.target.value)}
      >
        <option value="">Select year</option>

        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
};
