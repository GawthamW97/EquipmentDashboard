import React, { Fragment } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import NavBar from "../src/Layout/Navbar";
import Graph from "../src/components/Graph";

const App = () => (
  <Router>
    <Fragment>
      <NavBar />
      <Route exact path="/" />
      <Graph />
    </Fragment>
  </Router>
);

export default App;
