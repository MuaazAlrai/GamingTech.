import { useState } from "react";
import { Link } from "react-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { auth } from "../../../firebase";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(false);
    setError("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSubmitted(true);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Unable to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-4">
          <img src="/gamingtech-logo.svg" alt="GamingTech.pk" className="h-24 w-72 rounded-xl object-cover shadow-lg" />
          <div className="text-center">
            <h1 className="text-2xl font-bold">Forgot Password?</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Enter your account email and we'll send reset instructions
            </p>
          </div>
        </div>

        {submitted ? (
          <Alert className="bg-success/10 border-success">
            <Mail className="h-5 w-5 text-success" />
            <AlertDescription className="text-success-foreground">
              Password reset link has been sent to <strong>{email}</strong>.
              Please check your email inbox.
            </AlertDescription>
          </Alert>
        ) : null}

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Add email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11"
            />
          </div>

          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <Link
          to="/login"
          className="flex items-center justify-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>

      </div>
    </div>
  );
}
