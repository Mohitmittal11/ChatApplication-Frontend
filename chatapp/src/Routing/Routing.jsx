import React from "react";
import { Routes, Route } from "react-router-dom";
import Room from "../Components/Room";
import Client from "../Components/Client";
import Signin from "../Components/Signin";
const Routing = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Signin />} />
        <Route path="/signup" element={<Room />} />
        <Route path="/chat" element={<Client />} />
      </Routes>
    </div>
  );
};

export default Routing;
