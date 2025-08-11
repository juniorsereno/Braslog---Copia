/**
 * @jest-environment jsdom
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { useErrorHandler, useMutationHandlers } from '../use-error-handler';

// Mock sonner toast API
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

describe('useErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show custom error message when provided', () => {
    const { handleError } = useErrorHandler();
    const { toast } = require('sonner');
    handleError(new Error('x'), 'Custom message');
    expect(toast.error).toHaveBeenCalledWith('Custom message');
  });

  it('should map known error messages', () => {
    const { handleError } = useErrorHandler();
    const { toast } = require('sonner');
    handleError({ message: 'UNAUTHORIZED' });
    expect(toast.error).toHaveBeenCalled();
  });

  it('should show generic error when unknown', () => {
    const { handleError } = useErrorHandler();
    const { toast } = require('sonner');
    handleError({});
    expect(toast.error).toHaveBeenCalled();
  });
});

describe('useMutationHandlers', () => {
  it('should call success toast on onSuccess', () => {
    const { createMutationHandlers } = useMutationHandlers();
    const { toast } = require('sonner');
    const handlers = createMutationHandlers('OK', 'ERR');
    handlers.onSuccess();
    expect(toast.success).toHaveBeenCalledWith('OK');
  });

  it('should call error toast on onError', () => {
    const { createMutationHandlers } = useMutationHandlers();
    const { toast } = require('sonner');
    const handlers = createMutationHandlers('OK', 'ERR');
    handlers.onError(new Error('boom'));
    expect(toast.error).toHaveBeenCalledWith('ERR');
  });
});


