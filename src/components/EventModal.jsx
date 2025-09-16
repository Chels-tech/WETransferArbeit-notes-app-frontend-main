// src/components/EventModal.jsx
import React, { useEffect, useState } from "react";
import "./calendarModal.css";


function dateToLocalInput(d) {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  const tzOffset = date.getTimezoneOffset() * 60000;
  const localISO = new Date(date - tzOffset).toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
  return localISO;
}

export default function EventModal({ open, onClose, onSave, onDelete, event, slot }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState(""); // "YYYY-MM-DDTHH:mm"
  const [end, setEnd] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (event) {
      setTitle(event.title || "");
      setDescription(event.description || "");
      setStart(dateToLocalInput(event.start));
      setEnd(dateToLocalInput(event.end));
      setAllDay(!!event.allDay);
    } else if (slot) {
      // prefill with slot start/end (if month view slot might be midnight)
      setTitle("");
      setDescription("");
      setStart(dateToLocalInput(slot.start || new Date()));
      setEnd(dateToLocalInput(slot.end || new Date(new Date().getTime() + 60 * 60 * 1000)));
      setAllDay(false);
    } else {
      setTitle("");
      setDescription("");
      setStart("");
      setEnd("");
      setAllDay(false);
    }
  }, [open, event, slot]);

  if (!open) return null;

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      // pass strings (datetime-local) — CalendarView will convert to ISO
      await onSave({
        title: title.trim(),
        description: description.trim(),
        start: start,
        end: end,
        allDay: !!allDay,
      });
      // onSave closes modal on success (CalendarView handles)
    } catch (err) {
      console.error("EventModal submit error:", err);
      alert("Save failed: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="cm-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form className="cm-modal" onSubmit={submit} onMouseDown={(e) => e.stopPropagation()}>
        <h3 className="cm-title">{event ? "Edit Event" : "Add Event"}</h3>

        <label className="cm-field">
          <div className="cm-label">Title</div>
          <input className="cm-input" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>

        <label className="cm-field">
          <div className="cm-label">Description</div>
          <textarea className="cm-input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>

        <label className="cm-field">
          <div className="cm-label">Start</div>
          <input className="cm-input" type="datetime-local" required value={start} onChange={(e) => setStart(e.target.value)} />
        </label>

        <label className="cm-field">
          <div className="cm-label">End</div>
          <input className="cm-input" type="datetime-local" required value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>

        <label className="cm-inline">
          <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
          <span style={{ marginLeft: 8 }}>All day</span>
        </label>

        <div className="cm-actions">
          {event && (
            <button
              type="button"
              className="cm-btn cm-danger"
              onClick={async () => {
                if (!window.confirm("Delete this event?")) return;
                try {
                  setSaving(true);
                  await onDelete();
                } catch (err) {
                  alert("Delete failed: " + (err.message || err));
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
            >
              Delete
            </button>
          )}

          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button type="button" className="cm-btn" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="cm-btn cm-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </form>
    </div>
  );
}
