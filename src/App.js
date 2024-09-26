import React, { useState, useEffect } from "react";
import "./App.css";
import Markdown from "react-markdown";

function App() {
  const [fileName, setFileName] = useState("");
  const [userInput, setUserInput] = useState({
    fileUploaded: null,
    fileDoubt: "",
  });
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setUserInput((prevUserInput) => {
      return {
        ...prevUserInput,
        [e.target.name]:
          e.target.type === "file"
            ? e.target.files[0].type === "application/pdf"
              ? e.target.files[0]
              : null
            : e.target.value,
      };
    });
  }

  useEffect(() => {
    if (userInput.fileUploaded) {
      setFileName(userInput.fileUploaded.name);
    }
  }, [userInput.fileUploaded]);

  function handleSubmit() {
    if (userInput.fileDoubt !== "" && userInput.fileUploaded !== null) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "send", text: userInput.fileDoubt },
      ]);

      setLoading(true);

      const formData = new FormData();
      formData.append("fileUploaded", userInput.fileUploaded);
      formData.append("fileDoubt", userInput.fileDoubt);

      fetch("http://127.0.0.1:5000/generate", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          setMessages((prevMessages) => [
            ...prevMessages,
            { type: "receive", text: data.response },
          ]);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching response:", error);
          setLoading(false);
        });

      setUserInput((prevUserInput) => ({
        ...prevUserInput,
        fileDoubt: "",
      }));
    }
  }

  function handleKeyPress(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      if (userInput.fileUploaded === null) {
        alert("No Product File Found!");
      }
      if (userInput.fileDoubt === "") {
        alert("Product Query is Empty!");
      } else {
        handleSubmit();
      }
    }
  }

  useEffect(() => console.log(messages), [messages]);

  return (
    <div>
      <div className="navbar">
        <h1>Troubleshoot Chat</h1>
      </div>
      <div className="chat-component">
        {messages.map((message, idx) => {
          if (message.type === "send") {
            return (
              <p key={idx} className={message.type}>
                {message.text}
              </p>
            );
          } else {
            return (
              <p key={idx} className={message.type}>
                <Markdown>{message.text}</Markdown>
              </p>
            );
          }
        })}
        {loading && (
          <p className="receive" style={{ border: "none" }}>
            Loading...
          </p>
        )}
      </div>
      <div className="input-component">
        <label
          htmlFor="filePicker"
          style={{
            padding: "5px 10px",
            border: fileName === "" ? "2px solid grey" : "2px solid black",
            borderRadius: "7px",
            opacity: fileName === "" ? 0.5 : 1,
            maxWidth: "300px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {fileName === "" ? "Click to Upload Product Manual" : fileName}
        </label>
        <input
          id="filePicker"
          name="fileUploaded"
          style={{ position: "absolute", visibility: "hidden" }}
          type="file"
          onChange={handleChange}
        />
        <textarea
          name="fileDoubt"
          placeholder="Ask doubts regarding your product"
          value={userInput.fileDoubt}
          onChange={handleChange}
          onKeyDown={handleKeyPress}
        ></textarea>
        <button
          className="submit"
          onClick={handleSubmit}
          disabled={fileName === "" ? true : false}
          style={{ opacity: fileName === "" ? 0.5 : 1 }}
        >
          &rarr;
        </button>
      </div>
    </div>
  );
}

export default App;
