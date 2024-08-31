import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import moment from "moment";
import "../Style/userlist.css";
const UserList = () => {
  const sessionStorageName = sessionStorage.getItem("from");
  const navigate = useNavigate();
  const [users, setUsers] = useState();
  const [groupinfo, setGroupInfo] = useState();
  const [groupNameerror, setGroupNameError] = useState("");
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    async function fetchData() {
      const response = await axios.get(
        `${process.env.REACT_APP_Server_URL}/getAllUser`
      );
      if (response.status === 200) {
        console.log("response data is", response.data.data);
        setUsers(response?.data?.data);
      }
    }
    fetchData();
  }, []);

  const onUserSelect = async (data) => {
    console.log("Data is ", data);
    data.usergroup.push(sessionStorageName);
    const groupname = window.prompt("Please Enter the name of Group");
    if (groupname && groupname !== null && groupname !== undefined) {
      setGroupInfo({
        ...groupinfo,
        group_name: groupname,
        users: data.usergroup,
        microtime: Date.now(),
        time: moment().format("hh:mm a"),
        date: moment().format("Do MMM YYYY"),
      });
    }
  };

  useEffect(() => {
    async function submitData() {
      if (groupinfo) {
        const result = await axios.post(
          "http://localhost:8001/savegroupdata",
          groupinfo
        );
        if (result.data.statusCode === 200) {
          console.log("Result is ", result);
          if (
            groupinfo.group_name &&
            groupinfo.group_name !== null &&
            groupinfo.group_name !== undefined
          ) {
            navigate("/chat");
          }
        } else if (result?.data?.statusCode === 409) {
          setGroupNameError("Group Name is Already Exist");
          const inputvalue = document.querySelectorAll(".userlist");
          for (let i = 0; i < inputvalue.length; i++) {
            inputvalue[i].checked = false;
          }
        }
      }
    }
    submitData();
  }, [groupinfo]);

  return (
    <div className="maincontainer">
      <h2 className="title">User Listing</h2>
      <h3 className="groupnameError">{groupNameerror && groupNameerror}</h3>
      <div className="userlist">
        <form onSubmit={handleSubmit(onUserSelect)}>
          {users &&
            users?.map((item, index) => {
              if (item.username !== sessionStorageName) {
                return (
                  <div className="userShow">
                    <input
                      id={index}
                      type="checkbox"
                      value={item.username}
                      name="usergroup"
                      className="userlist"
                      {...register("usergroup", {
                        required: "Please Choose At Least One",
                      })}
                    />
                    <label htmlFor={index} className="usernameLabel">
                      {item.username}
                    </label>
                  </div>
                );
              }
            })}
          <div id="submitBtn">
            <p className="userSelecterror"> {errors?.usergroup?.message}</p>

            <button id="submitbtn">Create Group</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserList;
