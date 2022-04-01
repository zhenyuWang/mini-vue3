'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
    $slots: (i) => i.slots
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

const EMPTY_OBJ = {};
function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options;
    function render(vnode, container, parentComponent) {
        patch(null, vnode, container, parentComponent);
    }
    // n1 => oldVNode n2 newVNode
    function patch(n1, n2, container, parentComponent) {
        const { type, shapeFlag } = n2;
        switch (type) {
            case Text:
                processText(n1, n2, container);
                break;
            case Fragment:
                processFragment(n1, n2, container, parentComponent);
                break;
            default:
                if (shapeFlag & 1 /* ELEMENT */) {
                    // 处理 element
                    processElement(n1, n2, container, parentComponent);
                }
                else if (shapeFlag & 4 /* STATEFUL_COMPONENT */) {
                    // 处理 Component
                    processComponent(n1, n2, container, parentComponent);
                }
        }
    }
    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2, container, parentComponent);
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }
    function processElement(n1, n2, container, parentComponent) {
        if (!n1) {
            mountElement(n2, container, parentComponent);
        }
        else {
            patchElement(n1, n2);
        }
    }
    function patchElement(n1, n2, container) {
        console.log('patchElement', n1, n2);
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        const el = n2.el = n1.el;
        patchProps(el, oldProps, newProps);
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
    function mountElement(n2, container, parentComponent) {
        const el = (n2.el = hostCreateElement(n2.type));
        // handle children
        const { children, shapeFlag } = n2;
        if (shapeFlag & 8 /* TEXT_CHILDREN */) {
            processText(null, n2, el);
        }
        else if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
            mountChildren(n2, el, parentComponent);
        }
        // handle props
        const { props } = n2;
        if (props) {
            for (const key in props) {
                hostPatchProp(el, key, null, props[key]);
            }
        }
        hostInsert(el, container);
    }
    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach(child => {
            patch(null, child, container, parentComponent);
        });
    }
    function processComponent(n1, n2, container, parentComponent) {
        mountComponent(n2, container, parentComponent);
    }
    function mountComponent(initialVNode, container, parentComponent) {
        const instance = createComponentInstance(initialVNode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, container);
    }
    function setupRenderEffect(instance, container) {
        effect(() => {
            if (!instance.isMounted) {
                console.log('------init------');
                const { proxy } = instance;
                const subTree = instance.subTree = instance.render.call(proxy);
                console.log('subTree', subTree);
                patch(null, subTree, container, instance);
                instance.vnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                console.log('------update------');
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance);
            }
        });
    }
    return {
        createApp: createAppAPI(render)
    };
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
            console.log(el, key, newValue);
            el.setAttribute(key, newValue);
        }
    }
}
function insert(el, container) {
    console.log('------insert------');
    container.append(el);
}
let renderer = null;
function ensureRenderer() {
    return (renderer ||
        (renderer = createRenderer({
            createElement,
            patchProp,
            insert
        })));
}
function createApp(...args) {
    return ensureRenderer().createApp(...args);
}

exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.ref = ref;
exports.renderSlots = renderSlots;
