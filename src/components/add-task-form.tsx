"use client";

import { useFormStatus } from "react-dom";

import { createTask } from "@/lib/tasks";

import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending} aria-disabled={pending}>
      {pending ? "Creating task..." : "Create task"}
    </Button>
  );
}

export function AddTaskForm() {
  return (
    <form action={createTask} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="taskDate" className="mb-1 block text-sm font-medium text-slate-700">
            Date
          </label>
          <input
            id="taskDate"
            name="taskDate"
            type="date"
            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-300"
          />
        </div>

        <div>
          <label htmlFor="assignedTo" className="mb-1 block text-sm font-medium text-slate-700">
            Assigned to
          </label>
          <input
            id="assignedTo"
            name="assignedTo"
            placeholder="Name"
            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-300"
          />
        </div>
      </div>

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700">
          Task title
        </label>
        <input
          id="title"
          name="title"
          placeholder="Download AI files from VPE"
          className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-300"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">
          Task description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="What needs to be done?"
          className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-slate-300"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="startTime" className="mb-1 block text-sm font-medium text-slate-700">
            Start time
          </label>
          <input
            id="startTime"
            name="startTime"
            type="time"
            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-300"
          />
        </div>

        <div>
          <label htmlFor="completionTime" className="mb-1 block text-sm font-medium text-slate-700">
            Completion time
          </label>
          <input
            id="completionTime"
            name="completionTime"
            type="time"
            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-300"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="priority" className="mb-1 block text-sm font-medium text-slate-700">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue="medium"
            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-300"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue="not_started"
            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-300"
          >
            <option value="not_started">Not started</option>
            <option value="in_progress">In progress</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="dueDate" className="mb-1 block text-sm font-medium text-slate-700">
          Due date
        </label>
        <input
          id="dueDate"
          name="dueDate"
          type="date"
          className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-300"
        />
      </div>

      <div>
        <label htmlFor="workDone" className="mb-1 block text-sm font-medium text-slate-700">
          What did I do?
        </label>
        <textarea
          id="workDone"
          name="workDone"
          rows={2}
          placeholder="Describe the actual work completed"
          className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-slate-300"
        />
      </div>

      <div>
        <label htmlFor="evidenceLink" className="mb-1 block text-sm font-medium text-slate-700">
          Evidence / link
        </label>
        <input
          id="evidenceLink"
          name="evidenceLink"
          type="url"
          placeholder="https://example.com"
          className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-300"
        />
      </div>

      <div>
        <label htmlFor="remarks" className="mb-1 block text-sm font-medium text-slate-700">
          Remarks
        </label>
        <textarea
          id="remarks"
          name="remarks"
          rows={2}
          placeholder="Notes, blockers, follow-up details"
          className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-slate-300"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
