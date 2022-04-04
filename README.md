# mini-vue3

从零到一实现 mini-vue3，加油鸭！💪🏻

第一阶段：完成 mini-vue3 0.0.1，实现了 vue3 三大核心模块

#### reactivity

- [x] reactive 的实现
- [x] ref 的实现
- [x] readonly 的实现
- [x] computed 的实现
- [x] track 依赖收集
- [x] trigger 触发依赖
- [x] 支持 isReactive
- [x] 支持嵌套 reactive
- [x] 支持 toRaw
- [x] 支持 effect.scheduler
- [x] 支持 effect.stop
- [x] 支持 isReadonly
- [x] 支持 isProxy
- [x] 支持 shallowReadonly
- [x] 支持 proxyRefs

#### runtime-core

- [x] 支持组件类型
- [x] 支持 element 类型
- [x] 初始化 props
- [x] setup 可获取 props 和 context
- [x] 支持 component emit
- [x] 支持 proxy
- [x] 可以在 render 函数中获取 setup 返回的对象
- [x] nextTick 的实现
- [x] 支持 getCurrentInstance
- [x] 支持 provide/inject
- [x] 支持最基础的 slots
- [x] 支持 Text 类型节点
- [x] 支持 $el api

### runtime-dom
- [x] 支持 custom renderer

### compiler-core
- [x] 解析插值
- [x] 解析 element
- [x] 解析 text


### build

```shell
pnpm build
```

### example

通过 server 的方式打开 example/\* 下的 index.html 即可

>  推荐使用 [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)


## @todo
1. parse props
2. watch
3. other ...