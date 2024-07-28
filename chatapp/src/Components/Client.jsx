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
  const sessionStorageName = sessionStorage.getItem("username");
  const sessionStorageRoomName = sessionStorage.getItem("r_name");
  const sessionStorageId = sessionStorage.getItem("userId");
  const [socket, setSocket] = useState(null);
  let [userMessage, setUserMessage] = useState();
  const [userName, setUserName] = useState();
  const [refresh, setRefresh] = useState(0);

  let [messageData, setMessageData] = useState();

  useEffect(() => {
    if (!sessionStorageName || !sessionStorageRoomName || !sessionStorageId) {
      navigate("/");
    } else {
      setSocket(io(`${process.env.REACT_APP_Server_URL}`));
      async function fetchData() {
        const response = await axios.get(
          `${process.env.REACT_APP_Server_URL}/getUserAccordingtoRoom/${sessionStorageRoomName}`
        );

        if (response?.data?.statusCode === 200) {
          setUserName(response?.data?.data);
          setRefresh(1);
        }
      }
      fetchData();
    }
  }, []);

  useEffect(() => {
    async function fetchMessageData() {
      const result = await axios.get(
        `${process.env.REACT_APP_Server_URL}/getUserData`,
        {
          params: {
            username: sessionStorageName,
            roomid: sessionStorageId,
          },
        }
      );
      if (result?.data?.statusCode === 200) {
        setUserMessage(result?.data?.data);
      }
    }
    fetchMessageData();
  }, []);

  if (userMessage) {
    console.log("Usermesgh", userMessage);
  }

  useEffect(() => {
    socket?.on("receivedMessage", (newMessage) => {
      console.log("fgvbhnjm,", newMessage);
      const date = newMessage._date;
      if (userMessage?.length > 0) {
        console.log("User message is ", userMessage);
        const index = userMessage.findIndex((item) => item._date === date);
        if (index >= 0) {
          console.log("Index is ", index);

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
      if (refresh === 0) {
        window.location.reload();
      }
    });
  }, [userMessage, socket, refresh]);

  useEffect(() => {
    myref.current?.scrollIntoView({ behavior: "instant" });
  }, [userMessage]);

  useEffect(() => {
    setMessageData({
      ...messageData,
      username: sessionStorageName,
      room_id: sessionStorageId,
    });
    if (
      sessionStorageId &&
      sessionStorageId !== null &&
      sessionStorageId !== undefined
    ) {
      socket?.emit("join", sessionStorageId);
    }
  }, [socket]);

  const handleInputChange = (e) => {
    setMessageData({ ...messageData, message: e.target.value });
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();

    if (!sessionStorageName || !sessionStorageRoomName || !sessionStorageId) {
      navigate("/");
    } else {
      document.getElementById("sendmessageid").value = "";

      messageData = {
        ...messageData,
        microTime: Date.now(),
        time: moment().format("hh:mm a"),
        Date: moment().format("Do MMM YYYY"),
      };

      let messageArrayData = [];

      messageArrayData.push(messageData);

      let sendBodyData = {};
      sendBodyData = {
        ...sendBodyData,
        _date: moment().format("Do MMM YYYY"),
        messageinfo: messageArrayData,
      };

      if (sendBodyData) {
        const result = await axios.post(
          `${process.env.REACT_APP_Server_URL}/saveMessageData`,
          sendBodyData
        );
        socket?.emit("message", sendBodyData);

        setMessageData({ ...messageData, message: "" });
      }
    }
  };
  const handleLogOut = () => {
    const result = window.confirm("Do You Want to Log Out");
    if (result) {
      sessionStorage.clear();
      navigate("/");
    }
  };

  return (
    <div className="outer-container">
      <ToastContainer />
      <h4 className="logout" onClick={handleLogOut}>
        Log Out
      </h4>
      <h2>Chat Application</h2>
      <h3 className="roomName">{sessionStorage.getItem("r_name")}</h3>
      <div className="innerOuter">
        <div className="roomsdata">
          {userName &&
            userName?.map((value, index) => (
              <h3 key={index}>{value.username}</h3>
            ))}
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
                              data.username === sessionStorageName
                                ? "outgoingMessage"
                                : "incomingMessage"
                            }
                          >
                            <h4 key={index}>
                              {data.message}
                              <p className="datauserName">{data.username}</p>
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
            <form onSubmit={handleMessageSubmit}>
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
