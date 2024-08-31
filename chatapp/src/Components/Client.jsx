import { React, useEffect, useRef, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { io } from "socket.io-client";
import moment from "moment";
import "../Style/client.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const Client = () => {
  const navigate = useNavigate();
  const myref = useRef(null);
  const sessionStorageName = sessionStorage.getItem("from");
  const sessionId = sessionStorage.getItem("sessionId");
  const receipient = sessionStorage.getItem("to");
  const userId = sessionStorage.getItem("userId");
  const groupsessionId = sessionStorage.getItem("groupsessionId");
  const groupname = sessionStorage.getItem("groupname");
  const [groupDetails, setGroupDetails] = useState();
  const [socket, setSocket] = useState(null);
  let [userMessage, setUserMessage] = useState([]);
  const [userName, setUserName] = useState();
  let [messageData, setMessageData] = useState();

  useEffect(() => {
    if (!sessionStorageName || !userId) {
      navigate("/");
    } else {
      setSocket(io(`${process.env.REACT_APP_Server_URL}`));
      async function fetchData() {
        const response = await axios.get(
          `${process.env.REACT_APP_Server_URL}/getAllUser`
        );
        if (response.status === 200) {
          console.log("response data is", response.data.data);
          setUserName(response?.data?.data);
        }

        const result = await axios.get(
          `${process.env.REACT_APP_Server_URL}/getGroupName`,
          {
            params: {
              username: sessionStorageName,
            },
          }
        );
        if (result?.data?.statusCode === 200) {
          setGroupDetails(result?.data?.data);
        }
      }
      fetchData();
    }
  }, []);

  useEffect(() => {
    if (sessionId || groupsessionId) {
      document.getElementById("submitForm").style.display = "block";
    }
  }, []);

  useEffect(() => {
    async function fetchMessageData() {
      if (sessionId) {
        const result = await axios.get(
          `${process.env.REACT_APP_Server_URL}/getSingleChat`,
          {
            params: {
              username: sessionStorageName,
              sessionId: sessionId,
            },
          }
        );
        if (result?.status === 200) {
          console.log("Result is ", result);
          setUserMessage(result?.data?.data);
        }
      } else if (groupsessionId) {
        const result = await axios.get(
          `${process.env.REACT_APP_Server_URL}/getUserData`,
          {
            params: {
              username: sessionStorageName,
              roomid: groupsessionId,
            },
          }
        );
        if (result?.status === 200) {
          setUserMessage(result?.data?.data);
        }
      }
    }
    fetchMessageData();
  }, []);

  useEffect(() => {
    socket?.on("receivedGroupMessage", (newMessage) => {
      const date = newMessage._date;

      if (userMessage) {
        const index = userMessage.findIndex((item) => item._date === date);
        if (index >= 0) {
          const updatedMessageInfo = [
            ...userMessage[index].messageinfo,
            newMessage.messageinfo[0],
          ];

          const updatedObject = {
            ...userMessage[index],
            messageinfo: updatedMessageInfo,
          };

          setUserMessage([
            ...userMessage.slice(0, index),
            updatedObject,
            ...userMessage.slice(index + 1),
          ]);
        } else {
          setUserMessage([...userMessage, newMessage]);
        }
      }
    });
  }, [userMessage, socket]);

  useEffect(() => {
    socket?.on("receivedMessage", (newMessage) => {
      const date = newMessage._date;

      if (userMessage) {
        const index = userMessage.findIndex((item) => item._date === date);
        if (index >= 0) {
          const updatedMessageInfo = [
            ...userMessage[index].messageinfo,
            newMessage.messageinfo[0],
          ];
          const updatedObject = {
            ...userMessage[index],
            messageinfo: updatedMessageInfo,
          };
          setUserMessage([
            ...userMessage.slice(0, index),
            updatedObject,
            ...userMessage.slice(index + 1),
          ]);
        } else {
          setUserMessage([...userMessage, newMessage]);
        }
      }
    });
  }, [userMessage, socket]);

  useEffect(() => {
    myref.current?.scrollIntoView({ behavior: "instant" });
  }, [userMessage]);

  useEffect(() => {
    if (sessionId && sessionId != null && sessionId !== undefined) {
      socket?.emit("join", sessionId);
    } else {
      socket?.emit("join", groupsessionId);
    }
  }, [socket]);

  const handleInputChange = (e) => {
    setMessageData({ ...messageData, message: e.target.value });
  };

  const handleLogOut = () => {
    const result = window.confirm("Do You Want to Log Out");
    if (result) {
      sessionStorage.clear();
      navigate("/");
    }
  };

  const handleUserName = (e, value) => {
    e.preventDefault();
    console.log("User name at which we enter", value?.username);

    sessionStorage.setItem("to", value.username);
    const sessionData = [value?._id, userId].sort().join("_");
    sessionStorage.setItem("sessionId", sessionData);
    document.getElementById("submitForm").style.display = "block";
    sessionStorage.removeItem("groupsessionId");
    sessionStorage.removeItem("groupname");
    window.location.reload();
  };

  const handleGroup = (e) => {
    e.preventDefault();
    navigate("/userList");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!sessionStorageName) {
      navigate("/");
    } else {
      document.getElementById("sendmessageid").value = "";
      if (sessionId) {
        messageData = {
          ...messageData,
          from: sessionStorageName,
          microTime: Date.now(),
          time: moment().format("hh:mm a"),
          session_id: sessionId,
          to: receipient,
          _date: moment().format("Do MMM YYYY"),
        };

        let sendBodyData = {};
        sendBodyData = {
          ...sendBodyData,
          _date: moment().format("Do MMM YYYY"),
          messageinfo: [messageData],
        };
        if (sendBodyData) {
          socket?.emit("message", sendBodyData);

          setMessageData({ ...messageData, message: "" });
        }
      } else if (groupsessionId) {
        messageData = {
          ...messageData,
          microTime: Date.now(),
          time: moment().format("hh:mm a"),
          group_name: groupname,
          group_id: groupsessionId,
          _date: moment().format("Do MMM YYYY"),
          from: sessionStorageName,
        };
        const messageArrayData = [];
        messageArrayData.push(messageData);

        let sendBodyData = {};
        sendBodyData = {
          ...sendBodyData,
          _date: moment().format("Do MMM YYYY"),
          messageinfo: messageArrayData,
        };

        if (sendBodyData) {
          socket?.emit("groupmessage", sendBodyData);
          setMessageData({ ...messageData, message: "" });
        }
      }
    }
  };

  const handleGroupName = (item) => {
    sessionStorage.setItem("groupname", item.group_name);
    sessionStorage.setItem("groupsessionId", item._id);
    console.log("Item name is ", item.group_name);
    document.getElementById("submitForm").style.display = "block";
    sessionStorage.removeItem("to");
    sessionStorage.removeItem("sessionId");

    window.location.reload();
  };

  return (
    <div className="outer-container">
      <ToastContainer />
      <h4 className="logout" onClick={handleLogOut}>
        Log Out
      </h4>
      <h3 onClick={handleGroup} className="createGroup">
        Create Group
      </h3>
      <h2>Chat Application</h2>

      <h3 className="roomName">({sessionStorageName})</h3>
      <div className="innerOuter">
        <></>
        <div className="roomsdata">
          {userName &&
            userName?.map((value, index) => {
              if (value.username !== sessionStorageName) {
                return (
                  <h3
                    className={
                      value.username === receipient
                        ? "activeUserName"
                        : "username"
                    }
                    onClick={(e) => {
                      handleUserName(e, value);
                    }}
                    key={index}
                  >
                    {value.username}
                  </h3>
                );
              }
            })}
          {groupDetails &&
            groupDetails?.map((item) => {
              return (
                <p
                  onClick={(e) => {
                    e.preventDefault();
                    handleGroupName(item);
                  }}
                  className={
                    item.group_name === groupname
                      ? "activegroupname"
                      : "groupName"
                  }
                >
                  {item.group_name}
                </p>
              );
            })}
        </div>
        <></>
        <div className="main-chat-container">
          <div id="message-Area">
            <div id="scrollAutomatically" className="message">
              {userMessage &&
                userMessage?.map((value, index) => {
                  return (
                    <>
                      <h3 key={index} className="date">
                        {value._date}
                      </h3>
                      {value?.messageinfo?.map((data, index) => {
                        return (
                          <div
                            ref={myref}
                            className={
                              data.from === sessionStorageName ||
                              data.username === sessionStorageName
                                ? "outgoingMessage"
                                : "incomingMessage"
                            }
                          >
                            <h4 key={index}>
                              {data.message}
                              <p className="datauserName">{data.from}</p>
                            </h4>
                            <p className="dateTime">{data.time}</p>
                          </div>
                        );
                      })}
                    </>
                  );
                })}
            </div>
          </div>
          <></>
          <div className="sendMessageField">
            <form id="submitForm" onSubmit={handleFormSubmit}>
              <input
                onChange={handleInputChange}
                className="sendtextMessage"
                type="text"
                placeholder="Enter Text"
                name="text"
                id="sendmessageid"
                onKeyDown={(e) => {
                  if (e.code === "Space" && e.target.value === "") {
                    e.preventDefault();
                  }
                }}
              />
              <button disabled={!messageData?.message} id="sendbtn">
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Client;
