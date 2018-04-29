
import React, { Component } from 'react';
import athena_logo from './athena_logo.png';
import './App.css';
import { JsonEditor } from 'react-json-edit';
import axios from 'axios';
import Main from './Main';

import {withRouter} from 'react-router-dom'

// Import
import {
    JsonTree,
    ADD_DELTA_TYPE,
    REMOVE_DELTA_TYPE,
    UPDATE_DELTA_TYPE,
    DATA_TYPES,
    INPUT_USAGE_TYPES,
} from 'react-editable-json-tree'


const gUserName = "user1";
const gFileName = "test_profile7";
class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            jsonFile: {}
        }

    }
    componentDidMount() {

        console.log("JsonEdit: componenet did mount called ");

        const url = 'http://localhost:3000/users/' + gUserName + '/profiles/' + gFileName + '.json';
        var _this = this;

        this.serverRequest =
            axios
                .get(url)
                .then(function (result) {
                    console.log("result: " + result.data);
                    _this.setState({
                        jsonFile: result.data
                    });
                })

                

        // const url = 'http://localhost:3000/users/' + gUserName + 'profiles/' + gFileName + '.json';


    }
    render() {
        return (

            <div className="App">
                <header className="App-header">
                    <img src={athena_logo} className="App-logo" alt="logo" />
                    <h1 className="App-title">Personalization Profile Editing</h1>
                    <p className="App-intro">Edit your personal profile here</p>
                </header>
           <Main history={this.props.history}/>
            </div>
        );
    }

}



export default withRouter(App);
