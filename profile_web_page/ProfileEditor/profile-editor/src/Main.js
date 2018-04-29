
// import React from 'react'
import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom'

import athena_logo from './athena_logo.png';
import './App.css';

import axios from 'axios';
import Home from './Home'
import { Link } from 'react-router-dom'

import { GoogleLogin } from 'react-google-login-component';
import JsonEditPage from './JsonEditPage'
import {withRouter} from 'react-router-dom'
import Login from './Login'
import {
    JsonTree,
    ADD_DELTA_TYPE,
    REMOVE_DELTA_TYPE,
    UPDATE_DELTA_TYPE,
    DATA_TYPES,
    INPUT_USAGE_TYPES,
} from 'react-editable-json-tree'
console.log("Home log: "+Home);
console.log("jsonEditPage log: "+JsonEditPage);


const Main = () => (

    <main>
        <Switch>
            <Route exact path='/' component={Home} />
            <Route path='/LoginPage' render={(props) => (
                <Login history={props.history}  />
            )} />
            <Route path='/JsonEditPage' render={(props) => (
                <JsonEditPage history={props.history}  />
            )} />
        </Switch>
    </main>
);



export default Main