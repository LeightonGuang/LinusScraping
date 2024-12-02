"use client";

// Why use client here? I could have dumped this into its own client component,
// but this is simpler for the sake of the example!

import { useEffect, useState } from "react";

export default function Home() {
  const [result, setResult] = useState<
    { name: string; price: string }[] | null
  >(null);

  async function handleOnClick() {
    const results = await fetch("api/getPrices", {
      method: "POST",
      body: JSON.stringify({}),
    }).then((res) => res.json());

    setResult(results);
  }

  useEffect(() => {
    console.log(result);
  }, [result]);

  return (
    <main className="hero bg-base-200 min-h-screen">
      <div className="hero-content text-center">
        <div className="max-w-xl">
          <h1 className="text-5xl font-bold mb-8">Scrape element prices</h1>
          <p className="mb-2">Click the scrape</p>

          <p className="mb-6">
            <button className="btn btn-primary" onClick={handleOnClick}>
              Scrape
            </button>
          </p>
          {Array.isArray(result) ? (
            <div className="grid">
              <table>
                <thead>
                  <tr>
                    <th>Element</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {result.map((item, i) => (
                    <tr key={i}>
                      <td>{item.name}</td>
                      <td>${item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* <pre className="text-left py-4 px-5 rounded overflow-x-scroll">
                <code>{JSON.stringify(result, undefined, 2)}</code>
              </pre> */}
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </main>
  );
}
