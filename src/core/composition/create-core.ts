import { FetchApiClient } from '../adapters/fetch-api-client';
import { MockApiClient, type MockHandler } from '../adapters/mock-api-client';
import { BrowserTokenVault } from '../adapters/browser-token-vault';
import { coreConfig } from '../config/env';
import type { ApiClient } from '../ports/api-client';
import type { TokenVault } from '../ports/token-vault';

export interface SantclothesCore {
  api: ApiClient;
  tokens: TokenVault;
  connection: 'backend' | 'mock';
}

export function createSantclothesCore(mockHandler: MockHandler): SantclothesCore {
  const tokens = new BrowserTokenVault();
  return {
    tokens,
    connection: coreConfig.useBackend ? 'backend' : 'mock',
    api: coreConfig.useBackend
      ? new FetchApiClient(coreConfig.apiBaseUrl, tokens)
      : new MockApiClient(mockHandler),
  };
}
