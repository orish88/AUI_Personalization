
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

var gUserName = "user1";
var gFileName = "test_profile7";
class JsonEditPage extends Component {

    constructor(props) {
        super(props);
        gUserName = this.props.location.state.id;
        console.log("gUserName: "+gUserName);
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

            <div className="JsonEditPage">

                <header className="JsonEditPage-header">
                    <img src={athena_logo} className="JsonEditPage-logo" alt="logo" />
                    <h1 className="JsonEditPage-title">Profile Edit Page!!</h1>
                </header>
                <p className="JsonEditPage-intro">
                    To get started, edit <code>src/App.js</code> and save to reload.</p>
                <JsonEdit jsonFile={this.state.jsonFile} />
                <button id="bt_save_profile" onClick={()=>{this.saveProfile()}}>Save profile changes</button>
            </div>
        );
    }
    saveProfile(){
        const url = 'http://localhost:3000/users/' + gUserName + '/profiles/' + gFileName + '.json';
        var _this = this;
        const jsonContent = this.state.jsonFile;

        console.log("jsonContent to be sent: "+Object.keys(jsonContent));
        axios.post(url, jsonContent)
          .then(function (response) {
            alert(response);  
            console.log(response);
          })
          .catch(function (error) {
            alert(error);
            console.log(error);
          });
    }
}


class JsonEdit extends Component {

    render() {
        return (
            <div className="JsonEdit">

                <JsonTree rootName="Profile Settings" data={this.props.jsonFile}
                    isCollapsed={(keyPath, deep) => (deep !== 0)}
                    readOnly={(keyName, data, keyPath, deep, dataType) => {
                        if (deep < 1) {
                            return true;
                        }
                        return false;
                    }}
                />
            </div>
        );
    }
}

export default withRouter(JsonEditPage);
