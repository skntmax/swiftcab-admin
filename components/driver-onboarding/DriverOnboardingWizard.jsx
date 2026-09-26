'use client'

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getCookie } from 'cookies-next'
import {
  ArrowRight, Bike, Car, Check, ChevronLeft, FileText, IdCard,
  Landmark, Shield, Smartphone, Upload, UserRound, GraduationCap,
} from 'lucide-react'
import { contextProvider } from '@components/AppProvider'
import DocumentPreview from '@components/DocumentPreview'
import { SWC_KEYS } from '@constants'
import { persistAuthSession } from '@utils/authSession'
import { useFileUploader } from '@app/libs/apis/FileUploaderHook'
import {
  useAddDriverOnboardingVehicleMutation,
  useCompleteDriverTrainingMutation,
  useCreateDriverOnboardingSessionMutation,
  useDriverOnboardingCatalogMutation,
  useGetBanksMutation,
  useGetBankBranchMutation,
  useGetDriverOnboardingMutation,
  useActivateDriverMutation,
  useResumeDriverOnboardingMutation,
  useSaveDriverOnboardingPayoutMutation,
  useSaveDriverOnboardingProfileMutation,
  useSaveDriverOnboardingVerificationMutation,
  useSendDriverOnboardingOtpMutation,
  useSubmitDriverOnboardingMutation,
  useUploadDriverOnboardingDocumentMutation,
  useVerifyDriverOnboardingOtpMutation,
} from '@app/libs/apis/driver'

const ACCENT = '#c4f82a'
const INK = '#0b0b0b'
const SESSION_KEY = 'swc_driver_onboarding_session'

function envelopeData(res) {
  if (!res) return null
  const body = res.data
  if (res.error && (body == null || body.error)) return null
  if (body && body.error) return null
  return body?.data ?? body
}

function fieldStyle() {
  return {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '0.85rem',
    padding: '0.85rem 1rem',
    color: '#f4f4f5',
    fontSize: '0.95rem',
    outline: 'none',
  }
}

function PrimaryButton({ children, disabled, onClick, type = 'button' }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: '100%',
        background: disabled ? 'rgba(255,255,255,0.08)' : ACCENT,
        color: disabled ? 'rgba(255,255,255,0.35)' : INK,
        fontWeight: 800,
        padding: '0.95rem 1.25rem',
        borderRadius: '0.85rem',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
      }}
    >
      {children}
    </button>
  )
}

function GhostButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        background: 'transparent',
        color: ACCENT,
        fontWeight: 700,
        padding: '0.7rem',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}

function UploadSpinner() {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 18,
        height: 18,
        border: '2px solid rgba(196,248,42,0.25)',
        borderTopColor: ACCENT,
        borderRadius: '50%',
        animation: 'swc-onboard-spin 0.75s linear infinite',
        flexShrink: 0,
      }}
    />
  )
}

function FilePicker({ label, onPicked, capture, disabled }) {
  return (
    <label style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.65rem',
      border: '1px dashed rgba(196,248,42,0.35)',
      borderRadius: '0.85rem',
      padding: '0.85rem',
      cursor: disabled ? 'not-allowed' : 'pointer',
      color: '#fff',
      opacity: disabled ? 0.55 : 1,
    }}>
      {disabled ? <UploadSpinner /> : <Upload size={18} color={ACCENT} aria-hidden="true" />}
      <span>{label}</span>
      <input
        type="file"
        accept="image/*,.pdf"
        capture={capture}
        hidden
        disabled={disabled}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file && !disabled) onPicked(file)
          event.target.value = ''
        }}
      />
    </label>
  )
}

export default function DriverOnboardingWizard({
  userTypeId,
  embedded = false,
  onGoToLogin,
  onFinished,
  onContinueLater,
}) {
  const { successMessage, errorMessage } = useContext(contextProvider)
  const { uploadFile, loading: uploading } = useFileUploader()
  const [step, setStep] = useState(1)
  const [sessionId, setSessionId] = useState('')
  const [catalog, setCatalog] = useState(null)
  const [onboardingCase, setCase] = useState(null)
  const [busy, setBusy] = useState(false)
  const [service, setService] = useState('')
  const [preferredVhicleTypeId, setPreferredVhicleTypeId] = useState('')
  const [uploadingDocKey, setUploadingDocKey] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [challenge, setChallenge] = useState(null)
  const [referral, setReferral] = useState('')
  const [resendIn, setResendIn] = useState(0)
  const [profile, setProfile] = useState({
    fullName: '',
    dateOfBirth: '',
    preferredLanguage: 'English',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
    emergencyName: '',
    emergencyRelation: 'Spouse',
    emergencyPhone: '',
    profilePhotoUrl: '',
  })
  const [vehicle, setVehicle] = useState({
    vhicleTypeId: '',
    registrationNumber: '',
    make: '',
    model: '',
    year: '',
    seatingCapacity: '',
    permitNumber: '',
    insuranceNumber: '',
    rc: '',
  })
  const [selfieConsent, setSelfieConsent] = useState(false)
  const [activeModule, setActiveModule] = useState(null)
  const [quizByModule, setQuizByModule] = useState({})
  const [trainingError, setTrainingError] = useState('')
  const [plan, setPlan] = useState('FLEX')
  const [authUser, setAuthUser] = useState(null)
  const [payout, setPayout] = useState({
    bank_account: '',
    bank_account_branch: '',
    bank_account_no: '',
    ifsc: '',
    accountHolder: '',
  })
  const [readyChecks, setReadyChecks] = useState({
    gps: false,
    notifications: false,
    vehicle: false,
    payout: false,
    training: false,
  })

  const [loadCatalog] = useDriverOnboardingCatalogMutation()
  const [createSession] = useCreateDriverOnboardingSessionMutation()
  const [resumeOnboarding] = useResumeDriverOnboardingMutation()
  const [sendOtp, { isLoading: sendingOtp }] = useSendDriverOnboardingOtpMutation()
  const [verifyOtp] = useVerifyDriverOnboardingOtpMutation()
  const [getMine] = useGetDriverOnboardingMutation()
  const [saveProfile] = useSaveDriverOnboardingProfileMutation()
  const [addVehicle] = useAddDriverOnboardingVehicleMutation()
  const [uploadDoc] = useUploadDriverOnboardingDocumentMutation()
  const [saveVerification] = useSaveDriverOnboardingVerificationMutation()
  const [completeTraining] = useCompleteDriverTrainingMutation()
  const [savePayout] = useSaveDriverOnboardingPayoutMutation()
  const [submitCase] = useSubmitDriverOnboardingMutation()
  const [activate] = useActivateDriverMutation()
  const [getBanks, { data: banksData }] = useGetBanksMutation()
  const [getBranches, { data: branchData }] = useGetBankBranchMutation()

  const applyCase = useCallback((nextCase, options = {}) => {
    if (!nextCase) return
    setCase(nextCase)
    if (!options.keepStep) {
      setStep(nextCase.currentStep || 1)
    }
    if (nextCase.selectedService) setService(nextCase.selectedService)
    if (nextCase.selectedVhicleTypeId) {
      setPreferredVhicleTypeId(String(nextCase.selectedVhicleTypeId))
      setVehicle((prev) => ({
        ...prev,
        vhicleTypeId: prev.vhicleTypeId || String(nextCase.selectedVhicleTypeId),
      }))
    }
    if (nextCase.phone) setPhone(nextCase.phone)
    if (nextCase.profile) {
      setProfile((prev) => ({
        ...prev,
        fullName: nextCase.profile.fullName || prev.fullName,
        dateOfBirth: nextCase.profile.dateOfBirth
          ? String(nextCase.profile.dateOfBirth).slice(0, 10)
          : prev.dateOfBirth,
        preferredLanguage: nextCase.profile.preferredLanguage || prev.preferredLanguage,
        addressLine: nextCase.profile.addressLine || prev.addressLine,
        city: nextCase.profile.city || prev.city,
        state: nextCase.profile.state || prev.state,
        pincode: nextCase.profile.pincode || prev.pincode,
        emergencyName: nextCase.profile.emergencyName || prev.emergencyName,
        emergencyRelation: nextCase.profile.emergencyRelation || prev.emergencyRelation,
        emergencyPhone: nextCase.profile.emergencyPhone || prev.emergencyPhone,
        profilePhotoUrl: nextCase.profile.profilePhotoUrl || prev.profilePhotoUrl,
      }))
    }
    if (nextCase.earningPlan) setPlan(nextCase.earningPlan)
    if (nextCase.verification?.selfieConsent) setSelfieConsent(true)
  }, [])

  useEffect(() => {
    loadCatalog().then((res) => {
      const data = envelopeData(res)
      if (data) setCatalog(data)
    })

    const bootstrapEmbedded = async () => {
      const res = await getMine()
      const data = envelopeData(res)
      if (data?.catalog) setCatalog(data.catalog)
      if (data?.sessionId) await persistSession(data.sessionId)
      if (data?.case) {
        applyCase(data.case)
        return
      }
      if (getCookie(SWC_KEYS.SWC_TOKEN)) {
        setStep(2)
      }
    }

    if (embedded) {
      bootstrapEmbedded()
      return undefined
    }

    const stored = typeof window !== 'undefined' ? localStorage.getItem(SESSION_KEY) : ''
    if (stored) setSessionId(stored)
    if (stored) {
      resumeOnboarding({ sessionId: stored }).then((res) => {
        const data = envelopeData(res)
        if (data?.case) {
          applyCase(data.case)
          if (!getCookie(SWC_KEYS.SWC_TOKEN)) setStep(Math.max(2, data.case.currentStep || 1))
        }
      })
    }
    return undefined
  }, [applyCase, embedded, getMine, loadCatalog, resumeOnboarding])

  useEffect(() => {
    if (resendIn <= 0) return undefined
    const timer = setTimeout(() => setResendIn((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendIn])

  useEffect(() => {
    getBanks()
  }, [getBanks])

  useEffect(() => {
    if (payout.bank_account) {
      getBranches(`bankId=${payout.bank_account}`)
    }
  }, [getBranches, payout.bank_account])

  const activeVehicleTypes = useMemo(() => {
    if (Array.isArray(catalog?.activeVehicleTypes) && catalog.activeVehicleTypes.length > 0) {
      return catalog.activeVehicleTypes
    }
    const merged = (catalog?.services || []).flatMap((item) => item.types || [])
    const byId = new Map()
    merged.forEach((row) => {
      if (row?.id != null) byId.set(row.id, row)
    })
    return [...byId.values()]
  }, [catalog])

  const vehicleTypes = useMemo(() => {
    if (!service) return activeVehicleTypes
    const group = catalog?.services?.find((item) => item.code === service)
    return group?.types?.length ? group.types : activeVehicleTypes
  }, [activeVehicleTypes, catalog, service])

  async function persistSession(id) {
    setSessionId(id)
    localStorage.setItem(SESSION_KEY, id)
  }

  async function startRegistration(skipService = false) {
    setBusy(true)
    try {
      const payload = skipService
        ? {}
        : {
            selectedService: service || undefined,
            selectedVhicleTypeId: preferredVhicleTypeId
              ? Number(preferredVhicleTypeId)
              : undefined,
          }
      const res = await createSession(payload)
      const data = envelopeData(res)
      if (!data?.sessionId) {
        errorMessage(data?.message || data || 'Could not start registration')
        return
      }
      await persistSession(data.sessionId)
      if (data.case) applyCase(data.case)
      else setStep(2)
      if (preferredVhicleTypeId) {
        setVehicle((prev) => ({
          ...prev,
          vhicleTypeId: prev.vhicleTypeId || preferredVhicleTypeId,
        }))
      }
    } finally {
      setBusy(false)
    }
  }

  async function handleSendOtp() {
    setBusy(true)
    try {
      const res = await sendOtp({
        sessionId,
        phone,
        email,
        referralCode: referral,
        userType: Number(userTypeId),
      })
      const data = envelopeData(res)
      if (!data) {
        errorMessage(
          res?.data?.message ||
            (typeof res?.data?.data === 'string' ? res.data.data : null) ||
            'Could not send the code',
        )
        return
      }
      if (data.sessionId) await persistSession(data.sessionId)
      if (data.verification) setChallenge(data.verification)
      setResendIn(Number(data.resendIn || data.verification?.resendIn) || 60)
      successMessage(data.verification?.delivery?.channelHint || data.message || 'Check your email for the verification code.')
    } finally {
      setBusy(false)
    }
  }

  async function handleVerifyOtp() {
    setBusy(true)
    try {
      const res = await verifyOtp({
        sessionId,
        phone,
        otp,
        userType: Number(userTypeId),
        challengeId: challenge?.challengeId,
      })
      const data = envelopeData(res)
      if (!data?.token) {
        errorMessage(typeof res?.data === 'string' ? res.data : 'Invalid or expired verification code.')
        return
      }
      await persistAuthSession({ token: data.token, user: data.usersObj, refreshToken: data.refreshToken })
      setAuthUser(data.usersObj)
      if (data.sessionId) await persistSession(data.sessionId)
      if (data.case) applyCase(data.case)
      else setStep(3)
      successMessage('Mobile verified')
    } finally {
      setBusy(false)
    }
  }

  async function handleSaveProfile() {
    setBusy(true)
    try {
      const res = await saveProfile(profile)
      const data = envelopeData(res)
      if (!data?.case) {
        errorMessage(typeof res?.data === 'string' ? res.data : 'Could not save personal details')
        return
      }
      applyCase(data.case)
    } finally {
      setBusy(false)
    }
  }

  async function handleAddVehicle() {
    setBusy(true)
    try {
      const res = await addVehicle({
        service: service || undefined,
        vhicleTypeId: Number(vehicle.vhicleTypeId),
        registrationNumber: vehicle.registrationNumber,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        seatingCapacity: vehicle.seatingCapacity,
        permitNumber: vehicle.permitNumber,
        insuranceNumber: vehicle.insuranceNumber,
        rc: vehicle.rc,
      })
      const data = envelopeData(res)
      if (!data?.case) {
        errorMessage(typeof res?.data === 'string' ? res.data : 'Could not register the vehicle')
        return
      }
      applyCase(data.case)
    } finally {
      setBusy(false)
    }
  }

  async function handleUpload(kind, file, extra = {}) {
    const url = await uploadFile({ file, fileName: `${kind}-${Date.now()}-${file.name}` })
    if (!url) {
      errorMessage('Upload failed. Try another image.')
      return null
    }
    return url
  }

  async function handleDocument(doc, file) {
    const docKey = doc.document_type || doc.documentType
    setUploadingDocKey(docKey)
    try {
      const url = await handleUpload(docKey, file)
      if (!url) return
      const res = await uploadDoc({
        documentType: docKey,
        fileUrl: url,
      })
      const data = envelopeData(res)
      if (data?.case) {
        applyCase(data.case)
        successMessage(`${doc.catalog?.name || docKey} uploaded`)
      } else {
        errorMessage('The document uploaded, but could not be attached. Please try again.')
      }
    } finally {
      setUploadingDocKey('')
    }
  }

  async function handleVerificationFile(field, file) {
    setUploadingDocKey(field)
    try {
      const url = await handleUpload(field, file)
      if (!url) return
      if (field === 'profilePhotoUrl') {
        setProfile((prev) => ({ ...prev, profilePhotoUrl: url }))
        return
      }
      const res = await saveVerification({
        selfieConsent: true,
        [field]: url,
      })
      const data = envelopeData(res)
      if (data?.case) applyCase(data.case)
    } finally {
      setUploadingDocKey('')
    }
  }

  function answersForModule(moduleId) {
    const answers = quizByModule[moduleId]
    return Array.isArray(answers) ? answers : []
  }

  function setModuleAnswer(moduleId, index, value) {
    setQuizByModule((prev) => {
      const current = Array.isArray(prev[moduleId]) ? [...prev[moduleId]] : []
      current[index] = value
      return { ...prev, [moduleId]: current }
    })
    setTrainingError('')
  }

  async function handleTraining(mod) {
    const answers = answersForModule(mod.id)
    const questions = mod.quiz || []
    if (questions.some((_, index) => !answers[index])) {
      setTrainingError('Answer every question before submitting this module.')
      return
    }
    setBusy(true)
    setTrainingError('')
    try {
      const res = await completeTraining({
        moduleId: mod.id,
        acknowledged: true,
        answers,
      })
      const data = envelopeData(res)
      if (!data?.quizPassed && !data?.case) {
        const message =
          res?.data?.message ||
          (typeof res?.data?.data === 'string' ? res.data.data : null) ||
          'Answer the safety questions correctly to continue'
        setTrainingError(message)
        errorMessage(message)
        return
      }
      if (data.case) applyCase(data.case, { keepStep: true })
      setActiveModule(null)
      successMessage(`${mod.title} completed`)
      if (data.trainingComplete) setStep(8)
      else setStep(7)
    } finally {
      setBusy(false)
    }
  }

  async function handlePayout() {
    setBusy(true)
    try {
      const res = await savePayout({
        ...payout,
        earningPlan: plan,
      })
      const data = envelopeData(res)
      if (!data?.case) {
        errorMessage(typeof res?.data === 'string' ? res.data : 'Could not save payout details')
        return
      }
      applyCase(data.case)
    } finally {
      setBusy(false)
    }
  }

  async function handleSubmit() {
    setBusy(true)
    try {
      const res = await submitCase({})
      const data = envelopeData(res)
      if (!data?.case) {
        errorMessage(typeof res?.data === 'string' ? res.data : 'Complete every required step first')
        return
      }
      applyCase(data.case)
      successMessage('Submitted for review')
    } finally {
      setBusy(false)
    }
  }

  async function handleActivate() {
    setBusy(true)
    try {
      const res = await activate({})
      const data = envelopeData(res)
      if (!data?.activated) {
        errorMessage(typeof res?.data === 'string' ? res.data : 'Approval is required before going online')
        return
      }
      successMessage("You're ready to drive")
      onFinished?.({ user: data.user || authUser, case: data.case, activated: true })
    } finally {
      setBusy(false)
    }
  }

  const status = onboardingCase?.status
  const requiredDocumentsComplete = (onboardingCase?.documents || [])
    .filter((doc) => doc.required)
    .every((doc) => Boolean(doc.file_url))
  const verification = onboardingCase?.verification
  const verificationComplete = Boolean(
    verification?.selfieUrl &&
    verification?.vehicleFrontUrl &&
    verification?.vehicleRearUrl &&
    verification?.vehiclePlateUrl
  )
  const banks = banksData?.data || banksData || []
  const branches = branchData?.data || branchData || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      <style>{`@keyframes swc-onboard-spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
        {(catalog?.steps || []).map((item) => (
          <div key={item.step} style={{ flex: '1 1 18%', minWidth: '4.5rem' }}>
            <div style={{
              height: 4,
              borderRadius: 99,
              background: step >= item.step ? ACCENT : 'rgba(255,255,255,0.12)',
              marginBottom: 6,
            }} />
            <p style={{ margin: 0, fontSize: 11, color: step === item.step ? ACCENT : 'rgba(255,255,255,0.45)' }}>
              {item.tag}
            </p>
          </div>
        ))}
      </div>

      {step > 1 && step < 10 && status !== 'UNDER_REVIEW' && (
        <button
          type="button"
          onClick={() => setStep((value) => Math.max(1, value - 1))}
          style={{
            alignSelf: 'flex-start',
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <ChevronLeft size={16} /> Back
        </button>
      )}

      {step === 1 && (
        <section>
          <h2 style={{ color: '#fff', fontSize: '1.7rem', margin: '0 0 0.4rem' }}>Earn with SwiftCab</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 0 }}>
            Drive when you want. Track your earnings. Get support when you need it.
          </p>
          <p style={{ color: '#fff', fontWeight: 700 }}>Choose your service (optional)</p>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 0 }}>
            Pick a vehicle type now or skip — you can register the vehicle on a later step.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '0.65rem',
            marginBottom: '1rem',
            maxHeight: 280,
            overflowY: 'auto',
          }}>
            {activeVehicleTypes.map((item) => {
              const selected = String(preferredVhicleTypeId) === String(item.id)
              const Icon = /bike|scooter|motor/i.test(item.vhicle_type || '') ? Bike : Car
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setPreferredVhicleTypeId(String(item.id))
                    setVehicle((prev) => ({ ...prev, vhicleTypeId: String(item.id) }))
                    const match = (catalog?.services || []).find((group) =>
                      (group.types || []).some((row) => row.id === item.id),
                    )
                    if (match) setService(match.code)
                  }}
                  style={{
                    background: selected ? 'rgba(196,248,42,0.16)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${selected ? ACCENT : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '0.9rem',
                    padding: '0.75rem 0.55rem',
                    color: '#fff',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {item.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.avatar}
                      alt=""
                      style={{ width: 36, height: 36, objectFit: 'contain' }}
                    />
                  ) : (
                    <Icon size={22} color={ACCENT} aria-hidden="true" />
                  )}
                  <p style={{ fontWeight: 800, margin: '0.35rem 0 0', fontSize: 13 }}>
                    {item.disc || item.vhicle_type}
                  </p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                    {item.vhicle_type}
                  </p>
                </button>
              )
            })}
          </div>
          {activeVehicleTypes.length === 0 && (
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>Loading vehicle types…</p>
          )}
          <PrimaryButton disabled={busy} onClick={() => startRegistration(false)}>
            Start registration <ArrowRight size={18} />
          </PrimaryButton>
          <GhostButton onClick={() => startRegistration(true)}>Skip for now</GhostButton>
          {!embedded && <GhostButton onClick={onGoToLogin}>Already registered? Login</GhostButton>}
        </section>
      )}

      {step === 2 && (
        <section>
          <h2 style={{ color: '#fff', marginBottom: 4 }}>Contact verification</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Enter email and phone. The same code verifies both contacts.</p>
          <label style={{ color: '#fff', fontSize: 13 }}>Email</label>
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} style={fieldStyle()} placeholder="driver@email.com" />
          <div style={{ height: 10 }} />
          <label style={{ color: '#fff', fontSize: 13 }}>Mobile number</label>
          <input inputMode="numeric" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={fieldStyle()} placeholder="10-digit mobile number" />
          <div style={{ height: 10 }} />
          <label style={{ color: '#fff', fontSize: 13 }}>Referral code (optional)</label>
          <input value={referral} onChange={(e) => setReferral(e.target.value)} style={fieldStyle()} placeholder="Optional" />
          <div style={{ height: 12 }} />
          <PrimaryButton disabled={busy || sendingOtp || resendIn > 0 || !email || phone.length < 10} onClick={handleSendOtp}>
            {resendIn > 0 ? `Resend in ${resendIn}s` : 'Send OTP'}
          </PrimaryButton>
          <div style={{ height: 12 }} />
          <label style={{ color: '#fff', fontSize: 13 }}>OTP</label>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={fieldStyle()}
            placeholder="Enter the code from email"
            maxLength={6}
          />
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
            {challenge?.delivery?.channelHint || 'If you do not get a text, use the code sent to email.'}
          </p>
          <PrimaryButton disabled={busy || otp.length < 4} onClick={handleVerifyOtp}>
            Verify OTP <Smartphone size={16} />
          </PrimaryButton>
        </section>
      )}

      {step === 3 && (
        <section>
          <h2 style={{ color: '#fff' }}>Personal & KYC details</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Name and date of birth should match the identity document. Confirm extracted details — they are never changed silently.</p>
          {[
            ['fullName', 'Full name (as per ID)'],
            ['dateOfBirth', 'Date of birth', 'date'],
            ['addressLine', 'Current address'],
            ['city', 'City'],
            ['state', 'State'],
            ['pincode', 'PIN code'],
            ['emergencyName', 'Emergency contact name'],
            ['emergencyPhone', 'Emergency contact phone'],
          ].map(([key, label, type]) => (
            <div key={key} style={{ marginBottom: 10 }}>
              <label style={{ color: '#fff', fontSize: 13 }}>{label}</label>
              <input
                type={type || 'text'}
                value={profile[key]}
                onChange={(e) => setProfile((prev) => ({ ...prev, [key]: e.target.value }))}
                style={fieldStyle()}
              />
            </div>
          ))}
          <label style={{ color: '#fff', fontSize: 13 }}>Preferred language</label>
          <select
            value={profile.preferredLanguage}
            onChange={(e) => setProfile((prev) => ({ ...prev, preferredLanguage: e.target.value }))}
            style={fieldStyle()}
          >
            {['English', 'Hindi', 'Other'].map((lang) => <option key={lang} value={lang}>{lang}</option>)}
          </select>
          <div style={{ height: 10 }} />
          <FilePicker label={profile.profilePhotoUrl ? 'Replace profile photo' : 'Upload profile photo'} onPicked={(file) => handleVerificationFile('profilePhotoUrl', file)} capture="user" />
          <div style={{ height: 12 }} />
          <PrimaryButton disabled={busy || !profile.fullName} onClick={handleSaveProfile}>
            Save and continue <IdCard size={16} />
          </PrimaryButton>
        </section>
      )}

      {step === 4 && (
        <section>
          <h2 style={{ color: '#fff' }}>Vehicle & service</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>You can add more vehicles later. This one is registered against your driver profile, not as a single field.</p>
          <label style={{ color: '#fff', fontSize: 13 }}>Vehicle category</label>
          <select
            value={vehicle.vhicleTypeId}
            onChange={(e) => setVehicle((prev) => ({ ...prev, vhicleTypeId: e.target.value }))}
            style={fieldStyle()}
          >
            <option value="">Select vehicle type</option>
            {vehicleTypes.map((item) => (
              <option key={item.id} value={item.id}>{item.disc || item.vhicle_type}</option>
            ))}
          </select>
          {[
            ['registrationNumber', 'Registration number'],
            ['make', 'Make'],
            ['model', 'Model'],
            ['year', 'Manufacturing year'],
            ['rc', 'RC details'],
            ...(service && service !== 'BIKE' ? [['permitNumber', 'Permit details']] : []),
            ['insuranceNumber', 'Insurance'],
            ...(service === 'CAB' ? [['seatingCapacity', 'Seating capacity']] : []),
          ].map(([key, label]) => (
            <div key={key} style={{ marginTop: 10 }}>
              <label style={{ color: '#fff', fontSize: 13 }}>{label}</label>
              <input value={vehicle[key]} onChange={(e) => setVehicle((prev) => ({ ...prev, [key]: e.target.value }))} style={fieldStyle()} />
            </div>
          ))}
          <div style={{ height: 12 }} />
          <PrimaryButton disabled={busy || !vehicle.registrationNumber || !vehicle.vhicleTypeId} onClick={handleAddVehicle}>
            Register vehicle
          </PrimaryButton>
          {(onboardingCase?.vehicles || []).map((item) => (
            <p key={item.id} style={{ color: ACCENT, fontSize: 13 }}>
              {item.registration_number} · {item.service_category}
            </p>
          ))}
        </section>
      )}

      {step === 5 && (
        <section>
          <h2 style={{ color: '#fff' }}>Document upload</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>
            {(onboardingCase?.documentProgress?.complete || 0)} / {(onboardingCase?.documentProgress?.total || 0)} complete
          </p>
          {(onboardingCase?.documents || []).map((doc) => {
            const docKey = doc.document_type || doc.documentType
            const isUploading = uploading || uploadingDocKey === docKey
            const fileUrl = doc.file_url || doc.fileUrl
            return (
            <div key={doc.id} style={{
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '0.85rem',
              padding: '0.85rem',
              marginBottom: '0.7rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <strong style={{ color: '#fff' }}>{doc.catalog?.name || docKey}</strong>
                <span style={{ color: ACCENT, fontSize: 12 }}>{doc.required ? 'Required' : 'Optional'} · {doc.verification_status}</span>
              </div>
              {doc.rejection_reason && (
                <p style={{ color: '#fb7185', fontSize: 13, marginBottom: 0 }}>{doc.rejection_reason}</p>
              )}
              {fileUrl && (
                <div style={{ marginTop: 8, maxWidth: 120 }}>
                  <DocumentPreview url={fileUrl} alt={doc.catalog?.name || docKey} height={72} />
                </div>
              )}
              <div style={{ height: 8 }} />
              <FilePicker
                label={
                  isUploading
                    ? 'Uploading…'
                    : fileUrl
                      ? 'Replace document'
                      : 'Upload from camera or files'
                }
                disabled={isUploading}
                onPicked={(file) => handleDocument(doc, file)}
              />
            </div>
          )})}
          <PrimaryButton
            disabled={uploading || Boolean(uploadingDocKey) || !requiredDocumentsComplete}
            onClick={() => {
              if (onboardingCase?.currentStep >= 6) applyCase(onboardingCase)
              setStep(6)
            }}
          >
            Continue to verification
          </PrimaryButton>
        </section>
      )}

      {step === 6 && (
        <section>
          <h2 style={{ color: '#fff' }}>Selfie, face & vehicle verification</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>
            This is a trust check, not a casual profile photo. Face data is collected only with consent.
          </p>
          <label style={{ color: '#fff', display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <input type="checkbox" checked={selfieConsent} onChange={(e) => setSelfieConsent(e.target.checked)} />
            I consent to a one-time face match against my identity record.
          </label>
          {[
            ['selfieUrl', 'Capture live selfie', 'user', verification?.selfieUrl],
            ['vehicleFrontUrl', 'Vehicle front photo', 'environment', verification?.vehicleFrontUrl],
            ['vehicleRearUrl', 'Vehicle rear photo', 'environment', verification?.vehicleRearUrl],
            ['vehiclePlateUrl', 'Number plate photo', 'environment', verification?.vehiclePlateUrl],
          ].map(([field, label, capture, previewUrl]) => (
            <div key={field} style={{ marginBottom: 8 }}>
              {previewUrl && (
                <div style={{ maxWidth: 120, marginBottom: 6 }}>
                  <DocumentPreview url={previewUrl} alt={label} height={72} />
                </div>
              )}
              <FilePicker
                label={uploadingDocKey === field ? 'Uploading…' : label}
                capture={capture}
                disabled={uploading || uploadingDocKey === field}
                onPicked={(file) => handleVerificationFile(field, file)}
              />
            </div>
          ))}
          <div style={{ height: 12 }} />
          <PrimaryButton
            disabled={!selfieConsent || !verificationComplete}
            onClick={() => setStep(7)}
          >
            Continue to training <Shield size={16} />
          </PrimaryButton>
        </section>
      )}

      {step === 7 && (
        <section>
          <h2 style={{ color: '#fff' }}>Training & safety induction</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>
            {(onboardingCase?.training?.completed || 0)} / {(onboardingCase?.training?.total || (catalog?.training || []).length || 5)} modules complete
          </p>
          {(onboardingCase?.training?.modules || catalog?.training || []).map((mod) => {
            const done = Boolean(mod.progress?.quizPassed && mod.progress?.acknowledged)
            const answers = answersForModule(mod.id)
            const questions = mod.quiz || []
            const allAnswered = questions.length > 0 && questions.every((_, index) => Boolean(answers[index]))
            return (
              <div key={mod.id} style={{
                border: `1px solid ${done ? 'rgba(196,248,42,0.35)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '0.85rem',
                padding: '0.85rem',
                marginBottom: '0.65rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ color: '#fff' }}>{mod.title}</strong>
                  {done && <Check size={16} color={ACCENT} aria-hidden="true" />}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{mod.summary}</p>
                {activeModule === mod.id ? (
                  <div>
                    {questions.map((item, index) => (
                      <div key={item.q} style={{ marginBottom: 12 }}>
                        <p style={{ color: '#fff', fontSize: 14, marginBottom: 8 }}>{item.q}</p>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {['yes', 'no'].map((answer) => {
                            const selected = answers[index] === answer
                            return (
                              <button
                                key={answer}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => setModuleAnswer(mod.id, index, answer)}
                                style={{
                                  minWidth: 88,
                                  minHeight: 44,
                                  padding: '0.55rem 1rem',
                                  borderRadius: '0.7rem',
                                  border: `1px solid ${selected ? ACCENT : 'rgba(255,255,255,0.2)'}`,
                                  background: selected ? 'rgba(196,248,42,0.18)' : 'rgba(255,255,255,0.04)',
                                  color: selected ? ACCENT : '#fff',
                                  fontWeight: 700,
                                  textTransform: 'capitalize',
                                  cursor: 'pointer',
                                }}
                              >
                                {answer}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                    {trainingError && activeModule === mod.id && (
                      <p style={{ color: '#fb7185', fontSize: 13 }}>{trainingError}</p>
                    )}
                    <PrimaryButton
                      disabled={busy || !allAnswered}
                      onClick={() => handleTraining(mod)}
                    >
                      {busy ? 'Saving…' : done ? 'Save review' : 'Acknowledge and pass'}
                    </PrimaryButton>
                  </div>
                ) : (
                  <GhostButton onClick={() => {
                    setActiveModule(mod.id)
                    setTrainingError('')
                    if (!quizByModule[mod.id]) {
                      setQuizByModule((prev) => ({ ...prev, [mod.id]: [] }))
                    }
                  }}>
                    {done ? 'Review module' : 'Start module'}
                  </GhostButton>
                )}
              </div>
            )
          })}
          <PrimaryButton
            disabled={(onboardingCase?.training?.completed || 0) < (onboardingCase?.training?.total || 5)}
            onClick={() => setStep(8)}
          >
            Continue to payout <GraduationCap size={16} />
          </PrimaryButton>
        </section>
      )}

      {step === 8 && (
        <section>
          <h2 style={{ color: '#fff' }}>Bank, payout & plan</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Choose a plan first. Pay only if the plan requires it. Flex can start without an upfront subscription.</p>
          <div style={{ display: 'grid', gap: '0.65rem', marginBottom: '1rem' }}>
            {(catalog?.plans || []).map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => setPlan(item.code)}
                style={{
                  textAlign: 'left',
                  background: plan === item.code ? 'rgba(196,248,42,0.14)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${plan === item.code ? ACCENT : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '0.85rem',
                  color: '#fff',
                  padding: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <strong>{item.name}</strong> · {item.kind}
                <p style={{ margin: '0.2rem 0 0', fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{item.commission}. {item.fee}.</p>
              </button>
            ))}
          </div>
          <input placeholder="Account holder name" value={payout.accountHolder} onChange={(e) => setPayout((p) => ({ ...p, accountHolder: e.target.value }))} style={{ ...fieldStyle(), marginBottom: 8 }} />
          <select value={payout.bank_account} onChange={(e) => setPayout((p) => ({ ...p, bank_account: e.target.value }))} style={{ ...fieldStyle(), marginBottom: 8 }}>
            <option value="">Select bank</option>
            {(Array.isArray(banks) ? banks : []).map((bank) => (
              <option key={bank.id} value={bank.id}>{bank.bank_name}</option>
            ))}
          </select>
          <select value={payout.bank_account_branch} onChange={(e) => setPayout((p) => ({ ...p, bank_account_branch: e.target.value }))} style={{ ...fieldStyle(), marginBottom: 8 }}>
            <option value="">Select branch</option>
            {(Array.isArray(branches) ? branches : []).map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
            ))}
          </select>
          <input placeholder="Account number" value={payout.bank_account_no} onChange={(e) => setPayout((p) => ({ ...p, bank_account_no: e.target.value }))} style={{ ...fieldStyle(), marginBottom: 8 }} />
          <input placeholder="IFSC" value={payout.ifsc} onChange={(e) => setPayout((p) => ({ ...p, ifsc: e.target.value }))} style={{ ...fieldStyle(), marginBottom: 12 }} />
          <PrimaryButton disabled={busy || !payout.bank_account || !payout.ifsc} onClick={handlePayout}>
            Save payout <Landmark size={16} />
          </PrimaryButton>
        </section>
      )}

      {step === 9 && (
        <section>
          <h2 style={{ color: '#fff' }}>Final review</h2>
          {['UNDER_REVIEW', 'APPROVED'].includes(status) ? (
            <div style={{ color: '#fff' }}>
              <p>Your file is {status === 'APPROVED' ? 'approved' : 'with compliance'}.</p>
              {status === 'APPROVED' && <PrimaryButton onClick={() => setStep(10)}>Go to activation</PrimaryButton>}
              {status === 'UNDER_REVIEW' && onContinueLater && (
                <GhostButton onClick={() => onContinueLater({ user: authUser, case: onboardingCase })}>
                  Continue to driver dashboard
                </GhostButton>
              )}
            </div>
          ) : (
            <>
              <p style={{ color: 'rgba(255,255,255,0.65)' }}>
                Identity, vehicle, documents, training, and payout must be complete before approval.
              </p>
              {status === 'ACTION_REQUIRED' && (
                <p style={{ color: '#fb7185' }}>{onboardingCase?.rejectionReason || 'Additional verification required.'}</p>
              )}
              <PrimaryButton disabled={busy} onClick={handleSubmit}>Submit for review <FileText size={16} /></PrimaryButton>
            </>
          )}
        </section>
      )}

      {step === 10 && (
        <section>
          <h2 style={{ color: '#fff' }}>You're ready to drive</h2>
          <p style={{ color: 'rgba(255,255,255,0.65)' }}>Your profile and vehicle have been approved. Complete these checks before going online.</p>
          {[
            ['gps', 'GPS permission enabled'],
            ['notifications', 'Notifications enabled'],
            ['vehicle', 'Vehicle selected'],
            ['payout', 'Payout account verified'],
            ['training', 'Safety training completed'],
          ].map(([key, label]) => (
            <label key={key} style={{ display: 'flex', gap: 8, color: '#fff', marginBottom: 8 }}>
              <input
                type="checkbox"
                checked={readyChecks[key]}
                onChange={(e) => setReadyChecks((prev) => ({ ...prev, [key]: e.target.checked }))}
              />
              {label}
            </label>
          ))}
          <PrimaryButton
            disabled={busy || Object.values(readyChecks).some((value) => !value) || status !== 'APPROVED'}
            onClick={handleActivate}
          >
            Go Online <UserRound size={16} />
          </PrimaryButton>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
            First ride: review pickup + fare → accept → navigate → arrived → start → complete → earnings update.
          </p>
        </section>
      )}
    </div>
  )
}
