"use client"; // Mark this component as a Client Component
import './assets/css/login.css'
import React, { useContext, useEffect, useState } from 'react';
import { useGetUserQuery, useLoginUserMutation, useSignupUserMutation } from './libs/apis/user';
import Loader from './../components/loader/loader'
import { generateUsername } from '@utils';
import ApiLoader from './../components/ApiLoader'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useRouter } from '@node_modules/next/navigation';
import { contextProvider } from '@components/AppProvider';
import { SWC_KEYS } from '@constants';
import { fetGlobalNavbar } from './libs/slice/navMenuSlice';
import { useAppDispatch } from './libs/store';


const App = () => {

  const [isLogin, setIsLogin] = useState(true);
  const [isSignup, setSignup] = useState(false)
  const [isLoggedin, setIsLoggedin] = useState(false)
  const [userLoggedIn , setUserLoggedIn] = useState((false))
  let dispatch = useAppDispatch()
  
  const [apiRes, setApiRes] = useState({
       loginRes:"" ,
       signUpRes:""
  })

  const { successMessage , errorMessage ,setCookie  } = useContext(contextProvider)
  let router =  useRouter()
  
  const [ signupFd , setSignupFd ] = useState({
                email:{ name:"email" , value:"" , error: false , message:"Email is required" },
                username:{ name:"username" , value:"" , error: false , message:"Username is required" },
                password:{ name:"password" , value:"" , error: false , message:"Password is required" },
                userType:{ name:"userType" , value:"" , error: false , message:"User type is required " },
   })


      const [ loginFd , setLoginFd ] = useState({
        email:{ name:"email" , value:"" , error: false , message:"Email is required" },
        password:{ name:"password" , value:"" , error: false , message:"Password is required" },
        userType:{ name:"userType" , value:"" , error: false , message:"User type is required " },
       }) 

    // custom hooks
    const {data:userTypes , isLoading} = useGetUserQuery()
    const [registerUser ,{data:newUserData , isLoading:newUserDataLoader}] = useSignupUserMutation()
    const [loginNewUser , { data:loginNewUserData , isLoading:loginNewUserLoading}] = useLoginUserMutation()
    const handleSignupClick = () => {
      setIsLogin(false);
    };




  const handleApiRes = (name , value )=>{
    setApiRes(p=>({...p , [name]: value }))
  }
  
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

// on login ser 
useEffect(()=>{
      if(loginNewUserData?.data?.token || newUserData?.data?.token) {
        
        setCookie(SWC_KEYS.SWC_TOKEN , loginNewUserData?.data?.token || newUserData?.data?.token  , 
          {
            domain: '.swiftcab.in', // ✅ Makes the cookie available to all subdomains
            path: '/',              // ✅ Accessible on the entire domain
            secure: true,           // ✅ Required if using HTTPS
            httpOnly: true,         // ✅ Prevents JavaScript access (optional)
            sameSite: 'None'        // ✅ Allows cross-site requests (important for subdomain sharing)
          }

        )  
        setCookie(SWC_KEYS.SWC_USER , loginNewUserData?.data?.usersObj || newUserData?.data?.usersObj ,
          {
            domain: '.swiftcab.in', // ✅ Makes the cookie available to all subdomains
            path: '/',              // ✅ Accessible on the entire domain
            secure: true,           // ✅ Required if using HTTPS
            httpOnly: true,         // ✅ Prevents JavaScript access (optional)
            sameSite: 'None'        // ✅ Allows cross-site requests (important for subdomain sharing)
          }

        )  

         
         const  { username } = loginNewUserData?.data?.usersObj || newUserData.data?.usersObj

         let selectedUserType = userTypes?.data.find(item=> item.id==loginFd.userType.value)?.name || 
                                    userTypes?.data.find(item=> item.id==signupFd.userType.value)?.name
        
                                     // success  
          setUserLoggedIn(true)
          setTimeout(()=>{
            setUserLoggedIn(false)
            dispatch(fetGlobalNavbar({userType:selectedUserType})) // getting navbar 
            router.push(`/${selectedUserType}/${username.toLowerCase()}`)
          }, 2000 )
       }else{
            if(isLogin)
              errorMessage(loginNewUserData?.data)
            if(!isLogin)
              errorMessage(newUserData?.data)
       
        }
}, [loginNewUserData?.data , newUserData?.data ])

return (
     <>

     {userLoggedIn &&  <DotLottieReact
      src="https://lottie.host/f4331998-dfdc-4aed-a07a-876ff81d8744/HhAFaPYpDF.lottie"
      loop
      autoplay
      className="lottie-animation"
     />
    }

    
    <div className="wrapper login_box"  style={{opacity: (newUserDataLoader || loginNewUserLoading || userLoggedIn) ?0.2:1}} >
      <div className="title-text">
        <div className={`title login ${isLogin ? '' : 'slide'}`}>{isLogin?
        
         <span> Login as  { !isLoading  &&  <span className='line-1 anim-typewriter'> {userTypes?.data.find(item=> item.id==loginFd.userType.value)?.user_type || ""}</span>   }   </span> :
      
         <span> Signup as  { !isLoading  &&  <span className='line-1 anim-typewriter'> {userTypes?.data.find(item=> item.id==signupFd.userType.value)?.user_type || ""}</span>   }   </span>
      
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


            {isLoading ?  <ApiLoader height={"20px"} width={"20px"} />  :  
            <div className="field ">
              <select onBlur={loginOnBlur} onChange={loginOnchangeHandler}   name={loginFd.userType.name} value={loginFd.userType.value}  className='input' required>
                <option value="" disabled selected>
                  Select User Type
                </option>
                  {!isLoading  && userTypes?.data?.map(ele=>(
                    <option value={ele.id}>{ele.name}</option>
                ))}
              </select>
            </div>}

           {
            loginNewUserLoading? <ApiLoader height={"20px"} width={"20px"} /> :
            <div className="field btn" style={{opacity:isLoggedin?1:"0.4"}}>
              <div className="btn-layer">
              <input type="submit" value="Login" disabled={isLoggedin?false:true} />
              </div>
            
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


            { isLoading ?  <ApiLoader height={"20px"} width={"20px"} /> : 
             <div className="field fields">
             <select onChange={onChangeHandler} onBlur={onBlur}  name={userType.name} value={userType.value}  className='input' required>
               <option value="" disabled selected>
                 Select User Type
               </option>
                 {!isLoading  && userTypes?.data?.map(ele=>(
                   <option value={ele.id}>{ele.name}</option>
               ))}
             </select>
           </div>
            } 
             
            { !userType.value && userType.required &&  <span style={{color:"red"}} > {userType.message} </span> } 
                          
           {newUserDataLoader?  <ApiLoader height={"20px"} width={"20px"} />:
            <div className="field btn" style={{opacity : isSignup?1:"0.4"}} > 
              <div className="btn-layer">
              <input type="submit" disabled={isSignup?false:true} value="Signup" />
              </div>
              
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
