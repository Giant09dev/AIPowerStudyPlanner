"use client";

import { useEffect } from "react";

const AddBootstrap = () => {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.js");
  }, []);
  return <></>;
};

export default AddBootstrap;
