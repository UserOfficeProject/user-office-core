import React, {createContext, useState} from 'react';
import SignUp from './SignUp'
import SignIn from './SignIn'
import DashBoard from './DashBoard'
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Redirect } from 'react-router-dom';
import { GraphQLClient } from 'graphql-request'

export const AppContext = createContext();


const PrivateRoute = ({ component: Component, authed, ...rest }) => (
  <Route {...rest} render={(props) => (
    authed
      ? <Component {...props} />
      : <Redirect to='/SignIn' />
  )} />
)


async function apiCall(token, query, variables) {
  const endpoint = '/graphql'
  const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  return graphQLClient.request(query, variables).catch((error => console.log("take care of error")))
}


function App() {
 //const [token, setToken] = useState(null);
 // For development
  const [token, setToken] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OSwicm9sZXMiOlt7ImlkIjoxLCJzaG9ydENvZGUiOiJ1c2VyIiwidGl0bGUiOiJVc2VyIn0seyJpZCI6Miwic2hvcnRDb2RlIjoidXNlcl9vZmZpY2VyIiwidGl0bGUiOiJVc2VyIE9mZmljZXIifV0sImlhdCI6MTU2MTU1NTA5MywiZXhwIjoxNTkzMTEyNjkzfQ.84BAbKZzEZWD9Ayq-JVwY1PeMj1qUZKiz_JuumVoCMI");

  return (
    <Router>
    <div className="App">
      <AppContext.Provider value={{token, setToken, apiCall: apiCall.bind(this,token)}} >
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
