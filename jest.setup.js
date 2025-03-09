// 添加Jest DOM扩展
import '@testing-library/jest-dom';

// 模拟window.alert
window.alert = jest.fn();

// 模拟NextJS路由
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
    query: {},
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  redirect: jest.fn(),
}));

// 模拟next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key) => key,
}));

// 模拟next-intl/server
jest.mock('next-intl/server', () => ({
  getTranslations: jest.fn().mockResolvedValue((key) => key),
}));

// 重置所有模拟
beforeEach(() => {
  jest.clearAllMocks();
}); 