import { useLoaderData, Form, redirect } from "react-router";
import { getDB } from "~/db/getDB";
import { useState } from "react";
import { useParams } from "react-router";

export async function loader({ params }) {
  const db = await getDB();
  const employees = await db.all('SELECT id, full_name FROM employees');
  let timesheet = null;
  if (params.id) {
    timesheet = await db.get('SELECT * FROM timesheets WHERE id = ?', [params.id]);
  }
  return { employees, timesheet };
}

import type { ActionFunction } from "react-router";

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const employee_id = formData.get("employee_id");
  const start_time = formData.get("start_time");
  const end_time = formData.get("end_time");
  const summary = formData.get("summary");

  if (!employee_id || !start_time || !end_time || !summary) {
    return new Response("All fields are required", { status: 400 });
  }
  if (new Date(start_time) >= new Date(end_time)) {
    return new Response("Start time must be before end time", { status: 400 });
  }

  const db = await getDB();
  if (params.id) {
    await db.run(
      'UPDATE timesheets SET employee_id = ?, start_time = ?, end_time = ?, summary = ? WHERE id = ?',
      [employee_id, start_time, end_time, summary, params.id]
    );
  } else {
    await db.run(
      'INSERT INTO timesheets (employee_id, start_time, end_time, summary) VALUES (?, ?, ?, ?)',
      [employee_id, start_time, end_time, summary]
    );
  }
  return redirect("/timesheets");
};

export default function TimesheetPage() {
  const { employees, timesheet } = useLoaderData();
  const { id } = useParams();
  const [startTime, setStartTime] = useState(timesheet?.start_time || "");
  const [endTime, setEndTime] = useState(timesheet?.end_time || "");

  return (
    <div>
      <h1>{id ? "Edit" : "Create"} Timesheet</h1>
      <Form method="post">
        <div>
          <label htmlFor="employee_id">Employee</label>
          <select name="employee_id" id="employee_id" required defaultValue={timesheet?.employee_id || ""}>
            <option value="">Select an Employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.full_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="start_time">Start Time</label>
          <input
            type="datetime-local"
            name="start_time"
            id="start_time"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="end_time">End Time</label>
          <input
            type="datetime-local"
            name="end_time"
            id="end_time"
            required
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="summary">Summary</label>
          <textarea name="summary" id="summary" required defaultValue={timesheet?.summary || ""}></textarea>
        </div>
        <button type="submit">{id ? "Update" : "Create"} Timesheet</button>
      </Form>
      <hr />
      <ul>
        <li><a href="/timesheets">Timesheets</a></li>
        <li><a href="/employees">Employees</a></li>
        {timesheet && <li><a href={`/employees/${timesheet.employee_id}`}>Employee Profile</a></li>}
      </ul>
    </div>
  );
}