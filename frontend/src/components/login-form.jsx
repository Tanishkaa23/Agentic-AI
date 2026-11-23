
import { cn } from "@/lib/utils";
import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useNavigate } from "react-router-dom";
import { loginApi } from "@/features/auth";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/userSlice";

export function LoginForm({ className, ...props }) {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
   const dispatch=useDispatch()
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      // Firebase Google Authentication
      const result = await signInWithPopup(auth, googleProvider);

      // Firebase ID token
      const firebaseToken = await result.user.getIdToken();

      // Send token in request body to backend
      const data = await loginApi(firebaseToken);
      console.log(data);
      dispatch(setUser(data.user));
      // Backend login successful; HttpOnly cookie is set
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Google login failed:", err);

      let errorMessage = "Login failed. Please try again.";
      if (err?.code === "auth/configuration-not-found") {
        errorMessage = "Google provider is not enabled in Firebase Console. Go to Firebase Console > Authentication > Sign-in method and enable Google.";
      } else if (err?.code === "auth/popup-blocked") {
        errorMessage = "Sign-in popup was blocked by your browser. Please allow popups for this site and try again.";
      } else if (err?.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-in window was closed before completion.";
      } else if (err?.code === "auth/cancelled-popup-request") {
        errorMessage = "Only one sign-in request is allowed at a time.";
      } else if (err?.code === "auth/unauthorized-domain") {
        errorMessage = "This domain/port is not authorized in Firebase Console (Authentication > Settings > Authorized Domains).";
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight text-white">
            Welcome to Automate AI
          </CardTitle>

          <CardDescription className="text-sm text-zinc-400">
            Sign in to build and manage your AI agents.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <form>
            <FieldGroup>
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-xs text-red-300">
                  {error}
                </div>
              )}

              <Field>
                <Button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  variant="outline"
                  type="button"
                  className="h-12 w-full gap-3 rounded-xl border-white/15 bg-white/[0.04] text-sm font-medium text-white transition hover:border-violet-400/50 hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-zinc-300" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <FcGoogle className="text-lg" />
                      Continue with Google
                    </>
                  )}
                </Button>
              </Field>

              <Field>
                <FieldDescription className="pt-3 text-center text-xs leading-6 text-zinc-500">
                  By continuing, you agree to our{" "}
                  <a
                    href="/terms"
                    className="text-zinc-300 underline underline-offset-4 transition hover:text-white"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    className="text-zinc-300 underline underline-offset-4 transition hover:text-white"
                  >
                    Privacy Policy
                  </a>
                  .
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
