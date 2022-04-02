const extend = Object.assign;
const isObject = (val) => {
    return val !== null && typeof val === 'object';
};
const isArray = Array.isArray;
const isFunction = (val) => typeof val === 'function';
const hasChanged = (newValue, oldValue) => !Object.is(newValue, oldValue);
const isString = (val) => typeof val === 'string';
const onRE = /^on[^a-z]/;
const isOn = (key) => onRE.test(key);
const hasOwn = (target, key) => Object.prototype.hasOwnProperty.call(target, key);
// foo => Foo
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
// add-foo => addFoo
const camlize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : '';
    });
};
// foo => onFoo
const toHandlerKey = (str) => {
    return str ? `on${capitalize(str)}` : '';
};

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        key: props === null || props === void 0 ? void 0 : props.key,
        shapeFlag: getShapeFlag(type),
        el: null
    };
    if (isString(children)) {
        vnode.shapeFlag |= 8 /* TEXT_CHILDREN */;
    }
    else if (isArray(children)) {
        vnode.shapeFlag |= 16 /* ARRAY_CHILDREN */;
    }
    if (vnode.shapeFlag & 4 /* STATEFUL_COMPONENT */) {
        if (isObject(children)) {
            vnode.shapeFlag |= 32 /* SLOTS_CHILDREN */;
        }
    }
    return vnode;
}
function getShapeFlag(type) {
    return isString(type) ? 1 /* ELEMENT */ : 4 /* STATEFUL_COMPONENT */;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}
function isSameVNodeType(n1, n2) {
    return n1.type === n2.type && n1.key === n2.key;
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name = 'default', props) {
    const slot = slots[name];
    return createVNode(Fragment, {}, slot ? slot(props) : []);
}

// map 收集所有响应式数据 根据响应式数据的 key 收集所有的依赖
const targetsMap = new Map();
// 接收当前 effect 实例
let activeEffect;
// 是否应该进行依赖收集
let shouldTrack = false;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.dep = new Set();
        this.active = true;
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        // 不需要收集依赖
        if (!this.active) {
            return this._fn();
        }
        // 需要收集依赖
        shouldTrack = true;
        activeEffect = this;
        const result = this._fn();
        // 重置
        shouldTrack = false;
        return result;
    }
    stop() {
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
// 清除依赖
function cleanupEffect(effect) {
    const { dep } = effect;
    if (dep.size) {
        dep.forEach(dep => {
            dep.delete(effect);
        });
    }
}
function track(target, key) {
    if (!isTracking())
        return;
    let depsMap = targetsMap.get(target);
    if (depsMap === undefined) {
        depsMap = new Map();
        targetsMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (dep === undefined) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
}
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
function trackEffects(dep) {
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.dep.add(dep);
}
function trigger(target, key) {
    const depsMap = targetsMap.get(target);
    let dep = depsMap.get(key);
    dep && triggerEffects(dep);
}
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}
function effect(fn, option) {
    const _effect = new ReactiveEffect(fn, option === null || option === void 0 ? void 0 : option.scheduler);
    // 将 option 上的东西都给到 _effect
    extend(_effect, option);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReactiveGet = createGetter(false, true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (!isReadonly) {
            // 依赖收集
            track(target, key);
        }
        if (shallow)
            return res;
        // 处理 nested
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
        console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
        return true;
    }
};
extend({}, mutableHandlers, {
    get: shallowReactiveGet
});
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers);
}
function createActiveObject(raw, baseHandlers) {
    if (!isObject(raw)) {
        console.warn('target must is object');
        return raw;
    }
    return new Proxy(raw, baseHandlers);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
}
const toReactive = (value) => isObject(value) ? reactive(value) : value;

class RefImpl {
    constructor(value) {
        this.__v_isRef = true;
        this._rawValue = value;
        this._value = toReactive(value);
        this.dep = new Set();
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        // 如果新的值和之前的值不同，才进行处理
        if (hasChanged(newValue, this._rawValue)) {
            this._rawValue = newValue;
            this._value = toReactive(newValue);
            triggerEffects(this.dep);
        }
    }
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(r) {
    return !!(r === null || r === void 0 ? void 0 : r.__v_isRef) === true;
}
function unref(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unref(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return target[key].value = value;
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
    $props: (i) => i.props
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        else {
            const publicGetter = publicPropertiesMap[key];
            if (publicGetter) {
                return publicGetter(instance);
            }
        }
    }
};

function initProps(instance, rawProps = {}) {
    instance.props = rawProps;
}

const emit = (instance, eventName, ...args) => {
    const { props } = instance;
    const handlerName = toHandlerKey(camlize(eventName));
    const handler = props[handlerName];
    handler === null || handler === void 0 ? void 0 : handler(...args);
};

function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & 32 /* SLOTS_CHILDREN */) {
        normalizeObjectSlots(instance.slots, children);
    }
}
function normalizeObjectSlots(slots, children) {
    for (const key in children) {
        const value = children[key];
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return isArray(value) ? value : [value];
}

function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        parent,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        component: null,
        next: null,
        isMounted: false,
        subTree: {},
        provides: parent ? parent.provides : {},
        emit
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    // ctx
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        setCurrentInstance(instance);
        // 调用 setup 函数
        // shallowReadonly 将 props 第一层处理为 readonly
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
    else {
        finishComponentSetup(instance);
    }
}
function handleSetupResult(instance, setupResult) {
    if (isObject(setupResult)) {
        // 通过 proxyRefs 处理 setupResult count.value => count 直接获取
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (!instance.render) {
        instance.render = Component.render;
    }
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function provide(key, value) {
    var _a;
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let provides = currentInstance.provides;
        const parentProvides = (_a = currentInstance.parent) === null || _a === void 0 ? void 0 : _a.provides;
        // init
        if (parentProvides === provides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    const instance = getCurrentInstance();
    if (instance) {
        const provides = instance.parent == null
            ? instance.provides
            : instance.parent.provides;
        if (key in provides) {
            return provides[key];
        }
        else if (defaultValue) {
            return isFunction(defaultValue) ? defaultValue() : defaultValue;
        }
    }
}

function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(containerOrSelector) {
                // 根容器
                const container = normalizeContainer(containerOrSelector);
                const vnode = createVNode(rootComponent);
                render(vnode, container, null);
            }
        };
    };
}
function normalizeContainer(container) {
    if (isString(container)) {
        return document.querySelector(container);
    }
    return container;
}

function shouldUpdateComponent(prevVNode, nextVNode) {
    const { props: prevProps } = prevVNode;
    const { props: nextProps } = nextVNode;
    for (const key in nextProps) {
        if (nextProps[key] !== prevProps[key]) {
            return true;
        }
    }
    return false;
}

const EMPTY_OBJ = {};
function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, createText: hostCreateText, setText: hostSetText, setElementText: hostSetElementText, remove: hostRemove, } = options;
    function render(vnode, container, parentComponent) {
        patch(null, vnode, container, null, parentComponent);
    }
    // n1 => oldVNode n2 newVNode
    function patch(n1, n2, container, anchor = null, parentComponent) {
        if (n1 === n2) {
            return;
        }
        const { type, shapeFlag } = n2;
        switch (type) {
            case Text:
                processText(n1, n2, container, anchor);
                break;
            case Fragment:
                processFragment(n2, container, anchor, parentComponent);
                break;
            default:
                if (shapeFlag & 1 /* ELEMENT */) {
                    // 处理 element
                    processElement(n1, n2, container, anchor, parentComponent);
                }
                else if (shapeFlag & 4 /* STATEFUL_COMPONENT */) {
                    // 处理 Component
                    processComponent(n1, n2, container, anchor, parentComponent);
                }
        }
    }
    function processFragment(n2, container, anchor, parentComponent) {
        mountChildren(n2.children, container, anchor, parentComponent);
    }
    function processText(n1, n2, container, anchor) {
        if (n1 === null) {
            hostInsert((n2.el = hostCreateText(n2.children)), container, anchor);
        }
        else {
            const el = n2.el = n1.el;
            if (n2.children !== n1.children) {
                hostSetText(el, n2.children);
            }
        }
    }
    function processElement(n1, n2, container, anchor, parentComponent) {
        if (!n1) {
            mountElement(n2, container, anchor, parentComponent);
        }
        else {
            patchElement(n1, n2, parentComponent);
        }
    }
    function patchElement(n1, n2, parentComponent) {
        const el = n2.el = n1.el;
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        patchChildren(n1, n2, el, null, parentComponent);
        patchProps(el, oldProps, newProps);
    }
    function patchChildren(n1, n2, container, anchor, parentComponent) {
        const prevShapeFlag = n1.shapeFlag;
        const nextShapeFlag = n2.shapeFlag;
        const c1 = n1.children;
        const c2 = n2.children;
        // 如果新的子节点是文本类型
        if (nextShapeFlag & 8 /* TEXT_CHILDREN */) {
            console.log('new children is text');
            // 如果老的子节点是数组类型
            if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
                // 清空 oldChildren => array
                unmountChildren(n1.children);
            }
            // 如果老的是 array，c1 肯定不等于 c2
            // 否则肯定是文本类型
            // 如果老的是文本节点，c1 = c2,无需操作，否则需要替换文本节点
            if (c1 !== c2) {
                // 设置文本子节点
                hostSetElementText(container, c2);
            }
        }
        else {
            // 否则新的子节点肯定是数组类型
            console.log('new children is array');
            // 如果老的子节点是文本类型
            if (prevShapeFlag & 8 /* TEXT_CHILDREN */) {
                // 清空之前的文本内容
                hostSetElementText(container, '');
                mountChildren(c2, container, anchor, parentComponent);
            }
            else {
                // 否则老的子节点是数组类型
                patchKeyedChildren(c1, c2, container, anchor, parentComponent);
            }
        }
    }
    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            // remove
            hostRemove(el);
        }
    }
    function patchKeyedChildren(c1, c2, container, parentAnchor, parentComponent) {
        let i = 0;
        let l2 = c2.length;
        let e1 = c1.length - 1;
        let e2 = l2 - 1;
        // 1. 左侧对比
        // { a b } c
        // { a b } d e
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, null, parentComponent);
            }
            else {
                break;
            }
            i++;
        }
        // 2. 右侧对比
        // a { b c }
        // d e { b c }
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, null, parentComponent);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        // 3. 新的比老的多
        // a b
        // a b { c }
        // or
        // a b
        // { c d } a b
        // 如果老的已经处理完
        if (i > e1) {
            // 新的还没有处理完
            if (i <= e2) {
                // 挂载新的
                // 确定要挂载的位置
                const nextPos = e2 + 1;
                const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
                while (i <= e2) {
                    patch(null, c2[i], container, anchor, parentComponent);
                    i++;
                }
            }
        }
        // 4. 老的比新的多
        // a b { c d }
        // a b
        // or
        // { c d } a b
        // a b
        // 如果新的已经处理完
        if (i > e2) {
            // 老的还没处理完
            if (i <= e1) {
                // 卸载老的
                while (i <= e1) {
                    hostRemove(c1[i].el);
                    i++;
                }
            }
        }
        // 5. 对比中间部分
        // 5.1 老的里面存在，新的里面不存在，进行删除
        // a b { c d } f g
        // a b { e c } f g
        let s1 = i;
        let s2 = i;
        // 5.2 优化点：老的里面存在，新的里面不存在，并且处于已经对比完之后的位置，统一删除 => e h
        // a b { c d { e h } } f g
        // a b { d c } f g
        // 需要 patch 的数量
        const toBePatched = e2 - s2 + 1;
        // 已经 patch 的数量
        let patched = 0;
        // 是否需要移动
        let moved = false;
        // 记录老的 VNode 在新的里面的最大下标，方便知道相对位置是否发生变化
        let maxNewIndexSoFar = 0;
        const newIndexToOldIndexMap = new Array(toBePatched);
        for (let i = 0; i < toBePatched; i++) {
            newIndexToOldIndexMap[i] = 0;
        }
        // 获取 newVNode => index 的映射，方便后续通过 key 获取 newVNode
        const keyToNewIndexMap = new Map();
        for (let i = s2; i <= e2; i++) {
            const nextChild = c2[i];
            keyToNewIndexMap.set(nextChild.key, i);
        }
        // 遍历老的
        for (let i = s1; i <= e1; i++) {
            const prevChild = c1[i];
            // 如果已经 patch 的数量大于等于要 patch 的数量，后续不需要对比了，直接删除
            if (patched >= toBePatched) {
                hostRemove(prevChild.el);
                continue;
            }
            // 尝试获取 oldVNode 对应 newVNode 的 index
            let newIndex;
            if (prevChild.key !== null) {
                newIndex = keyToNewIndexMap.get(prevChild.key);
            }
            else {
                for (let j = s2; j <= e2; j++) {
                    if (isSameVNodeType(prevChild, c2[j])) {
                        newIndex = j;
                        break;
                    }
                }
            }
            // 如果好不到对应映射，进行删除
            if (newIndex === undefined) {
                hostRemove(prevChild.el);
            }
            else {
                // 如果找到对应映射，进行更新
                patch(prevChild, c2[newIndex], container, null, parentComponent);
                patched++;
                // 因为 i 可能为 0，但是这里的 0 是我们初始化的一个值，有特殊含义，所以后边用 i+1
                newIndexToOldIndexMap[newIndex - s2] = i + 1;
                // 通过判断 newIndex 是否大于已处理 newIndex 最大值标识是否发生相对位置变化
                if (newIndex >= maxNewIndexSoFar) {
                    maxNewIndexSoFar = newIndex;
                }
                else {
                    moved = true;
                }
            }
        }
        // 5.3 move & mount
        // 移动需要移动的，挂载老的里面没有的
        // a b { c d e } f g
        // a b { e c h d } f g
        const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : [];
        let j = increasingNewIndexSequence.length - 1;
        for (let i = toBePatched - 1; i >= 0; i--) {
            // 获取 newVNode index
            const nextIndex = s2 + i;
            // 获取 newVNode
            const nextChild = c2[nextIndex];
            // 获取挂载锚点
            const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor;
            if (newIndexToOldIndexMap[i] === 0) {
                // 如果 newVNode 没有对应的 oldVNode
                patch(null, nextChild, container, anchor, parentComponent);
            }
            else if (moved) {
                // 如果有 VNode 需要移动
                // j<0 说明最长递增子序列为空
                // i !== increasingNewIndexSequence[j]，说明当前 VNode 不在最长递增子序列中
                // 满足以上两种情况之一才需要移动
                if (j < 0 || i !== increasingNewIndexSequence[j]) {
                    hostInsert(nextChild.el, container, anchor);
                }
                else {
                    j--;
                }
            }
        }
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const prev = oldProps[key];
                const next = newProps[key];
                if (prev !== next && key !== 'value') {
                    hostPatchProp(el, key, prev, next);
                }
            }
            if (oldProps !== EMPTY_OBJ) {
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null);
                    }
                }
            }
        }
    }
    function mountElement(vnode, container, anchor, parentComponent) {
        const el = (vnode.el = hostCreateElement(vnode.type));
        // handle children
        const { children, shapeFlag } = vnode;
        if (shapeFlag & 8 /* TEXT_CHILDREN */) {
            hostSetElementText(el, vnode.children);
        }
        else if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
            mountChildren(children, el, anchor, parentComponent);
        }
        // handle props
        const { props } = vnode;
        if (props) {
            for (const key in props) {
                hostPatchProp(el, key, null, props[key]);
            }
        }
        hostInsert(el, container, anchor);
    }
    function mountChildren(children, container, anchor, parentComponent) {
        children.forEach(child => {
            patch(null, child, container, anchor, parentComponent);
        });
    }
    function processComponent(n1, n2, container, anchor, parentComponent) {
        if (n1 === null) {
            mountComponent(n2, container, anchor, parentComponent);
        }
        else {
            updateComponent(n1, n2);
        }
    }
    function mountComponent(initialVNode, container, anchor, parentComponent) {
        const instance = initialVNode.component = createComponentInstance(initialVNode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, initialVNode, anchor, container);
    }
    function updateComponent(n1, n2) {
        const instance = n2.component = n1.component;
        if (shouldUpdateComponent(n1, n2)) {
            instance.next = n2;
            instance.update();
        }
        else {
            n2.el = n1.el;
            instance.vnode = n2;
        }
    }
    function setupRenderEffect(instance, initialVNode, anchor, container) {
        instance.update = effect(() => {
            if (!instance.isMounted) {
                console.log('------init------');
                const { proxy } = instance;
                const subTree = instance.subTree = instance.render.call(proxy);
                patch(null, subTree, container, anchor, instance);
                initialVNode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                console.log('------update------');
                const { next, vnode } = instance;
                if (next) {
                    next.el = vnode.el;
                    updateComponentPreRender(instance, next);
                }
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, anchor, instance);
            }
        });
    }
    return {
        createApp: createAppAPI(render)
    };
}
function updateComponentPreRender(instance, nextVNode) {
    instance.vnode = nextVNode;
    instance.next = null;
    instance.props = nextVNode.props;
}
function getSequence(arr) {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                }
                else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}

function createElement(type) {
    console.log('------createElement------');
    return document.createElement(type);
}
function patchProp(el, key, oldValue, newValue) {
    console.log('------patchProp------');
    if (key === 'innerHTML' || key === 'textContent') {
        el[key] = newValue == null ? '' : newValue;
    }
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, newValue);
    }
    else {
        if (newValue === undefined || newValue == null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, newValue);
        }
    }
}
function insert(child, parent, anchor) {
    console.log('------insert------');
    parent.insertBefore(child, anchor || null);
}
function createText(text) {
    return document.createTextNode(text);
}
function setText(node, text) {
    node.nodeValue = text;
}
function setElementText(el, text) {
    el.textContent = text;
}
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
let renderer = null;
function ensureRenderer() {
    return (renderer ||
        (renderer = createRenderer({
            createElement,
            patchProp,
            insert,
            createText,
            setText,
            setElementText,
            remove,
        })));
}
function createApp(...args) {
    return ensureRenderer().createApp(...args);
}

export { createApp, createRenderer, createTextVNode, getCurrentInstance, h, inject, provide, ref, renderSlots };
