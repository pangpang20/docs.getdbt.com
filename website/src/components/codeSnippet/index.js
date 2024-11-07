import React, { useEffect, useState } from 'react';

function CodeSnippet({ resourceType }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          'https://raw.githubusercontent.com/dbt-labs/dbt-jsonschema/main/schema.json'
        );
        const jsonData = await response.json();
        setData(jsonData[resourceType] || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, [resourceType]);

  if (!data.length) return <p>No data available for {resourceType}.</p>;

  return (
    <div>
      <h2>{resourceType}</h2>
      <table>
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.type}</td>
              <td>{item.description || 'No description available'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CodeSnippet;
