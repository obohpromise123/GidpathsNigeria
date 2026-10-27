// Fictional accounts for demo mode. They exist only in the browser tab.
export const DEMO_USERS = {
  admin: { id: 'demo-admin', email: 'admin@demo.local', display_name: 'Demo Administrator', platform_role: 'admin' },
  school_admin: { id: 'demo-head', email: 'principal@demo.local', display_name: 'Demo Principal', platform_role: 'user' },
  counsellor: { id: 'demo-counsellor', email: 'counsellor@demo.local', display_name: 'Demo Counsellor', platform_role: 'user' },
} as const

export type DemoUserKind = keyof typeof DEMO_USERS

export const DEMO_SCHOOL_ID = 'demo-school'
export const DEMO_SCHOOL_CODE = 'DEMO2026'
export const DEMO_SCHOOL_NAME = 'Demo Secondary School (sample)'
