import React from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import Lobby from './components/Lobby';
import Desktop from './components/Desktop';
import Login from './components/Login';
import withAuth from './withAuth';
import api from './api.js'

let HOST = window.location.origin.replace(/^http/, 'ws');
if (window.location.hostname === "localhost"){
  HOST = 'ws://localhost:3001';
}

class App extends React.Component {
  ws = api.connect(HOST);
  events = [];

  addMsgEvent = (event, callback) => {
    this.events[event] = callback;
    let ws = api.getWebSocket();
    ws.onmessage = (message) => {
      let msg = JSON.parse(message.data);
      let eventNames = Object.keys(this.events);
      for (const eventName of eventNames) {
        if (msg.event === eventName) {
          this.events[eventName](msg);
          break;
        }
      }
    }
  }

  render () {
    const LobbyWithAuth = withAuth(Lobby);
    const DesktopWithAuth = withAuth(Desktop);
    return (
      <HashRouter>
        <div>
          <Switch>
            <Route exact path="/" 
              render={props => (
                <LobbyWithAuth {...props} addMsgEvent={this.addMsgEvent} />
              )}
            />
            <Route path="/desktop" 
              render={props => (
                <DesktopWithAuth {...props} addMsgEvent={this.addMsgEvent} />
              )}
            />
            <Route path="/login" component={Login} />
          </Switch>
        </div>
      </HashRouter>
    )
  };
}

export default App;
