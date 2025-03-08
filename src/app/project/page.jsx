"use client";
import React from "react";
import { useState, useEffect, useContext, useRef } from "react";
import { initializeSocket, receiveMessage, sendMessage } from "@/config/socket";
import axios from "axios";
import { UserContext } from "@/context/userContext";
import UserAuth from "@/auth/UserAuth";
import Markdown from "markdown-to-jsx";
import hljs from "highlight.js";

function SyntaxHighlightedCode(props) {
  const ref = useRef(null);

  React.useEffect(() => {
    if (ref.current && props.className?.includes("lang-") && window.hljs) {
      window.hljs.highlightElement(ref.current);

      ref.current.removeAttribute("data-highlighted");
    }
  }, [props.className, props.children]);

  return <code {...props} ref={ref} />;
}

const page = () => {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [project, setProject] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("project")) || null;
    }
    return null;
  });
  const [selectedUserId, setSelectedUserId] = useState(new Set());
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const { user } = useContext(UserContext);
  const messageBox = useRef(null);

  const handleUserClick = (id) => {
    setSelectedUserId((prevSelectedUserId) => {
      const newSelectedUserId = new Set(prevSelectedUserId);
      if (newSelectedUserId.has(id)) {
        newSelectedUserId.delete(id);
      } else {
        newSelectedUserId.add(id);
      }

      return newSelectedUserId;
    });
  };

  function addCollaborators() {
    axios
      .put(
        "/api/projects/add-user",
        {
          projectId: project?._id,
          users: Array.from(selectedUserId),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        setIsModalOpen(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const send = () => {
    if (!message) return;

    const messageObj = {
      message: message,
      sender: user,
    };

    const newMessage = {
      ...messageObj,
      isOutgoing: true,
    };

    sendMessage("project-message", messageObj);

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setMessage("");
    scrollToBottom();
  };

  function WriteAiMessage(message) {

    const messageObject = JSON.parse(message)

    return (
        <div
            className='overflow-auto bg-slate-950 text-white rounded-sm p-2'
        >
            <Markdown
                children={messageObject.text}
                options={{
                    overrides: {
                        code: SyntaxHighlightedCode,
                    },
                }}
            />
        </div>)
    }

  useEffect(() => {
    if (!project?._id || !user?.email) return;

    const socket = initializeSocket(project._id);

    const messageHandler = (data) => {
      console.log("Message received:", data);
      if (data?.sender?._id && data.sender._id !== user._id) {
        console.log("Adding message to chat:", data);
        setMessages((prevMessages) => [
          ...prevMessages,
          { ...data, isOutgoing: false },
        ]);
        scrollToBottom();
      }
    };

    socket.on("project-message", messageHandler);

    axios
      .get(`/api/projects/${project._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        setProject(res.data.project);
      })
      .catch((err) => {
        console.error("Error fetching project:", err);
      });

    axios
      .get("/api/users/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        setUsers(res.data.users);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
      });

    return () => {
      socket.off("project-message", messageHandler);
    };
  }, [project?._id, user?.email]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    if (messageBox.current) {
      messageBox.current.scrollTop = messageBox.current.scrollHeight;
    }
  }

  return (
    <UserAuth>
      <main className="h-screen w-screen flex">
        <section className="left relative flex flex-col h-screen min-w-96 bg-slate-300">
          <header className="flex justify-between items-center p-2 px-4 w-full bg-slate-100 absolute z-10 top-0">
            <button className="flex gap-2" onClick={() => setIsModalOpen(true)}>
              <i className="ri-add-fill mr-1"></i>
              <p>Add collaborator</p>
            </button>
            <button
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
              className="p-2"
            >
              <i className="ri-group-fill"></i>
            </button>
          </header>

          <div className="conversation-area pt-14 pb-10 flex-grow flex flex-col h-full relative">
            <div
              ref={messageBox}
              className="message-box p-1 flex-grow flex flex-col gap-1 overflow-auto max-h-full scrollbar-hide"
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`${
                    msg.sender._id === "ai" ? "max-w-80" : "max-w-52"
                  } ${
                    msg.sender._id == user._id.toString() && "ml-auto"
                  }  message flex flex-col p-2 bg-slate-50 w-fit rounded-md`}
                >
                  <small className="opacity-65 text-xs ml-1">
                    {msg.sender.email}
                  </small>
                  {msg.sender._id === "ai" ? 
                     WriteAiMessage(msg.message)
                     : <p className="text-sm">{msg.message}</p>}
                </div>
              ))}
            </div>
            <div className="inputField w-full flex absolute bottom-0">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
                className="p-2 px-4 border-none outline-none flex-grow"
                type="text"
                placeholder="Enter message"
              />
              <button onClick={send} className="px-5 bg-slate-950 text-white">
                <i className="ri-send-plane-fill"></i>
              </button>
            </div>
          </div>

          <div
            className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute z-20 transition-all ${
              isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
            } top-0`}
          >
            <header className="flex justify-between items-center px-4 p-2 bg-slate-200">
              <h1 className="font-semibold text-lg">Collaborators</h1>
              <button
                onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
                className="p-2"
              >
                <i className="ri-close-fill"></i>
              </button>
            </header>
            <div className="users flex flex-col gap-2">
              {project?.users ? (
                project.users.map((user, index) => {
                  return (
                    <div
                      key={index}
                      className="user cursor-pointer hover:bg-slate-200 p-2 flex gap-2 items-center"
                    >
                      <div className="aspect-square rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600">
                        <i className="ri-user-fill absolute"></i>
                      </div>
                      <h1 className="font-semibold text-lg">{user.email}</h1>
                    </div>
                  );
                })
              ) : (
                <p>Loading...</p>
              )}
            </div>
          </div>
        </section>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-md w-96 max-w-full relative">
              <header className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Select User</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2">
                  <i className="ri-close-fill"></i>
                </button>
              </header>
              <div className="users-list flex flex-col gap-2 mb-16 max-h-96 overflow-auto">
                {users.map((user) => (
                  <div
                    key={user._id || user.id}
                    className={`user cursor-pointer hover:bg-slate-200 ${
                      Array.from(selectedUserId).indexOf(user._id) != -1
                        ? "bg-slate-200"
                        : ""
                    } p-2 flex gap-2 items-center`}
                    onClick={() => handleUserClick(user._id)}
                  >
                    <div className="aspect-square relative rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600">
                      <i className="ri-user-fill absolute"></i>
                    </div>
                    <h1 className="font-semibold text-lg">{user.email}</h1>
                  </div>
                ))}
              </div>
              <button
                onClick={addCollaborators}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Add Collaborators
              </button>
            </div>
          </div>
        )}
      </main>
    </UserAuth>
  );
};

export default page;
