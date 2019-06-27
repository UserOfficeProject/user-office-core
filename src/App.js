import React, {createContext, useState} from 'react';
import SignUp from './SignUp'
import SignIn from './SignIn'
import DashBoard from './DashBoard'
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Redirect } from 'react-router-dom';

export const AppContext = createContext();


const PrivateRoute = ({ component: Component, authed, ...rest }) => (
  <Route {...rest} render={(props) => (
    authed
      ? <Component {...props} />
      : <Redirect to='/SignIn' />
  )} />
)


function App() {
  const [token, setToken] = useState(null);
  console.log(token)
  return (
    <Router>
    <div className="App">
      <AppContext.Provider value={{token, setToken}} >
      <Switch>
        <Route path="/SignUp" component={SignUp} />
        <Route path="/SignIn" component={SignIn} />
        <PrivateRoute authed={token} path="/" component={DashBoard}/>
      </Switch>
      </AppContext.Provider>

    </div>
    </Router>
  );
}

export default App;
