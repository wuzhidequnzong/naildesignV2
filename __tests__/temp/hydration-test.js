// 模拟React水合错误的测试

// 情景：服务器端与客户端渲染不一致
console.log('\n=== 服务器端与客户端渲染不一致测试 ===');

// 模拟服务器端环境
const serverEnvironment = {
  NEXT_PUBLIC_AUTH_GITHUB_ENABLED: "true"  // 环境变量在服务器端可用
};

// 模拟客户端环境
const clientEnvironment = {
  // 客户端可能无法获取相同的环境变量值
  NEXT_PUBLIC_AUTH_GITHUB_ENABLED: undefined
};

// 模拟服务器端渲染函数 - 基于服务器环境
function serverRender() {
  const githubEnabled = serverEnvironment.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true";
  console.log('服务器端渲染:');
  console.log('- GitHub登录按钮可见?', githubEnabled);
  
  // 返回模拟的HTML结果
  return `<div>
    ${githubEnabled ? '<button>GitHub登录</button>' : '<!-- 无GitHub登录按钮 -->'}
  </div>`;
}

// 模拟客户端水合函数 - 基于客户端环境
function clientHydrate() {
  const githubEnabled = clientEnvironment.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true";
  console.log('客户端水合:');
  console.log('- GitHub登录按钮可见?', githubEnabled);
  
  // 返回模拟的React元素结构
  return `<div>
    ${githubEnabled ? '<button>GitHub登录</button>' : '<!-- 无GitHub登录按钮 -->'}
  </div>`;
}

// 模拟水合过程
function simulateHydration() {
  console.log('开始模拟水合过程...');
  
  // 第1步：服务器渲染
  const serverHTML = serverRender();
  console.log('\n服务器渲染的HTML:', serverHTML);
  
  // 第2步：客户端水合
  const clientElements = clientHydrate();
  console.log('\n客户端生成的元素:', clientElements);
  
  // 第3步：检查不一致
  const hydrationMatch = serverHTML === clientElements;
  
  if (!hydrationMatch) {
    console.error('\n*** 水合错误检测 ***');
    console.error('Hydration failed because the initial UI does not match what was rendered on the server.');
    console.error('- 服务器生成: GitHub登录按钮 可见');
    console.error('- 客户端生成: GitHub登录按钮 不可见');
  } else {
    console.log('\n水合成功，没有检测到不一致');
  }
  
  return { hydrationMatch };
}

// 运行测试
const hydrationTest = simulateHydration();
console.log('\n测试结果:', hydrationTest);

// 解决方案测试：使用状态保护

console.log('\n\n=== 测试修复方案：使用状态保护 ===');

function simulateFixedComponent() {
  console.log('模拟已修复的组件...');
  
  // 模拟客户端状态初始化
  let isClientSide = false;
  
  // 模拟useEffect钩子
  function simulateUseEffect(callback) {
    // 在"客户端"运行effect
    console.log('模拟客户端useEffect执行...');
    isClientSide = true;
    callback();
  }
  
  // 第1步：初始渲染 (服务器端或首次客户端)
  console.log('\n初始渲染:');
  const initialRender = !isClientSide 
    ? '加载中...' // 服务器端或首次客户端渲染时显示占位内容
    : (clientEnvironment.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === 'true' 
       ? '<button>GitHub登录</button>' 
       : '<!-- 无GitHub登录按钮 -->');
       
  console.log('渲染结果:', initialRender);
       
  // 第2步：模拟useEffect执行
  simulateUseEffect(() => {
    console.log('客户端状态已更新');
  });
  
  // 第3步：重新渲染（客户端数据可用后）
  console.log('\n客户端状态更新后重新渲染:');
  const rerender = !isClientSide
    ? '加载中...'
    : (clientEnvironment.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === 'true'
       ? '<button>GitHub登录</button>' 
       : '<!-- 无GitHub登录按钮 -->');
  
  console.log('渲染结果:', rerender);
  
  return {
    initialRender,
    finalRender: rerender,
    avoidedHydrationError: true
  };
}

const fixedTest = simulateFixedComponent();
console.log('\n修复方案测试结果:', fixedTest); 