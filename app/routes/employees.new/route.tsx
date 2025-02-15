import { Form, redirect, useLoaderData, useNavigate } from "react-router";
import { getDB } from "~/db/getDB";
import { useParams } from "react-router-dom";

export async function loader({ params }) {
  const db = await getDB();
  const employee = params.id
    ? await db.get("SELECT * FROM employees WHERE id = ?", [params.id])
    : null;
  return employee;
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const full_name = formData.get("full_name");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const dob = formData.get("dob");
  const job_title = formData.get("job_title");
  const department = formData.get("department");
  const salary = formData.get("salary");
  const start_date = formData.get("start_date");
  const end_date = formData.get("end_date");
  
  const db = await getDB();

  if (params.id) {
    await db.run(
      "UPDATE employees SET full_name=?, email=?, phone=?, dob=?, job_title=?, department=?, salary=?, start_date=?, end_date=? WHERE id=?",
      [full_name, email, phone, dob, job_title, department, salary, start_date, end_date, params.id]
    );
  } else {
    await db.run(
      "INSERT INTO employees (full_name, email, phone, dob, job_title, department, salary, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [full_name, email, phone, dob, job_title, department, salary, start_date, end_date]
    );
  }

  return redirect("/employees");
}

export default function EmployeeFormPage() {
  const employee = useLoaderData();
  const navigate = useNavigate();
  
  return (
    <div>
      <h1>{employee ? "Edit Employee" : "Create New Employee"}</h1>
      <Form method="post">
        <div>
          <label htmlFor="full_name">Full Name</label>
          <input type="text" name="full_name" id="full_name" defaultValue={employee?.full_name || ""} required />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" name="email" id="email" defaultValue={employee?.email || ""} required />
        </div>
        <div>
          <label htmlFor="phone">Phone Number</label>
          <input type="tel" name="phone" id="phone" defaultValue={employee?.phone || ""} required pattern="[0-9]{10}" />
        </div>
        <div>
          <label htmlFor="dob">Date of Birth</label>
          <input type="date" name="dob" id="dob" defaultValue={employee?.dob || ""} required />
        </div>
        <div>
          <label htmlFor="job_title">Job Title</label>
          <input type="text" name="job_title" id="job_title" defaultValue={employee?.job_title || ""} required />
        </div>
        <div>
          <label htmlFor="department">Department</label>
          <input type="text" name="department" id="department" defaultValue={employee?.department || ""} required />
        </div>
        <div>
          <label htmlFor="salary">Salary ($)</label>
          <input type="number" name="salary" id="salary" defaultValue={employee?.salary || ""} required min="0" />
        </div>
        <div>
          <label htmlFor="start_date">Start Date</label>
          <input type="date" name="start_date" id="start_date" defaultValue={employee?.start_date || ""} required />
        </div>
        <div>
          <label htmlFor="end_date">End Date</label>
          <input type="date" name="end_date" id="end_date" defaultValue={employee?.end_date || ""} />
        </div>
        <button type="submit">{employee ? "Update" : "Create"} Employee</button>
      </Form>
      <button onClick={() => navigate("/employees")}>Back to Employees</button>
    </div>
  );
}
