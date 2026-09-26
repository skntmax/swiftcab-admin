"use client";
import React, { useContext, useEffect, useMemo, useState, useRef } from 'react';
import { useGetUserQuery, useLoginUserMutation, useSignupUserMutation, useVerifyOtpMutation, useResendVerificationMutation } from './libs/apis/user';
import { generateUsername } from '@utils';
import ApiLoader from './../components/ApiLoader';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useRouter } from 'next/navigation';
import { contextProvider } from '@components/AppProvider';
import { fetGlobalNavbar } from './libs/slice/navMenuSlice';
import { useAppDispatch } from './libs/store';
import { persistAuthSession } from '@utils/authSession';
import DriverOnboardingWizard from '@components/driver-onboarding/DriverOnboardingWizard';
import {
  Eye, EyeOff, ArrowRight, Car, Zap, Shield, UserPlus, Users, User,
  Search, Building2, Headphones, Megaphone, Wallet, Wrench, Briefcase, LifeBuoy,
} from 'lucide-react';

const ACCENT = '#c4f82a';
const INK = '#0b0b0b';

function slugifyRole(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, '-');
}

function prettyRoleLabel(type) {
  const raw = String(type?.label || type?.name || '').trim();
  if (!raw) return 'Role';
  if (raw.includes(' ') && raw !== slugifyRole(raw)) return raw;
  return raw.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

const ROLE_META = {
  'driver-partner': { icon: Car, group: 'On the road' },
  owner: { icon: Building2, group: 'On the road' },
  customer: { icon: User, group: 'On the road' },
  admin: { icon: Shield, group: 'Control' },
  'super-admin': { icon: Shield, group: 'Control' },
  'operations-manager': { icon: Wrench, group: 'Operations' },
  'partner-manager': { icon: Briefcase, group: 'Operations' },
  'vendor-coordinator': { icon: Briefcase, group: 'Operations' },
  'sales-manager': { icon: Users, group: 'Go to market' },
  'sales-executive': { icon: Users, group: 'Go to market' },
  'sales-representative': { icon: Users, group: 'Go to market' },
  'account-manager': { icon: Briefcase, group: 'Go to market' },
  'marketing-manager': { icon: Megaphone, group: 'Go to market' },
  'marketing-executive': { icon: Megaphone, group: 'Go to market' },
  'marketing-specialist': { icon: Megaphone, group: 'Go to market' },
  'customer support-manager': { icon: Headphones, group: 'Support' },
  'support-agent': { icon: LifeBuoy, group: 'Support' },
  'helpdesk-agent': { icon: LifeBuoy, group: 'Support' },
  'technical support-engineer': { icon: Wrench, group: 'Support' },
  'finance-manager': { icon: Wallet, group: 'Finance' },
  'crm-developer': { icon: UserPlus, group: 'Control' },
  'crm-analyst': { icon: UserPlus, group: 'Control' },
};

function roleMetaFor(type) {
  const slug = slugifyRole(type?.name) || slugifyRole(type?.label);
  return ROLE_META[slug] || { icon: User, group: 'More roles' };
}

const fieldStyle = (focused) => ({
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: `1px solid ${focused ? ACCENT : 'rgba(255,255,255,0.12)'}`,
  borderRadius: '0.85rem',
  padding: '0.95rem 1.15rem',
  color: '#f4f4f5',
  fontSize: '1rem',
  outline: 'none',
  boxShadow: focused ? `0 0 0 3px rgba(196,248,42,0.18)` : 'none',
});

function RoleTypePicker({ roles, selectedId, onSelect, loading }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const filtered = useMemo(() => {
    const list = Array.isArray(roles) ? roles : [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((type) => {
      const haystack = `${prettyRoleLabel(type)} ${type.name || ''} ${type.label || ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [roles, query]);

  const grouped = useMemo(() => {
    const buckets = new Map();
    filtered.forEach((type) => {
      const group = roleMetaFor(type).group;
      if (!buckets.has(group)) buckets.set(group, []);
      buckets.get(group).push(type);
    });
    return Array.from(buckets.entries());
  }, [filtered]);

  if (loading) {
    return <ApiLoader height={"20px"} width={"20px"} />;
  }

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: '0.85rem' }}>
        <Search
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '0.9rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '1rem',
            height: '1rem',
            color: 'rgba(255,255,255,0.45)',
          }}
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search roles"
          aria-label="Search roles"
          style={{
            ...fieldStyle(focused),
            paddingLeft: '2.4rem',
            paddingTop: '0.7rem',
            paddingBottom: '0.7rem',
            fontSize: '0.9rem',
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
      <div
        role="radiogroup"
        aria-label="User type"
        style={{
          maxHeight: '16.5rem',
          overflowY: 'auto',
          paddingRight: '0.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.9rem',
        }}
      >
        {grouped.length === 0 && (
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', margin: 0 }}>
            No roles match that search.
          </p>
        )}
        {grouped.map(([group, items]) => (
          <div key={group}>
            <p style={{
              margin: '0 0 0.45rem',
              fontSize: '0.68rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(196,248,42,0.75)',
              fontWeight: 700,
            }}>
              {group}
            </p>
            <div className="user-type-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.55rem' }}>
              {items.map((type) => {
                const selected = String(selectedId) === String(type.id);
                const IconComponent = roleMetaFor(type).icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => onSelect(type.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.55rem',
                      minHeight: 44,
                      padding: '0.7rem 0.75rem',
                      borderRadius: '0.8rem',
                      border: `1px solid ${selected ? ACCENT : 'rgba(255,255,255,0.12)'}`,
                      background: selected ? 'rgba(196,248,42,0.12)' : 'rgba(255,255,255,0.03)',
                      color: selected ? ACCENT : 'rgba(255,255,255,0.78)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'border-color 0.2s ease, background 0.2s ease',
                    }}
                  >
                    <IconComponent aria-hidden="true" style={{ width: '1.15rem', height: '1.15rem', flexShrink: 0 }} />
                    <span className="user-type-label" style={{ fontSize: '0.78rem', fontWeight: 600, lineHeight: 1.25 }}>
                      {prettyRoleLabel(type)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
        ctx.fillStyle = `rgba(196, 248, 42, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
        gradient.addColorStop(0, `rgba(196, 248, 42, ${this.opacity * 0.5})`);
        gradient.addColorStop(1, 'rgba(196, 248, 42, 0)');
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

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.strokeStyle = `rgba(196, 248, 42, ${0.12 * (1 - distance / 120)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((particle) => {
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

  const { successMessage, errorMessage } = useContext(contextProvider);
  let router = useRouter();

  const [signupFd, setSignupFd] = useState({
    email: { name: "email", value: "", error: false, message: "Email is required" },
    phone: { name: "phone", value: "", error: false, message: "Phone is required" },
    username: { name: "username", value: "", error: false, message: "Username is required" },
    password: { name: "password", value: "", error: false, message: "Password is required" },
    userType: { name: "userType", value: "", error: false, message: "User type is required" },
  });

  const [loginFd, setLoginFd] = useState({
    email: { name: "email", value: "", error: false, message: "Email is required" },
    password: { name: "password", value: "", error: false, message: "Password is required" },
    userType: { name: "userType", value: "", error: false, message: "User type is required" },
  });

  const { data: userTypes, isLoading } = useGetUserQuery();
  const [registerUser, { data: newUserData, isLoading: newUserDataLoader }] = useSignupUserMutation();
  const [loginNewUser, { data: loginNewUserData, isLoading: loginNewUserLoading }] = useLoginUserMutation();
  const [verifyOtp, { data: verifyOtpData, isLoading: verifyOtpLoading }] = useVerifyOtpMutation();
  const [resendVerification, { isLoading: resendLoading }] = useResendVerificationMutation();
  const [challenge, setChallenge] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [resendIn, setResendIn] = useState(0);

  const handleSignupClick = () => {
    setIsLogin(false);
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

  const { email, password, userType, username, phone } = signupFd;
  const selectedSignupRole = (userTypes?.data || []).find((item) => item.id == userType.value);
  const isDriverSignup = slugifyRole(selectedSignupRole?.name) === 'driver-partner';
  const selectedLoginRole = (userTypes?.data || []).find((item) => item.id == loginFd.userType.value);
  const isDriverLogin = slugifyRole(selectedLoginRole?.name) === 'driver-partner';

  const openDriverDashboard = (result) => {
    const username = result?.user?.username || result?.case?.driver?.username;
    if (!username) {
      errorMessage('Driver session is missing. Verify the mobile number again.');
      return;
    }
    dispatch(fetGlobalNavbar({ userType: 'driver-partner' }));
    router.push(`/driver-partner/${String(username).toLowerCase()}`);
  };

  const signupUser = (e) => {
    e.preventDefault();
    let payload = { email: email.value, username: username.value, password: password.value, phone: phone.value, userType: Number(userType.value) };
    registerUser(payload);
  };

  const loginUser = (e) => {
    e.preventDefault();
    let payload = { emailOrUsername: loginFd.email.value, password: loginFd.password.value, userType: Number(loginFd.userType.value) };
    loginNewUser(payload);
  };

  useEffect(() => {
    const { email, password, userType, username, phone } = signupFd;
    if (email.value && password.value && userType.value && username.value && phone.value)
      setSignup(true);
    else
      setSignup(false);
  }, [email.value, password.value, userType.value, username.value, phone.value]);

  useEffect(() => {
    const { email, password, userType } = loginFd;
    if (email.value && password.value && userType.value)
      setIsLoggedin(true);
    else
      setIsLoggedin(false);
  }, [loginFd.email.value, loginFd.password.value, loginFd.userType.value]);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const timer = setTimeout(() => setResendIn((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  useEffect(() => {
    if (newUserData?.data?.verificationRequired || newUserData?.data?.verification) {
      setChallenge(newUserData.data.verification);
      setResendIn(Number(newUserData.data.verification?.resendIn) || 60);
      successMessage(newUserData.data.verification?.delivery?.channelHint || "Check your email for the verification code.");
      return;
    }

    const token = loginNewUserData?.data?.token || newUserData?.data?.token || verifyOtpData?.data?.token;
    const user = loginNewUserData?.data?.usersObj || newUserData?.data?.usersObj || verifyOtpData?.data?.usersObj;

    if (!token || !user) {
      if (isLogin && loginNewUserData && !loginNewUserData?.data?.token) {
        errorMessage(loginNewUserData?.data);
      }
      if (!isLogin && newUserData && !newUserData?.data?.token && !newUserData?.data?.verificationRequired) {
        errorMessage(newUserData?.data?.message || newUserData?.data);
      }
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const tokenPayload = (() => {
          try {
            const part = String(token).split('.')[1]
            if (!part) return {}
            return JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')))
          } catch {
            return {}
          }
        })()
        await persistAuthSession({
          token,
          user: { ...user, id: user.id ?? tokenPayload.id },
          refreshToken: loginNewUserData?.data?.refreshToken || newUserData?.data?.refreshToken || verifyOtpData?.data?.refreshToken,
        });
        if (cancelled) return;

        const { username } = user;
        const selectedUserType =
          userTypes?.data.find((item) => item.id == loginFd.userType.value)?.name ||
          userTypes?.data.find((item) => item.id == signupFd.userType.value)?.name;

        setUserLoggedIn(true);
        setTimeout(() => {
          setUserLoggedIn(false);
          dispatch(fetGlobalNavbar({ userType: selectedUserType }));
          router.push(`/${selectedUserType}/${username.toLowerCase()}`);
        }, 2000);
      } catch (err) {
        errorMessage("Could not save login session");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loginNewUserData?.data, newUserData?.data, verifyOtpData?.data]);

  const allRoles = userTypes?.data || [];

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
          position: "relative",
          background: INK,
          color: '#f4f4f5'
        }}
      >
        <div
          className={`left-panel${isDriverSignup && !isLogin ? ' onboarding-wide' : ''}`}
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: INK,
            zIndex: 2,
            borderRight: '1px solid rgba(255,255,255,0.08)',
            position: "relative"
          }}
        >
          <div style={{ padding: '1.35rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', background: ACCENT, borderRadius: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Car style={{ width: '1.35rem', height: '1.35rem', color: INK, strokeWidth: 2.5 }} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>
                  Swift<span style={{ color: ACCENT }}>Cab</span>
                </h1>
                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Pilot login</p>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 1.75rem' }}>
            <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem', padding: '0.28rem' }}>
                <button
                  type="button"
                  onClick={handleLoginClick}
                  style={{
                    flex: 1,
                    padding: '0.7rem 1.25rem',
                    borderRadius: '0.8rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: isLogin ? ACCENT : 'transparent',
                    color: isLogin ? INK : 'rgba(255,255,255,0.65)',
                  }}
                >
                  LOGIN
                </button>
                <button
                  type="button"
                  onClick={handleSignupClick}
                  style={{
                    flex: 1,
                    padding: '0.7rem 1.25rem',
                    borderRadius: '0.8rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: !isLogin ? ACCENT : 'transparent',
                    color: !isLogin ? INK : 'rgba(255,255,255,0.65)',
                  }}
                >
                  SIGNUP
                </button>
              </div>

              <div style={{ marginBottom: '1.6rem' }}>
                <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem', letterSpacing: '-0.03em' }}>
                  {isLogin ? 'Enter the console' : 'Join the fleet team'}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.55)', margin: 0 }}>
                  {isLogin ? 'Pick your role, then continue with the same account you already use.' : 'Create a pilot account for your assigned role.'}
                </p>
              </div>

              {isLogin ? (
                <form onSubmit={loginUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }} autoComplete="on">
                  <div>
                    <label htmlFor="login-email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.82)', marginBottom: '0.5rem' }}>
                      Email or Username
                    </label>
                    <input
                      id="login-email"
                      type="text"
                      name={loginFd.email.name}
                      value={loginFd.email.value}
                      onChange={loginOnchangeHandler}
                      onBlur={loginOnBlur}
                      placeholder="Enter your email or username"
                      autoComplete="username"
                      required
                      style={fieldStyle(false)}
                      onFocus={(e) => { e.target.style.borderColor = ACCENT; e.target.style.boxShadow = '0 0 0 3px rgba(196,248,42,0.18)'; }}
                      onBlurCapture={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; }}
                    />
                    {!loginFd.email.value && loginFd.email.required && <span style={{ color: '#fb7185', fontSize: '0.875rem' }}>{loginFd.email.message}</span>}
                  </div>

                  <div>
                    <label htmlFor="login-password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.82)', marginBottom: '0.5rem' }}>
                      Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        name={loginFd.password.name}
                        value={loginFd.password.value}
                        onChange={loginOnchangeHandler}
                        onBlur={loginOnBlur}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                        style={{ ...fieldStyle(false), paddingRight: '3rem' }}
                        onFocus={(e) => { e.target.style.borderColor = ACCENT; e.target.style.boxShadow = '0 0 0 3px rgba(196,248,42,0.18)'; }}
                        onBlurCapture={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        style={{
                          position: 'absolute',
                          right: '0.85rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'rgba(255,255,255,0.45)',
                          width: 32,
                          height: 32,
                        }}
                      >
                        {showPassword ? <EyeOff style={{ width: '1.15rem', height: '1.15rem' }} /> : <Eye style={{ width: '1.15rem', height: '1.15rem' }} />}
                      </button>
                    </div>
                    {!loginFd.password.value && loginFd.password.required && <span style={{ color: '#fb7185', fontSize: '0.875rem' }}>{loginFd.password.message}</span>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.82)', marginBottom: '0.5rem' }}>
                      User type
                    </label>
                    <RoleTypePicker
                      roles={allRoles}
                      selectedId={loginFd.userType.value}
                      loading={isLoading}
                      onSelect={(id) => loginOnchangeHandler({ target: { name: 'userType', value: id } })}
                    />
                    {!loginFd.userType.value && loginFd.userType.required && <span style={{ color: '#fb7185', fontSize: '0.875rem' }}>{loginFd.userType.message}</span>}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ marginRight: '0.5rem' }} />
                      <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)' }}>Remember me</span>
                    </label>
                    {isDriverLogin ? (
                      <a href="#" onClick={handleSignupClick} style={{ fontSize: '0.875rem', color: ACCENT, fontWeight: 600, textDecoration: 'none' }}>
                        Start driver registration
                      </a>
                    ) : (
                      <a href="#" style={{ fontSize: '0.875rem', color: ACCENT, fontWeight: 600, textDecoration: 'none' }}>
                        Forgot password?
                      </a>
                    )}
                  </div>

                  {loginNewUserLoading ? <ApiLoader height={"20px"} width={"20px"} /> :
                    <button
                      type="submit"
                      disabled={!isLoggedin}
                      style={{
                        width: '100%',
                        background: isLoggedin ? ACCENT : 'rgba(255,255,255,0.08)',
                        color: isLoggedin ? INK : 'rgba(255,255,255,0.35)',
                        fontWeight: 800,
                        padding: '1rem 1.5rem',
                        borderRadius: '0.85rem',
                        border: 'none',
                        cursor: isLoggedin ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      Sign In
                      <ArrowRight style={{ width: '1.25rem', height: '1.25rem' }} />
                    </button>
                  }

                  <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)' }}>
                    Not a member? <a href="#" onClick={handleSignupClick} style={{ color: ACCENT, fontWeight: 600, textDecoration: 'none' }}>Signup now</a>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.82)', marginBottom: '0.5rem' }}>
                      User type
                    </label>
                    <RoleTypePicker
                      roles={allRoles}
                      selectedId={userType.value}
                      loading={isLoading}
                      onSelect={(id) => onChangeHandler({ target: { name: 'userType', value: id } })}
                    />
                    {!userType.value && userType.required && <span style={{ color: '#fb7185', fontSize: '0.875rem' }}>{userType.message}</span>}
                  </div>

                  {isDriverSignup ? (
                    <DriverOnboardingWizard
                      userTypeId={userType.value}
                      onGoToLogin={handleLoginClick}
                      onContinueLater={openDriverDashboard}
                      onFinished={openDriverDashboard}
                    />
                  ) : (
                    <form onSubmit={signupUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }} autoComplete="on">
                  <div>
                    <label htmlFor="signup-phone" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.82)', marginBottom: '0.5rem' }}>
                      Mobile number
                    </label>
                    <input
                      id="signup-phone"
                      type="tel"
                      name={phone.name}
                      value={phone.value}
                      onChange={(e) => onChangeHandler({ target: { name: 'phone', value: e.target.value.replace(/\D/g, '') } })}
                      onBlur={onBlur}
                      placeholder="10-digit mobile number"
                      autoComplete="tel"
                      required
                      maxLength={10}
                      style={fieldStyle(false)}
                    />
                    {!phone.value && phone.required && <span style={{ color: '#fb7185', fontSize: '0.875rem' }}>{phone.message}</span>}
                  </div>
                  <div>
                    <label htmlFor="signup-email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.82)', marginBottom: '0.5rem' }}>
                      Email Address
                    </label>
                    <input
                      id="signup-email"
                      type="email"
                      name={email.name}
                      value={email.value}
                      onChange={onChangeHandler}
                      onBlur={onBlur}
                      placeholder="your.email@example.com"
                      autoComplete="email"
                      required
                      style={fieldStyle(false)}
                    />
                    {!email.value && email.required && <span style={{ color: '#fb7185', fontSize: '0.875rem' }}>{email.message}</span>}
                  </div>

                  <div>
                    <label htmlFor="signup-username" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.82)', marginBottom: '0.5rem' }}>
                      Username
                    </label>
                    <input
                      id="signup-username"
                      type="text"
                      name={username.name}
                      value={username.value}
                      onChange={onChangeHandler}
                      onBlur={onBlur}
                      placeholder="Choose a unique username"
                      autoComplete="username"
                      required
                      style={fieldStyle(false)}
                    />
                    {!username.value && username.required && <span style={{ color: '#fb7185', fontSize: '0.875rem' }}>{username.message}</span>}
                  </div>

                  <div>
                    <label htmlFor="signup-password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.82)', marginBottom: '0.5rem' }}>
                      Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        name={password.name}
                        value={password.value}
                        onChange={onChangeHandler}
                        onBlur={onBlur}
                        placeholder="Create a strong password"
                        autoComplete="new-password"
                        required
                        style={{ ...fieldStyle(false), paddingRight: '3rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        style={{
                          position: 'absolute',
                          right: '0.85rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'rgba(255,255,255,0.45)',
                          width: 32,
                          height: 32,
                        }}
                      >
                        {showPassword ? <EyeOff style={{ width: '1.15rem', height: '1.15rem' }} /> : <Eye style={{ width: '1.15rem', height: '1.15rem' }} />}
                      </button>
                    </div>
                    {!password.value && password.required && <span style={{ color: '#fb7185', fontSize: '0.875rem' }}>{password.message}</span>}
                  </div>

                  {challenge && (
                    <div>
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                        {challenge.delivery?.channelHint || 'Check your email for the verification code.'}
                      </p>
                      <input
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Verification code"
                        maxLength={6}
                        style={fieldStyle(false)}
                      />
                      <button
                        type="button"
                        disabled={verifyOtpLoading || otpCode.length < 4}
                        onClick={() => verifyOtp({
                          otp: otpCode,
                          phone: phone.value,
                          userType: Number(userType.value),
                          challengeId: challenge.challengeId,
                        })}
                        style={{
                          width: '100%',
                          marginTop: '0.85rem',
                          background: ACCENT,
                          color: INK,
                          fontWeight: 800,
                          padding: '1rem 1.5rem',
                          borderRadius: '0.85rem',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {verifyOtpLoading ? 'Verifying…' : 'Verify code'}
                      </button>
                      <button
                        type="button"
                        disabled={resendLoading || resendIn > 0}
                        onClick={async () => {
                          const result = await resendVerification({
                            email: email.value,
                            phone: phone.value,
                            userType: Number(userType.value),
                            purpose: 'signup',
                          });
                          const data = result?.data?.data || result?.data;
                          if (data?.verification) {
                            setChallenge(data.verification);
                            setResendIn(Number(data.verification.resendIn) || 60);
                            successMessage(data.verification.delivery?.channelHint || 'A new code is on the way.');
                          }
                        }}
                        style={{
                          width: '100%',
                          marginTop: '0.65rem',
                          background: 'transparent',
                          color: resendIn > 0 ? 'rgba(255,255,255,0.4)' : ACCENT,
                          fontWeight: 700,
                          padding: '0.65rem',
                          border: 'none',
                          cursor: resendIn > 0 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
                      </button>
                    </div>
                  )}

                  {!challenge && (newUserDataLoader ? <ApiLoader height={"20px"} width={"20px"} /> :
                    <button
                      type="submit"
                      disabled={!isSignup}
                      style={{
                        width: '100%',
                        background: isSignup ? ACCENT : 'rgba(255,255,255,0.08)',
                        color: isSignup ? INK : 'rgba(255,255,255,0.35)',
                        fontWeight: 800,
                        padding: '1rem 1.5rem',
                        borderRadius: '0.85rem',
                        border: 'none',
                        cursor: isSignup ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      Create Account
                      <ArrowRight style={{ width: '1.25rem', height: '1.25rem' }} />
                    </button>
                  )}

                  <p style={{ fontSize: '0.875rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                    By signing up, you agree to our{' '}
                    <a href="#" style={{ color: ACCENT, fontWeight: 600, textDecoration: 'none' }}>
                      Terms & Conditions
                    </a>
                  </p>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={{ padding: '1.25rem 1.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              © 2026 SwiftCab.in • All rights reserved
            </p>
          </div>
        </div>

        <div className="hero-panel" style={{
          display: 'none',
          background: 'linear-gradient(135deg, #111111, #0b0b0b, #141414)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <ParticleBackground />

          <div style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.05,
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
            zIndex: 1
          }}></div>

          <div className="gradient-orb-1" style={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            width: '20rem',
            height: '20rem',
            background: 'radial-gradient(circle, rgba(196, 248, 42, 0.22) 0%, transparent 70%)',
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
            background: 'radial-gradient(circle, rgba(196, 248, 42, 0.12) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(70px)',
            animation: 'float 25s ease-in-out infinite reverse',
            zIndex: 1
          }}></div>

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
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(196, 248, 42, 0.12)',
                backdropFilter: 'blur(10px)',
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                border: '1px solid rgba(196, 248, 42, 0.3)',
                marginBottom: '2rem',
              }}>
                <Zap style={{ width: '1rem', height: '1rem', color: ACCENT }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: ACCENT }}>Every role. One console.</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ fontSize: '3.4rem', fontWeight: 800, lineHeight: 1.12, margin: 0, letterSpacing: '-0.04em' }}>
                  Drivers, owners,<br />ops and admins
                </h2>
                <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.62)', fontWeight: 400, margin: 0, maxWidth: '28rem' }}>
                  Sign in with the role assigned to you. The same account flow, a clearer seat for each team.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.85rem', maxWidth: '32rem' }}>
                {[
                  { icon: Car, title: 'Drivers', subtitle: 'Live rides and map' },
                  { icon: Building2, title: 'Owners', subtitle: 'Fleet and KYC' },
                  { icon: Shield, title: 'Admins', subtitle: 'Roles and masters' },
                  { icon: Headphones, title: 'Support', subtitle: 'Tickets and help' }
                ].map((feature, idx) => (
                  <div key={idx} className="feature-card" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '0.85rem',
                    padding: '1rem',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'all 0.2s ease',
                  }}>
                    <div style={{
                      width: '2.4rem',
                      height: '2.4rem',
                      background: 'rgba(196, 248, 42, 0.14)',
                      borderRadius: '0.55rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <feature.icon style={{ width: '1.2rem', height: '1.2rem', color: ACCENT }} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>{feature.title}</p>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{feature.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div className="stat-item">
                <p style={{ fontSize: '2rem', fontWeight: 800, color: ACCENT, margin: 0 }}>All roles</p>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>From the live directory</p>
              </div>
              <div className="stat-item">
                <p style={{ fontSize: '2rem', fontWeight: 800, color: ACCENT, margin: 0 }}>One login</p>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Same cookies and routes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        .feature-card:hover {
          background: rgba(196, 248, 42, 0.08) !important;
          transform: translateY(-2px);
        }

        .stat-item {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .stat-item:nth-child(1) { animation-delay: 0.1s; }
        .stat-item:nth-child(2) { animation-delay: 0.2s; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .stat-item, .gradient-orb-1, .gradient-orb-2 { animation: none !important; opacity: 1; }
        }

        .left-panel {
          width: 100%;
          min-height: 100vh;
        }

        .hero-panel {
          display: none !important;
        }

        @media (min-width: 1024px) {
          .left-panel {
            width: 38% !important;
            min-width: 440px;
          }

          .left-panel.onboarding-wide {
            width: 52% !important;
            min-width: 560px;
          }

          .hero-panel {
            display: flex !important;
            flex: 1;
          }

          .user-type-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (min-width: 1440px) {
          .left-panel {
            width: 34% !important;
          }
        }

        @media (max-width: 640px) {
          .left-panel > div:first-child {
            padding: 1rem !important;
          }

          .left-panel > div:nth-child(2) {
            padding: 1.35rem 1rem !important;
          }

          .left-panel h1 {
            font-size: 1.2rem !important;
          }

          .left-panel h2 {
            font-size: 1.4rem !important;
          }

          .user-type-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
};

export default App;
