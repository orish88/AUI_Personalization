import React from 'react'
import { Link } from 'react-router-dom'

import { GoogleLogin } from 'react-google-login-component';
import JsonEditPage from './JsonEditPage'
import {withRouter} from 'react-router-dom'

var gHistory;
class Login extends React.Component {
    
    constructor(props, context) {
        super(props, context);

        console.log("Login ctr");
        // this.props.history.push("/JsonEditPage");
        this.state = {  history:this.props.history };
        gHistory = this.props.history;    
        // this.setState({history:this.props.history});
    }

    responseGoogle(googleUser) {
        var id_token = googleUser.getAuthResponse().id_token;
        var googleId = googleUser.getId();
        var googleIdStr = JSON.stringify(googleId);
        var str = JSON.stringify(googleUser);
        console.log("googlUser: "+str);
        console.log("googlUserKeys: "+Object.keys(googleUser));
        console.log("google id: "+  googleIdStr);
        console.log({ accessToken: id_token });
        
        gHistory.push({
            pathname: '/JsonEditPage',
            search: '',
            state: { id: googleIdStr  }
          });
        //anything else you want to do(save to localStorage)...
    }

    render() {
        return (
            <div>
                <GoogleLogin socialId="somesocialid"
                    className="google-login"
                    scope="profile"
                    fetchBasicProfile={false}
                    responseHandler={this.responseGoogle}
                    buttonText="Login With Google" ><li></li></GoogleLogin>
                    
            </div>
        );
    }


}

export default Login;