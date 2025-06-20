"use client";

import PasswordSignIn from "./PasswordSignIn";

export default function AuthUI(props: any) {
  return (
    <div className="my-auto mb-auto mt-8 flex flex-col md:mt-[70px] md:max-w-full lg:mt-[130px] lg:max-w-[420px]">
      <p className="text-[32px] font-bold text-foreground dark:text-white">
        {props.viewProp === "signup"
          ? "Sign Up"
          : props.viewProp === "forgot_password"
            ? "Forgot Password"
            : props.viewProp === "update_password"
              ? "Update Password"
              : props.viewProp === "email_signin"
                ? "Email Sign In"
                : "Sign In"}
      </p>
      <p className="mb-2.5 mt-2.5 font-normal text-foreground dark:text-zinc-400">
        {props.viewProp === "signup"
          ? "Enter your email and password to sign up!"
          : props.viewProp === "forgot_password"
            ? "Enter your email to get a passoword reset link!"
            : props.viewProp === "update_password"
              ? "Choose a new password for your account!"
              : props.viewProp === "email_signin"
                ? "Enter your email to get a magic link!"
                : "Enter your email and password to sign in!"}
      </p>
      {props.viewProp === "password_signin" && (
        <PasswordSignIn
          allowEmail={props.allowEmail}
          redirectMethod={props.redirectMethod}
        />
      )}
    </div>
  );
}
