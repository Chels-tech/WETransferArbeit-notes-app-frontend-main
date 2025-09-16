// src/services/eventsApi.js
const API_URL = "https://calendar-backend-4ibq.onrender.com";

async function parseJsonSafe(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

function normalizeForServer(event = {}) {
  const out = {};
  if (event.title !== undefined) out.title = event.title;
  if (event.description !== undefined) out.description = event.description;
  if (event.start) out.start = new Date(event.start).toISOString();
  if (event.end) out.end = new Date(event.end).toISOString();
  if (event.allDay !== undefined) out.allDay = event.allDay;
  
  console.log('Sending to server:', out);
  
  return out;
}

export async function getEvents() {
  console.log('Fetching events from:', API_URL);
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`GET /api/events failed (${res.status})`);
    const data = await parseJsonSafe(res);
    console.log('Received events:', data);
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export async function createEvent(event) {
  const payload = normalizeForServer(event);
  console.log('Creating event with payload:', payload);
  
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    console.log('Create response status:', res.status);
    
    if (!res.ok) {
      const body = await parseJsonSafe(res);
      console.error('Create failed response:', body);
      throw new Error(`Create failed (${res.status}) - ${JSON.stringify(body)}`);
    }
    return parseJsonSafe(res);
  } catch (error) {
    console.error('Create event error:', error);
    throw error;
  }
}

export async function updateEvent(id, event) {
  const payload = normalizeForServer(event);
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await parseJsonSafe(res);
    throw new Error(`Update failed (${res.status}) - ${JSON.stringify(body)}`);
  }
  return parseJsonSafe(res);
}

export async function deleteEvent(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const body = await parseJsonSafe(res);
    throw new Error(`Delete failed (${res.status}) - ${JSON.stringify(body)}`);
  }
  return parseJsonSafe(res);
}