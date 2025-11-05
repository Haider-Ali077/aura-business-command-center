import { API_BASE_URL } from "@/config/api";

/**
 * Check if a tenant has RAG enabled by querying the backend
 * @param tenantId - The tenant ID to check
 * @returns Promise<boolean> - True if tenant has RAG enabled
 */
export async function checkTenantRag(tenantId: number): Promise<boolean> {
  try {
    // We'll create a simple endpoint to check tenant RAG status
    // For now, we can check it via a separate API call or include it in session
    // Since we don't have a dedicated endpoint, we'll make the request to /ask_with_rag
    // and it will handle the fallback internally, OR we check via a utility endpoint
    
    // Alternative: Check via backend utility (if available)
    // For now, we'll rely on the backend's fallback logic in /ask_with_rag
    // But for efficiency, let's create a simple check:
    
    const response = await fetch(`${API_BASE_URL}/check_tenant_rag?tenant_id=${tenantId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.is_rag === true || data.is_rag === 1;
    }
    
    // If endpoint doesn't exist or fails, default to false (safe fallback)
    // The backend /ask_with_rag endpoint will also handle fallback internally
    return false;
  } catch (error) {
    console.warn("⚠️ Could not check tenant RAG status, defaulting to false:", error);
    return false;
  }
}

/**
 * Get the appropriate endpoint based on tenant RAG status
 * @param tenantId - The tenant ID
 * @param useRag - Whether to use RAG endpoint (if known)
 * @returns The endpoint path ('/ask' or '/ask_with_rag')
 */
export function getAskEndpoint(tenantId: number, useRag?: boolean): string {
  // If useRag is explicitly provided, use it
  if (useRag !== undefined) {
    return useRag ? "/ask_with_rag" : "/ask";
  }
  
  // Otherwise default to /ask (will be checked dynamically)
  return "/ask";
}

