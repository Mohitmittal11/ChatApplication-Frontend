import React from "react";
import { Routes, Route } from "react-router-dom";
import Room from "../Components/Room";
import Client from "../Components/Client";
import Signin from "../Components/Signin";
import UserList from "../Components/UserList";
const Routing = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Signin />} />
        <Route path="/signup" element={<Room />} />
        <Route path="/chat" element={<Client />} />
        <Route path="/userList" element={<UserList />} />
      </Routes>
    </div>
  );
};

export default Routing;
