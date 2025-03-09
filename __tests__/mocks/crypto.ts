/**
 * 模拟crypto模块
 * 用于测试环境中提供加密功能
 */
export function mockCrypto() {
  const mockRandomUUID = jest.fn().mockReturnValue('test-uuid-1234567890');
  
  return {
    ...jest.requireActual('crypto'),
    randomUUID: mockRandomUUID,
    randomBytes: (size: number) => {
      const buf = Buffer.alloc(size);
      for (let i = 0; i < size; i++) {
        buf[i] = Math.floor(Math.random() * 256);
      }
      return buf;
    },
    createHash: (algorithm: string) => {
      return {
        update: (data: any) => {
          return {
            digest: (encoding: string) => {
              // 对于测试目的，返回一个确定性的哈希值
              return 'mock-hash-value-for-testing-' + 
                (typeof data === 'string' ? data.substring(0, 8) : 'buffer');
            }
          };
        }
      };
    }
  };
} 