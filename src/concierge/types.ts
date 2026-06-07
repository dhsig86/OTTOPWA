export type OttoProfile = 'medico' | 'estudante' | 'profissional' | 'paciente';

export type ConciergeSurface = 'pwa' | 'zap' | 'dashboard' | 'test';

export type ClinicalRisk = 'low' | 'medium' | 'high' | 'variable';

export type DataSensitivity = 'none' | 'low' | 'phi' | 'high_phi';

export type AdapterStatus = 'mock' | 'deeplink' | 'read_only' | 'real' | 'blocked';

export type IdentityVerificationStatus = 'verified' | 'unverified';

export type IdentityVerificationMethod = 'firebase_token' | 'whatsapp_phone_link' | 'mock_lab' | 'anonymous';

export interface IdentityVerification {
  status: IdentityVerificationStatus;
  method: IdentityVerificationMethod;
  resolvedBy: 'pwa_auth' | 'zap_gateway' | 'lab' | 'none';
}

export interface UserPreferences {
  preferredCalcAreas?: string[];
  preferredCalculatorIds?: string[];
  answerStyle?: 'concise' | 'balanced' | 'detailed';
  defaultSurface?: ConciergeSurface;
}

export type ActionKind =
  | 'respond'
  | 'open_module'
  | 'deep_link'
  | 'request_confirmation'
  | 'call_tool'
  | 'handoff_to_pwa'
  | 'refuse';

export type RedactionLevel = 'none' | 'partial' | 'strict';

export interface IdentityContext {
  uid: string;
  profile: OttoProfile;
  displayName?: string;
  phoneE164?: string;
  verification?: IdentityVerification;
  preferences?: UserPreferences;
}

export interface PatientContext {
  patientId?: string;
  token?: string;
  consentScope?: string[];
}

export interface ConciergeInput {
  surface: ConciergeSurface;
  input: {
    kind: 'text' | 'audio' | 'document' | 'image';
    text?: string;
    mediaRef?: string;
  };
  identity: IdentityContext;
  patientContext?: PatientContext;
  session: {
    id: string;
    timestamp: string;
    locale: 'pt-BR';
  };
  source?: {
    whatsappMessageId?: string;
    pwaRoute?: string;
    moduleId?: string;
  };
}

export interface AuditPolicy {
  eventType: string;
  storePayload: boolean;
  redactionLevel: RedactionLevel;
}

export interface ConciergeDecision {
  decisionId: string;
  intentId: string;
  confidence: number;
  riskLevel: ClinicalRisk;
  action: {
    kind: ActionKind;
    moduleId?: string;
    url?: string;
    payload?: Record<string, unknown>;
    requiresConfirmation?: boolean;
  };
  audit: AuditPolicy;
  userMessage: string;
  debug: {
    traceId: string;
    selectedIntent?: string;
    guardrailDecision: 'allow' | 'confirm' | 'handoff' | 'refuse';
    classifiedBy?: 'local' | 'deepseek';
  };
}

export interface ModuleRegistryEntry {
  id: string;
  displayName: string;
  currentUrl: string;
  category: 'clinico' | 'educacao_paciente' | 'operacional';
  profiles: OttoProfile[];
  status: 'live' | 'beta' | 'coming-soon';
  clinicalRisk: ClinicalRisk;
  dataSensitivity: DataSensitivity;
  capabilities: string[];
  surfaces: ConciergeSurface[];
  adapter: {
    status: AdapterStatus;
    timeoutMs: number;
  };
  policies: {
    requiresAuth: boolean;
    allowsIframe: boolean;
    supportsDeepLink: boolean;
    supportsPostMessage: boolean;
    requiresConfirmationForPersist: boolean;
  };
}

export interface IntentRegistryEntry {
  id: string;
  displayName: string;
  description: string;
  examples: string[];
  negativeExamples?: string[];
  moduleId: string;
  actionKind: ActionKind;
  riskLevel: ClinicalRisk;
  allowedProfiles: OttoProfile[];
  allowedSurfaces: ConciergeSurface[];
  requiresConfirmation: boolean;
  requiresPatientContext: boolean;
  dataSensitivity: DataSensitivity;
  auditPolicy: AuditPolicy;
}

export interface IntentCandidate {
  intent: IntentRegistryEntry;
  confidence: number;
  matchedTerms: string[];
}

export interface AdapterRequest {
  moduleId: string;
  intentId: string;
  surface: ConciergeSurface;
  input: {
    text?: string;
    mediaRef?: string;
  };
  identity?: Pick<IdentityContext, 'uid' | 'profile' | 'verification' | 'preferences'>;
  traceId: string;
}

export type AdapterResponseStatus = 'success' | 'needs_handoff' | 'error' | 'timeout';

export interface AdapterResponse {
  status: AdapterResponseStatus;
  moduleId: string;
  intentId: string;
  summary: string;
  redactionLevel: RedactionLevel;
  payload?: Record<string, unknown>;
  debug: {
    traceId: string;
    adapterStatus: AdapterStatus;
    containsPhi: boolean;
  };
}

export interface ModuleActivation {
  shouldActivate: boolean;
  moduleId?: string;
  mode: 'none' | 'deep_link' | 'open_module' | 'adapter' | 'handoff' | 'confirmation';
  url?: string;
  reason: string;
}

export interface CommandSimulationResult {
  decision: ConciergeDecision;
  activation: ModuleActivation;
  adapterResponse?: AdapterResponse;
  durationMs: number;
}
