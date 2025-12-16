import { User, UserRole } from '../types';

const DB_KEY = 'legal_sathi_users_db';

interface UserRecord extends User {
  password: string; // In a real app, this would be a hashed string
}

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const MockBackend = {
  /**
   * Register a new user into the local database
   */
  register: async (name: string, email: string, password: string, role: UserRole): Promise<{ user: User, token: string }> => {
    await delay(800); // Simulate server processing time

    const usersStr = localStorage.getItem(DB_KEY);
    const users: UserRecord[] = usersStr ? JSON.parse(usersStr) : [];

    // Check if user already exists
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("User with this email already exists.");
    }

    const newUser: UserRecord = {
      id: Date.now().toString(),
      name,
      email,
      role,
      verified: true,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e3a8a&color=fff`,
      password // Storing plain text for demo only. NEVER do this in production.
    };

    users.push(newUser);
    localStorage.setItem(DB_KEY, JSON.stringify(users));

    // Return User object (without password) and a mock token
    const { password: _, ...safeUser } = newUser;
    return {
      user: safeUser,
      token: `mock-jwt-token-${Date.now()}`
    };
  },

  /**
   * Authenticate a user
   */
  login: async (email: string, password: string): Promise<{ user: User, token: string }> => {
    await delay(800); // Simulate server processing time

    const usersStr = localStorage.getItem(DB_KEY);
    const users: UserRecord[] = usersStr ? JSON.parse(usersStr) : [];

    const foundUser = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!foundUser) {
      throw new Error("Invalid email or password.");
    }

    // Return User object (without password) and a mock token
    const { password: _, ...safeUser } = foundUser;
    return {
      user: safeUser,
      token: `mock-jwt-token-${Date.now()}`
    };
  }
};