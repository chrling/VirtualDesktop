import React from 'react';
import '../styles/Login.css';

class Login extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      alertContent: ''
    };
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    fetch('/signin', {
      method: 'POST',
      body: JSON.stringify(this.state),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => {
      if (res.status === 200) {
        this.props.history.push('/');
      } else if (res.status === 401) {
        this.setState({ 
          alertContent: 'Username or password incorrect'
        });
      }
    }).catch(err => {
      console.error(err);
    });
  }

  signup = (e) => {
    e.preventDefault();
    fetch('/signup', {
      method: 'POST',
      body: JSON.stringify(this.state),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => {
      if (res.status === 200) {
        this.setState({ 
          alertContent: 'Successfully registered'
        });
      } else if (res.status === 409) {
        this.setState({ 
          alertContent: 'Username is taken'
        });
      }
    }).catch(err => {
      console.error(err);
    });
  }

  render () {
    return (
      <div className="login-page">
        <form className='login-form' onSubmit={this.handleSubmit}>
          Username:
          <input className='login-input' type='text' name='username' value={this.state.username} onChange={this.handleChange} />
          Password:
          <input className='login-input' type='password' name='password' value={this.state.password} onChange={this.handleChange} />
          <div className='buttons'>
            <input className='login-btn' type='submit' value='Login' />
            <input className='login-btn' type='button' onClick={this.signup} value='Register' />
          </div>
          <div>{this.state.alertContent}</div>
        </form>
        <footer id='footer'>
          <a href="/credits.html" id="footer">Credits</a>
        </footer>
      </div>
    )
  };
}

export default Login;
