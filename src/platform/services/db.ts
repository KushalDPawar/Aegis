/**
 * AEGIS Sovereign Database Engine
 * 
 * Implements persistent database storage using on-device IndexedDB with
 * PBKDF2-HMAC-SHA256 salted password hashing, structured tables, and session management.
 * Fully compatible with optional Supabase cloud integration.
 */

export interface DbUser {
  id: string;
  email: string;
  name: string;
  userId: string;
  passwordHash: string;
  salt: string;
  accountNumber: string;
  tier: string;
  role: string;
  clearanceLevel: string;
  phone: string;
  balance: number;
  isDemoAccount: boolean;
  demoPersonaType?: 'vulnerable' | 'stressed' | 'healthy';
  createdAt: string;
  lastLogin: string;
  twoFactorEnabled: boolean;
}

export interface DbSession {
  token: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
}

const DB_NAME = 'aegis_sovereign_db';
const DB_VERSION = 1;

// ── Web Crypto API: PBKDF2 Salted Password Hashing ──────────────────────────

async function generateSalt(): Promise<string> {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const rawKey = await crypto.subtle.exportKey('raw', key);
  return Array.from(new Uint8Array(rawKey), b => b.toString(16).padStart(2, '0')).join('');
}

// ── IndexedDB Database Setup & Seeding ──────────────────────────────────────

let dbPromise: Promise<IDBDatabase> | null = null;

function getDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id' });
        userStore.createIndex('email', 'email', { unique: true });
        userStore.createIndex('userId', 'userId', { unique: true });
      }

      if (!db.objectStoreNames.contains('sessions')) {
        db.createObjectStore('sessions', { keyPath: 'token' });
      }

      if (!db.objectStoreNames.contains('audit_records')) {
        const auditStore = db.createObjectStore('audit_records', { keyPath: 'id' });
        auditStore.createIndex('userId', 'userId', { unique: false });
      }
    };

    request.onsuccess = async () => {
      const db = request.result;
      await seedDefaultDemoAccounts(db);
      resolve(db);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
}

// ── Initial Seed Data (3 Distinct Demo Personas) ────────────────────────────

async function seedDefaultDemoAccounts(db: IDBDatabase): Promise<void> {
  return new Promise((resolve) => {
    const tx = db.transaction(['users'], 'readwrite');
    const store = tx.objectStore('users');
    const checkReq = store.get('usr-demo-vulnerable');

    checkReq.onsuccess = async () => {
      if (checkReq.result) {
        resolve(); // Already seeded
        return;
      }

      const salt = await generateSalt();
      const defaultHash = await hashPassword('aegis2026', salt);

      const demoUsers: DbUser[] = [
        {
          id: 'usr-demo-vulnerable',
          userId: 'deepak.sharma',
          email: 'deepak.sharma@ascend.bank',
          name: 'Deepak Sharma',
          passwordHash: defaultHash,
          salt: salt,
          accountNumber: 'ACC #4912 · ELITE',
          tier: 'ELITE',
          role: 'Executive Client',
          clearanceLevel: 'Level 3 Sovereign Clearance',
          phone: '+91 98450 12948',
          balance: 2845000,
          isDemoAccount: true,
          demoPersonaType: 'vulnerable',
          createdAt: new Date().toISOString(),
          lastLogin: 'Today, 14:22 IST (Terminal 01)',
          twoFactorEnabled: true,
        },
        {
          id: 'usr-demo-stressed',
          userId: 'priya.treasury',
          email: 'priya.nair@chromastudios.com',
          name: 'Priya Nair',
          passwordHash: defaultHash,
          salt: salt,
          accountNumber: 'ACC #8821 · TREASURY',
          tier: 'CORPORATE',
          role: 'Treasury Officer',
          clearanceLevel: 'Multi-Sig Corporate Approver',
          phone: '+91 98200 48192',
          balance: 14500000,
          isDemoAccount: true,
          demoPersonaType: 'stressed',
          createdAt: new Date().toISOString(),
          lastLogin: 'Today, 11:05 IST (Corporate Portal)',
          twoFactorEnabled: true,
        },
        {
          id: 'usr-demo-healthy',
          userId: 'vikram.admin',
          email: 'vikram.malhotra@sentinel.ai',
          name: 'Vikram Malhotra',
          passwordHash: defaultHash,
          salt: salt,
          accountNumber: 'ACC #1004 · COMPLIANCE',
          tier: 'RISK OFFICER',
          role: 'Chief Risk Officer',
          clearanceLevel: 'Full Fraud Forensic Override',
          phone: '+91 99100 37190',
          balance: 5210000,
          isDemoAccount: true,
          demoPersonaType: 'healthy',
          createdAt: new Date().toISOString(),
          lastLogin: 'Today, 09:30 IST (Risk Station)',
          twoFactorEnabled: true,
        },
      ];

      const writeTx = db.transaction(['users'], 'readwrite');
      const writeStore = writeTx.objectStore('users');
      demoUsers.forEach(u => writeStore.put(u));
      writeTx.oncomplete = () => resolve();
    };
  });
}

// ── Public Database Service Operations ──────────────────────────────────────

export const DatabaseService = {
  /**
   * Find user by Email or User ID
   */
  async findUser(identifier: string): Promise<DbUser | null> {
    const db = await getDb();
    const cleanId = identifier.trim().toLowerCase();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(['users'], 'readonly');
      const store = tx.objectStore('users');

      // Try searching via email index
      const emailIndex = store.index('email');
      const emailReq = emailIndex.get(cleanId);

      emailReq.onsuccess = () => {
        if (emailReq.result) {
          resolve(emailReq.result);
          return;
        }

        // Try searching via userId index
        const userIndex = store.index('userId');
        const userReq = userIndex.get(cleanId);

        userReq.onsuccess = () => {
          resolve(userReq.result || null);
        };
        userReq.onerror = () => reject(userReq.error);
      };
      emailReq.onerror = () => reject(emailReq.error);
    });
  },

  /**
   * Create a new persistent user account with salted password hash
   */
  async createUser(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<{ user: DbUser | null; error?: string }> {
    const db = await getDb();
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanName = data.name.trim();

    // Check if email already exists
    const existing = await this.findUser(cleanEmail);
    if (existing) {
      return { user: null, error: 'An account with this email address already exists.' };
    }

    const salt = await generateSalt();
    const passwordHash = await hashPassword(data.password, salt);

    const generatedUserId = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_.]/g, '');
    const randomAccNum = Math.floor(1000 + Math.random() * 9000);

    const newUser: DbUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email: cleanEmail,
      userId: generatedUserId,
      name: cleanName,
      passwordHash: passwordHash,
      salt: salt,
      accountNumber: `ACC #${randomAccNum} · SOVEREIGN`,
      tier: 'SOVEREIGN',
      role: data.role || 'Executive Member',
      clearanceLevel: 'Level 2 Verified Sovereign Access',
      phone: '+91 (Configured on first session)',
      balance: 1000000,
      isDemoAccount: false,
      createdAt: new Date().toISOString(),
      lastLogin: 'Just now (Initial Session)',
      twoFactorEnabled: true,
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(['users'], 'readwrite');
      const store = tx.objectStore('users');
      const req = store.add(newUser);

      req.onsuccess = () => {
        resolve({ user: newUser });
      };
      req.onerror = () => {
        resolve({ user: null, error: 'Failed to write account to sovereign database.' });
      };
    });
  },

  /**
   * Authenticate user credentials against salted cryptographic hash
   */
  async verifyCredentials(identifier: string, password: string): Promise<{ user: DbUser | null; error?: string }> {
    const user = await this.findUser(identifier);

    if (!user) {
      return { user: null, error: 'No account found with this email or User ID.' };
    }

    // Verify cryptographic password hash
    const computedHash = await hashPassword(password, user.salt);
    if (computedHash !== user.passwordHash) {
      return { user: null, error: 'Invalid password. Please check your credentials.' };
    }

    // Update last login timestamp
    const db = await getDb();
    const tx = db.transaction(['users'], 'readwrite');
    const store = tx.objectStore('users');
    const updatedUser: DbUser = {
      ...user,
      lastLogin: `Today, ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST (Verified)`,
    };
    store.put(updatedUser);

    return { user: updatedUser };
  },

  /**
   * Create or update active session
   */
  async createSession(userId: string): Promise<DbSession> {
    const db = await getDb();
    const session: DbSession = {
      token: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId: userId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(['sessions'], 'readwrite');
      const store = tx.objectStore('sessions');
      const req = store.put(session);
      req.onsuccess = () => resolve(session);
      req.onerror = () => reject(req.error);
    });
  },

  /**
   * Retrieve all seeded demo accounts for quick demo selection
   */
  async getDemoUsers(): Promise<DbUser[]> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['users'], 'readonly');
      const store = tx.objectStore('users');
      const req = store.getAll();

      req.onsuccess = () => {
        const allUsers: DbUser[] = req.result || [];
        const demos = allUsers.filter(u => u.isDemoAccount);
        resolve(demos);
      };
      req.onerror = () => reject(req.error);
    });
  },
};
