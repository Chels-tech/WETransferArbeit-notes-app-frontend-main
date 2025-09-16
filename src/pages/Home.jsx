import React, { useEffect, useState } from "react";
import Aside from "../components/aside/Aside";
import NoteCard from "../components/note/NoteCard";

import FAB from "../components/action-button/FAB";
import SAB from "../components/action-button/SAB";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useModal } from "../hooks/useModal";
import { API } from "../config";

const Home = () => {
  const { show, text, setText, handleShow, handleClose } = useModal();
  const [notes, setNotes] = useState([]);
  const [editableNote, setEditableNote] = useState(null);

  const API_URL = API.notes;

  // Hilfsfunktion: immer mit JWT Header
  const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem("jwt");
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json().catch(() => ({}));
  };

  // --- CRUD Funktionen ---
  const fetchNotes = async () => {
    try {
      const data = await authFetch(API_URL);
      setNotes(data.sort((a, b) => b.id - a.id));
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  const createNote = async (text) => {
    return authFetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  };

  const updateNote = async (note) => {
    return authFetch(`${API_URL}/${note.id}`, {
      method: "PUT",
      body: JSON.stringify(note),
    });
  };

  const deleteNote = async (note) => {
    await authFetch(`${API_URL}/${note.id}`, { method: "DELETE" });
  };
  // --- Ende CRUD Funktionen ---

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSubmit = async () => {
    if (editableNote) {
      const updatedNote = { ...editableNote, text };
      await updateNote(updatedNote);
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === updatedNote.id ? updatedNote : note
        )
      );
    } else {
      const newNote = await createNote(text);
      setNotes((prevNotes) => [newNote, ...prevNotes]);
    }

    handleClose();
    setEditableNote(null);
    setText("");
  };

  const handleDelete = async (note) => {
    await deleteNote(note);
    setNotes((prevNotes) => prevNotes.filter((n) => n.id !== note.id));
  };

  const handleUpdate = (note) => {
    setEditableNote(note);
    setText(note.text);
    handleShow();
  };

  return (
    <>
      <Aside>
        <SAB onClick={handleShow}></SAB>
      </Aside>
      <main>
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          >
            {note.text}
          </NoteCard>
        ))}
      </main>

      <FAB onClick={handleShow}></FAB>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Enter Your Text</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="exampleForm.ControlTextarea1">
            <Form.Label>Write something:</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type here..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Home;
