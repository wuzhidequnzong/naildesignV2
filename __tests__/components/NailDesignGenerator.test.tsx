import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NailDesignGenerator from '@/components/blocks/NailDesignGenerator';
import { useSession } from 'next-auth/react';

// 模拟next-auth的useSession
jest.mock('next-auth/react', () => ({
  useSession: jest.fn()
}));

// 模拟fetch API
global.fetch = jest.fn();

describe('NailDesignGenerator Component', () => {
  
  // 设置测试环境
  beforeEach(() => {
    // 重置所有模拟
    jest.clearAllMocks();
    
    // 默认模拟未登录状态
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated'
    });
    
    // 模拟fetch返回成功
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, image_url: 'https://example.com/test.png' })
    });
  });

  test('渲染输入框和按钮', () => {
    render(<NailDesignGenerator />);
    
    // 验证组件基本元素存在
    expect(screen.getByPlaceholderText('美甲设计描述')).toBeInTheDocument();
    expect(screen.getByText('生成')).toBeInTheDocument();
  });

  test('未登录用户应该看到按钮被禁用', () => {
    render(<NailDesignGenerator />);
    
    // 输入足够长度的提示词
    const input = screen.getByPlaceholderText('美甲设计描述');
    fireEvent.change(input, { target: { value: '足够长的提示词测试' } });
    
    // 检查按钮状态和提示消息
    const button = screen.getByText('生成');
    expect(button).toBeDisabled();
    expect(screen.getByText('请先登录账号后再生成美甲设计')).toBeInTheDocument();
  });

  test('输入过短的提示词应该禁用按钮', () => {
    // 模拟已登录状态
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: 'test-user-id' } },
      status: 'authenticated'
    });
    
    render(<NailDesignGenerator />);
    
    // 输入过短的提示词
    const input = screen.getByPlaceholderText('美甲设计描述');
    fireEvent.change(input, { target: { value: '短' } });
    
    // 检查按钮状态
    const button = screen.getByText('生成');
    expect(button).toBeDisabled();
  });

  test('用户输入有效提示词后应该能点击按钮', async () => {
    // 模拟已登录状态
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: 'test-user-id' } },
      status: 'authenticated'
    });
    
    render(<NailDesignGenerator />);
    
    // 输入有效提示词
    const input = screen.getByPlaceholderText('美甲设计描述');
    fireEvent.change(input, { target: { value: '足够长的提示词测试' } });
    
    // 检查按钮状态
    const button = screen.getByText('生成');
    expect(button).not.toBeDisabled();
  });

  test('点击生成按钮应该调用API', async () => {
    // 模拟已登录状态
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: 'test-user-id' } },
      status: 'authenticated'
    });
    
    // 模拟window.location.reload
    const mockReload = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true
    });
    
    // 模拟setTimeout
    jest.useFakeTimers();
    
    render(<NailDesignGenerator />);
    
    // 输入有效提示词
    const input = screen.getByPlaceholderText('美甲设计描述');
    fireEvent.change(input, { target: { value: '足够长的提示词测试' } });
    
    // 点击生成按钮
    const button = screen.getByText('生成');
    fireEvent.click(button);
    
    // 验证fetch被调用
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/generate/nail-design',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ prompt: '足够长的提示词测试' })
        })
      );
    });
    
    // 前进计时器模拟等待
    jest.advanceTimersByTime(1500);
    
    // 验证页面重载被调用
    expect(mockReload).toHaveBeenCalled();
  });

  test('API返回错误时应显示错误消息', async () => {
    // 模拟已登录状态
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: 'test-user-id' } },
      status: 'authenticated'
    });
    
    // 模拟API错误
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: '生成失败，请稍后重试' })
    });
    
    render(<NailDesignGenerator />);
    
    // 输入有效提示词
    const input = screen.getByPlaceholderText('美甲设计描述');
    fireEvent.change(input, { target: { value: '足够长的提示词测试' } });
    
    // 点击生成按钮
    const button = screen.getByText('生成');
    fireEvent.click(button);
    
    // 验证错误消息显示
    await waitFor(() => {
      expect(screen.getByText('生成失败，请稍后重试')).toBeInTheDocument();
    });
  });

  test('已达使用上限应禁用按钮', () => {
    // 模拟已登录状态但已达使用上限
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: 'test-user-id' } },
      status: 'authenticated'
    });
    
    // 渲染组件并设置达到使用限制
    const { rerender } = render(<NailDesignGenerator />);
    
    // 手动设置组件状态(这在实际测试中需要特殊处理)
    // 这里我们重新渲染一个有预设状态的组件来模拟
    rerender(
      <NailDesignGenerator initialUsageCount={5} initialUsageLimit={5} />
    );
    
    // 输入有效提示词
    const input = screen.getByPlaceholderText('美甲设计描述');
    fireEvent.change(input, { target: { value: '足够长的提示词测试' } });
    
    // 检查按钮状态
    const button = screen.getByText('生成');
    expect(button).toBeDisabled();
    expect(screen.getByText('每位用户每天最多生成5次，请明天再来')).toBeInTheDocument();
  });
}); 