"use client";
import React, { useContext, useEffect, useState, useRef } from 'react';
import { useGetUserQuery, useLoginUserMutation, useSignupUserMutation } from './libs/apis/user';
import { generateUsername } from '@utils';
import ApiLoader from './../components/ApiLoader';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useRouter } from 'next/navigation';
import { contextProvider } from '@components/AppProvider';
import { SWC_KEYS } from '@constants';
import { fetGlobalNavbar } from './libs/slice/navMenuSlice';
import { useAppDispatch } from './libs/store';
import { Eye, EyeOff, ArrowRight, Car, Zap, Shield, Clock, CheckCircle2, Menu } from 'lucide-react';
import { IconSteeringWheel, IconUserExclamation, IconUsersPlus } from '@tabler/icons-react';
import { IconUserPlus } from '@tabler/icons-react';

// Particle Animation Component
const ParticleBackground = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const updateCanvasSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    updateCanvasSize();
    
    const particles = [];
    const particleCount = window.innerWidth < 768 ? 30 : 60;
    
    class Particle {
      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
        this.opacity = Math.random() * 0.5 + 0.3;
      }
      
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }
      
      draw() {
        ctx.fillStyle = `rgba(14, 165, 233, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow effect
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
        gradient.addColorStop(0, `rgba(14, 165, 233, ${this.opacity * 0.5})`);
        gradient.addColorStop(1, 'rgba(14, 165, 233, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
    
    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            ctx.strokeStyle = `rgba(14, 165, 233, ${0.15 * (1 - distance / 120)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    const handleResize = () => {
      updateCanvasSize();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
};

const App = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isSignup, setSignup] = useState(false);
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  let dispatch = useAppDispatch();

  const [apiRes, setApiRes] = useState({
    loginRes: "",
    signUpRes: ""
  });

  const { successMessage, errorMessage, setCookie } = useContext(contextProvider);
  let router = useRouter();

  const [signupFd, setSignupFd] = useState({
    email: { name: "email", value: "", error: false, message: "Email is required" },
    username: { name: "username", value: "", error: false, message: "Username is required" },
    password: { name: "password", value: "", error: false, message: "Password is required" },
    userType: { name: "userType", value: "", error: false, message: "User type is required" },
  });

  const [loginFd, setLoginFd] = useState({
    email: { name: "email", value: "", error: false, message: "Email is required" },
    password: { name: "password", value: "", error: false, message: "Password is required" },
    userType: { name: "userType", value: "", error: false, message: "User type is required" },
  });

  // custom hooks
  const { data: userTypes, isLoading } = useGetUserQuery();
  const [registerUser, { data: newUserData, isLoading: newUserDataLoader }] = useSignupUserMutation();
  const [loginNewUser, { data: loginNewUserData, isLoading: loginNewUserLoading }] = useLoginUserMutation();

  const handleSignupClick = () => {
    setIsLogin(false);
  };

  const handleApiRes = (name, value) => {
    setApiRes(p => ({ ...p, [name]: value }));
  };

  const loginOnchangeHandler = (e) => {
    const { name, value } = e.target;
    setLoginFd(p => ({ ...p, [name]: { ...p[name], value: value } }));
  };

  const onChangeHandler = (e) => {
    const { name, value } = e.target;

    if (name == "email") {
      let splitEmail = value.split('@')[0];
      let randomUsername = generateUsername(splitEmail);
      setSignupFd(p => ({ ...p, ['username']: { ...p['username'], value: randomUsername } }));
    }

    if (name == "username") {
      if (signupFd.email.value) {
        let splitEmail = signupFd.email.value.split('@')[0];
        if (value.length > splitEmail.length) {
          setSignupFd(p => ({ ...p, ['username']: { ...p['username'], value: value } }));
        } else {
          return;
        }
      }
    }
    setSignupFd(p => ({ ...p, [name]: { ...p[name], value: value } }));
  };

  const onBlur = (e) => {
    const { name, value } = e.target;
    if (!value) {
      setSignupFd(p => ({
        ...p, [name]: { ...p[name], required: true }
      }));
    }
  };

  const loginOnBlur = (e) => {
    const { name, value } = e.target;
    if (!value) {
      setLoginFd(p => ({
        ...p, [name]: { ...p[name], required: true }
      }));
    }
  };

  const handleLoginClick = () => {
    setIsLogin(true);
  };

  const { email, password, userType, username } = signupFd;

  const signupUser = (e) => {
    e.preventDefault();
    let payload = { email: email.value, username: username.value, password: password.value, userType: Number(userType.value) };
    registerUser(payload);
  };

  const loginUser = (e) => {
    e.preventDefault();
    let payload = { emailOrUsername: loginFd.email.value, password: loginFd.password.value, userType: Number(loginFd.userType.value) };
    loginNewUser(payload);
  };

  // for signup
  useEffect(() => {
    const { email, password, userType, username } = signupFd;
    if (email.value && password.value && userType.value && username.value)
      setSignup(true);
    else
      setSignup(false);
  }, [email.value, password.value, userType.value, username.value]);

  // for login
  useEffect(() => {
    const { email, password, userType } = loginFd;
    if (email.value && password.value && userType.value)
      setIsLoggedin(true);
    else
      setIsLoggedin(false);
  }, [loginFd.email.value, loginFd.password.value, loginFd.userType.value]);

  // on login user
  useEffect(() => {
    if (loginNewUserData?.data?.token || newUserData?.data?.token) {
      setCookie(SWC_KEYS.SWC_TOKEN, loginNewUserData?.data?.token || newUserData?.data?.token);
      setCookie(SWC_KEYS.SWC_USER, loginNewUserData?.data?.usersObj || newUserData?.data?.usersObj);

      const { username } = loginNewUserData?.data?.usersObj || newUserData.data?.usersObj;

      let selectedUserType = userTypes?.data.find(item => item.id == loginFd.userType.value)?.name ||
        userTypes?.data.find(item => item.id == signupFd.userType.value)?.name;

      setUserLoggedIn(true);
      setTimeout(() => {
        setUserLoggedIn(false);
        dispatch(fetGlobalNavbar({ userType: selectedUserType }));
        router.push(`/${selectedUserType}/${username.toLowerCase()}`);
      }, 2000);
    } else {
      if (isLogin)
        errorMessage(loginNewUserData?.data);
      if (!isLogin)
        errorMessage(newUserData?.data);
    }
  }, [loginNewUserData?.data, newUserData?.data]);

  const userTypesList = [
    { id: 1, name: 'Driver', icon: IconSteeringWheel, label: "driver-partner" },
    { id: 2, name: 'Admin', icon: IconUserPlus , label: "admin" },
    { id: 3, name: 'Super Admin', icon: IconUsersPlus, label: "super-admin" },
    { id: 4, name: 'Owner', icon: IconUserExclamation, label: "owner" }
  ];

  return (
    <>
      {userLoggedIn && <DotLottieReact
        src="https://lottie.host/f4331998-dfdc-4aed-a07a-876ff81d8744/HhAFaPYpDF.lottie"
        loop
        autoplay
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          width: '300px',
          height: '300px'
        }}
      />}

      <div
        style={{
          opacity: (newUserDataLoader || loginNewUserLoading || userLoggedIn) ? 0.2 : 1,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "row",
          width: "100%",
          position: "relative"
        }}
      >
        {/* Left Panel - Form */}
        <div
          className="left-panel"
          style={{
            width: "40%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#fff",
            zIndex: 2,
            boxShadow: "2px 0 10px rgba(0,0,0,0.05)",
            position: "relative"
          }}
        >
          {/* Header */}
          <div style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Car style={{ width: '1.5rem', height: '1.5rem', color: 'white', strokeWidth: 2.5 }} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                  Swift<span style={{ color: '#0ea5e9' }}>Cab</span>
                </h1>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>.in</p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem 2rem' }}>
            <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
              {/* Toggle */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: '#f3f4f6', borderRadius: '1rem', padding: '0.25rem' }}>
                <button
                  onClick={handleLoginClick}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.75rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    background: isLogin ? 'white' : 'transparent',
                    color: isLogin ? '#1f2937' : '#6b7280',
                    boxShadow: isLogin ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  LOGIN
                </button>
                <button
                  onClick={handleSignupClick}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.75rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    background: !isLogin ? 'white' : 'transparent',
                    color: !isLogin ? '#1f2937' : '#6b7280',
                    boxShadow: !isLogin ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  SIGNUP
                </button>
              </div>

              {/* Title */}
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                  {isLogin ? 'Pilot Dashboard' : 'Join SwiftCab'}
                </h2>
                <p style={{ color: '#6b7280' }}>
                  {isLogin ? 'Access your account to continue' : 'Create your pilot account today'}
                </p>
              </div>

              {isLogin ? (
                // Login Form
                <form onSubmit={loginUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                      Email or Username
                    </label>
                    <input
                      type="text"
                      name={loginFd.email.name}
                      value={loginFd.email.value}
                      onChange={loginOnchangeHandler}
                      onBlur={loginOnBlur}
                      placeholder="Enter your email or username"
                      required
                      style={{
                        width: '100%',
                        background: 'white',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        padding: '1rem 1.25rem',
                        color: '#1f2937',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.3s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
                      onBlurCapture={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                    {!loginFd.email.value && loginFd.email.required && <span style={{ color: 'red', fontSize: '0.875rem' }}>{loginFd.email.message}</span>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                      Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name={loginFd.password.name}
                        value={loginFd.password.value}
                        onChange={loginOnchangeHandler}
                        onBlur={loginOnBlur}
                        placeholder="Enter your password"
                        required
                        style={{
                          width: '100%',
                          background: 'white',
                          border: '2px solid #e5e7eb',
                          borderRadius: '0.75rem',
                          padding: '1rem 3rem 1rem 1.25rem',
                          color: '#1f2937',
                          fontSize: '1rem',
                          outline: 'none',
                          transition: 'border-color 0.3s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
                        onBlurCapture={(e) => e.target.style.borderColor = '#e5e7eb'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '1rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#9ca3af'
                        }}
                      >
                        {showPassword ? <EyeOff style={{ width: '1.25rem', height: '1.25rem' }} /> : <Eye style={{ width: '1.25rem', height: '1.25rem' }} />}
                      </button>
                    </div>
                    {!loginFd.password.value && loginFd.password.required && <span style={{ color: 'red', fontSize: '0.875rem' }}>{loginFd.password.message}</span>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                      User Type
                    </label>
                    {isLoading ? <ApiLoader height={"20px"} width={"20px"} /> :
                      <div className="user-type-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                        {userTypes?.data?.filter(ele => userTypesList.some(ie =>
                          String(ie.label)
                            .toLowerCase()
                            .replace(/\s+/g, '-')
                            === String(ele.label)
                            .toLowerCase()
                            .replace(/\s+/g, '-')
                        )
                        ).map(type => {
                          const IconComponent = userTypesList.find(t => t.name === type.name)?.icon || Car;
                          return (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => loginOnchangeHandler({ target: { name: 'userType', value: type.id } })}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '1rem 0.75rem',
                                borderRadius: '0.75rem',
                                border: `2px solid ${loginFd.userType.value == type.id ? '#0ea5e9' : '#e5e7eb'}`,
                                background: loginFd.userType.value == type.id ? '#f0f9ff' : 'white',
                                color: loginFd.userType.value == type.id ? '#0369a1' : '#6b7280',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                              }}
                            >
                              <IconComponent style={{ width: '1.5rem', height: '1.5rem', marginBottom: '0.25rem' }} />
                              <span className="user-type-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>{type.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    }
                    {!loginFd.userType.value && loginFd.userType.required && <span style={{ color: 'red', fontSize: '0.875rem' }}>{loginFd.userType.message}</span>}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ marginRight: '0.5rem' }} />
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Remember me</span>
                    </label>
                    <a href="#" style={{ fontSize: '0.875rem', color: '#0ea5e9', fontWeight: 600, textDecoration: 'none' }}>
                      Forgot password?
                    </a>
                  </div>

                  {loginNewUserLoading ? <ApiLoader height={"20px"} width={"20px"} /> :
                    <button
                      type="submit"
                      disabled={!isLoggedin}
                      style={{
                        width: '100%',
                        background: isLoggedin ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : '#e5e7eb',
                        color: 'white',
                        fontWeight: 'bold',
                        padding: '1rem 1.5rem',
                        borderRadius: '0.75rem',
                        border: 'none',
                        cursor: isLoggedin ? 'pointer' : 'not-allowed',
                        transition: 'all 0.3s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: isLoggedin ? '0 10px 15px rgba(14, 165, 233, 0.3)' : 'none'
                      }}
                    >
                      Sign In
                      <ArrowRight style={{ width: '1.25rem', height: '1.25rem' }} />
                    </button>
                  }

                  <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
                    Not a member? <a href="#" onClick={handleSignupClick} style={{ color: '#0ea5e9', fontWeight: 600, textDecoration: 'none' }}>Signup now</a>
                  </div>
                </form>
              ) : (
                // Signup Form
                <form onSubmit={signupUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      name={email.name}
                      value={email.value}
                      onChange={onChangeHandler}
                      onBlur={onBlur}
                      placeholder="your.email@example.com"
                      required
                      style={{
                        width: '100%',
                        background: 'white',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        padding: '1rem 1.25rem',
                        color: '#1f2937',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                    />
                    {!email.value && email.required && <span style={{ color: 'red', fontSize: '0.875rem' }}>{email.message}</span>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                      Username
                    </label>
                    <input
                      type="text"
                      name={username.name}
                      value={username.value}
                      onChange={onChangeHandler}
                      onBlur={onBlur}
                      placeholder="Choose a unique username"
                      required
                      style={{
                        width: '100%',
                        background: 'white',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        padding: '1rem 1.25rem',
                        color: '#1f2937',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                    />
                    {!username.value && username.required && <span style={{ color: 'red', fontSize: '0.875rem' }}>{username.message}</span>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                      Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name={password.name}
                        value={password.value}
                        onChange={onChangeHandler}
                        onBlur={onBlur}
                        placeholder="Create a strong password"
                        required
                        style={{
                          width: '100%',
                          background: 'white',
                          border: '2px solid #e5e7eb',
                          borderRadius: '0.75rem',
                          padding: '1rem 3rem 1rem 1.25rem',
                          color: '#1f2937',
                          fontSize: '1rem',
                          outline: 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '1rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#9ca3af'
                        }}
                      >
                        {showPassword ? <EyeOff style={{ width: '1.25rem', height: '1.25rem' }} /> : <Eye style={{ width: '1.25rem', height: '1.25rem' }} />}
                      </button>
                    </div>
                    {!password.value && password.required && <span style={{ color: 'red', fontSize: '0.875rem' }}>{password.message}</span>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                      User Type
                    </label>
                    {isLoading ? <ApiLoader height={"20px"} width={"20px"} /> :
                      <div className="user-type-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                        {userTypes?.data?.filter(ele =>
                          userTypesList.some(ie =>
                            String(ie.label)
                              .toLowerCase()
                              .replace(/\s+/g, '-')
                              === String(ele.label)
                              .toLowerCase()
                              .replace(/\s+/g, '-')
                          )
                        )
                          .map(type => {
                            const IconComponent = userTypesList.find(t => t.name === type.name)?.icon || Car;
                            return (
                              <button
                                key={type.id}
                                type="button"
                                onClick={() => onChangeHandler({ target: { name: 'userType', value: type.id } })}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '1rem 0.75rem',
                                  borderRadius: '0.75rem',
                                  border: `2px solid ${userType.value == type.id ? '#0ea5e9' : '#e5e7eb'}`,
                                  background: userType.value == type.id ? '#f0f9ff' : 'white',
                                  color: userType.value == type.id ? '#0369a1' : '#6b7280',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s'
                                }}
                              >
                                <IconComponent style={{ width: '1.5rem', height: '1.5rem', marginBottom: '0.25rem' }} />
                                <span className="user-type-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>{type.name}</span>
                              </button>
                            );
                          })}
                      </div>
                    }
                    {!userType.value && userType.required && <span style={{ color: 'red', fontSize: '0.875rem' }}>{userType.message}</span>}
                  </div>

                  {newUserDataLoader ? <ApiLoader height={"20px"} width={"20px"} /> :
                    <button
                      type="submit"
                      disabled={!isSignup}
                      style={{
                        width: '100%',
                        background: isSignup ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : '#e5e7eb',
                        color: 'white',
                        fontWeight: 'bold',
                        padding: '1rem 1.5rem',
                        borderRadius: '0.75rem',
                        border: 'none',
                        cursor: isSignup ? 'pointer' : 'not-allowed',
                        transition: 'all 0.3s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: isSignup ? '0 10px 15px rgba(14, 165, 233, 0.3)' : 'none'
                      }}
                    >
                      Create Account
                      <ArrowRight style={{ width: '1.25rem', height: '1.25rem' }} />
                    </button>
                  }

                  <p style={{ fontSize: '0.875rem', textAlign: 'center', color: '#6b7280' }}>
                    By signing up, you agree to our{' '}
                    <a href="#" style={{ color: '#0ea5e9', fontWeight: 600, textDecoration: 'none' }}>
                      Terms & Conditions
                    </a>
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #f0f0f0' }}>
            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
              © 2024 SwiftCab.in • All rights reserved
            </p>
          </div>
        </div>

        {/* Right Panel - Hero with Particles */}
        <div className="hero-panel" style={{
          display: 'none',
          background: 'linear-gradient(135deg, #1f2937, #111827, #1f2937)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Particle Background */}
          <ParticleBackground />

          {/* Background pattern overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.05,
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
            zIndex: 1
          }}></div>

          {/* Animated gradient orbs */}
          <div className="gradient-orb-1" style={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            width: '20rem',
            height: '20rem',
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.3) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(60px)',
            animation: 'float 20s ease-in-out infinite',
            zIndex: 1
          }}></div>
          
          <div className="gradient-orb-2" style={{
            position: 'absolute',
            bottom: '15%',
            left: '10%',
            width: '25rem',
            height: '25rem',
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.2) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(70px)',
            animation: 'float 25s ease-in-out infinite reverse',
            zIndex: 1
          }}></div>

          {/* Content */}
          <div style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '4rem',
            color: 'white',
            height: '100%'
          }}>
            {/* Top badge */}
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(14, 165, 233, 0.15)',
                backdropFilter: 'blur(10px)',
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                border: '1px solid rgba(14, 165, 233, 0.3)',
                marginBottom: '2rem',
                animation: 'pulse 3s ease-in-out infinite'
              }}>
                <Zap style={{ width: '1rem', height: '1rem', color: '#0ea5e9' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0ea5e9' }}>#SwiftCabForWeb</span>
              </div>
            </div>

            {/* Center content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ fontSize: '3.75rem', fontWeight: 'bold', lineHeight: 1.2, margin: 0 }}>
                  Everyday city<br />commute
                </h2>
                <p style={{ fontSize: '1.5rem', color: '#d1d5db', fontWeight: 300, margin: 0 }}>
                  Affordable AC cab rides at<br />your doorstep
                </p>
              </div>

              {/* Features Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', maxWidth: '32rem' }}>
                {[
                  { icon: Zap, title: 'Quick Booking', subtitle: 'In seconds' },
                  { icon: Shield, title: 'Safe & Secure', subtitle: 'Verified drivers' },
                  { icon: Clock, title: '24/7 Available', subtitle: 'Always ready' },
                  { icon: Car, title: 'AC Cabs', subtitle: 'Comfort ride' }
                ].map((feature, idx) => (
                  <div key={idx} className="feature-card" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}>
                    <div style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      background: 'rgba(14, 165, 233, 0.2)',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <feature.icon style={{ width: '1.25rem', height: '1.25rem', color: '#0ea5e9' }} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>{feature.title}</p>
                      <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>{feature.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom stats */}
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div className="stat-item">
                <p style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#0ea5e9', margin: 0 }}>50K+</p>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>Active Drivers</p>
              </div>
              <div className="stat-item">
                <p style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#0ea5e9', margin: 0 }}>1M+</p>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>Happy Riders</p>
              </div>
              <div className="stat-item">
                <p style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#0ea5e9', margin: 0 }}>100+</p>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>Cities</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Animations */
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        /* Feature card hover effect */
        .feature-card:hover {
          background: rgba(255, 255, 255, 0.12) !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(14, 165, 233, 0.2);
        }

        /* Stat animation */
        .stat-item {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .stat-item:nth-child(1) { animation-delay: 0.1s; }
        .stat-item:nth-child(2) { animation-delay: 0.2s; }
        .stat-item:nth-child(3) { animation-delay: 0.3s; }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Mobile First - Default Styles */
        .left-panel {
          width: 100%;
          min-height: 100vh;
        }
        
        .hero-panel {
          display: none !important;
        }

        /* Tablet and Desktop */
        @media (min-width: 1024px) {
          .left-panel {
            width: 35% !important;
            min-width: 420px;
          }
          
          .hero-panel {
            display: flex !important;
            flex: 1;
          }
        }

        /* Large Desktop */
        @media (min-width: 1440px) {
          .left-panel {
            width: 32% !important;
          }
        }

        /* Extra Large Desktop */
        @media (min-width: 1920px) {
          .left-panel {
            width: 28% !important;
            max-width: 550px;
          }
        } 

        /* Mobile adjustments */
        @media (max-width: 640px) {
          .left-panel > div:first-child {
            padding: 1rem !important;
          }
          
          .left-panel > div:nth-child(2) {
            padding: 1.5rem 1rem !important;
          }
          
          .left-panel h1 {
            font-size: 1.25rem !important;
          }
          
          .left-panel h2 {
            font-size: 1.5rem !important;
          }

          .user-type-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }

          .user-type-label {
            font-size: 0.65rem !important;
          }
        }

        /* Tablet adjustments for user type grid */
        @media (min-width: 641px) and (max-width: 768px) {
          .user-type-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        /* Small mobile */
        @media (max-width: 380px) {
          .user-type-grid {
            grid-template-columns: 1fr !important;
          }

          .left-panel h1 {
            font-size: 1.1rem !important;
          }
        }
      `}</style>
    </>
  );
};

export default App;