import React from 'react';
import SignUp from './SignUp'
import SignIn from './SignIn'
import ProposalSubmission from './ProposalSubmission'
import { BrowserRouter as Router, Route, Link } from "react-router-dom";


function menu(){
  return<nav>
  <ul>
    <li>
      <Link to="/ProposalSubmission/">Proposal</Link>
    </li>
    <li>
      <Link to="/SignUp/">Registration</Link>
    </li>
    <li>
      <Link to="/SignIn/">Login</Link>
    </li>
  </ul>
</nav>
}


function App() {
  return (
    <Router>
    <div className="App">
        <Route exact path="/" component={menu} />
        <Route path="/ProposalSubmission" component={ProposalSubmission} />
        <Route path="/SignUp" component={SignUp} />
        <Route path="/SignIn" component={SignIn} />
    </div>
    </Router>
  );
}

export default App;
