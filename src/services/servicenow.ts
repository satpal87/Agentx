import { supabase } from "@/lib/supabase";
import { ServiceNowCredential } from "@/lib/servicenow";

/**
 * ServiceNow API Integration Service
 *
 * This service handles all interactions with the ServiceNow API, including:
 * - Authentication
 * - Querying records
 * - Creating/updating records
 * - Processing API responses
 */

interface ServiceNowAuthResponse {
  token_type: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}

interface ServiceNowRecord {
  [key: string]: any;
}

interface ServiceNowQueryOptions {
  table: string;
  query?: string;
  limit?: number;
  offset?: number;
  fields?: string[];
  orderBy?: string;
  orderDirection?: "asc" | "desc";
}

interface ServiceNowError {
  status: number;
  message: string;
  detail?: string;
}

export class ServiceNowAPI {
  private baseUrl: string;
  private username: string;
  private password: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private credentialId: string;

  constructor(credential: ServiceNowCredential) {
    this.baseUrl = credential.instance_url.endsWith("/")
      ? credential.instance_url
      : `${credential.instance_url}/`;
    this.username = credential.username;
    this.password = credential.password;
    this.credentialId = credential.id;
  }

  /**
   * Authenticate with ServiceNow API
   * Uses Basic Auth as the primary authentication method
   */
  private async authenticate(): Promise<void> {
    try {
      // Check if we already have a valid token
      if (this.accessToken && Date.now() < this.tokenExpiry) {
        console.log("Using existing ServiceNow authentication token");
        return;
      }

      console.log(`Authenticating with ServiceNow at ${this.baseUrl}`);
      console.log(
        `Using credentials - Username: ${this.username}, Password: ${this.password ? "[REDACTED]" : "[EMPTY]"}`,
      );

      // Validate credentials
      if (!this.username || !this.password) {
        throw new Error(
          "ServiceNow username or password is empty. Please check your credentials.",
        );
      }

      // Use basic auth for all requests as per user request
      console.log("Using basic auth for ServiceNow API requests");

      // Create the base64 encoded credentials
      const encodedCredentials = btoa(`${this.username}:${this.password}`);
      console.log("Base64 encoded credentials created successfully");

      this.accessToken = encodedCredentials;
      this.tokenExpiry = Date.now() + 3600000; // 1 hour

      // Test the basic auth with a simple request
      console.log("Testing authentication with a simple request...");
      const testUrl = `${this.baseUrl}api/now/v2/table/sys_user?sysparm_limit=1`;
      console.log(`Test request URL: ${testUrl}`);

      const testResponse = await fetch(testUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Basic ${this.accessToken}`,
        },
      });

      console.log(`Test response status: ${testResponse.status}`);

      if (!testResponse.ok) {
        const errorText = await testResponse.text();
        console.error("Authentication test failed:", {
          status: testResponse.status,
          statusText: testResponse.statusText,
          responseText: errorText,
        });
        throw new Error(
          `Basic auth test failed: ${testResponse.status} ${errorText}`,
        );
      }

      console.log(
        "Successfully authenticated with ServiceNow using Basic Auth",
      );
    } catch (error) {
      console.error("ServiceNow authentication error:", error);
      throw new Error(
        `Failed to authenticate with ServiceNow: ${error.message}`,
      );
    }
  }

  /**
   * Make an authenticated request to the ServiceNow API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    await this.authenticate();

    const url = endpoint.startsWith("http")
      ? endpoint
      : `${this.baseUrl}api/now/v2/${endpoint}`;

    // We're always using Basic auth now
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${this.accessToken}`,
      ...options.headers,
    };

    console.log(`Making ${options.method || "GET"} request to ${url}`);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          const error: ServiceNowError = {
            status: response.status,
            message: errorData.error?.message || "Unknown error",
            detail: errorData.error?.detail || "",
          };
          errorMessage = error.message;
          if (error.detail) errorMessage += `: ${error.detail}`;
          throw { ...error, message: errorMessage };
        } catch (jsonError) {
          // If we can't parse the error as JSON, just use the status text
          const textError = await response.text();
          throw {
            status: response.status,
            message: textError || response.statusText || errorMessage,
          };
        }
      }

      return (await response.json()) as T;
    } catch (error) {
      console.error("ServiceNow API request error:", error);
      if (error.status === 401) {
        // Token might be expired, reset it and try again
        this.accessToken = null;
        this.tokenExpiry = 0;
        return this.request(endpoint, options);
      }
      throw error;
    }
  }

  /**
   * Query ServiceNow records
   */
  async queryRecords(
    options: ServiceNowQueryOptions,
  ): Promise<ServiceNowRecord[]> {
    const {
      table,
      query,
      limit = 10,
      offset = 0,
      fields = [],
      orderBy,
      orderDirection = "desc",
    } = options;

    let endpoint = `table/${table}`;
    const queryParams = new URLSearchParams();

    if (query) {
      queryParams.append("sysparm_query", query);
    }

    queryParams.append("sysparm_limit", limit.toString());
    queryParams.append("sysparm_offset", offset.toString());

    if (fields.length > 0) {
      queryParams.append("sysparm_fields", fields.join(","));
    }

    if (orderBy) {
      queryParams.append("sysparm_order_by", orderBy);
      queryParams.append("sysparm_order", orderDirection);
    }

    const queryString = queryParams.toString();
    if (queryString) {
      endpoint += `?${queryString}`;
    }

    try {
      const response = await this.request<{ result: ServiceNowRecord[] }>(
        endpoint,
      );
      return response.result;
    } catch (error) {
      console.error(`Error querying ${table} records:`, error);
      throw new Error(
        `Failed to query ${table} records: ${error.message || "Unknown error"}`,
      );
    }
  }

  /**
   * Get a single record by sys_id
   */
  async getRecord(
    table: string,
    sysId: string,
    fields: string[] = [],
  ): Promise<ServiceNowRecord> {
    let endpoint = `table/${table}/${sysId}`;

    if (fields.length > 0) {
      const queryParams = new URLSearchParams();
      queryParams.append("sysparm_fields", fields.join(","));
      endpoint += `?${queryParams.toString()}`;
    }

    try {
      const response = await this.request<{ result: ServiceNowRecord }>(
        endpoint,
      );
      return response.result;
    } catch (error) {
      console.error(`Error getting ${table} record:`, error);
      throw new Error(
        `Failed to get ${table} record: ${error.message || "Unknown error"}`,
      );
    }
  }

  /**
   * Create a new record
   */
  async createRecord(
    table: string,
    data: ServiceNowRecord,
  ): Promise<ServiceNowRecord> {
    const endpoint = `table/${table}`;

    try {
      const response = await this.request<{ result: ServiceNowRecord }>(
        endpoint,
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      );
      return response.result;
    } catch (error) {
      console.error(`Error creating ${table} record:`, error);
      throw new Error(
        `Failed to create ${table} record: ${error.message || "Unknown error"}`,
      );
    }
  }

  /**
   * Update an existing record
   */
  async updateRecord(
    table: string,
    sysId: string,
    data: ServiceNowRecord,
  ): Promise<ServiceNowRecord> {
    const endpoint = `table/${table}/${sysId}`;

    try {
      const response = await this.request<{ result: ServiceNowRecord }>(
        endpoint,
        {
          method: "PATCH",
          body: JSON.stringify(data),
        },
      );
      return response.result;
    } catch (error) {
      console.error(`Error updating ${table} record:`, error);
      throw new Error(
        `Failed to update ${table} record: ${error.message || "Unknown error"}`,
      );
    }
  }

  /**
   * Delete a record
   */
  async deleteRecord(table: string, sysId: string): Promise<void> {
    const endpoint = `table/${table}/${sysId}`;

    try {
      await this.request(endpoint, {
        method: "DELETE",
      });
    } catch (error) {
      console.error(`Error deleting ${table} record:`, error);
      throw new Error(
        `Failed to delete ${table} record: ${error.message || "Unknown error"}`,
      );
    }
  }

  /**
   * Execute a ServiceNow script
   */
  async executeScript(script: string): Promise<any> {
    const endpoint = "v1/script/execute";

    try {
      const response = await this.request<{ result: any }>(endpoint, {
        method: "POST",
        body: JSON.stringify({
          script: script,
        }),
      });
      return response.result;
    } catch (error) {
      console.error("Error executing script:", error);
      throw new Error(
        `Failed to execute script: ${error.message || "Unknown error"}`,
      );
    }
  }

  /**
   * Test the connection to ServiceNow
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.authenticate();
      // Try to get a simple record to verify connection works
      await this.request<{ result: any }>("table/sys_user?sysparm_limit=1");
      return true;
    } catch (error) {
      console.error("ServiceNow connection test failed:", error);
      return false;
    }
  }
}

/**
 * Get a ServiceNow API client for a specific credential
 */
export async function getServiceNowClient(
  credentialId: string,
  userId: string,
): Promise<ServiceNowAPI | null> {
  try {
    // Get the credential from the database
    const { data, error } = await supabase
      .from("servicenow_credentials")
      .select("*")
      .eq("id", credentialId)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      console.error("Error getting ServiceNow credential:", error);
      return null;
    }

    return new ServiceNowAPI(data);
  } catch (error) {
    console.error("Error creating ServiceNow client:", error);
    return null;
  }
}

/**
 * Get all ServiceNow API clients for a user
 */
export async function getAllServiceNowClients(
  userId: string,
): Promise<Record<string, ServiceNowAPI>> {
  try {
    // Get all credentials for the user
    const { data, error } = await supabase
      .from("servicenow_credentials")
      .select("*")
      .eq("user_id", userId);

    if (error || !data) {
      console.error("Error getting ServiceNow credentials:", error);
      return {};
    }

    // Create a client for each credential
    const clients: Record<string, ServiceNowAPI> = {};
    for (const credential of data) {
      clients[credential.id] = new ServiceNowAPI(credential);
    }

    return clients;
  } catch (error) {
    console.error("Error creating ServiceNow clients:", error);
    return {};
  }
}
