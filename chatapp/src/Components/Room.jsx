import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Style/room.css";
import { useForm } from "react-hook-form";
import axios from "axios";
import { DateTime } from "luxon";

const Room = () => {
  const navigate = useNavigate();
  const [isuserRegistered, setIsUserRegistered] = useState();
  const [isActive, setIsActive] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (sessionStorage.length > 0) {
      navigate("/chat");
    }
  }, []);

  const handleFormSubmit = async (data) => {
    setIsActive(true);
    data = {
      ...data,
      microtime: Date.now(),
      date: new Date().toDateString(),
      time: DateTime.local().toLocaleString(DateTime.TIME_24_SIMPLE),
    };

    const result = await axios.post(
      `${process.env.REACT_APP_Server_URL}/saveUserData`,
      data
    );
    if (result?.data?.statusCode === 200) {
      console.log("Result is", result.data.data);
      sessionStorage.setItem("from", result?.data?.data?.username);
      sessionStorage.setItem("userId", result?.data?.data?._id);
      navigate("/chat");
    }
    if (result?.data?.statusCode === 409) {
      setIsUserRegistered("User is Already Registered");
      setIsActive(false);
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

          <button id="joinroomid">
            {isActive ? "Loading..." : "Join Room"}
          </button>
          <p onClick={() => navigate("/")} className="sigininNav">
            Signin ?
          </p>
        </form>
      </div>
    </div>
  );
};

export default Room;
