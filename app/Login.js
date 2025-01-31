"use client"; // Mark this component as a Client Component

import React, { useEffect, useState } from 'react';
import { useGetUserQuery, useLoginUserMutation, useSignupUserMutation } from './libs/apis/user';
import Loader from './../components/loader/loader'
import { generateUsername } from '@utils';
import ApiLoader from './../components/ApiLoader'
const App = () => {

  const [isLogin, setIsLogin] = useState(true);
  const [isSignup, setSignup] = useState(false)
  const [isLoggedin, setIsLoggedin] = useState(false)

  
  const [ signupFd , setSignupFd ] = useState({
                email:{ name:"email" , value:"" , error: false , message:"email is required" },
                username:{ name:"username" , value:"" , error: false , message:"username is required" },
                password:{ name:"password" , value:"" , error: false , message:"password is required" },
                userType:{ name:"userType" , value:"" , error: false , message:"user type is required " },
   })


   const [ loginFd , setLoginFd ] = useState({
    email:{ name:"email" , value:"" , error: false , message:"email is required" },
    password:{ name:"password" , value:"" , error: false , message:"password is required" },
    userType:{ name:"userType" , value:"" , error: false , message:"user type is required " },
})

  // custom hooks
  const {data:userTypes , isLoading} = useGetUserQuery()
  const [registerUser ,{data:newUserData , isLoading:newUserDataLoader}] = useSignupUserMutation()
  const [loginNewUser , { data:loginNewUserData , isLoading:loginNewUserLoading}] = useLoginUserMutation()
  const handleSignupClick = () => {
    setIsLogin(false);
  };


  const loginOnchangeHandler =(e)=>{
    const { name , value} = e.target
    setLoginFd(p=>({...p  , [name]:{...p[name] , value:value  }     }))

  }


    const onChangeHandler = (e )=>{
     const { name , value} = e.target
     
      if(name=="email") {
        let splitEmail =value.split('@')[0]
        let randomUsername = generateUsername(splitEmail)
        setSignupFd(p=>({...p  , ['username']:{...p['username'] , value:randomUsername  }     }))
      }

      if(name=="username") {
       
         if(signupFd.email.value) {
          let splitEmail =signupFd.email.value.split('@')[0]
             
          console.log(value.length,splitEmail.length)
          if(value.length>splitEmail.length) {
            setSignupFd(p=>({...p  , ['username']:{...p['username'] , value:value  }     })) 
          }else{
            return 
          }
         }
      
         
      }


       setSignupFd(p=>({...p  , [name]:{...p[name] , value:value  }     }))
    }

    const onBlur = (e)=>{
     const  { name , value} = e.target
    
        if(!value) {
          setSignupFd(p=>({
            ...p , [name]:{...p[name] , required:true  }
        })) 
      }
    }

    const loginOnBlur = (e)=>{
       
      const  { name , value} = e.target
    
        if(!value) {
          setLoginFd(p=>({
            ...p , [name]:{...p[name] , required:true  }
        })) 
      }

    }
   
  const handleLoginClick = () => {
    setIsLogin(true);
  };



const { email , password ,userType , username} = signupFd



const signupUser= (e)=>{
  e.preventDefault()
  console.log("signup user")
  let payload = { email:email.value , username:username.value , password:password.value , userType:Number( userType.value)}
  
  registerUser(payload)
  
}

const loginUser = (e)=>{
   
  e.preventDefault()
  let payload = { emailOrUsername:loginFd.email.value ,  password:loginFd.password.value , userType:Number( loginFd.userType.value)}
  loginNewUser(payload)

}



// for signup 
useEffect(()=>{

  const { email , password ,userType , username} = signupFd

   if(email.value &&  password.value && userType.value && username.value) 
    setSignup(true)  
  else 
    setSignup(false)  

   
}, [email.value , password.value ,userType.value , username.value])










// for login 
useEffect(()=>{

  const { email , password ,userType } = loginFd

   if(email.value &&  password.value && userType.value ) 
          setIsLoggedin(true)
    else
    setIsLoggedin(false)
           
   
}, [loginFd.email.value , loginFd.password.value ,loginFd.userType.value ])


return (
     <>
     
    <div className="wrapper">
      <div className="title-text">
        <div className={`title login ${isLogin ? '' : 'slide'}`}>{isLogin?
        
        `Login as [${!isLoading  &&  userTypes?.data.find(item=> item.id==loginFd.userType.value)?.user_type || "" }] `:
        
        `Signup as [${!isLoading  &&  userTypes?.data.find(item=> item.id==signupFd.userType.value)?.user_type || "" }] `
        }</div>
        {/* <div className={`title signup ${isLogin ? 'slide' : ''}`}>Signup Form</div> */}
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
          <form  className="login" onSubmit={loginUser} >
            <div className="field">
              <input type="text" onBlur={loginOnBlur} onChange={loginOnchangeHandler} name={loginFd.email.name} value={loginFd.email.value} placeholder="Email or Username" required />
            </div>

            { !loginFd.email.value && loginFd.email.required &&  <span style={{color:"red"}} > {loginFd.email.message} </span> } 
            
            <div className="field">
              <input type="password" onBlur={loginOnBlur} onChange={loginOnchangeHandler} name={loginFd.password.name} value={loginFd.password.value} placeholder="Password" required />
            </div>

            { !loginFd.password.value && loginFd.password.required &&  <span style={{color:"red"}} > {loginFd.password.message} </span> } 
            

            <div className="pass-link">
              <a href="#">Forgot password?</a>
            </div>


            <div className="field fields">
              <select onBlur={loginOnBlur} onChange={loginOnchangeHandler}   name={loginFd.userType.name} value={loginFd.userType.value}  className='input' required>
                <option value="" disabled selected>
                  Select User Type
                </option>
                  {!isLoading  && userTypes?.data?.map(ele=>(
                    <option value={ele.id}>{ele.user_type}</option>
                ))}
              </select>
            </div>


           {
            loginNewUserLoading? <ApiLoader height={"20px"} width={"20px"} /> :
            <div className="field btn" style={{opacity:isLoggedin?1:"0.4"}}>
              <div className="btn-layer"></div>
              <input type="submit" value="Login" disabled={isLoggedin?false:true} />
            </div> 
           }
           


            <div className="signup-link">
              Not a member? <a href="#" onClick={handleSignupClick}>Signup now</a>
            </div>
          </form>
          <form  className="signup" onSubmit={signupUser}>
          
            <div className="field">
              <input type="text" onChange={onChangeHandler} onBlur={onBlur}  name={email.name} value={email.value} placeholder="Email Address" required />
            </div>
               { !email.value && email.required &&  <span style={{color:"red"}} > {email.message} </span> } 
            <div className="field">
              <input type="text" placeholder="User Name" onBlur={onBlur}  onChange={onChangeHandler}  name={username.name} value={username.value}  required />
            </div>
            { !username.value && username.required &&  <span style={{color:"red"}} > {username.message} </span> } 


            <div className="field">
              <input type="password" onChange={onChangeHandler} onBlur={onBlur}  name={password.name} value={password.value}  placeholder="Password" required />
            </div>
            
            { !password.value && password.required &&  <span style={{color:"red"}} > {password.message} </span> } 


            <div className="field fields">
         
              <select onChange={onChangeHandler} onBlur={onBlur}  name={userType.name} value={userType.value}  className='input' required>
                <option value="" disabled selected>
                  Select User Type
                </option>
                  {!isLoading  && userTypes?.data?.map(ele=>(
                    <option value={ele.id}>{ele.user_type}</option>
                ))}
              </select>
            </div>

            { !userType.value && userType.required &&  <span style={{color:"red"}} > {userType.message} </span> } 
                          
              

           {newUserDataLoader?  <ApiLoader height={"20px"} width={"20px"} />:
            <div className="field btn" style={{opacity : isSignup?1:"0.4"}} > 
              <div className="btn-layer"></div>
              <input type="submit" disabled={isSignup?false:true} value="Signup" />
            </div>
           }
          

          </form>
        </div>
      </div>


    </div>
    </>

  );
};

export default App;