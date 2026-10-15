"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Server actions: these run on the server when the login form is
// submitted. The password never touches our own code beyond being passed
// straight to Supabase.

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  };
}

// Supabase's error messages are written for developers. These say what
// a boarder or landlord should actually do next.
function friendly(message: string) {
  const m = message.toLowerCase();
  if (m.includes("rate limit")) {
    return "Too many sign-ups right now. Please try again in an hour, or ask your landlord to set up your account.";
  }
  if (m.includes("email not confirmed")) {
    return "Please open the confirmation email we sent you first (check Spam too), then log in.";
  }
  if (m.includes("invalid login credentials")) {
    return "Wrong email or password. New here? Enter your email and a password, then choose Sign up.";
  }
  if (m.includes("already registered")) {
    return "This email already has an account. Choose Log in instead.";
  }
  if (m.includes("password")) {
    return "Your password needs at least 6 characters.";
  }
  return message;
}

export async function login(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(readCredentials(formData));
  if (error) redirect(`/login?error=${encodeURIComponent(friendly(error.message))}`);
  redirect("/");
}

export async function signup(formData: FormData) {
  const credentials = readCredentials(formData);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(credentials);
  if (error) redirect(`/login?error=${encodeURIComponent(friendly(error.message))}`);
  // When "Confirm email" is ON, there is no session until the email link is clicked.
  if (!data.session) {
    redirect(
      `/login?message=${encodeURIComponent(
        `We sent a confirmation link to ${credentials.email}. Open it (check Spam too), then come back here and log in.`,
      )}`,
    );
  }
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
