import React from 'react';
import { Redirect } from 'react-router-dom';

function withAuth(Component) {
  return class extends React.Component {
    constructor() {
      super();
      this.state = {
        authenticated: true
      };
    }

    componentDidMount() {
      fetch('/verifyToken')
        .then(res => {
          if (res.status === 200) {
            this.setState({ authenticated: true });
          } else {
            this.setState({ authenticated: false });
          }
        }).catch(err => {
          console.error(err);
          this.setState({ authenticated: false });
        });
    }

    render() {
      if (!this.state.authenticated) return <Redirect to='/login' />;
      else return <Component {...this.props} />;
    }
  }
}

export default withAuth;
