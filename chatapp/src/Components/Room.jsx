import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Style/room.css";
import { useForm } from "react-hook-form";
import axios from "axios";
import Cookies from "js-cookie";
import { DateTime } from "luxon";

const Room = () => {
  const navigate = useNavigate();
  const [selectdata, setSelectData] = useState();
  const [isuserRegistered, setIsUserRegistered] = useState();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchRoomData = async () => {
      const resultData = await axios.get(`${process.env.REACT_APP_Server_URL}/getroomOption`);
      if (resultData) {
        setSelectData(resultData?.data?.data);
      }
    };
    fetchRoomData();
  }, []);

  const handleFormSubmit = async (data) => {
    data = {
      ...data,
      microtime: Date.now(),
      date: new Date().toDateString(),
      time: DateTime.local().toLocaleString(DateTime.TIME_24_SIMPLE),
    };
    const result = await axios.post(`${process.env.REACT_APP_Server_URL}/saveroomdata`, data);
    if (result?.data?.statusCode === 200) {
      // Cookies.set("s_id", result?.data?.s_id);
      navigate("/");
    }
    if (result?.data?.statusCode === 409) {
      setIsUserRegistered("User is Already Registered  for Same Room");
    }
  };

  return (
    <div className="main-room-container">
      <h2 className="join-room">Sign-up</h2>
      <h3 className="userRegisteredError">
        {isuserRegistered && isuserRegistered}
      </h3>
      <div className="roomform">
        <form id="form" onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="userInput">
            <label className="usernamelabel" htmlFor="userid">
              Enter Username
            </label>
            <input
              onKeyDown={(e) => {
                if (e.code === "Space" && e.target.value === "") {
                  e.preventDefault();
                }
              }}
              className="Username"
              type="text"
              name="username"
              id="userid"
              {...register("username", {
                required: "*Username is Required",
                pattern: {
                  value: /^[a-zA-Z ]*[a-zA-Z]$/g,
                  message: "*Please Fill Only Characters",
                },
              })}
            />
            <p className="roomError">
              {errors?.username && errors?.username?.message}
            </p>
          </div>
          <div className="select-room">
            <label className="usernamelabel">Select Room</label>
            <select
              name="room_name"
              className="selectRoom"
              {...register("room_name", {
                required: "*Please Choose one Option",
              })}
            >
              {" "}
              <option value={""}>Choose Room</option>
              {selectdata &&
                selectdata.map((value) => (
                  <option value={`${value.room_name_type}`}>
                    {value.room_name_type}
                  </option>
                ))}
            </select>
            <p className="roomError">
              {errors?.room_name && errors?.room_name?.message}
            </p>
          </div>
          <button id="joinroomid">Join Room</button>
          <span onClick={() => navigate("/")} className="sigininNav">
            Signin ?
          </span>
        </form>
      </div>
    </div>
  );
};

export default Room;
