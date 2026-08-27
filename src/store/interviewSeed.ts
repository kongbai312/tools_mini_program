export type InterviewQuestionType = 'choice' | 'qa'

export interface InterviewQuestionSeed {
  id: string
  bankId: string
  sort: number
  title: string
  type: InterviewQuestionType
  options: string[]
  answerText: string
  answerIndex?: number
  analysis: string
  tags: string[]
  imageUrl?: string
}

export interface InterviewBankSeed {
  id: string
  name: string
  description: string
  color: string
  questionCount: number
}

export const interviewBankSeed: InterviewBankSeed[] = [
  {
    id: 'frontend-core',
    name: '前端核心',
    description: 'JavaScript、Vue、CSS、浏览器与网络基础',
    color: '#1D4ED8',
    questionCount: 6,
  },
  {
    id: 'frontend-vue',
    name: 'Vue 专项',
    description: 'Composition API、响应式、组件通信与工程化',
    color: '#7C3AED',
    questionCount: 4,
  },
]

export const interviewQuestionSeed: InterviewQuestionSeed[] = [
  {
    id: 'frontend-core-001',
    bankId: 'frontend-core',
    sort: 1,
    title: 'JavaScript 中闭包最核心的特征是什么？',
    type: 'choice',
    options: [
      '函数可以访问并记住外层作用域变量',
      '函数必须写在另一个函数内部',
      '函数执行完后会立即销毁所有变量',
      '只有箭头函数才有闭包',
    ],
    answerIndex: 0,
    answerText: '函数可以访问并记住外层作用域变量',
    analysis: '闭包的关键不是语法位置，而是函数能在外部作用域结束后仍访问那个作用域里的变量，常用于缓存、私有状态和回调。',
    tags: ['JavaScript', '作用域', '闭包'],
  },
  {
    id: 'frontend-core-002',
    bankId: 'frontend-core',
    sort: 2,
    title: 'Flex 布局中让子项水平垂直居中，常见组合是什么？',
    type: 'choice',
    options: [
      'justify-content: center; align-items: center;',
      'text-align: center; vertical-align: middle;',
      'position: absolute; top: 50%; left: 50%;',
      'display: block; margin: 0 auto;',
    ],
    answerIndex: 0,
    answerText: 'justify-content: center; align-items: center;',
    analysis: '在 flex 容器里，主轴居中用 justify-content，交叉轴居中用 align-items，二者组合即可实现双向居中。',
    tags: ['CSS', 'Flexbox', '布局'],
  },
  {
    id: 'frontend-core-003',
    bankId: 'frontend-core',
    sort: 3,
    title: 'HTTP 缓存中，协商缓存通常依赖哪组响应头？',
    type: 'choice',
    options: ['Cache-Control 和 Expires', 'Content-Type 和 Content-Length', 'ETag 和 Last-Modified', 'Origin 和 Referer'],
    answerIndex: 2,
    answerText: 'ETag 和 Last-Modified',
    analysis: '协商缓存通过 ETag / If-None-Match 和 Last-Modified / If-Modified-Since 这类机制判断资源是否变化。',
    tags: ['网络', 'HTTP', '缓存'],
  },
  {
    id: 'frontend-core-004',
    bankId: 'frontend-core',
    sort: 4,
    title: '判断一个数组里是否有重复元素，常见思路有哪些？',
    type: 'qa',
    options: [],
    answerText: '可以先排序再线性扫描，也可以直接用 Set 一次遍历。',
    analysis: '排序后相邻重复最容易发现；如果更追求时间复杂度，也可以用 Set 一次遍历完成。',
    tags: ['算法', '数组', 'Set'],
  },
  {
    id: 'frontend-core-005',
    bankId: 'frontend-core',
    sort: 5,
    title: '事件循环中，宏任务和微任务的执行顺序通常是怎样的？',
    type: 'qa',
    options: [],
    answerText: '每轮宏任务结束后，会先清空当前微任务队列。',
    analysis: '每个宏任务执行完后，当前轮次会先清空微任务队列，再进入下一轮宏任务，这也是 Promise 回调常常早于 setTimeout 的原因。',
    tags: ['浏览器', '事件循环', 'Promise'],
  },
  {
    id: 'frontend-vue-001',
    bankId: 'frontend-vue',
    sort: 1,
    title: 'Vue 3 中 ref 和 reactive 的主要区别是什么？',
    type: 'choice',
    options: [
      'ref 只能包裹对象，reactive 只能包裹基本类型',
      'ref 适合基本类型和单值，reactive 适合对象/数组的整体响应式',
      '两者完全一样，只是写法不同',
      'reactive 只能在模板里使用，ref 只能在脚本里使用',
    ],
    answerIndex: 1,
    answerText: 'ref 适合基本类型和单值，reactive 适合对象/数组的整体响应式',
    analysis: 'ref 返回带 `.value` 的响应式引用，适合基本类型或单个值；reactive 直接返回代理对象，适合对象和数组。',
    tags: ['Vue', '响应式', 'Composition API'],
  },
  {
    id: 'frontend-vue-002',
    bankId: 'frontend-vue',
    sort: 2,
    title: 'Vue 组件通信里，父传子最常见的方式是什么？',
    type: 'choice',
    options: ['emit', 'props', 'provide/inject', 'pinia'],
    answerIndex: 1,
    answerText: 'props',
    analysis: '父组件通过 props 将数据传给子组件，这是最基础也最常用的单向数据流方式。',
    tags: ['Vue', '组件通信'],
  },
  {
    id: 'frontend-vue-003',
    bankId: 'frontend-vue',
    sort: 3,
    title: '什么场景更适合使用 computed 而不是普通方法？',
    type: 'qa',
    options: [],
    answerText: '当值依赖响应式数据且需要缓存时，用 computed 更合适。',
    analysis: 'computed 会基于依赖缓存结果，只有依赖变化时才重新计算；普通方法每次渲染都会执行。',
    tags: ['Vue', 'computed'],
  },
  {
    id: 'frontend-vue-004',
    bankId: 'frontend-vue',
    sort: 4,
    title: '请简述 Vue3 响应式系统里 proxy 的作用。',
    type: 'qa',
    options: [],
    answerText: 'Proxy 用来拦截对象访问和修改，从而实现依赖收集和更新触发。',
    analysis: 'Vue 3 使用 Proxy 代理对象，通过 get/set 拦截实现依赖追踪和更新派发。',
    tags: ['Vue', 'Proxy', '响应式'],
  },
]
