import { useState } from "react";

export const useModal = () => {
  const [show, setShow] = useState(false);
  const [text, setText] = useState(""); // State for textarea input

  const handleShow = () => setShow(true);
  const handleClose = () => {
    setShow(false);
    setText(""); // Optionally reset the textarea when closing
  };

  return { show, text, setText, handleShow, handleClose };
};
