// src/components/CalendarView.jsx
import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import EventModal from "./EventModal";
import "./calendarModal.css"; // styling for modal and small layout

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

const API = "http://localhost:3000/api/events";

export default function CalendarView() {
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);

  async function loadEvents() {
    try {
      setLoading(true);
      const res = await fetch(API);
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      // map backend events to react-big-calendar format
      const mapped = data.map((ev) => ({
        ...ev,
        id: ev._id,
        _id: ev._id,
        title: ev.title,
        start: new Date(ev.start),
        end: new Date(ev.end),
        allDay: !!ev.allDay,
        description: ev.description || "",
      }));
      setEvents(mapped);
    } catch (err) {
      console.error("loadEvents error:", err);
      alert("Could not load events: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  function openCreate(slotInfo) {
    setSelectedEvent(null);
    // slotInfo.start/slotInfo.end are Date objects
    setSelectedSlot(slotInfo);
    setModalOpen(true);
  }

  function openEdit(ev) {
    // ev will be the mapped event object (with start/end Date)
    setSelectedEvent(ev);
    setSelectedSlot(null);
    setModalOpen(true);
  }

  async function handleSave(payload) {
    // payload must include start (ISO or datetime-local), end, title, description, allDay
    try {
      // normalize start/end to ISO strings
      const toISO = (v) => (v instanceof Date ? v.toISOString() : new Date(v).toISOString());
      if (selectedEvent) {
        const id = selectedEvent._id || selectedEvent.id;
        const body = {
          title: payload.title,
          description: payload.description || "",
          start: toISO(payload.start),
          end: toISO(payload.end),
          allDay: !!payload.allDay,
        };
        const res = await fetch(`${API}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Update failed");
      } else {
        // create
        const body = {
          title: payload.title,
          description: payload.description || "",
          start: toISO(payload.start),
          end: toISO(payload.end),
          allDay: !!payload.allDay,
        };
        const res = await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error("Create failed: " + txt);
        }
      }
      // success: close modal and reload
      setModalOpen(false);
      setSelectedEvent(null);
      setSelectedSlot(null);
      await loadEvents();
    } catch (err) {
      console.error("handleSave error:", err);
      alert("Save failed: " + (err.message || err));
    }
  }

  async function handleDelete() {
    try {
      if (!selectedEvent) return;
      const id = selectedEvent._id || selectedEvent.id;
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setModalOpen(false);
      setSelectedEvent(null);
      setSelectedSlot(null);
      await loadEvents();
    } catch (err) {
      console.error("handleDelete error:", err);
      alert("Delete failed: " + (err.message || err));
    }
  }

  // quick placeholder while loading
  if (loading && events.length === 0) {
    // still render calendar; optional small loader
  }

  return (
    <div style={{ padding: 20, minHeight: "100vh", background: "#1b2838" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h2 style={{ color: "#1f3c4dff", textAlign: "center", marginBottom: 12 }}>My Calendar</h2>

        <div style={{ background: "#fff", borderRadius: 8, padding: 8 }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            selectable
            onSelectSlot={openCreate}
            onSelectEvent={openEdit}
            style={{ height: "75vh" }}
            // toolbar and views remain functional
          />
        </div>
      </div>

      <EventModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedEvent(null); setSelectedSlot(null); }}
        onSave={handleSave}
        onDelete={handleDelete}
        event={selectedEvent}
        slot={selectedSlot}
      />
    </div>
  );
}
