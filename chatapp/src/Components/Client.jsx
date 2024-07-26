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
  const [userdata, setUserdata] = useState();
  const [socket, setSocket] = useState(null);
  const [userMessage, setUserMessage] = useState();
  const [userName, setUserName] = useState();

  let [messageData, setMessageData] = useState();

  useEffect(() => {
    if (!sessionStorageName || !sessionStorageRoomName || !sessionStorageId) {
      navigate("/");
    } else {
      setSocket(io(`${process.env.REACT_APP_Server_URL}`));
      async function fetchData() {
        const result = await axios.get(
          `${process.env.REACT_APP_Server_URL}/getUserData`,
          {
            params: {
              username: sessionStorageName,
              roomid: sessionStorageId,
            },
          }
        );

        const response = await axios.get(
          `${process.env.REACT_APP_Server_URL}/getUserAccordingtoRoom/${sessionStorageRoomName}`
        );

        if (result?.data?.statusCode === 200) {
          setUserMessage(result?.data?.data);
        }

        if (response?.data?.statusCode === 200) {
          setUserName(response?.data?.data);
        }
      }
      fetchData();
    }
  }, []);

  useEffect(() => {
    myref.current?.scrollIntoView({ behavior: "instant" });
  }, [userMessage]);

  useEffect(() => {
    const roomId = sessionStorage.getItem("userId");
    const userName = sessionStorageName;
    setMessageData({
      ...messageData,
      username: userName,
      room_id: roomId,
    });
    if (roomId && roomId !== null && roomId !== undefined) {
      socket?.emit("join", roomId);
      setUserdata({ ...userdata, roomid: roomId });
    }
  }, [socket]);

  const handleInputChange = (e) => {
    setUserdata({ ...userdata, usermessage: e.target.value });
    setMessageData({ ...messageData, message: e.target.value });
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    document.getElementById("sendmessageid").value = "";

    socket?.emit("message", userdata);
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
      if (result.status === 200) {
        window.location.reload();
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
          {userName && userName?.map((value) => <h3>{value.username}</h3>)}
        </div>
        <></>
        <div className="main-chat-container">
          <div id="message-Area">
            <div id="scrollAutomatically" className="message">
              {userMessage?.map((value) => {
                return (
                  <>
                    <h3 className="date">{value._date}</h3>
                    {value?.messageinfo?.map((data) => {
                      return (
                        <div
                          ref={myref}
                          className={
                            data.username === sessionStorageName
                              ? "outgoingMessage"
                              : "incomingMessage"
                          }
                        >
                          <h4>
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
              />
              <button id="sendbtn">Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Client;

//  {userMessage?.map(
//           (value) => (
//             (<h1>{value._date}</h1>),
//             value?.messageinfo?.map((data) => (
//               <div
//                 ref={myref}
//                 className={
//                   data.username === sessionStorageName
//                     ? "outgoingMessage"
//                     : "incomingMessage"
//                 }
//               >
//                 <h4>{data.message}</h4>
//                 <p>{data.time}</p>
//               </div>
//             ))
//           )
//         )}
