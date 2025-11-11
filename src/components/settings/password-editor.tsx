import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { PasswordInput } from "@/components/auth/password-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { orpc } from "@/orpc/client";

const SUCCESS_MESSAGE_TIMEOUT = 3000;

export function PasswordEditor() {
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showSuccess, setShowSuccess] = useState(false);
	const [showError, setShowError] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const mutation = useMutation({
		mutationFn: (data: { currentPassword: string; newPassword: string }) =>
			orpc.profiles.changePassword.call(data),
		onSuccess: () => {
			setShowSuccess(true);
			setShowError(false);
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
			setTimeout(() => {
				setShowSuccess(false);
			}, SUCCESS_MESSAGE_TIMEOUT);
		},
		onError: (error: Error) => {
			setShowError(true);
			setShowSuccess(false);
			setErrorMessage(error.message || "Failed to change password");
		},
	});

	const passwordsMatch = newPassword === confirmPassword;
	const allFieldsFilled =
		currentPassword.length > 0 &&
		newPassword.length > 0 &&
		confirmPassword.length > 0;
	const canSave = allFieldsFilled && passwordsMatch && !mutation.isPending;

	const handleSave = () => {
		if (!canSave) {
			return;
		}
		mutation.mutate({ currentPassword, newPassword });
	};

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="current-password">Current password</Label>
				<PasswordInput
					disabled={mutation.isPending}
					id="current-password"
					onChange={(e) => setCurrentPassword(e.target.value)}
					placeholder="••••••••"
					value={currentPassword}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="new-password">New password</Label>
				<PasswordInput
					disabled={mutation.isPending}
					id="new-password"
					onChange={(e) => setNewPassword(e.target.value)}
					placeholder="••••••••"
					value={newPassword}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="confirm-password">Confirm new password</Label>
				<PasswordInput
					disabled={mutation.isPending}
					id="confirm-password"
					onChange={(e) => setConfirmPassword(e.target.value)}
					placeholder="••••••••"
					value={confirmPassword}
				/>
				{confirmPassword.length > 0 && !passwordsMatch && (
					<p className="text-destructive text-sm">Passwords do not match</p>
				)}
			</div>

			{showSuccess && (
				<Alert>
					<CheckCircle2 className="size-4" />
					<AlertDescription>Password changed successfully!</AlertDescription>
				</Alert>
			)}

			{showError && (
				<Alert variant="destructive">
					<AlertCircle className="size-4" />
					<AlertDescription>{errorMessage}</AlertDescription>
				</Alert>
			)}

			<Button disabled={!canSave} onClick={handleSave} type="button">
				{mutation.isPending ? "Changing Password..." : "Change Password"}
			</Button>
		</div>
	);
}
