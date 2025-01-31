"use client"; // Mark this component as a Client Component

import React, { useEffect, useState } from 'react';
import { useGetUserQuery } from './libs/apis/user';

const App = () => {
  const [isLogin, setIsLogin] = useState(true);

  // custom hooks
  const {data:userTypes , isLoading} = useGetUserQuery()
  
  const handleSignupClick = () => {
    setIsLogin(false);
  };

  const handleLoginClick = () => {
    setIsLogin(true);
  };


  useEffect(()=>{
     

    
  }, [userTypes?.data])

  


  return (
    <div className="wrapper">
      <div className="title-text">
        <div className={`title login ${isLogin ? '' : 'slide'}`}>Login Form</div>
        <div className={`title signup ${isLogin ? 'slide' : ''}`}>Signup Form</div>
      </div>
      <div className="form-container">
        <div className="slide-controls">
          <input
            type="radio"
            name="slide"
            id="login"
            checked={isLogin}
            onChange={handleLoginClick}
          />
          <input
            type="radio"
            name="slide"
            id="signup"
            checked={!isLogin}
            onChange={handleSignupClick}
          />
          <label htmlFor="login" className="slide login">
            Login
          </label>
          <label htmlFor="signup" className="slide signup">
            Signup
          </label>
          <div className="slider-tab"></div>
        </div>
        <div className="form-inner" style={{ transform: isLogin ? "translateX(0)" : "translateX(-50%)" }}>
          <form action="#" className="login">
            <div className="field">
              <input type="text" placeholder="Email Address" required />
            </div>
            <div className="field">
              <input type="password" placeholder="Password" required />
            </div>
            <div className="pass-link">
              <a href="#">Forgot password?</a>
            </div>
            <div className="field btn">
              <div className="btn-layer"></div>
              <input type="submit" value="Login" />
            </div>
            <div className="signup-link">
              Not a member? <a href="#" onClick={handleSignupClick}>Signup now</a>
            </div>
          </form>
          <form action="#" className="signup">
            <div className="field">
              <input type="text" placeholder="User Name" required />
            </div>
            <div className="field">
              <input type="text" placeholder="Email Address" required />
            </div>
            <div className="field">
              <input type="password" placeholder="Password" required />
            </div>
            <div className="field fields">
         
              <select className='input' required>
                <option value="" disabled selected>
                  Select User Type
                </option>
                  {!isLoading  && userTypes?.data?.map(ele=>(
                    <option value={ele.id}>{ele.user_type}</option>
                ))}
              </select>
            </div>
            <div className="field btn">
              <div className="btn-layer"></div>
              <input type="submit" value="Signup" />
            </div>
          </form>
        </div>
      </div>


    </div>
  );
};

export default App;