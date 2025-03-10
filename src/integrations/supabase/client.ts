
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { UserRole } from '@/lib/types';
import { format } from 'date-fns';

const SUPABASE_URL = "https://kpfrojdpkfjyazgcznko.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwZnJvamRwa2ZqeWF6Z2N6bmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1OTQxNjUsImV4cCI6MjA1NzE3MDE2NX0.2CjS2cNtR0Z-WJhBeSSUqEk4xtHNJizDyNeZ6XTYi08";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Helper to format dates for Supabase
export const formatDateForSupabase = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

// Helper to convert DB types to App types
export const mapDbTypeToAppType = <T extends Record<string, any>>(dbData: any, fieldMappings: Record<string, string>): T => {
  if (!dbData) return {} as T;
  
  const result: Record<string, any> = {};
  Object.entries(dbData).forEach(([key, value]) => {
    // Map snake_case to camelCase
    const appKey = fieldMappings[key] || key;
    result[appKey] = value;
  });
  
  return result as T;
};

// Function to ensure a user exists (sign up if not already registered)
export async function ensureUserExists(email: string, password: string, userData?: { full_name?: string; role?: UserRole }) {
  try {
    // First try to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    // If login was successful, return the user
    if (signInData.user) {
      return { user: signInData.user, isNewUser: false };
    }

    // If error is not related to auth (e.g. network error), throw it
    if (signInError && !signInError.message.includes('Invalid login credentials')) {
      throw signInError;
    }

    // User doesn't exist, try to sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData?.full_name,
          role: userData?.role
        }
      }
    });

    if (signUpError) {
      throw signUpError;
    }

    // If we have a user from sign up, create their profile
    if (signUpData.user) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: signUpData.user.id,
          full_name: userData?.full_name,
          role: userData?.role
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
      }

      // If role is supervisor, create a supervisor entry
      if (userData?.role === UserRole.SUPERVISOR) {
        const { error: supervisorError } = await supabase
          .from('supervisors')
          .insert({
            user_id: signUpData.user.id,
            name: userData.full_name || email.split('@')[0]
          });

        if (supervisorError) {
          console.error('Error creating supervisor record:', supervisorError);
        }
      }

      return { user: signUpData.user, isNewUser: true };
    }

    throw new Error('Failed to create user');
  } catch (error) {
    console.error('Error in ensureUserExists:', error);
    throw error;
  }
}

// Sign out the current user
export async function signOut() {
  return supabase.auth.signOut();
}
