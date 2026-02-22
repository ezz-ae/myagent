/**
 * Twilio Integration Hooks for LocalAgent Frontend
 * Provides utilities to initiate calls, check status, and handle call lifecycle
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export interface CallInitiateResponse {
  status: "initiated" | "error";
  call_sid?: string;
  phone?: string;
  message?: string;
}

export interface CallStatusResponse {
  call_sid: string;
  status: "queued" | "ringing" | "in-progress" | "completed" | "failed" | "busy" | "no-answer";
  from?: string;
  to?: string;
  start_time?: string;
  end_time?: string;
  duration?: number;
  price?: string;
}

/**
 * Initiate an outbound phone call
 * @param phone Phone number to call (e.g., "+1234567890")
 * @param language Language for the call ("en" or "ar")
 * @returns Call response with call_sid or error message
 */
export async function initiateCall(
  phone: string,
  language: "en" | "ar" = "en"
): Promise<CallInitiateResponse> {
  try {
    const response = await fetch(`${API_BASE}/v1/call/initiate?phone=${encodeURIComponent(phone)}&language=${language}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        status: "error",
        message: error.detail || "Failed to initiate call",
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error initiating call:", error);
    return {
      status: "error",
      message: "Network error: Could not reach backend",
    };
  }
}

/**
 * Check the status of an active call
 * @param callSid The Twilio Call SID
 * @returns Call status or error
 */
export async function getCallStatus(
  callSid: string
): Promise<CallStatusResponse | null> {
  try {
    const response = await fetch(`${API_BASE}/v1/call/status/${callSid}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.error("Call not found or status check failed");
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error checking call status:", error);
    return null;
  }
}

/**
 * End an active call
 * @param callSid The Twilio Call SID
 * @returns Success or error
 */
export async function endCall(callSid: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/v1/call/end/${callSid}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    return response.ok;
  } catch (error) {
    console.error("Error ending call:", error);
    return false;
  }
}

/**
 * Poll call status at regular intervals
 * Useful for updating UI with live call status
 * @param callSid The Twilio Call SID
 * @param interval Polling interval in milliseconds (default 2000)
 * @param onStatusChange Callback when status changes
 * @param timeout Maximum time to poll in milliseconds (default 3600000 = 1 hour)
 * @returns Stop function to terminate polling
 */
export function pollCallStatus(
  callSid: string,
  onStatusChange: (status: CallStatusResponse | null) => void,
  interval: number = 2000,
  timeout: number = 3600000
): () => void {
  let lastStatus: string | null = null;
  const startTime = Date.now();

  const pollInterval = setInterval(async () => {
    // Check timeout
    if (Date.now() - startTime > timeout) {
      clearInterval(pollInterval);
      return;
    }

    const status = await getCallStatus(callSid);

    // Only callback if status changed
    if (status && status.status !== lastStatus) {
      lastStatus = status.status;
      onStatusChange(status);

      // Stop polling when call is complete
      if (status.status === "completed" || status.status === "failed" || status.status === "no-answer") {
        clearInterval(pollInterval);
      }
    }
  }, interval);

  // Return stop function
  return () => clearInterval(pollInterval);
}

/**
 * Format call duration in MM:SS format
 * @param seconds Duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Get human-readable call status text
 * @param status Call status string
 * @returns Human-readable status text
 */
export function getStatusText(
  status: "queued" | "ringing" | "in-progress" | "completed" | "failed" | "busy" | "no-answer"
): string {
  const statusMap: Record<string, string> = {
    queued: "Queued",
    ringing: "Ringing…",
    "in-progress": "Call Active",
    completed: "Call Ended",
    failed: "Call Failed",
    busy: "Line Busy",
    "no-answer": "No Answer",
  };
  return statusMap[status] || "Unknown";
}

/**
 * Get color class for call status (Tailwind classes)
 * @param status Call status string
 * @returns Tailwind color class
 */
export function getStatusColor(
  status: "queued" | "ringing" | "in-progress" | "completed" | "failed" | "busy" | "no-answer"
): string {
  const colorMap: Record<string, string> = {
    queued: "text-white/40",
    ringing: "text-blue-400",
    "in-progress": "text-green-400",
    completed: "text-white/40",
    failed: "text-red-400",
    busy: "text-orange-400",
    "no-answer": "text-yellow-400",
  };
  return colorMap[status] || "text-white/40";
}

/**
 * Validate phone number format
 * @param phone Phone number to validate
 * @returns True if valid, false otherwise
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Basic validation: should start with + and have at least 10 digits
  const phoneRegex = /^\+?1?\d{9,15}$/;
  return phoneRegex.test(phone.replace(/\D/g, ""));
}

/**
 * Format phone number for display
 * @param phone Raw phone number
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.length === 11 && cleaned[0] === "1") {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  // Return with + prefix if not present
  return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
}
