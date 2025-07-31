import React, { useEffect, useState } from 'react';

function LogOut() {
  const logOut = () => {
    window.localStorage.removeItem("loggedWyreUserAdmin");
    window.localStorage.removeItem("currentUser");
    window.location.href = "/";
  };
  useEffect(() => {
    logOut();
  });
  return <div>{""}</div>;
}

export default LogOut;
