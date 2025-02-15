import { useLoaderData } from "react-router";
import { getDB } from "~/db/getDB";
import { useState } from "react";

export async function loader() {
  const db = await getDB();
  const employees = await db.all("SELECT * FROM employees;");
  return { employees };
}

export default function EmployeesPage() {
  const { employees } = useLoaderData();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("full_name");
  const [filterDepartment, setFilterDepartment] = useState("");

  const filteredEmployees = employees
    .filter((employee) =>
      employee.full_name.toLowerCase().includes(search.toLowerCase()) &&
      (filterDepartment ? employee.department === filterDepartment : true)
    )
    .sort((a, b) => (a[sortField] > b[sortField] ? 1 : -1));

  return (
    <div>
      <h1>Employee List</h1>
      <input
        type="text"
        placeholder="Search by name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select onChange={(e) => setSortField(e.target.value)}>
        <option value="full_name">Name</option>
        <option value="job_title">Job Title</option>
        <option value="department">Department</option>
        <option value="salary">Salary</option>
      </select>
      <select onChange={(e) => setFilterDepartment(e.target.value)}>
        <option value="">All Departments</option>
        <option value="HR">HR</option>
        <option value="Engineering">Engineering</option>
        <option value="Sales">Sales</option>
      </select>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Full Name</th>
            <th>Job Title</th>
            <th>Department</th>
            <th>Salary</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.id}</td>
              <td>{employee.full_name}</td>
              <td>{employee.job_title}</td>
              <td>{employee.department}</td>
              <td>${employee.salary}</td>
              <td>
                <a href={`/employees/${employee.id}`}>View</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr />
      <ul>
        <li><a href="/employees/new">New Employee</a></li>
        <li><a href="/timesheets/">Timesheets</a></li>
      </ul>
    </div>
  );
}