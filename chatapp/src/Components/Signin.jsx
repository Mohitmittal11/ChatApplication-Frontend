import { React, useEffect, useState } from "react";
import "../Style/signin.css";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const Signin = () => {
  const [optionData, setOptionData] = useState();
  const [errorMessage, setErrorMessage] = useState("");
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  useEffect(() => {
    const fetchRoomData = async () => {
      const resultData = await axios.get(
        `${process.env.REACT_APP_Server_URL}/getroomOption`
      );
      if (resultData) {
        setOptionData(resultData?.data?.data);
      }
    };
    if (sessionStorage.length > 0) {
      navigate("/chat");
    } else {
      fetchRoomData();
    }
  }, []);

  const formSubmit = async (data) => {
    setIsActive(true);
    const result = await axios.post(
      `${process.env.REACT_APP_Server_URL}/getSigininInfo`,
      data
    );
    if (result?.data?.statusCode === 200) {
      sessionStorage.setItem("userId", result?.data?.data[0]?.room_id);
      sessionStorage.setItem("username", result?.data?.data[0]?.username);
      sessionStorage.setItem("r_name", result?.data?.data[0]?.room_name);
      navigate("/chat");
      setIsActive(false);
    } else {
      setErrorMessage("Please Fill Correct Credentials");
      setIsActive(false);
    }
  };
  return (
    <div className="mainContainer">
      <h2 className="joinroom">Join Room</h2>
      <h3 className="error">{errorMessage && errorMessage}</h3>
      <div className="formContainer">
        <form id="signinform" onSubmit={handleSubmit(formSubmit)}>
          <input
            {...register("user_name", {
              required: "* Please Enter User Name",
              pattern: {
                value: /^[a-zA-Z ]*[a-zA-Z]$/g,
                message: "*Please Fill Only Characters",
              },
            })}
            onKeyDown={(e) => {
              if (e.code === "Space" && e.target.value === "") {
                e.preventDefault();
              }
            }}
            name="user_name"
            type="text"
            placeholder="Enter Your Name"
            className="input-Name"
          />
          <p className="errors"> {errors?.user_name?.message}</p>
          <div className="select-room">
            <label className="usernamelabel">Select Room</label>
            <select
              name="room_name"
              className="selectRoomdata"
              {...register("room_name", {
                required: "*Please Choose one Option",
              })}
            >
              {" "}
              <option value={""}>Choose Room</option>
              {optionData &&
                optionData.map((value) => (
                  <option value={`${value.room_name_type}`}>
                    {value.room_name_type}
                  </option>
                ))}
            </select>
            <p className="roomError">
              {errors?.room_name && errors?.room_name?.message}
            </p>
          </div>
          <button id="sigininbtn">{isActive ? "Loading..." : "Sign In"}</button>
          <p onClick={() => navigate("/signup")} className="signUp">
            Sign Up?
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signin;
