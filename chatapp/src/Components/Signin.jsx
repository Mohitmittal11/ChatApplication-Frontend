import { React, useEffect, useState } from "react";
import useAuthStore from "../Store/authStore";
import "../Style/signin.css";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const Signin = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();

  const { name } = useAuthStore.getState();
  useEffect(() => {
    if (sessionStorage.length > 0) {
      navigate("/chat");
    }
  }, [navigate]);
  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm();

  const formSubmit = async (data) => {
    setIsActive(true);

    const result = await axios.post(
      `${process.env.REACT_APP_Server_URL}/getSigininInfo`,
      data
    );
    if (result?.data?.statusCode === 200) {
      sessionStorage.setItem("from", result?.data?.data[0]?.username);
      sessionStorage.setItem("userId", result?.data?.data[0]._id);
      navigate("/chat");
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
            onFocus={() => {
              setValue("user_name", name);
            }}
            name="user_name"
            type="text"
            placeholder="Enter Your Name"
            className="input-Name"
          />
          <p className="errors"> {errors?.user_name?.message}</p>
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
