import React from "react";
import { Link } from "react-router-dom";
import { Typography } from "@material-ui/core";

const Navbar = () => {
  return (
    <nav>
      <div style={{ background: "#3949ab" }}>
        <Typography variant="h4" style={{ padding: "20px" }}>
          <Link to="/" style={{ color: "white", textDecoration: "none" }}>
            Equipment Dashboard
          </Link>
        </Typography>
      </div>
    </nav>
  );
};

export default Navbar;
