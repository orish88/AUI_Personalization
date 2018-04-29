import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => (
  <div>
    <h1>Welcome to the Personalization Profile Editing Website!</h1>

    <li><Link to='/LoginPage'>Log in</Link></li>
    {/* <li><Link to='/JsonEditPage'>Profile Editor</Link></li> */}

  </div>
)



export default Home
