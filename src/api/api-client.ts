import type { APIRequestContext, APIResponse } from '@playwright/test';

export interface RequestOptions {
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
  data?: unknown;
  /** Throw on a non-2xx response. Defaults to `true`. */
  failOnStatusCode?: boolean;
}

/**
 * Thin wrapper over Playwright's `APIRequestContext`.
 *
 * Centralises base headers and error handling so endpoint modules under
 * `src/api/endpoints/` stay declarative.
 */
export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async get(url: string, options: RequestOptions = {}): Promise<APIResponse> {
    return this.send('GET', url, options);
  }

  async post(url: string, options: RequestOptions = {}): Promise<APIResponse> {
    return this.send('POST', url, options);
  }

  async put(url: string, options: RequestOptions = {}): Promise<APIResponse> {
    return this.send('PUT', url, options);
  }

  async patch(url: string, options: RequestOptions = {}): Promise<APIResponse> {
    return this.send('PATCH', url, options);
  }

  async delete(url: string, options: RequestOptions = {}): Promise<APIResponse> {
    return this.send('DELETE', url, options);
  }

  /** Convenience wrapper that parses a JSON body into a typed value. */
  async getJson<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const response = await this.get(url, options);
    return (await response.json()) as T;
  }

  private async send(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    { params, headers, data, failOnStatusCode = true }: RequestOptions,
  ): Promise<APIResponse> {
    const response = await this.request.fetch(url, {
      method,
      params,
      headers: { Accept: 'application/json', ...headers },
      ...(data === undefined ? {} : { data }),
    });

    if (failOnStatusCode && !response.ok()) {
      const body = await response.text().catch(() => '<unreadable body>');
      throw new Error(
        `${method} ${url} failed: ${response.status()} ${response.statusText()}\n${body.slice(0, 500)}`,
      );
    }

    return response;
  }
}
