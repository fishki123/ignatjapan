
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value' || descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.22.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    function startsWith(string, search) {
      return string.substr(0, search.length) === search;
    }

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    function addQuery(pathname, query) {
      return pathname + (query ? `?${query}` : "");
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
      // /foo/bar, /baz/qux => /foo/bar
      if (startsWith(to, "/")) {
        return to;
      }

      const [toPathname, toQuery] = to.split("?");
      const [basePathname] = base.split("?");
      const toSegments = segmentize(toPathname);
      const baseSegments = segmentize(basePathname);

      // ?a=b, /users?b=c => /users?a=b
      if (toSegments[0] === "") {
        return addQuery(basePathname, toQuery);
      }

      // profile, /users/789 => /users/789/profile
      if (!startsWith(toSegments[0], ".")) {
        const pathname = baseSegments.concat(toSegments).join("/");

        return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
      }

      // ./       , /users/123 => /users/123
      // ../      , /users/123 => /users
      // ../..    , /users/123 => /
      // ../../one, /a/b/c/d   => /a/b/one
      // .././one , /a/b/c/d   => /a/b/c/one
      const allSegments = baseSegments.concat(toSegments);
      const segments = [];

      allSegments.forEach(segment => {
        if (segment === "..") {
          segments.pop();
        } else if (segment !== ".") {
          segments.push(segment);
        }
      });

      return addQuery("/" + segments.join("/"), toQuery);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    /* node_modules\svelte-routing\src\Router.svelte generated by Svelte v3.22.2 */

    function create_fragment(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32768) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[15], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[15], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let $routes;
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, "routes");
    	component_subscribe($$self, routes, value => $$invalidate(8, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(7, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(6, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ["basepath", "url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Router", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("$$scope" in $$props) $$invalidate(15, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		derived,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		pick,
    		match,
    		stripSlashes,
    		combinePaths,
    		basepath,
    		url,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$base,
    		$location,
    		$routes
    	});

    	$$self.$inject_state = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("hasActiveRoute" in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 64) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			 {
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 384) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			 {
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [
    		routes,
    		location,
    		base,
    		basepath,
    		url,
    		hasActiveRoute,
    		$base,
    		$location,
    		$routes,
    		locationContext,
    		routerContext,
    		activeRoute,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$$scope,
    		$$slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-routing\src\Route.svelte generated by Svelte v3.22.2 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*routeParams*/ 2,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[1],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, routeParams, $location*/ 4114) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[12], get_default_slot_context), get_slot_changes(default_slot_template, /*$$scope*/ ctx[12], dirty, get_default_slot_changes));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1(ctx) {
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[4] },
    		/*routeParams*/ ctx[1],
    		/*routeProps*/ ctx[2]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 22)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
    					dirty & /*routeParams*/ 2 && get_spread_object(/*routeParams*/ ctx[1]),
    					dirty & /*routeProps*/ 4 && get_spread_object(/*routeProps*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[3] !== null && /*$activeRoute*/ ctx[3].route === /*route*/ ctx[7] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[3] !== null && /*$activeRoute*/ ctx[3].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let $location;
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, "activeRoute");
    	component_subscribe($$self, activeRoute, value => $$invalidate(3, $activeRoute = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway.
    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Route", $$slots, ['default']);

    	$$self.$set = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("path" in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(12, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		LOCATION,
    		path,
    		component,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		location,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), $$new_props));
    		if ("path" in $$props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$props) $$invalidate(0, component = $$new_props.component);
    		if ("routeParams" in $$props) $$invalidate(1, routeParams = $$new_props.routeParams);
    		if ("routeProps" in $$props) $$invalidate(2, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute*/ 8) {
    			 if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(1, routeParams = $activeRoute.params);
    			}
    		}

    		 {
    			const { path, component, ...rest } = $$props;
    			$$invalidate(2, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		registerRoute,
    		unregisterRoute,
    		$$props,
    		$$scope,
    		$$slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-routing\src\Link.svelte generated by Svelte v3.22.2 */
    const file = "node_modules\\svelte-routing\\src\\Link.svelte";

    function create_fragment$2(ctx) {
    	let a;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{ "aria-current": /*ariaCurrent*/ ctx[2] },
    		/*props*/ ctx[1]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			add_location(a, file, 40, 0, 1249);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(a, "click", /*onClick*/ ctx[5], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32768) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[15], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[15], dirty, null));
    				}
    			}

    			set_attributes(a, get_spread_update(a_levels, [
    				dirty & /*href*/ 1 && { href: /*href*/ ctx[0] },
    				dirty & /*ariaCurrent*/ 4 && { "aria-current": /*ariaCurrent*/ ctx[2] },
    				dirty & /*props*/ 2 && /*props*/ ctx[1]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let { to = "#" } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = () => ({}) } = $$props;
    	const { base } = getContext(ROUTER);
    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(12, $base = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(13, $location = value));
    	const dispatch = createEventDispatcher();
    	let href, isPartiallyCurrent, isCurrent, props;

    	function onClick(event) {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = $location.pathname === href || replace;

    			navigate(href, { state, replace: shouldReplace });
    		}
    	}

    	const writable_props = ["to", "replace", "state", "getProps"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Link", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("to" in $$props) $$invalidate(6, to = $$props.to);
    		if ("replace" in $$props) $$invalidate(7, replace = $$props.replace);
    		if ("state" in $$props) $$invalidate(8, state = $$props.state);
    		if ("getProps" in $$props) $$invalidate(9, getProps = $$props.getProps);
    		if ("$$scope" in $$props) $$invalidate(15, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		createEventDispatcher,
    		ROUTER,
    		LOCATION,
    		navigate,
    		startsWith,
    		resolve,
    		shouldNavigate,
    		to,
    		replace,
    		state,
    		getProps,
    		base,
    		location,
    		dispatch,
    		href,
    		isPartiallyCurrent,
    		isCurrent,
    		props,
    		onClick,
    		$base,
    		$location,
    		ariaCurrent
    	});

    	$$self.$inject_state = $$props => {
    		if ("to" in $$props) $$invalidate(6, to = $$props.to);
    		if ("replace" in $$props) $$invalidate(7, replace = $$props.replace);
    		if ("state" in $$props) $$invalidate(8, state = $$props.state);
    		if ("getProps" in $$props) $$invalidate(9, getProps = $$props.getProps);
    		if ("href" in $$props) $$invalidate(0, href = $$props.href);
    		if ("isPartiallyCurrent" in $$props) $$invalidate(10, isPartiallyCurrent = $$props.isPartiallyCurrent);
    		if ("isCurrent" in $$props) $$invalidate(11, isCurrent = $$props.isCurrent);
    		if ("props" in $$props) $$invalidate(1, props = $$props.props);
    		if ("ariaCurrent" in $$props) $$invalidate(2, ariaCurrent = $$props.ariaCurrent);
    	};

    	let ariaCurrent;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $base*/ 4160) {
    			 $$invalidate(0, href = to === "/" ? $base.uri : resolve(to, $base.uri));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 8193) {
    			 $$invalidate(10, isPartiallyCurrent = startsWith($location.pathname, href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 8193) {
    			 $$invalidate(11, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 2048) {
    			 $$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
    		}

    		if ($$self.$$.dirty & /*getProps, $location, href, isPartiallyCurrent, isCurrent*/ 11777) {
    			 $$invalidate(1, props = getProps({
    				location: $location,
    				href,
    				isPartiallyCurrent,
    				isCurrent
    			}));
    		}
    	};

    	return [
    		href,
    		props,
    		ariaCurrent,
    		base,
    		location,
    		onClick,
    		to,
    		replace,
    		state,
    		getProps,
    		isPartiallyCurrent,
    		isCurrent,
    		$base,
    		$location,
    		dispatch,
    		$$scope,
    		$$slots
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { to: 6, replace: 7, state: 8, getProps: 9 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Tailwindcss.svelte generated by Svelte v3.22.2 */

    function create_fragment$3(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tailwindcss> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Tailwindcss", $$slots, []);
    	return [];
    }

    class Tailwindcss extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tailwindcss",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\Mainmenu.svelte generated by Svelte v3.22.2 */
    const file$1 = "src\\Mainmenu.svelte";

    // (8:12) <Link to="/">
    function create_default_slot_5(ctx) {
    	let a;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			img = element("img");
    			attr_dev(img, "class", "object-left-top bg-gray-400 w-20 h-20");
    			if (img.src !== (img_src_value = "https://i.ibb.co/1n212y8/Ignat-Japan.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Ignat-Japan");
    			attr_dev(img, "border", "0");
    			add_location(img, file$1, 9, 20, 480);
    			attr_dev(a, "href", "#");
    			add_location(a, file$1, 8, 16, 446);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(8:12) <Link to=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (29:28) <Link to="Register">
    function create_default_slot_4(ctx) {
    	let a;
    	let span;

    	const block = {
    		c: function create() {
    			a = element("a");
    			span = element("span");
    			span.textContent = "Регистрация";
    			attr_dev(span, "class", "text-white underline");
    			add_location(span, file$1, 29, 44, 1954);
    			attr_dev(a, "href", "#");
    			add_location(a, file$1, 29, 32, 1942);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(29:28) <Link to=\\\"Register\\\">",
    		ctx
    	});

    	return block;
    }

    // (38:28) <Link to="Login">
    function create_default_slot_3(ctx) {
    	let a;
    	let span;

    	const block = {
    		c: function create() {
    			a = element("a");
    			span = element("span");
    			span.textContent = "Войти";
    			attr_dev(span, "class", "text-white underline ml-6");
    			add_location(span, file$1, 38, 44, 2375);
    			attr_dev(a, "href", "#");
    			add_location(a, file$1, 38, 32, 2363);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(38:28) <Link to=\\\"Login\\\">",
    		ctx
    	});

    	return block;
    }

    // (51:28) <Link to="Mainprofile">
    function create_default_slot_2(ctx) {
    	let a;
    	let i;
    	let t;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			t = text("Profile");
    			attr_dev(i, "class", "fa fa-user fa-fw");
    			add_location(i, file$1, 51, 143, 3684);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "p-2 hover:bg-gray-800 text-white text-sm no-underline hover:no-underline block text-center");
    			add_location(a, file$1, 51, 32, 3573);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    			append_dev(a, t);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(51:28) <Link to=\\\"Mainprofile\\\">",
    		ctx
    	});

    	return block;
    }

    // (68:16) <Link to="/">
    function create_default_slot_1(ctx) {
    	let a;
    	let i;
    	let span;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			span = element("span");
    			span.textContent = "Главное меню";
    			attr_dev(i, "class", "fas fa-home pr-0 ml-4 md:ml-0 md:pr-3 text-blue-600");
    			add_location(i, file$1, 69, 24, 4847);
    			attr_dev(span, "class", "pb-1 md:pb-0 text-xs md:text-base  md:text-white block md:inline-block");
    			add_location(span, file$1, 69, 91, 4914);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "block py-1 md:py-3 pl-1 align-middle text-white no-underline hover:text-white hover:border-pink-500");
    			add_location(a, file$1, 68, 20, 4701);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    			append_dev(a, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(68:16) <Link to=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (75:16) <Link to="Japanliterature">
    function create_default_slot(ctx) {
    	let a;
    	let i;
    	let span;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			span = element("span");
    			span.textContent = "Японская литература";
    			attr_dev(i, "class", "fa fa-book pr-0 md:pr-3 ml-6 md:ml-0");
    			add_location(i, file$1, 76, 24, 5357);
    			attr_dev(span, "class", "pb-1 md:pb-0 text-xs md:text-base  md:text-white block md:inline-block");
    			add_location(span, file$1, 76, 76, 5409);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "block py-1 md:py-3 pl-1 align-middle text-white no-underline hover:text-white hover:border-purple-500");
    			add_location(a, file$1, 75, 20, 5209);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    			append_dev(a, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(75:16) <Link to=\\\"Japanliterature\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let body;
    	let nav;
    	let div9;
    	let div0;
    	let t0;
    	let div2;
    	let span0;
    	let input0;
    	let t1;
    	let div1;
    	let svg0;
    	let path0;
    	let t2;
    	let div8;
    	let ul0;
    	let li0;
    	let div3;
    	let p0;
    	let t3;
    	let li1;
    	let div4;
    	let p1;
    	let t4;
    	let ul1;
    	let li2;
    	let div7;
    	let button;
    	let span1;
    	let i0;
    	let t5;
    	let svg1;
    	let path1;
    	let t6;
    	let div6;
    	let input1;
    	let t7;
    	let t8;
    	let a0;
    	let i1;
    	let t9;
    	let t10;
    	let div5;
    	let t11;
    	let a1;
    	let i2;
    	let t12;
    	let t13;
    	let div11;
    	let div10;
    	let ul2;
    	let li3;
    	let t14;
    	let li4;
    	let t15;
    	let li5;
    	let a2;
    	let i3;
    	let span2;
    	let t17;
    	let div12;
    	let t18;
    	let div16;
    	let div15;
    	let div13;
    	let p2;
    	let t20;
    	let p3;
    	let t22;
    	let div14;
    	let t23;
    	let div17;
    	let t24;
    	let script;
    	let current;

    	const link0 = new Link({
    			props: {
    				to: "/",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link1 = new Link({
    			props: {
    				to: "Register",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link2 = new Link({
    			props: {
    				to: "Login",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link3 = new Link({
    			props: {
    				to: "Mainprofile",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link4 = new Link({
    			props: {
    				to: "/",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link5 = new Link({
    			props: {
    				to: "Japanliterature",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			body = element("body");
    			nav = element("nav");
    			div9 = element("div");
    			div0 = element("div");
    			create_component(link0.$$.fragment);
    			t0 = space();
    			div2 = element("div");
    			span0 = element("span");
    			input0 = element("input");
    			t1 = space();
    			div1 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t2 = space();
    			div8 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			div3 = element("div");
    			p0 = element("p");
    			create_component(link1.$$.fragment);
    			t3 = space();
    			li1 = element("li");
    			div4 = element("div");
    			p1 = element("p");
    			create_component(link2.$$.fragment);
    			t4 = space();
    			ul1 = element("ul");
    			li2 = element("li");
    			div7 = element("div");
    			button = element("button");
    			span1 = element("span");
    			i0 = element("i");
    			t5 = text(" Привет, пользователь ");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t6 = space();
    			div6 = element("div");
    			input1 = element("input");
    			t7 = space();
    			create_component(link3.$$.fragment);
    			t8 = space();
    			a0 = element("a");
    			i1 = element("i");
    			t9 = text(" Settings");
    			t10 = space();
    			div5 = element("div");
    			t11 = space();
    			a1 = element("a");
    			i2 = element("i");
    			t12 = text(" Log Out");
    			t13 = space();
    			div11 = element("div");
    			div10 = element("div");
    			ul2 = element("ul");
    			li3 = element("li");
    			create_component(link4.$$.fragment);
    			t14 = space();
    			li4 = element("li");
    			create_component(link5.$$.fragment);
    			t15 = space();
    			li5 = element("li");
    			a2 = element("a");
    			i3 = element("i");
    			span2 = element("span");
    			span2.textContent = "Analytics";
    			t17 = space();
    			div12 = element("div");
    			t18 = space();
    			div16 = element("div");
    			div15 = element("div");
    			div13 = element("div");
    			p2 = element("p");
    			p2.textContent = "Ignat Japan - это ( в значительной степени ) академический сайт, посвященный различным аспектам одной из великих мировых литератур.\r\n                Сайт имеет тенденцию расширяться неторопливо, тем не менее, здесь есть материал, который возможно недоступен в других местах, поэтому не стесняйтесь просматривать.";
    			t20 = space();
    			p3 = element("p");
    			p3.textContent = "Японская литература — литература на японском языке, хронологически охватывающая период почти в полтора тысячелетия: от летописи «Кодзики» (712 год) до произведений современных авторов.\r\n                    На ранней стадии своего развития испытала сильнейшее влияние китайской литературы и зачастую писалась на классическом китайском. Влияние китайского в разной степени ощущалось вплоть до конца периода\r\n                    Эдо, сведясь к минимуму в XIX веке, начиная с которого развитие японской литературы стало во многом обусловлено продолжающимся до настоящего времени диалогом с европейской литературой.";
    			t22 = space();
    			div14 = element("div");
    			t23 = space();
    			div17 = element("div");
    			t24 = space();
    			script = element("script");
    			script.textContent = "/*Toggle dropdown list*/\r\n    function toggleDD(myDropMenu) {\r\n        document.getElementById(myDropMenu).classList.toggle(\"invisible\");\r\n    }\r\n    /*Filter dropdown options*/\r\n    function filterDD(myDropMenu, myDropMenuSearch) {\r\n        var input, filter, ul, li, a, i;\r\n        input = document.getElementById(myDropMenuSearch);\r\n        filter = input.value.toUpperCase();\r\n        div = document.getElementById(myDropMenu);\r\n        a = div.getElementsByTagName(\"a\");\r\n        for (i = 0; i < a.length; i++) {\r\n            if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {\r\n                a[i].style.display = \"\";\r\n            } else {\r\n                a[i].style.display = \"none\";\r\n            }\r\n        }\r\n    }\r\n    // Close the dropdown menu if the user clicks outside of it\r\n    window.onclick = function(event) {\r\n        if (!event.target.matches('.drop-button') && !event.target.matches('.drop-search')) {\r\n            var dropdowns = document.getElementsByClassName(\"dropdownlist\");\r\n            for (var i = 0; i < dropdowns.length; i++) {\r\n                var openDropdown = dropdowns[i];\r\n                if (!openDropdown.classList.contains('invisible')) {\r\n                    openDropdown.classList.add('invisible');\r\n                }\r\n            }\r\n        }\r\n    }";
    			attr_dev(div0, "class", "flex flex-shrink md:w-1/3 justify-center md:justify-start text-white");
    			add_location(div0, file$1, 6, 8, 319);
    			attr_dev(input0, "type", "search");
    			attr_dev(input0, "placeholder", "Search");
    			attr_dev(input0, "class", "w-full bg-gray-800 text-sm text-white transition border border-transparent focus:outline-none focus:border-gray-700 rounded py-1 px-2 pl-10 appearance-none leading-normal");
    			add_location(input0, file$1, 15, 24, 857);
    			attr_dev(path0, "d", "M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z");
    			add_location(path0, file$1, 18, 32, 1355);
    			attr_dev(svg0, "class", "fill-current pointer-events-none text-white w-4 h-4");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 20 20");
    			add_location(svg0, file$1, 17, 28, 1201);
    			attr_dev(div1, "class", "absolute search-icon");
    			set_style(div1, "top", ".5rem");
    			set_style(div1, "left", ".8rem");
    			add_location(div1, file$1, 16, 24, 1104);
    			attr_dev(span0, "class", "relative w-full");
    			add_location(span0, file$1, 14, 28, 801);
    			attr_dev(div2, "class", "flex flex-1 w-full justify-center md:justify-start text-white px-2 mr-0 md:mr-20");
    			add_location(div2, file$1, 13, 8, 677);
    			attr_dev(p0, "class", "text-white");
    			add_location(p0, file$1, 27, 24, 1836);
    			attr_dev(div3, "class", "relative inline-block");
    			add_location(div3, file$1, 26, 20, 1775);
    			attr_dev(li0, "class", "flex-none md:mr-3");
    			add_location(li0, file$1, 25, 16, 1723);
    			attr_dev(p1, "class", "text-white");
    			add_location(p1, file$1, 36, 24, 2260);
    			attr_dev(div4, "class", "relative inline-block");
    			add_location(div4, file$1, 35, 20, 2199);
    			attr_dev(li1, "class", "flex-none md:mr-3");
    			add_location(li1, file$1, 34, 16, 2147);
    			attr_dev(ul0, "class", "pr-1");
    			add_location(ul0, file$1, 24, 12, 1688);
    			attr_dev(i0, "class", "fa fa-user");
    			add_location(i0, file$1, 47, 135, 2926);
    			attr_dev(span1, "class", "pr-2");
    			add_location(span1, file$1, 47, 116, 2907);
    			attr_dev(path1, "d", "M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z");
    			add_location(path1, file$1, 47, 282, 3073);
    			attr_dev(svg1, "class", "h-3 fill-current inline");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 20 20");
    			add_location(svg1, file$1, 47, 190, 2981);
    			attr_dev(button, "onclick", "toggleDD('myDropdown')");
    			attr_dev(button, "class", "drop-button text-white focus:outline-none");
    			add_location(button, file$1, 47, 24, 2815);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "drop-search p-2 text-gray-600");
    			attr_dev(input1, "placeholder", "Search..");
    			attr_dev(input1, "id", "myInput");
    			attr_dev(input1, "onkeyup", "filterDD('myDropdown','myInput')");
    			add_location(input1, file$1, 49, 28, 3350);
    			attr_dev(i1, "class", "fa fa-cog fa-fw");
    			add_location(i1, file$1, 53, 139, 3905);
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "class", "p-2 hover:bg-gray-800 text-white text-sm no-underline hover:no-underline block text-center");
    			add_location(a0, file$1, 53, 28, 3794);
    			attr_dev(div5, "class", "border border-gray-800");
    			add_location(div5, file$1, 54, 28, 3979);
    			attr_dev(i2, "class", "fas fa-sign-out-alt fa-fw");
    			add_location(i2, file$1, 55, 139, 4162);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "class", "p-2 hover:bg-gray-800 text-white text-sm no-underline hover:no-underline block text-center");
    			add_location(a1, file$1, 55, 28, 4051);
    			attr_dev(div6, "id", "myDropdown");
    			attr_dev(div6, "class", "dropdownlist absolute bg-gray-900 text-white right-0 mt-3 p-3 overflow-auto z-30 invisible");
    			add_location(div6, file$1, 48, 24, 3200);
    			attr_dev(div7, "class", "relative inline-block");
    			add_location(div7, file$1, 46, 20, 2754);
    			attr_dev(li2, "class", "flex-1 md:flex-none md:mr-3 text-right");
    			add_location(li2, file$1, 45, 20, 2681);
    			attr_dev(ul1, "class", "list-reset flex justify-between flex-1 md:flex-none items-center");
    			add_location(ul1, file$1, 44, 12, 2582);
    			attr_dev(div8, "class", "flex w-full pt-2 content-center justify-between md:w-1/3 md:justify-end");
    			add_location(div8, file$1, 23, 8, 1589);
    			attr_dev(div9, "class", "flex flex-wrap items-center");
    			add_location(div9, file$1, 5, 4, 268);
    			attr_dev(nav, "class", "bg-gray-900 pt-2 md:pt-1 pb-1 px-1 mt-0 h-auto fixed w-full z-20 top-0 ");
    			add_location(nav, file$1, 4, 0, 177);
    			attr_dev(li3, "class", "flex-1 md:flex-none md:mr-3");
    			add_location(li3, file$1, 66, 12, 4608);
    			attr_dev(li4, "class", "flex-1 md:flex-none md:mr-3");
    			add_location(li4, file$1, 73, 12, 5102);
    			attr_dev(i3, "class", "fas fa-chart-area pr-0 ml-4 md:pr-3");
    			add_location(i3, file$1, 82, 20, 5806);
    			attr_dev(span2, "class", "pb-1 md:pb-0 text-xs md:text-base text-white md:text-white block md:inline-block");
    			add_location(span2, file$1, 82, 71, 5857);
    			attr_dev(a2, "href", "#");
    			attr_dev(a2, "class", "block py-1 md:py-3 pl-1 align-middle text-white no-underline hover:text-white hover:border-purple-500");
    			add_location(a2, file$1, 81, 16, 5662);
    			attr_dev(li5, "class", "flex-1 md:flex-none md:mr-3");
    			add_location(li5, file$1, 80, 12, 5604);
    			attr_dev(ul2, "class", "list-reset flex justify-between flex-1");
    			add_location(ul2, file$1, 65, 8, 4543);
    			attr_dev(div10, "class", "flex w-full content-center justify-between md:justify-end");
    			add_location(div10, file$1, 64, 4, 4462);
    			attr_dev(div11, "class", "pl-10 pr-10 bg-red-900 flex flex-wrap items-center fixed w-full bottom-0 md:bottom-auto");
    			add_location(div11, file$1, 63, 0, 4355);
    			attr_dev(div12, "class", "bg-gray-300 h-16 w-full");
    			add_location(div12, file$1, 88, 0, 6046);
    			add_location(p2, file$1, 93, 16, 6309);
    			attr_dev(p3, "class", "p-16 md:p-16");
    			add_location(p3, file$1, 95, 16, 6647);
    			attr_dev(div13, "class", "md:w-full w-auto ");
    			add_location(div13, file$1, 92, 12, 6260);
    			attr_dev(div14, "class", "md:w-full w-auto ");
    			add_location(div14, file$1, 99, 12, 7319);
    			attr_dev(div15, "class", "bg-gray-100 border-2 border-black p-4 h-full md:h-full rounded-lg shadow-lg");
    			add_location(div15, file$1, 91, 8, 6157);
    			attr_dev(div16, "class", "flex-1 bg-gray-300 p-4 pb-24 md:pb-5");
    			add_location(div16, file$1, 90, 4, 6097);
    			attr_dev(div17, "class", "h-20 md:h-12 w-full bg-gray-100");
    			add_location(div17, file$1, 104, 0, 7402);
    			add_location(script, file$1, 105, 0, 7455);
    			attr_dev(body, "class", "mt-20 font-sans antialiased text-gray-900 leading-normal tracking-wider bg-cover");
    			add_location(body, file$1, 3, 0, 80);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, nav);
    			append_dev(nav, div9);
    			append_dev(div9, div0);
    			mount_component(link0, div0, null);
    			append_dev(div9, t0);
    			append_dev(div9, div2);
    			append_dev(div2, span0);
    			append_dev(span0, input0);
    			append_dev(span0, t1);
    			append_dev(span0, div1);
    			append_dev(div1, svg0);
    			append_dev(svg0, path0);
    			append_dev(div9, t2);
    			append_dev(div9, div8);
    			append_dev(div8, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, div3);
    			append_dev(div3, p0);
    			mount_component(link1, p0, null);
    			append_dev(ul0, t3);
    			append_dev(ul0, li1);
    			append_dev(li1, div4);
    			append_dev(div4, p1);
    			mount_component(link2, p1, null);
    			append_dev(div8, t4);
    			append_dev(div8, ul1);
    			append_dev(ul1, li2);
    			append_dev(li2, div7);
    			append_dev(div7, button);
    			append_dev(button, span1);
    			append_dev(span1, i0);
    			append_dev(button, t5);
    			append_dev(button, svg1);
    			append_dev(svg1, path1);
    			append_dev(div7, t6);
    			append_dev(div7, div6);
    			append_dev(div6, input1);
    			append_dev(div6, t7);
    			mount_component(link3, div6, null);
    			append_dev(div6, t8);
    			append_dev(div6, a0);
    			append_dev(a0, i1);
    			append_dev(a0, t9);
    			append_dev(div6, t10);
    			append_dev(div6, div5);
    			append_dev(div6, t11);
    			append_dev(div6, a1);
    			append_dev(a1, i2);
    			append_dev(a1, t12);
    			append_dev(body, t13);
    			append_dev(body, div11);
    			append_dev(div11, div10);
    			append_dev(div10, ul2);
    			append_dev(ul2, li3);
    			mount_component(link4, li3, null);
    			append_dev(ul2, t14);
    			append_dev(ul2, li4);
    			mount_component(link5, li4, null);
    			append_dev(ul2, t15);
    			append_dev(ul2, li5);
    			append_dev(li5, a2);
    			append_dev(a2, i3);
    			append_dev(a2, span2);
    			append_dev(body, t17);
    			append_dev(body, div12);
    			append_dev(body, t18);
    			append_dev(body, div16);
    			append_dev(div16, div15);
    			append_dev(div15, div13);
    			append_dev(div13, p2);
    			append_dev(div13, t20);
    			append_dev(div13, p3);
    			append_dev(div15, t22);
    			append_dev(div15, div14);
    			append_dev(body, t23);
    			append_dev(body, div17);
    			append_dev(body, t24);
    			append_dev(body, script);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const link0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link0_changes.$$scope = { dirty, ctx };
    			}

    			link0.$set(link0_changes);
    			const link1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link1_changes.$$scope = { dirty, ctx };
    			}

    			link1.$set(link1_changes);
    			const link2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link2_changes.$$scope = { dirty, ctx };
    			}

    			link2.$set(link2_changes);
    			const link3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link3_changes.$$scope = { dirty, ctx };
    			}

    			link3.$set(link3_changes);
    			const link4_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link4_changes.$$scope = { dirty, ctx };
    			}

    			link4.$set(link4_changes);
    			const link5_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link5_changes.$$scope = { dirty, ctx };
    			}

    			link5.$set(link5_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);
    			transition_in(link2.$$.fragment, local);
    			transition_in(link3.$$.fragment, local);
    			transition_in(link4.$$.fragment, local);
    			transition_in(link5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			transition_out(link2.$$.fragment, local);
    			transition_out(link3.$$.fragment, local);
    			transition_out(link4.$$.fragment, local);
    			transition_out(link5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			destroy_component(link0);
    			destroy_component(link1);
    			destroy_component(link2);
    			destroy_component(link3);
    			destroy_component(link4);
    			destroy_component(link5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Mainmenu> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Mainmenu", $$slots, []);
    	$$self.$capture_state = () => ({ Router, Link, Route });
    	return [];
    }

    class Mainmenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Mainmenu",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\literature.svelte generated by Svelte v3.22.2 */
    const file$2 = "src\\literature.svelte";

    // (8:20) <Link to="Literaturepage">
    function create_default_slot$1(ctx) {
    	let a;
    	let div;

    	const block = {
    		c: function create() {
    			a = element("a");
    			div = element("div");
    			attr_dev(div, "class", "bg-gray-600 w-auto h-64");
    			add_location(div, file$2, 9, 28, 390);
    			attr_dev(a, "href", "#");
    			add_location(a, file$2, 8, 24, 348);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, div);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(8:20) <Link to=\\\"Literaturepage\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div7;
    	let div6;
    	let div5;
    	let div0;
    	let t0;
    	let div4;
    	let div1;
    	let h3;
    	let t2;
    	let div2;
    	let p0;
    	let t4;
    	let div3;
    	let p1;
    	let current;

    	const link = new Link({
    			props: {
    				to: "Literaturepage",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			create_component(link.$$.fragment);
    			t0 = space();
    			div4 = element("div");
    			div1 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Название";
    			t2 = space();
    			div2 = element("div");
    			p0 = element("p");
    			p0.textContent = "Жанр/Категория Жанр/Категория Жанр/Категория";
    			t4 = space();
    			div3 = element("div");
    			p1 = element("p");
    			p1.textContent = "Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-то\r\n                        Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-то\r\n                        Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-то";
    			add_location(div0, file$2, 6, 16, 269);
    			attr_dev(h3, "class", "font-bold text-3xl text-gray-800 font-bold leading-none mb-3 text-center");
    			add_location(h3, file$2, 14, 38, 588);
    			attr_dev(div1, "class", "mt-2");
    			add_location(div1, file$2, 14, 20, 570);
    			attr_dev(p0, "class", "text-gray-600 mb-2 text-center");
    			add_location(p0, file$2, 15, 34, 728);
    			attr_dev(div2, "class", "");
    			add_location(div2, file$2, 15, 20, 714);
    			attr_dev(p1, "class", "leading-normal text-left slide-in-bottom-subtitle");
    			add_location(p1, file$2, 16, 34, 860);
    			attr_dev(div3, "class", "");
    			add_location(div3, file$2, 16, 20, 846);
    			attr_dev(div4, "class", "");
    			add_location(div4, file$2, 13, 16, 534);
    			attr_dev(div5, "class", "bg-gray-100 border-2 border-black p-4 rounded-lg shadow-lg w-auto h-full");
    			add_location(div5, file$2, 5, 12, 165);
    			attr_dev(div6, "class", "flex-1 bg-gray-300 p-1 md:p-4");
    			add_location(div6, file$2, 4, 8, 108);
    			attr_dev(div7, "class", "");
    			add_location(div7, file$2, 3, 4, 84);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div0);
    			mount_component(link, div0, null);
    			append_dev(div5, t0);
    			append_dev(div5, div4);
    			append_dev(div4, div1);
    			append_dev(div1, h3);
    			append_dev(div4, t2);
    			append_dev(div4, div2);
    			append_dev(div2, p0);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div3, p1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const link_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    			destroy_component(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Literature> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Literature", $$slots, []);
    	$$self.$capture_state = () => ({ Router, Link, Route });
    	return [];
    }

    class Literature extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Literature",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\Japanliterature.svelte generated by Svelte v3.22.2 */
    const file$3 = "src\\Japanliterature.svelte";

    // (9:12) <Link to="/">
    function create_default_slot_5$1(ctx) {
    	let a;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			img = element("img");
    			attr_dev(img, "class", "object-left-top bg-gray-400 w-20 h-20");
    			if (img.src !== (img_src_value = "https://i.ibb.co/1n212y8/Ignat-Japan.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Ignat-Japan");
    			attr_dev(img, "border", "0");
    			add_location(img, file$3, 10, 20, 526);
    			attr_dev(a, "href", "#");
    			add_location(a, file$3, 9, 16, 492);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$1.name,
    		type: "slot",
    		source: "(9:12) <Link to=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (30:28) <Link to="Register">
    function create_default_slot_4$1(ctx) {
    	let a;
    	let span;

    	const block = {
    		c: function create() {
    			a = element("a");
    			span = element("span");
    			span.textContent = "Регистрация";
    			attr_dev(span, "class", "text-white underline");
    			add_location(span, file$3, 30, 44, 2000);
    			attr_dev(a, "href", "#");
    			add_location(a, file$3, 30, 32, 1988);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$1.name,
    		type: "slot",
    		source: "(30:28) <Link to=\\\"Register\\\">",
    		ctx
    	});

    	return block;
    }

    // (39:28) <Link to="Login">
    function create_default_slot_3$1(ctx) {
    	let a;
    	let span;

    	const block = {
    		c: function create() {
    			a = element("a");
    			span = element("span");
    			span.textContent = "Войти";
    			attr_dev(span, "class", "text-white underline ml-6");
    			add_location(span, file$3, 39, 44, 2421);
    			attr_dev(a, "href", "#");
    			add_location(a, file$3, 39, 32, 2409);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(39:28) <Link to=\\\"Login\\\">",
    		ctx
    	});

    	return block;
    }

    // (52:28) <Link to="Mainprofile">
    function create_default_slot_2$1(ctx) {
    	let a;
    	let i;
    	let t;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			t = text("Profile");
    			attr_dev(i, "class", "fa fa-user fa-fw");
    			add_location(i, file$3, 52, 143, 3726);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "p-2 hover:bg-gray-800 text-white text-sm no-underline hover:no-underline block text-center");
    			add_location(a, file$3, 52, 32, 3615);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    			append_dev(a, t);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(52:28) <Link to=\\\"Mainprofile\\\">",
    		ctx
    	});

    	return block;
    }

    // (69:16) <Link to="/">
    function create_default_slot_1$1(ctx) {
    	let a;
    	let i;
    	let span;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			span = element("span");
    			span.textContent = "Главное меню";
    			attr_dev(i, "class", "fas fa-home pr-0 ml-4 md:ml-0 md:pr-3");
    			add_location(i, file$3, 70, 24, 4889);
    			attr_dev(span, "class", "pb-1 md:pb-0 text-xs md:text-base  md:text-white block md:inline-block");
    			add_location(span, file$3, 70, 77, 4942);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "block py-1 md:py-3 pl-1 align-middle text-white no-underline hover:text-white hover:border-pink-500");
    			add_location(a, file$3, 69, 20, 4743);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    			append_dev(a, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(69:16) <Link to=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (76:16) <Link to="Japanliterature">
    function create_default_slot$2(ctx) {
    	let a;
    	let i;
    	let span;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			span = element("span");
    			span.textContent = "Японская литература";
    			attr_dev(i, "class", "fa fa-book pr-0 md:pr-3 ml-6 md:ml-0 text-blue-600");
    			add_location(i, file$3, 77, 24, 5385);
    			attr_dev(span, "class", "pb-1 md:pb-0 text-xs md:text-base  md:text-white block md:inline-block");
    			add_location(span, file$3, 77, 90, 5451);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "block py-1 md:py-3 pl-1 align-middle text-white no-underline hover:text-white hover:border-purple-500");
    			add_location(a, file$3, 76, 20, 5237);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    			append_dev(a, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(76:16) <Link to=\\\"Japanliterature\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let body;
    	let nav;
    	let div9;
    	let div0;
    	let t0;
    	let div2;
    	let span0;
    	let input0;
    	let t1;
    	let div1;
    	let svg0;
    	let path0;
    	let t2;
    	let div8;
    	let ul0;
    	let li0;
    	let div3;
    	let p0;
    	let t3;
    	let li1;
    	let div4;
    	let p1;
    	let t4;
    	let ul1;
    	let li2;
    	let div7;
    	let button0;
    	let span1;
    	let i0;
    	let t5;
    	let svg1;
    	let path1;
    	let t6;
    	let div6;
    	let input1;
    	let t7;
    	let t8;
    	let a0;
    	let i1;
    	let t9;
    	let t10;
    	let div5;
    	let t11;
    	let a1;
    	let i2;
    	let t12;
    	let t13;
    	let div11;
    	let div10;
    	let ul2;
    	let li3;
    	let t14;
    	let li4;
    	let t15;
    	let li5;
    	let a2;
    	let i3;
    	let span2;
    	let t17;
    	let div12;
    	let t18;
    	let div15;
    	let div14;
    	let div13;
    	let button1;
    	let t20;
    	let div17;
    	let div16;
    	let a3;
    	let t21;
    	let a4;
    	let t22;
    	let a5;
    	let t23;
    	let a6;
    	let t24;
    	let div18;
    	let t25;
    	let script;
    	let current;

    	const link0 = new Link({
    			props: {
    				to: "/",
    				$$slots: { default: [create_default_slot_5$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link1 = new Link({
    			props: {
    				to: "Register",
    				$$slots: { default: [create_default_slot_4$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link2 = new Link({
    			props: {
    				to: "Login",
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link3 = new Link({
    			props: {
    				to: "Mainprofile",
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link4 = new Link({
    			props: {
    				to: "/",
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link5 = new Link({
    			props: {
    				to: "Japanliterature",
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const manga0 = new Literature({ $$inline: true });
    	const manga1 = new Literature({ $$inline: true });
    	const manga2 = new Literature({ $$inline: true });
    	const manga3 = new Literature({ $$inline: true });

    	const block = {
    		c: function create() {
    			body = element("body");
    			nav = element("nav");
    			div9 = element("div");
    			div0 = element("div");
    			create_component(link0.$$.fragment);
    			t0 = space();
    			div2 = element("div");
    			span0 = element("span");
    			input0 = element("input");
    			t1 = space();
    			div1 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t2 = space();
    			div8 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			div3 = element("div");
    			p0 = element("p");
    			create_component(link1.$$.fragment);
    			t3 = space();
    			li1 = element("li");
    			div4 = element("div");
    			p1 = element("p");
    			create_component(link2.$$.fragment);
    			t4 = space();
    			ul1 = element("ul");
    			li2 = element("li");
    			div7 = element("div");
    			button0 = element("button");
    			span1 = element("span");
    			i0 = element("i");
    			t5 = text(" Привет, пользователь ");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t6 = space();
    			div6 = element("div");
    			input1 = element("input");
    			t7 = space();
    			create_component(link3.$$.fragment);
    			t8 = space();
    			a0 = element("a");
    			i1 = element("i");
    			t9 = text(" Settings");
    			t10 = space();
    			div5 = element("div");
    			t11 = space();
    			a1 = element("a");
    			i2 = element("i");
    			t12 = text(" Log Out");
    			t13 = space();
    			div11 = element("div");
    			div10 = element("div");
    			ul2 = element("ul");
    			li3 = element("li");
    			create_component(link4.$$.fragment);
    			t14 = space();
    			li4 = element("li");
    			create_component(link5.$$.fragment);
    			t15 = space();
    			li5 = element("li");
    			a2 = element("a");
    			i3 = element("i");
    			span2 = element("span");
    			span2.textContent = "Analytics";
    			t17 = space();
    			div12 = element("div");
    			t18 = space();
    			div15 = element("div");
    			div14 = element("div");
    			div13 = element("div");
    			button1 = element("button");
    			button1.textContent = "Добавить литературу";
    			t20 = space();
    			div17 = element("div");
    			div16 = element("div");
    			a3 = element("a");
    			create_component(manga0.$$.fragment);
    			t21 = space();
    			a4 = element("a");
    			create_component(manga1.$$.fragment);
    			t22 = space();
    			a5 = element("a");
    			create_component(manga2.$$.fragment);
    			t23 = space();
    			a6 = element("a");
    			create_component(manga3.$$.fragment);
    			t24 = space();
    			div18 = element("div");
    			t25 = space();
    			script = element("script");
    			script.textContent = "/*Toggle dropdown list*/\r\n    function toggleDD(myDropMenu) {\r\n        document.getElementById(myDropMenu).classList.toggle(\"invisible\");\r\n    }\r\n    /*Filter dropdown options*/\r\n    function filterDD(myDropMenu, myDropMenuSearch) {\r\n        var input, filter, ul, li, a, i;\r\n        input = document.getElementById(myDropMenuSearch);\r\n        filter = input.value.toUpperCase();\r\n        div = document.getElementById(myDropMenu);\r\n        a = div.getElementsByTagName(\"a\");\r\n        for (i = 0; i < a.length; i++) {\r\n            if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {\r\n                a[i].style.display = \"\";\r\n            } else {\r\n                a[i].style.display = \"none\";\r\n            }\r\n        }\r\n    }\r\n    // Close the dropdown menu if the user clicks outside of it\r\n    window.onclick = function(event) {\r\n        if (!event.target.matches('.drop-button') && !event.target.matches('.drop-search')) {\r\n            var dropdowns = document.getElementsByClassName(\"dropdownlist\");\r\n            for (var i = 0; i < dropdowns.length; i++) {\r\n                var openDropdown = dropdowns[i];\r\n                if (!openDropdown.classList.contains('invisible')) {\r\n                    openDropdown.classList.add('invisible');\r\n                }\r\n            }\r\n        }\r\n    }";
    			attr_dev(div0, "class", "flex flex-shrink md:w-1/3 justify-center md:justify-start text-white");
    			add_location(div0, file$3, 7, 8, 365);
    			attr_dev(input0, "type", "search");
    			attr_dev(input0, "placeholder", "Search");
    			attr_dev(input0, "class", "w-full bg-gray-800 text-sm text-white transition border border-transparent focus:outline-none focus:border-gray-700 rounded py-1 px-2 pl-10 appearance-none leading-normal");
    			add_location(input0, file$3, 16, 24, 903);
    			attr_dev(path0, "d", "M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z");
    			add_location(path0, file$3, 19, 32, 1401);
    			attr_dev(svg0, "class", "fill-current pointer-events-none text-white w-4 h-4");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 20 20");
    			add_location(svg0, file$3, 18, 28, 1247);
    			attr_dev(div1, "class", "absolute search-icon");
    			set_style(div1, "top", ".5rem");
    			set_style(div1, "left", ".8rem");
    			add_location(div1, file$3, 17, 24, 1150);
    			attr_dev(span0, "class", "relative w-full");
    			add_location(span0, file$3, 15, 28, 847);
    			attr_dev(div2, "class", "flex flex-1 w-full justify-center md:justify-start text-white px-2 mr-0 md:mr-20");
    			add_location(div2, file$3, 14, 8, 723);
    			attr_dev(p0, "class", "text-white");
    			add_location(p0, file$3, 28, 24, 1882);
    			attr_dev(div3, "class", "relative inline-block");
    			add_location(div3, file$3, 27, 20, 1821);
    			attr_dev(li0, "class", "flex-none md:mr-3");
    			add_location(li0, file$3, 26, 16, 1769);
    			attr_dev(p1, "class", "text-white");
    			add_location(p1, file$3, 37, 24, 2306);
    			attr_dev(div4, "class", "relative inline-block");
    			add_location(div4, file$3, 36, 20, 2245);
    			attr_dev(li1, "class", "flex-none md:mr-3");
    			add_location(li1, file$3, 35, 16, 2193);
    			attr_dev(ul0, "class", "pr-1");
    			add_location(ul0, file$3, 25, 12, 1734);
    			attr_dev(i0, "class", "fa fa-user");
    			add_location(i0, file$3, 48, 135, 2968);
    			attr_dev(span1, "class", "pr-2");
    			add_location(span1, file$3, 48, 116, 2949);
    			attr_dev(path1, "d", "M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z");
    			add_location(path1, file$3, 48, 282, 3115);
    			attr_dev(svg1, "class", "h-3 fill-current inline");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 20 20");
    			add_location(svg1, file$3, 48, 190, 3023);
    			attr_dev(button0, "onclick", "toggleDD('myDropdown')");
    			attr_dev(button0, "class", "drop-button text-white focus:outline-none");
    			add_location(button0, file$3, 48, 24, 2857);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "drop-search p-2 text-gray-600");
    			attr_dev(input1, "placeholder", "Search..");
    			attr_dev(input1, "id", "myInput");
    			attr_dev(input1, "onkeyup", "filterDD('myDropdown','myInput')");
    			add_location(input1, file$3, 50, 28, 3392);
    			attr_dev(i1, "class", "fa fa-cog fa-fw");
    			add_location(i1, file$3, 54, 139, 3947);
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "class", "p-2 hover:bg-gray-800 text-white text-sm no-underline hover:no-underline block text-center");
    			add_location(a0, file$3, 54, 28, 3836);
    			attr_dev(div5, "class", "border border-gray-800");
    			add_location(div5, file$3, 55, 28, 4021);
    			attr_dev(i2, "class", "fas fa-sign-out-alt fa-fw");
    			add_location(i2, file$3, 56, 139, 4204);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "class", "p-2 hover:bg-gray-800 text-white text-sm no-underline hover:no-underline block text-center");
    			add_location(a1, file$3, 56, 28, 4093);
    			attr_dev(div6, "id", "myDropdown");
    			attr_dev(div6, "class", "dropdownlist absolute bg-gray-900 text-white right-0 mt-3 p-3 overflow-auto z-30 invisible");
    			add_location(div6, file$3, 49, 24, 3242);
    			attr_dev(div7, "class", "relative inline-block");
    			add_location(div7, file$3, 47, 20, 2796);
    			attr_dev(li2, "class", "flex-1 md:flex-none md:mr-3 text-right");
    			add_location(li2, file$3, 46, 16, 2723);
    			attr_dev(ul1, "class", "list-reset flex justify-between flex-1 md:flex-none items-center");
    			add_location(ul1, file$3, 45, 12, 2628);
    			attr_dev(div8, "class", "flex w-full pt-2 content-center justify-between md:w-1/3 md:justify-end");
    			add_location(div8, file$3, 24, 8, 1635);
    			attr_dev(div9, "class", "flex flex-wrap items-center");
    			add_location(div9, file$3, 6, 4, 314);
    			attr_dev(nav, "class", "bg-gray-900 pt-2 md:pt-1 pb-1 px-1 mt-0 h-auto fixed w-full z-20 top-0 ");
    			add_location(nav, file$3, 5, 0, 223);
    			attr_dev(li3, "class", "flex-1 md:flex-none md:mr-3");
    			add_location(li3, file$3, 67, 12, 4650);
    			attr_dev(li4, "class", "flex-1 md:flex-none md:mr-3");
    			add_location(li4, file$3, 74, 12, 5130);
    			attr_dev(i3, "class", "fas fa-chart-area pr-0 ml-4 md:pr-3");
    			add_location(i3, file$3, 83, 20, 5848);
    			attr_dev(span2, "class", "pb-1 md:pb-0 text-xs md:text-base text-white md:text-white block md:inline-block");
    			add_location(span2, file$3, 83, 71, 5899);
    			attr_dev(a2, "href", "#");
    			attr_dev(a2, "class", "block py-1 md:py-3 pl-1 align-middle text-white no-underline hover:text-white hover:border-purple-500");
    			add_location(a2, file$3, 82, 16, 5704);
    			attr_dev(li5, "class", "flex-1 md:flex-none md:mr-3");
    			add_location(li5, file$3, 81, 12, 5646);
    			attr_dev(ul2, "class", "list-reset flex justify-between flex-1");
    			add_location(ul2, file$3, 66, 8, 4585);
    			attr_dev(div10, "class", "flex w-full content-center justify-between md:justify-end");
    			add_location(div10, file$3, 65, 4, 4504);
    			attr_dev(div11, "class", "pl-10 pr-10 bg-red-900 flex flex-wrap items-center fixed w-full bottom-0 md:bottom-auto");
    			add_location(div11, file$3, 64, 0, 4397);
    			attr_dev(div12, "class", "flex flex-col h-20 md:h-12 w-full bg-gray-300");
    			add_location(div12, file$3, 89, 0, 6088);
    			attr_dev(button1, "class", "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline");
    			attr_dev(button1, "type", "button");
    			add_location(button1, file$3, 93, 12, 6327);
    			attr_dev(div13, "class", "p-4 justify-end");
    			add_location(div13, file$3, 92, 8, 6284);
    			attr_dev(div14, "class", "grid grid-cols-1 md:grid-cols-2 flex-col md:flex-row");
    			add_location(div14, file$3, 91, 4, 6208);
    			attr_dev(div15, "class", "bg-gray-300 flex-col main-content");
    			add_location(div15, file$3, 90, 0, 6155);
    			add_location(a3, file$3, 101, 8, 6693);
    			add_location(a4, file$3, 104, 8, 6743);
    			add_location(a5, file$3, 107, 8, 6793);
    			add_location(a6, file$3, 110, 8, 6843);
    			attr_dev(div16, "class", "grid grid-cols-1 md:grid-cols-2 flex-col md:flex-row");
    			add_location(div16, file$3, 100, 4, 6617);
    			attr_dev(div17, "class", "flex-col bg-gray-300 main-content");
    			add_location(div17, file$3, 99, 0, 6564);
    			attr_dev(div18, "class", "h-20 md:h-12 w-full bg-gray-300");
    			add_location(div18, file$3, 115, 0, 6905);
    			add_location(script, file$3, 116, 0, 6958);
    			attr_dev(body, "class", "mt-20 font-sans antialiased text-gray-900 leading-normal tracking-wider bg-cover");
    			add_location(body, file$3, 4, 0, 126);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, nav);
    			append_dev(nav, div9);
    			append_dev(div9, div0);
    			mount_component(link0, div0, null);
    			append_dev(div9, t0);
    			append_dev(div9, div2);
    			append_dev(div2, span0);
    			append_dev(span0, input0);
    			append_dev(span0, t1);
    			append_dev(span0, div1);
    			append_dev(div1, svg0);
    			append_dev(svg0, path0);
    			append_dev(div9, t2);
    			append_dev(div9, div8);
    			append_dev(div8, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, div3);
    			append_dev(div3, p0);
    			mount_component(link1, p0, null);
    			append_dev(ul0, t3);
    			append_dev(ul0, li1);
    			append_dev(li1, div4);
    			append_dev(div4, p1);
    			mount_component(link2, p1, null);
    			append_dev(div8, t4);
    			append_dev(div8, ul1);
    			append_dev(ul1, li2);
    			append_dev(li2, div7);
    			append_dev(div7, button0);
    			append_dev(button0, span1);
    			append_dev(span1, i0);
    			append_dev(button0, t5);
    			append_dev(button0, svg1);
    			append_dev(svg1, path1);
    			append_dev(div7, t6);
    			append_dev(div7, div6);
    			append_dev(div6, input1);
    			append_dev(div6, t7);
    			mount_component(link3, div6, null);
    			append_dev(div6, t8);
    			append_dev(div6, a0);
    			append_dev(a0, i1);
    			append_dev(a0, t9);
    			append_dev(div6, t10);
    			append_dev(div6, div5);
    			append_dev(div6, t11);
    			append_dev(div6, a1);
    			append_dev(a1, i2);
    			append_dev(a1, t12);
    			append_dev(body, t13);
    			append_dev(body, div11);
    			append_dev(div11, div10);
    			append_dev(div10, ul2);
    			append_dev(ul2, li3);
    			mount_component(link4, li3, null);
    			append_dev(ul2, t14);
    			append_dev(ul2, li4);
    			mount_component(link5, li4, null);
    			append_dev(ul2, t15);
    			append_dev(ul2, li5);
    			append_dev(li5, a2);
    			append_dev(a2, i3);
    			append_dev(a2, span2);
    			append_dev(body, t17);
    			append_dev(body, div12);
    			append_dev(body, t18);
    			append_dev(body, div15);
    			append_dev(div15, div14);
    			append_dev(div14, div13);
    			append_dev(div13, button1);
    			append_dev(body, t20);
    			append_dev(body, div17);
    			append_dev(div17, div16);
    			append_dev(div16, a3);
    			mount_component(manga0, a3, null);
    			append_dev(div16, t21);
    			append_dev(div16, a4);
    			mount_component(manga1, a4, null);
    			append_dev(div16, t22);
    			append_dev(div16, a5);
    			mount_component(manga2, a5, null);
    			append_dev(div16, t23);
    			append_dev(div16, a6);
    			mount_component(manga3, a6, null);
    			append_dev(body, t24);
    			append_dev(body, div18);
    			append_dev(body, t25);
    			append_dev(body, script);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const link0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link0_changes.$$scope = { dirty, ctx };
    			}

    			link0.$set(link0_changes);
    			const link1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link1_changes.$$scope = { dirty, ctx };
    			}

    			link1.$set(link1_changes);
    			const link2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link2_changes.$$scope = { dirty, ctx };
    			}

    			link2.$set(link2_changes);
    			const link3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link3_changes.$$scope = { dirty, ctx };
    			}

    			link3.$set(link3_changes);
    			const link4_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link4_changes.$$scope = { dirty, ctx };
    			}

    			link4.$set(link4_changes);
    			const link5_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link5_changes.$$scope = { dirty, ctx };
    			}

    			link5.$set(link5_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);
    			transition_in(link2.$$.fragment, local);
    			transition_in(link3.$$.fragment, local);
    			transition_in(link4.$$.fragment, local);
    			transition_in(link5.$$.fragment, local);
    			transition_in(manga0.$$.fragment, local);
    			transition_in(manga1.$$.fragment, local);
    			transition_in(manga2.$$.fragment, local);
    			transition_in(manga3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			transition_out(link2.$$.fragment, local);
    			transition_out(link3.$$.fragment, local);
    			transition_out(link4.$$.fragment, local);
    			transition_out(link5.$$.fragment, local);
    			transition_out(manga0.$$.fragment, local);
    			transition_out(manga1.$$.fragment, local);
    			transition_out(manga2.$$.fragment, local);
    			transition_out(manga3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			destroy_component(link0);
    			destroy_component(link1);
    			destroy_component(link2);
    			destroy_component(link3);
    			destroy_component(link4);
    			destroy_component(link5);
    			destroy_component(manga0);
    			destroy_component(manga1);
    			destroy_component(manga2);
    			destroy_component(manga3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Japanliterature> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Japanliterature", $$slots, []);
    	$$self.$capture_state = () => ({ Router, Link, Route, Manga: Literature });
    	return [];
    }

    class Japanliterature extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Japanliterature",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\LiteraturePage.svelte generated by Svelte v3.22.2 */
    const file$4 = "src\\LiteraturePage.svelte";

    // (9:12) <Link to="/">
    function create_default_slot_7(ctx) {
    	let a;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			img = element("img");
    			attr_dev(img, "class", "object-left-top bg-gray-400 w-20 h-20");
    			if (img.src !== (img_src_value = "https://i.ibb.co/1n212y8/Ignat-Japan.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Ignat-Japan");
    			attr_dev(img, "border", "0");
    			add_location(img, file$4, 10, 20, 482);
    			attr_dev(a, "href", "#");
    			add_location(a, file$4, 9, 16, 448);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(9:12) <Link to=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (30:28) <Link to="Register">
    function create_default_slot_6(ctx) {
    	let a;
    	let span;

    	const block = {
    		c: function create() {
    			a = element("a");
    			span = element("span");
    			span.textContent = "Регистрация";
    			attr_dev(span, "class", "text-white underline");
    			add_location(span, file$4, 30, 44, 1956);
    			attr_dev(a, "href", "#");
    			add_location(a, file$4, 30, 32, 1944);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(30:28) <Link to=\\\"Register\\\">",
    		ctx
    	});

    	return block;
    }

    // (39:28) <Link to="Login">
    function create_default_slot_5$2(ctx) {
    	let a;
    	let span;

    	const block = {
    		c: function create() {
    			a = element("a");
    			span = element("span");
    			span.textContent = "Войти";
    			attr_dev(span, "class", "text-white underline ml-6");
    			add_location(span, file$4, 39, 44, 2377);
    			attr_dev(a, "href", "#");
    			add_location(a, file$4, 39, 32, 2365);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$2.name,
    		type: "slot",
    		source: "(39:28) <Link to=\\\"Login\\\">",
    		ctx
    	});

    	return block;
    }

    // (52:28) <Link to="Mainprofile">
    function create_default_slot_4$2(ctx) {
    	let a;
    	let i;
    	let t;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			t = text("Profile");
    			attr_dev(i, "class", "fa fa-user fa-fw");
    			add_location(i, file$4, 52, 143, 3682);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "p-2 hover:bg-gray-800 text-white text-sm no-underline hover:no-underline block text-center");
    			add_location(a, file$4, 52, 32, 3571);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    			append_dev(a, t);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$2.name,
    		type: "slot",
    		source: "(52:28) <Link to=\\\"Mainprofile\\\">",
    		ctx
    	});

    	return block;
    }

    // (69:16) <Link to="/">
    function create_default_slot_3$2(ctx) {
    	let a;
    	let i;
    	let span;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			span = element("span");
    			span.textContent = "Главное меню";
    			attr_dev(i, "class", "fas fa-home pr-0 ml-4 md:ml-0 md:pr-3");
    			add_location(i, file$4, 70, 24, 4845);
    			attr_dev(span, "class", "pb-1 md:pb-0 text-xs md:text-base  md:text-white block md:inline-block");
    			add_location(span, file$4, 70, 77, 4898);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "block py-1 md:py-3 pl-1 align-middle text-white no-underline hover:text-white hover:border-pink-500");
    			add_location(a, file$4, 69, 20, 4699);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    			append_dev(a, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$2.name,
    		type: "slot",
    		source: "(69:16) <Link to=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (76:16) <Link to="Japanliterature">
    function create_default_slot_2$2(ctx) {
    	let a;
    	let i;
    	let span;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			span = element("span");
    			span.textContent = "Японская литература";
    			attr_dev(i, "class", "fa fa-book pr-0 md:pr-3 ml-6 md:ml-0");
    			add_location(i, file$4, 77, 24, 5341);
    			attr_dev(span, "class", "pb-1 md:pb-0 text-xs md:text-base  md:text-white block md:inline-block");
    			add_location(span, file$4, 77, 76, 5393);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "block py-1 md:py-3 pl-1 align-middle text-white no-underline hover:text-white hover:border-purple-500");
    			add_location(a, file$4, 76, 20, 5193);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    			append_dev(a, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$2.name,
    		type: "slot",
    		source: "(76:16) <Link to=\\\"Japanliterature\\\">",
    		ctx
    	});

    	return block;
    }

    // (143:28) <Link to="Register">
    function create_default_slot_1$2(ctx) {
    	let a;
    	let span;

    	const block = {
    		c: function create() {
    			a = element("a");
    			span = element("span");
    			span.textContent = "зарегистрируйтесь";
    			attr_dev(span, "class", "underline");
    			add_location(span, file$4, 143, 44, 10405);
    			attr_dev(a, "href", "#");
    			add_location(a, file$4, 143, 32, 10393);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(143:28) <Link to=\\\"Register\\\">",
    		ctx
    	});

    	return block;
    }

    // (147:28) <Link to="Login">
    function create_default_slot$3(ctx) {
    	let a;
    	let span;

    	const block = {
    		c: function create() {
    			a = element("a");
    			span = element("span");
    			span.textContent = "войдите";
    			attr_dev(span, "class", "underline");
    			add_location(span, file$4, 147, 44, 10620);
    			attr_dev(a, "href", "#");
    			add_location(a, file$4, 147, 32, 10608);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(147:28) <Link to=\\\"Login\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let body;
    	let nav;
    	let div9;
    	let div0;
    	let t0;
    	let div2;
    	let span0;
    	let input0;
    	let t1;
    	let div1;
    	let svg0;
    	let path0;
    	let t2;
    	let div8;
    	let ul0;
    	let li0;
    	let div3;
    	let p0;
    	let t3;
    	let li1;
    	let div4;
    	let p1;
    	let t4;
    	let ul1;
    	let li2;
    	let div7;
    	let button0;
    	let span1;
    	let i0;
    	let t5;
    	let svg1;
    	let path1;
    	let t6;
    	let div6;
    	let input1;
    	let t7;
    	let t8;
    	let a0;
    	let i1;
    	let t9;
    	let t10;
    	let div5;
    	let t11;
    	let a1;
    	let i2;
    	let t12;
    	let t13;
    	let div11;
    	let div10;
    	let ul2;
    	let li3;
    	let t14;
    	let li4;
    	let t15;
    	let li5;
    	let a2;
    	let i3;
    	let span2;
    	let t17;
    	let div12;
    	let t18;
    	let div24;
    	let div23;
    	let div13;
    	let h30;
    	let t20;
    	let div20;
    	let div14;
    	let t21;
    	let div19;
    	let div15;
    	let p2;
    	let t23;
    	let div16;
    	let p3;
    	let t25;
    	let div17;
    	let p4;
    	let t27;
    	let div18;
    	let p5;
    	let t29;
    	let div21;
    	let h31;
    	let t31;
    	let div22;
    	let p6;
    	let t33;
    	let div35;
    	let div34;
    	let div25;
    	let t35;
    	let div33;
    	let div28;
    	let div26;
    	let i4;
    	let t36;
    	let div27;
    	let t38;
    	let div32;
    	let div29;
    	let input2;
    	let t39;
    	let div30;
    	let p7;
    	let t40;
    	let t41;
    	let t42;
    	let div31;
    	let button1;
    	let t44;
    	let div43;
    	let div42;
    	let div41;
    	let div37;
    	let div36;
    	let i5;
    	let t45;
    	let div40;
    	let div38;
    	let p8;
    	let t47;
    	let p9;
    	let t49;
    	let p10;
    	let t51;
    	let div39;
    	let p11;
    	let t53;
    	let div44;
    	let t54;
    	let script;
    	let current;

    	const link0 = new Link({
    			props: {
    				to: "/",
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link1 = new Link({
    			props: {
    				to: "Register",
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link2 = new Link({
    			props: {
    				to: "Login",
    				$$slots: { default: [create_default_slot_5$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link3 = new Link({
    			props: {
    				to: "Mainprofile",
    				$$slots: { default: [create_default_slot_4$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link4 = new Link({
    			props: {
    				to: "/",
    				$$slots: { default: [create_default_slot_3$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link5 = new Link({
    			props: {
    				to: "Japanliterature",
    				$$slots: { default: [create_default_slot_2$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link6 = new Link({
    			props: {
    				to: "Register",
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link7 = new Link({
    			props: {
    				to: "Login",
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			body = element("body");
    			nav = element("nav");
    			div9 = element("div");
    			div0 = element("div");
    			create_component(link0.$$.fragment);
    			t0 = space();
    			div2 = element("div");
    			span0 = element("span");
    			input0 = element("input");
    			t1 = space();
    			div1 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t2 = space();
    			div8 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			div3 = element("div");
    			p0 = element("p");
    			create_component(link1.$$.fragment);
    			t3 = space();
    			li1 = element("li");
    			div4 = element("div");
    			p1 = element("p");
    			create_component(link2.$$.fragment);
    			t4 = space();
    			ul1 = element("ul");
    			li2 = element("li");
    			div7 = element("div");
    			button0 = element("button");
    			span1 = element("span");
    			i0 = element("i");
    			t5 = text(" Привет, пользователь ");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t6 = space();
    			div6 = element("div");
    			input1 = element("input");
    			t7 = space();
    			create_component(link3.$$.fragment);
    			t8 = space();
    			a0 = element("a");
    			i1 = element("i");
    			t9 = text(" Settings");
    			t10 = space();
    			div5 = element("div");
    			t11 = space();
    			a1 = element("a");
    			i2 = element("i");
    			t12 = text(" Log Out");
    			t13 = space();
    			div11 = element("div");
    			div10 = element("div");
    			ul2 = element("ul");
    			li3 = element("li");
    			create_component(link4.$$.fragment);
    			t14 = space();
    			li4 = element("li");
    			create_component(link5.$$.fragment);
    			t15 = space();
    			li5 = element("li");
    			a2 = element("a");
    			i3 = element("i");
    			span2 = element("span");
    			span2.textContent = "Analytics";
    			t17 = space();
    			div12 = element("div");
    			t18 = space();
    			div24 = element("div");
    			div23 = element("div");
    			div13 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Название";
    			t20 = space();
    			div20 = element("div");
    			div14 = element("div");
    			t21 = space();
    			div19 = element("div");
    			div15 = element("div");
    			p2 = element("p");
    			p2.textContent = "Автор:";
    			t23 = space();
    			div16 = element("div");
    			p3 = element("p");
    			p3.textContent = "Жанр:";
    			t25 = space();
    			div17 = element("div");
    			p4 = element("p");
    			p4.textContent = "Год:";
    			t27 = space();
    			div18 = element("div");
    			p5 = element("p");
    			p5.textContent = "Метки:";
    			t29 = space();
    			div21 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Описание";
    			t31 = space();
    			div22 = element("div");
    			p6 = element("p");
    			p6.textContent = "Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-то\r\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-то\r\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-то\r\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т\r\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т\r\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т\r\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т\r\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т\r\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т\r\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т\r\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т\r\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т\r\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т\r\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т\r\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т\r\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т\r\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т\r\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т";
    			t33 = space();
    			div35 = element("div");
    			div34 = element("div");
    			div25 = element("div");
    			div25.textContent = "Новый комментарий:";
    			t35 = space();
    			div33 = element("div");
    			div28 = element("div");
    			div26 = element("div");
    			i4 = element("i");
    			t36 = space();
    			div27 = element("div");
    			div27.textContent = "Имя";
    			t38 = space();
    			div32 = element("div");
    			div29 = element("div");
    			input2 = element("input");
    			t39 = space();
    			div30 = element("div");
    			p7 = element("p");
    			t40 = text("Чтобы написать комментарии,\r\n                            ");
    			create_component(link6.$$.fragment);
    			t41 = text("\r\n                            или\r\n                            ");
    			create_component(link7.$$.fragment);
    			t42 = space();
    			div31 = element("div");
    			button1 = element("button");
    			button1.textContent = "Отправить";
    			t44 = space();
    			div43 = element("div");
    			div42 = element("div");
    			div41 = element("div");
    			div37 = element("div");
    			div36 = element("div");
    			i5 = element("i");
    			t45 = space();
    			div40 = element("div");
    			div38 = element("div");
    			p8 = element("p");
    			p8.textContent = "Имя,";
    			t47 = space();
    			p9 = element("p");
    			p9.textContent = "Дата,";
    			t49 = space();
    			p10 = element("p");
    			p10.textContent = "Время";
    			t51 = space();
    			div39 = element("div");
    			p11 = element("p");
    			p11.textContent = "то-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-то";
    			t53 = space();
    			div44 = element("div");
    			t54 = space();
    			script = element("script");
    			script.textContent = "/*Toggle dropdown list*/\r\n    function toggleDD(myDropMenu) {\r\n        document.getElementById(myDropMenu).classList.toggle(\"invisible\");\r\n    }\r\n    /*Filter dropdown options*/\r\n    function filterDD(myDropMenu, myDropMenuSearch) {\r\n        var input, filter, ul, li, a, i;\r\n        input = document.getElementById(myDropMenuSearch);\r\n        filter = input.value.toUpperCase();\r\n        div = document.getElementById(myDropMenu);\r\n        a = div.getElementsByTagName(\"a\");\r\n        for (i = 0; i < a.length; i++) {\r\n            if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {\r\n                a[i].style.display = \"\";\r\n            } else {\r\n                a[i].style.display = \"none\";\r\n            }\r\n        }\r\n    }\r\n    // Close the dropdown menu if the user clicks outside of it\r\n    window.onclick = function(event) {\r\n        if (!event.target.matches('.drop-button') && !event.target.matches('.drop-search')) {\r\n            var dropdowns = document.getElementsByClassName(\"dropdownlist\");\r\n            for (var i = 0; i < dropdowns.length; i++) {\r\n                var openDropdown = dropdowns[i];\r\n                if (!openDropdown.classList.contains('invisible')) {\r\n                    openDropdown.classList.add('invisible');\r\n                }\r\n            }\r\n        }\r\n    }";
    			attr_dev(div0, "class", "flex flex-shrink md:w-1/3 justify-center md:justify-start text-white");
    			add_location(div0, file$4, 7, 8, 321);
    			attr_dev(input0, "type", "search");
    			attr_dev(input0, "placeholder", "Search");
    			attr_dev(input0, "class", "w-full bg-gray-800 text-sm text-white transition border border-transparent focus:outline-none focus:border-gray-700 rounded py-1 px-2 pl-10 appearance-none leading-normal");
    			add_location(input0, file$4, 16, 24, 859);
    			attr_dev(path0, "d", "M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z");
    			add_location(path0, file$4, 19, 32, 1357);
    			attr_dev(svg0, "class", "fill-current pointer-events-none text-white w-4 h-4");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 20 20");
    			add_location(svg0, file$4, 18, 28, 1203);
    			attr_dev(div1, "class", "absolute search-icon");
    			set_style(div1, "top", ".5rem");
    			set_style(div1, "left", ".8rem");
    			add_location(div1, file$4, 17, 24, 1106);
    			attr_dev(span0, "class", "relative w-full");
    			add_location(span0, file$4, 15, 28, 803);
    			attr_dev(div2, "class", "flex flex-1 w-full justify-center md:justify-start text-white px-2 mr-0 md:mr-20");
    			add_location(div2, file$4, 14, 8, 679);
    			attr_dev(p0, "class", "text-white");
    			add_location(p0, file$4, 28, 24, 1838);
    			attr_dev(div3, "class", "relative inline-block");
    			add_location(div3, file$4, 27, 20, 1777);
    			attr_dev(li0, "class", "flex-none md:mr-3");
    			add_location(li0, file$4, 26, 16, 1725);
    			attr_dev(p1, "class", "text-white");
    			add_location(p1, file$4, 37, 24, 2262);
    			attr_dev(div4, "class", "relative inline-block");
    			add_location(div4, file$4, 36, 20, 2201);
    			attr_dev(li1, "class", "flex-none md:mr-3");
    			add_location(li1, file$4, 35, 16, 2149);
    			attr_dev(ul0, "class", "pr-1");
    			add_location(ul0, file$4, 25, 12, 1690);
    			attr_dev(i0, "class", "fa fa-user");
    			add_location(i0, file$4, 48, 135, 2924);
    			attr_dev(span1, "class", "pr-2");
    			add_location(span1, file$4, 48, 116, 2905);
    			attr_dev(path1, "d", "M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z");
    			add_location(path1, file$4, 48, 282, 3071);
    			attr_dev(svg1, "class", "h-3 fill-current inline");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 20 20");
    			add_location(svg1, file$4, 48, 190, 2979);
    			attr_dev(button0, "onclick", "toggleDD('myDropdown')");
    			attr_dev(button0, "class", "drop-button text-white focus:outline-none");
    			add_location(button0, file$4, 48, 24, 2813);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "drop-search p-2 text-gray-600");
    			attr_dev(input1, "placeholder", "Search..");
    			attr_dev(input1, "id", "myInput");
    			attr_dev(input1, "onkeyup", "filterDD('myDropdown','myInput')");
    			add_location(input1, file$4, 50, 28, 3348);
    			attr_dev(i1, "class", "fa fa-cog fa-fw");
    			add_location(i1, file$4, 54, 139, 3903);
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "class", "p-2 hover:bg-gray-800 text-white text-sm no-underline hover:no-underline block text-center");
    			add_location(a0, file$4, 54, 28, 3792);
    			attr_dev(div5, "class", "border border-gray-800");
    			add_location(div5, file$4, 55, 28, 3977);
    			attr_dev(i2, "class", "fas fa-sign-out-alt fa-fw");
    			add_location(i2, file$4, 56, 139, 4160);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "class", "p-2 hover:bg-gray-800 text-white text-sm no-underline hover:no-underline block text-center");
    			add_location(a1, file$4, 56, 28, 4049);
    			attr_dev(div6, "id", "myDropdown");
    			attr_dev(div6, "class", "dropdownlist absolute bg-gray-900 text-white right-0 mt-3 p-3 overflow-auto z-30 invisible");
    			add_location(div6, file$4, 49, 24, 3198);
    			attr_dev(div7, "class", "relative inline-block");
    			add_location(div7, file$4, 47, 20, 2752);
    			attr_dev(li2, "class", "flex-1 md:flex-none md:mr-3 text-right");
    			add_location(li2, file$4, 46, 16, 2679);
    			attr_dev(ul1, "class", "list-reset flex justify-between flex-1 md:flex-none items-center");
    			add_location(ul1, file$4, 45, 12, 2584);
    			attr_dev(div8, "class", "flex w-full pt-2 content-center justify-between md:w-1/3 md:justify-end");
    			add_location(div8, file$4, 24, 8, 1591);
    			attr_dev(div9, "class", "flex flex-wrap items-center");
    			add_location(div9, file$4, 6, 4, 270);
    			attr_dev(nav, "class", "bg-gray-900 pt-2 md:pt-1 pb-1 px-1 mt-0 h-auto fixed w-full z-20 top-0 ");
    			add_location(nav, file$4, 5, 0, 179);
    			attr_dev(li3, "class", "flex-1 md:flex-none md:mr-3");
    			add_location(li3, file$4, 67, 12, 4606);
    			attr_dev(li4, "class", "flex-1 md:flex-none md:mr-3");
    			add_location(li4, file$4, 74, 12, 5086);
    			attr_dev(i3, "class", "fas fa-chart-area pr-0 ml-4 md:pr-3");
    			add_location(i3, file$4, 83, 20, 5790);
    			attr_dev(span2, "class", "pb-1 md:pb-0 text-xs md:text-base text-white md:text-white block md:inline-block");
    			add_location(span2, file$4, 83, 71, 5841);
    			attr_dev(a2, "href", "#");
    			attr_dev(a2, "class", "block py-1 md:py-3 pl-1 align-middle text-white no-underline hover:text-white hover:border-purple-500");
    			add_location(a2, file$4, 82, 16, 5646);
    			attr_dev(li5, "class", "flex-1 md:flex-none md:mr-3");
    			add_location(li5, file$4, 81, 12, 5588);
    			attr_dev(ul2, "class", "list-reset flex justify-between flex-1");
    			add_location(ul2, file$4, 66, 8, 4541);
    			attr_dev(div10, "class", "flex w-full content-center justify-between md:justify-end");
    			add_location(div10, file$4, 65, 4, 4460);
    			attr_dev(div11, "class", "pl-10 pr-10 bg-red-900 flex flex-wrap items-center fixed w-full bottom-0 md:bottom-auto");
    			add_location(div11, file$4, 64, 0, 4353);
    			attr_dev(div12, "class", "bg-gray-300 h-20 md:h-16 w-full");
    			add_location(div12, file$4, 89, 0, 6030);
    			attr_dev(h30, "class", "text-3xl text-white font-bold leading-none mb-3 text-center bg-red-900 rounded-lg shadow-lg");
    			add_location(h30, file$4, 92, 22, 6245);
    			attr_dev(div13, "class", "");
    			add_location(div13, file$4, 92, 8, 6231);
    			attr_dev(div14, "class", " bg-gray-600 w-64 h-64");
    			add_location(div14, file$4, 94, 12, 6424);
    			attr_dev(p2, "class", "text-gray-600 mb-8 ");
    			add_location(p2, file$4, 96, 34, 6545);
    			attr_dev(div15, "class", "ml-4");
    			add_location(div15, file$4, 96, 16, 6527);
    			attr_dev(p3, "class", "text-gray-600 mb-8 ");
    			add_location(p3, file$4, 97, 34, 6628);
    			attr_dev(div16, "class", "ml-4");
    			add_location(div16, file$4, 97, 16, 6610);
    			attr_dev(p4, "class", "text-gray-600 mb-8 ");
    			add_location(p4, file$4, 98, 34, 6710);
    			attr_dev(div17, "class", "ml-4");
    			add_location(div17, file$4, 98, 16, 6692);
    			attr_dev(p5, "class", "text-gray-600 mb-8 ");
    			add_location(p5, file$4, 99, 34, 6791);
    			attr_dev(div18, "class", "ml-4");
    			add_location(div18, file$4, 99, 16, 6773);
    			attr_dev(div19, "class", "w-full sm:w-1/1");
    			add_location(div19, file$4, 95, 12, 6480);
    			attr_dev(div20, "class", "flex flex-row mb-4");
    			add_location(div20, file$4, 93, 8, 6378);
    			attr_dev(h31, "class", "text-3xl text-white font-bold leading-none mb-3 text-center bg-red-900 rounded-lg shadow-lg");
    			add_location(h31, file$4, 102, 22, 6898);
    			attr_dev(div21, "class", "");
    			add_location(div21, file$4, 102, 8, 6884);
    			attr_dev(p6, "class", "leading-normal slide-in-bottom-subtitle");
    			add_location(p6, file$4, 104, 12, 7059);
    			attr_dev(div22, "class", "");
    			add_location(div22, file$4, 103, 8, 7031);
    			attr_dev(div23, "class", "bg-gray-100 border-2 border-black p-4 h-full md:h-full rounded-lg shadow-lg");
    			add_location(div23, file$4, 91, 4, 6132);
    			attr_dev(div24, "class", "flex-1 bg-gray-300 p-1 md:p-4");
    			add_location(div24, file$4, 90, 0, 6083);
    			attr_dev(div25, "class", "mt-1 mb-1 ml-4 md:ml-4");
    			add_location(div25, file$4, 127, 12, 9340);
    			attr_dev(i4, "class", "fas fa-user fa-7x ml-4 mt-2");
    			add_location(i4, file$4, 131, 24, 9575);
    			attr_dev(div26, "class", "bg-gray-600 w-32 h-32 ml-4 ");
    			add_location(div26, file$4, 130, 20, 9508);
    			attr_dev(div27, "class", "ml-16 mt-1 ");
    			add_location(div27, file$4, 133, 20, 9668);
    			attr_dev(div28, "class", "");
    			add_location(div28, file$4, 129, 16, 9472);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "placeholder", "Оставьте комментарий");
    			attr_dev(input2, "class", " w-full ml-4 mr-2 bg-gray-100 border-2 border-gray-500 p-0 md:p-2 h-32 w-auto rounded-lg shadow-lg text-sm text-black transition border border-transparent focus:outline-none focus:border-gray-700 appearance-none leading-normal");
    			add_location(input2, file$4, 137, 24, 9839);
    			attr_dev(div29, "class", "flex flex-row");
    			add_location(div29, file$4, 136, 20, 9786);
    			attr_dev(p7, "class", "mt-1");
    			add_location(p7, file$4, 140, 24, 10236);
    			attr_dev(div30, "class", "flex flex-row ml-4");
    			add_location(div30, file$4, 139, 20, 10178);
    			attr_dev(button1, "class", "w-auto mb-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline");
    			attr_dev(button1, "type", "button");
    			add_location(button1, file$4, 152, 24, 10847);
    			attr_dev(div31, "class", "mr-2 mt-2 md:mt-2 text-right");
    			add_location(div31, file$4, 151, 20, 10779);
    			attr_dev(div32, "class", "w-full");
    			add_location(div32, file$4, 135, 16, 9744);
    			attr_dev(div33, "class", "w-full md:flex-row md:flex");
    			add_location(div33, file$4, 128, 12, 9414);
    			attr_dev(div34, "class", "bg-gray-100 border-2 border-black h-full md:h-full w-full rounded-lg shadow-lg");
    			add_location(div34, file$4, 126, 8, 9234);
    			attr_dev(div35, "class", "flex-1 bg-gray-300 p-1 md:p-4");
    			add_location(div35, file$4, 125, 4, 9181);
    			attr_dev(i5, "class", "fas fa-user fa-7x ml-4 mt-2");
    			add_location(i5, file$4, 165, 20, 11463);
    			attr_dev(div36, "class", "bg-gray-600 w-32 h-32");
    			add_location(div36, file$4, 164, 16, 11406);
    			attr_dev(div37, "class", "mt-6");
    			add_location(div37, file$4, 163, 12, 11370);
    			attr_dev(p8, "class", "md:-ml-32 -ml-32");
    			add_location(p8, file$4, 170, 20, 11651);
    			attr_dev(p9, "class", "ml-8 md:ml-8");
    			add_location(p9, file$4, 171, 20, 11709);
    			attr_dev(p10, "class", "ml-8 md:ml-8");
    			add_location(p10, file$4, 172, 20, 11764);
    			attr_dev(div38, "class", "flex flex-row");
    			add_location(div38, file$4, 169, 16, 11602);
    			add_location(p11, file$4, 175, 20, 12109);
    			attr_dev(div39, "class", "w-full ml-2 md:ml-2 mr-0 md:mr-2 bg-gray-100 border-2 border-gray-500 p-2 h-32 w-auto rounded-lg shadow-lg text-sm text-black transition border border-transparent focus:outline-none focus:border-gray-700 appearance-none leading-normal");
    			add_location(div39, file$4, 174, 16, 11839);
    			attr_dev(div40, "class", "w-full");
    			add_location(div40, file$4, 168, 12, 11564);
    			attr_dev(div41, "class", "w-full flex flex-row");
    			add_location(div41, file$4, 162, 8, 11322);
    			attr_dev(div42, "class", "bg-gray-100 border-2 border-black p-4 h-full md:h-full rounded-lg shadow-lg");
    			add_location(div42, file$4, 161, 4, 11223);
    			attr_dev(div43, "class", "flex-1 bg-gray-300 p-1 md:p-4");
    			add_location(div43, file$4, 160, 0, 11174);
    			attr_dev(div44, "class", "h-20 md:h-12 w-full bg-gray-300");
    			add_location(div44, file$4, 181, 0, 12245);
    			add_location(script, file$4, 182, 0, 12298);
    			attr_dev(body, "class", "mt-20 font-sans antialiased text-gray-900 leading-normal tracking-wider bg-cover");
    			add_location(body, file$4, 4, 0, 82);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, nav);
    			append_dev(nav, div9);
    			append_dev(div9, div0);
    			mount_component(link0, div0, null);
    			append_dev(div9, t0);
    			append_dev(div9, div2);
    			append_dev(div2, span0);
    			append_dev(span0, input0);
    			append_dev(span0, t1);
    			append_dev(span0, div1);
    			append_dev(div1, svg0);
    			append_dev(svg0, path0);
    			append_dev(div9, t2);
    			append_dev(div9, div8);
    			append_dev(div8, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, div3);
    			append_dev(div3, p0);
    			mount_component(link1, p0, null);
    			append_dev(ul0, t3);
    			append_dev(ul0, li1);
    			append_dev(li1, div4);
    			append_dev(div4, p1);
    			mount_component(link2, p1, null);
    			append_dev(div8, t4);
    			append_dev(div8, ul1);
    			append_dev(ul1, li2);
    			append_dev(li2, div7);
    			append_dev(div7, button0);
    			append_dev(button0, span1);
    			append_dev(span1, i0);
    			append_dev(button0, t5);
    			append_dev(button0, svg1);
    			append_dev(svg1, path1);
    			append_dev(div7, t6);
    			append_dev(div7, div6);
    			append_dev(div6, input1);
    			append_dev(div6, t7);
    			mount_component(link3, div6, null);
    			append_dev(div6, t8);
    			append_dev(div6, a0);
    			append_dev(a0, i1);
    			append_dev(a0, t9);
    			append_dev(div6, t10);
    			append_dev(div6, div5);
    			append_dev(div6, t11);
    			append_dev(div6, a1);
    			append_dev(a1, i2);
    			append_dev(a1, t12);
    			append_dev(body, t13);
    			append_dev(body, div11);
    			append_dev(div11, div10);
    			append_dev(div10, ul2);
    			append_dev(ul2, li3);
    			mount_component(link4, li3, null);
    			append_dev(ul2, t14);
    			append_dev(ul2, li4);
    			mount_component(link5, li4, null);
    			append_dev(ul2, t15);
    			append_dev(ul2, li5);
    			append_dev(li5, a2);
    			append_dev(a2, i3);
    			append_dev(a2, span2);
    			append_dev(body, t17);
    			append_dev(body, div12);
    			append_dev(body, t18);
    			append_dev(body, div24);
    			append_dev(div24, div23);
    			append_dev(div23, div13);
    			append_dev(div13, h30);
    			append_dev(div23, t20);
    			append_dev(div23, div20);
    			append_dev(div20, div14);
    			append_dev(div20, t21);
    			append_dev(div20, div19);
    			append_dev(div19, div15);
    			append_dev(div15, p2);
    			append_dev(div19, t23);
    			append_dev(div19, div16);
    			append_dev(div16, p3);
    			append_dev(div19, t25);
    			append_dev(div19, div17);
    			append_dev(div17, p4);
    			append_dev(div19, t27);
    			append_dev(div19, div18);
    			append_dev(div18, p5);
    			append_dev(div23, t29);
    			append_dev(div23, div21);
    			append_dev(div21, h31);
    			append_dev(div23, t31);
    			append_dev(div23, div22);
    			append_dev(div22, p6);
    			append_dev(body, t33);
    			append_dev(body, div35);
    			append_dev(div35, div34);
    			append_dev(div34, div25);
    			append_dev(div34, t35);
    			append_dev(div34, div33);
    			append_dev(div33, div28);
    			append_dev(div28, div26);
    			append_dev(div26, i4);
    			append_dev(div28, t36);
    			append_dev(div28, div27);
    			append_dev(div33, t38);
    			append_dev(div33, div32);
    			append_dev(div32, div29);
    			append_dev(div29, input2);
    			append_dev(div32, t39);
    			append_dev(div32, div30);
    			append_dev(div30, p7);
    			append_dev(p7, t40);
    			mount_component(link6, p7, null);
    			append_dev(p7, t41);
    			mount_component(link7, p7, null);
    			append_dev(div32, t42);
    			append_dev(div32, div31);
    			append_dev(div31, button1);
    			append_dev(body, t44);
    			append_dev(body, div43);
    			append_dev(div43, div42);
    			append_dev(div42, div41);
    			append_dev(div41, div37);
    			append_dev(div37, div36);
    			append_dev(div36, i5);
    			append_dev(div41, t45);
    			append_dev(div41, div40);
    			append_dev(div40, div38);
    			append_dev(div38, p8);
    			append_dev(div38, t47);
    			append_dev(div38, p9);
    			append_dev(div38, t49);
    			append_dev(div38, p10);
    			append_dev(div40, t51);
    			append_dev(div40, div39);
    			append_dev(div39, p11);
    			append_dev(body, t53);
    			append_dev(body, div44);
    			append_dev(body, t54);
    			append_dev(body, script);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const link0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link0_changes.$$scope = { dirty, ctx };
    			}

    			link0.$set(link0_changes);
    			const link1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link1_changes.$$scope = { dirty, ctx };
    			}

    			link1.$set(link1_changes);
    			const link2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link2_changes.$$scope = { dirty, ctx };
    			}

    			link2.$set(link2_changes);
    			const link3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link3_changes.$$scope = { dirty, ctx };
    			}

    			link3.$set(link3_changes);
    			const link4_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link4_changes.$$scope = { dirty, ctx };
    			}

    			link4.$set(link4_changes);
    			const link5_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link5_changes.$$scope = { dirty, ctx };
    			}

    			link5.$set(link5_changes);
    			const link6_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link6_changes.$$scope = { dirty, ctx };
    			}

    			link6.$set(link6_changes);
    			const link7_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link7_changes.$$scope = { dirty, ctx };
    			}

    			link7.$set(link7_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);
    			transition_in(link2.$$.fragment, local);
    			transition_in(link3.$$.fragment, local);
    			transition_in(link4.$$.fragment, local);
    			transition_in(link5.$$.fragment, local);
    			transition_in(link6.$$.fragment, local);
    			transition_in(link7.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			transition_out(link2.$$.fragment, local);
    			transition_out(link3.$$.fragment, local);
    			transition_out(link4.$$.fragment, local);
    			transition_out(link5.$$.fragment, local);
    			transition_out(link6.$$.fragment, local);
    			transition_out(link7.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			destroy_component(link0);
    			destroy_component(link1);
    			destroy_component(link2);
    			destroy_component(link3);
    			destroy_component(link4);
    			destroy_component(link5);
    			destroy_component(link6);
    			destroy_component(link7);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LiteraturePage> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("LiteraturePage", $$slots, []);
    	$$self.$capture_state = () => ({ Router, Link, Route });
    	return [];
    }

    class LiteraturePage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LiteraturePage",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\Register.svelte generated by Svelte v3.22.2 */
    const file$5 = "src\\Register.svelte";

    // (9:12) <Link to="/">
    function create_default_slot_5$3(ctx) {
    	let a;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			img = element("img");
    			attr_dev(img, "class", "object-left-top bg-gray-400 w-20 h-20");
    			if (img.src !== (img_src_value = "https://i.ibb.co/1n212y8/Ignat-Japan.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Ignat-Japan");
    			attr_dev(img, "border", "0");
    			add_location(img, file$5, 10, 20, 593);
    			attr_dev(a, "href", "#");
    			add_location(a, file$5, 9, 16, 559);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$3.name,
    		type: "slot",
    		source: "(9:12) <Link to=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (30:28) <Link to="Register">
    function create_default_slot_4$3(ctx) {
    	let a;
    	let span;

    	const block = {
    		c: function create() {
    			a = element("a");
    			span = element("span");
    			span.textContent = "Регистрация";
    			attr_dev(span, "class", "text-white underline");
    			add_location(span, file$5, 30, 44, 2067);
    			attr_dev(a, "href", "#");
    			add_location(a, file$5, 30, 32, 2055);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$3.name,
    		type: "slot",
    		source: "(30:28) <Link to=\\\"Register\\\">",
    		ctx
    	});

    	return block;
    }

    // (39:28) <Link to="Login">
    function create_default_slot_3$3(ctx) {
    	let a;
    	let span;

    	const block = {
    		c: function create() {
    			a = element("a");
    			span = element("span");
    			span.textContent = "Войти";
    			attr_dev(span, "class", "text-white underline ml-6");
    			add_location(span, file$5, 39, 44, 2488);
    			attr_dev(a, "href", "#");
    			add_location(a, file$5, 39, 32, 2476);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$3.name,
    		type: "slot",
    		source: "(39:28) <Link to=\\\"Login\\\">",
    		ctx
    	});

    	return block;
    }

    // (52:28) <Link to="Mainprofile">
    function create_default_slot_2$3(ctx) {
    	let a;
    	let i;
    	let t;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			t = text("Profile");
    			attr_dev(i, "class", "fa fa-user fa-fw");
    			add_location(i, file$5, 52, 143, 3793);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "p-2 hover:bg-gray-800 text-white text-sm no-underline hover:no-underline block text-center");
    			add_location(a, file$5, 52, 32, 3682);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    			append_dev(a, t);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$3.name,
    		type: "slot",
    		source: "(52:28) <Link to=\\\"Mainprofile\\\">",
    		ctx
    	});

    	return block;
    }

    // (69:16) <Link to="/">
    function create_default_slot_1$3(ctx) {
    	let a;
    	let i;
    	let span;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			span = element("span");
    			span.textContent = "Главное меню";
    			attr_dev(i, "class", "fas fa-home pr-0 ml-4 md:ml-0 md:pr-3");
    			add_location(i, file$5, 70, 24, 4956);
    			attr_dev(span, "class", "pb-1 md:pb-0 text-xs md:text-base  md:text-white block md:inline-block");
    			add_location(span, file$5, 70, 77, 5009);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "block py-1 md:py-3 pl-1 align-middle text-white no-underline hover:text-white hover:border-pink-500");
    			add_location(a, file$5, 69, 20, 4810);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    			append_dev(a, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(69:16) <Link to=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (76:16) <Link to="Japanliterature">
    function create_default_slot$4(ctx) {
    	let a;
    	let i;
    	let span;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			span = element("span");
    			span.textContent = "Японская литература";
    			attr_dev(i, "class", "fa fa-book pr-0 md:pr-3 ml-6 md:ml-0");
    			add_location(i, file$5, 77, 24, 5452);
    			attr_dev(span, "class", "pb-1 md:pb-0 text-xs md:text-base  md:text-white block md:inline-block");
    			add_location(span, file$5, 77, 76, 5504);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "block py-1 md:py-3 pl-1 align-middle text-white no-underline hover:text-white hover:border-purple-500");
    			add_location(a, file$5, 76, 20, 5304);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    			append_dev(a, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(76:16) <Link to=\\\"Japanliterature\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let body;
    	let nav;
    	let div9;
    	let div0;
    	let t0;
    	let div2;
    	let span0;
    	let input0;
    	let t1;
    	let div1;
    	let svg0;
    	let path0;
    	let t2;
    	let div8;
    	let ul0;
    	let li0;
    	let div3;
    	let p0;
    	let t3;
    	let li1;
    	let div4;
    	let p1;
    	let t4;
    	let ul1;
    	let li2;
    	let div7;
    	let button0;
    	let span1;
    	let i0;
    	let t5;
    	let svg1;
    	let path1;
    	let t6;
    	let div6;
    	let input1;
    	let t7;
    	let t8;
    	let a0;
    	let i1;
    	let t9;
    	let t10;
    	let div5;
    	let t11;
    	let a1;
    	let i2;
    	let t12;
    	let t13;
    	let div11;
    	let div10;
    	let ul2;
    	let li3;
    	let t14;
    	let li4;
    	let t15;
    	let li5;
    	let a2;
    	let i3;
    	let span2;
    	let t17;
    	let div12;
    	let t18;
    	let div23;
    	let form;
    	let div15;
    	let div13;
    	let label0;
    	let t20;
    	let input2;
    	let t21;
    	let p2;
    	let t23;
    	let div14;
    	let label1;
    	let t25;
    	let input3;
    	let t26;
    	let div17;
    	let div16;
    	let label2;
    	let t28;
    	let input4;
    	let t29;
    	let div19;
    	let div18;
    	let label3;
    	let t31;
    	let input5;
    	let t32;
    	let p3;
    	let t34;
    	let div21;
    	let div20;
    	let label4;
    	let t36;
    	let input6;
    	let t37;
    	let div22;
    	let button1;
    	let t39;
    	let p4;
    	let t41;
    	let div24;
    	let t42;
    	let div25;
    	let t43;
    	let div26;
    	let t44;
    	let div27;
    	let t45;
    	let div28;
    	let t46;
    	let div29;
    	let t47;
    	let div30;
    	let t48;
    	let div31;
    	let t49;
    	let script;
    	let current;

    	const link0 = new Link({
    			props: {
    				to: "/",
    				$$slots: { default: [create_default_slot_5$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link1 = new Link({
    			props: {
    				to: "Register",
    				$$slots: { default: [create_default_slot_4$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link2 = new Link({
    			props: {
    				to: "Login",
    				$$slots: { default: [create_default_slot_3$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link3 = new Link({
    			props: {
    				to: "Mainprofile",
    				$$slots: { default: [create_default_slot_2$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link4 = new Link({
    			props: {
    				to: "/",
    				$$slots: { default: [create_default_slot_1$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link5 = new Link({
    			props: {
    				to: "Japanliterature",
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			body = element("body");
    			nav = element("nav");
    			div9 = element("div");
    			div0 = element("div");
    			create_component(link0.$$.fragment);
    			t0 = space();
    			div2 = element("div");
    			span0 = element("span");
    			input0 = element("input");
    			t1 = space();
    			div1 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t2 = space();
    			div8 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			div3 = element("div");
    			p0 = element("p");
    			create_component(link1.$$.fragment);
    			t3 = space();
    			li1 = element("li");
    			div4 = element("div");
    			p1 = element("p");
    			create_component(link2.$$.fragment);
    			t4 = space();
    			ul1 = element("ul");
    			li2 = element("li");
    			div7 = element("div");
    			button0 = element("button");
    			span1 = element("span");
    			i0 = element("i");
    			t5 = text(" Привет, пользователь ");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t6 = space();
    			div6 = element("div");
    			input1 = element("input");
    			t7 = space();
    			create_component(link3.$$.fragment);
    			t8 = space();
    			a0 = element("a");
    			i1 = element("i");
    			t9 = text(" Settings");
    			t10 = space();
    			div5 = element("div");
    			t11 = space();
    			a1 = element("a");
    			i2 = element("i");
    			t12 = text(" Log Out");
    			t13 = space();
    			div11 = element("div");
    			div10 = element("div");
    			ul2 = element("ul");
    			li3 = element("li");
    			create_component(link4.$$.fragment);
    			t14 = space();
    			li4 = element("li");
    			create_component(link5.$$.fragment);
    			t15 = space();
    			li5 = element("li");
    			a2 = element("a");
    			i3 = element("i");
    			span2 = element("span");
    			span2.textContent = "Analytics";
    			t17 = space();
    			div12 = element("div");
    			t18 = space();
    			div23 = element("div");
    			form = element("form");
    			div15 = element("div");
    			div13 = element("div");
    			label0 = element("label");
    			label0.textContent = "Имя";
    			t20 = space();
    			input2 = element("input");
    			t21 = space();
    			p2 = element("p");
    			p2.textContent = "Пожалуйста, заполните это поле.";
    			t23 = space();
    			div14 = element("div");
    			label1 = element("label");
    			label1.textContent = "Фамилия";
    			t25 = space();
    			input3 = element("input");
    			t26 = space();
    			div17 = element("div");
    			div16 = element("div");
    			label2 = element("label");
    			label2.textContent = "Логин";
    			t28 = space();
    			input4 = element("input");
    			t29 = space();
    			div19 = element("div");
    			div18 = element("div");
    			label3 = element("label");
    			label3.textContent = "Пароль";
    			t31 = space();
    			input5 = element("input");
    			t32 = space();
    			p3 = element("p");
    			p3.textContent = "Делайте длинным и сложным как хотите";
    			t34 = space();
    			div21 = element("div");
    			div20 = element("div");
    			label4 = element("label");
    			label4.textContent = "Email";
    			t36 = space();
    			input6 = element("input");
    			t37 = space();
    			div22 = element("div");
    			button1 = element("button");
    			button1.textContent = "Зарегистрироваться";
    			t39 = space();
    			p4 = element("p");
    			p4.textContent = "©2020 Acme Corp. Все права защищены.";
    			t41 = space();
    			div24 = element("div");
    			t42 = space();
    			div25 = element("div");
    			t43 = space();
    			div26 = element("div");
    			t44 = space();
    			div27 = element("div");
    			t45 = space();
    			div28 = element("div");
    			t46 = space();
    			div29 = element("div");
    			t47 = space();
    			div30 = element("div");
    			t48 = space();
    			div31 = element("div");
    			t49 = space();
    			script = element("script");
    			script.textContent = "/*Toggle dropdown list*/\r\n    function toggleDD(myDropMenu) {\r\n        document.getElementById(myDropMenu).classList.toggle(\"invisible\");\r\n    }\r\n    /*Filter dropdown options*/\r\n    function filterDD(myDropMenu, myDropMenuSearch) {\r\n        var input, filter, ul, li, a, i;\r\n        input = document.getElementById(myDropMenuSearch);\r\n        filter = input.value.toUpperCase();\r\n        div = document.getElementById(myDropMenu);\r\n        a = div.getElementsByTagName(\"a\");\r\n        for (i = 0; i < a.length; i++) {\r\n            if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {\r\n                a[i].style.display = \"\";\r\n            } else {\r\n                a[i].style.display = \"none\";\r\n            }\r\n        }\r\n    }\r\n    // Close the dropdown menu if the user clicks outside of it\r\n    window.onclick = function(event) {\r\n        if (!event.target.matches('.drop-button') && !event.target.matches('.drop-search')) {\r\n            var dropdowns = document.getElementsByClassName(\"dropdownlist\");\r\n            for (var i = 0; i < dropdowns.length; i++) {\r\n                var openDropdown = dropdowns[i];\r\n                if (!openDropdown.classList.contains('invisible')) {\r\n                    openDropdown.classList.add('invisible');\r\n                }\r\n            }\r\n        }\r\n    }";
    			attr_dev(div0, "class", "flex flex-shrink md:w-1/3 justify-center md:justify-start text-white");
    			add_location(div0, file$5, 7, 8, 432);
    			attr_dev(input0, "type", "search");
    			attr_dev(input0, "placeholder", "Search");
    			attr_dev(input0, "class", "w-full bg-gray-800 text-sm text-white transition border border-transparent focus:outline-none focus:border-gray-700 rounded py-1 px-2 pl-10 appearance-none leading-normal");
    			add_location(input0, file$5, 16, 24, 970);
    			attr_dev(path0, "d", "M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z");
    			add_location(path0, file$5, 19, 32, 1468);
    			attr_dev(svg0, "class", "fill-current pointer-events-none text-white w-4 h-4");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 20 20");
    			add_location(svg0, file$5, 18, 28, 1314);
    			attr_dev(div1, "class", "absolute search-icon");
    			set_style(div1, "top", ".5rem");
    			set_style(div1, "left", ".8rem");
    			add_location(div1, file$5, 17, 24, 1217);
    			attr_dev(span0, "class", "relative w-full");
    			add_location(span0, file$5, 15, 28, 914);
    			attr_dev(div2, "class", "flex flex-1 w-full justify-center md:justify-start text-white px-2 mr-0 md:mr-20");
    			add_location(div2, file$5, 14, 8, 790);
    			attr_dev(p0, "class", "text-white");
    			add_location(p0, file$5, 28, 24, 1949);
    			attr_dev(div3, "class", "relative inline-block");
    			add_location(div3, file$5, 27, 20, 1888);
    			attr_dev(li0, "class", "flex-none md:mr-3");
    			add_location(li0, file$5, 26, 16, 1836);
    			attr_dev(p1, "class", "text-white");
    			add_location(p1, file$5, 37, 24, 2373);
    			attr_dev(div4, "class", "relative inline-block");
    			add_location(div4, file$5, 36, 20, 2312);
    			attr_dev(li1, "class", "flex-none md:mr-3");
    			add_location(li1, file$5, 35, 16, 2260);
    			attr_dev(ul0, "class", "pr-1");
    			add_location(ul0, file$5, 25, 12, 1801);
    			attr_dev(i0, "class", "fa fa-user");
    			add_location(i0, file$5, 48, 135, 3035);
    			attr_dev(span1, "class", "pr-2");
    			add_location(span1, file$5, 48, 116, 3016);
    			attr_dev(path1, "d", "M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z");
    			add_location(path1, file$5, 48, 282, 3182);
    			attr_dev(svg1, "class", "h-3 fill-current inline");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 20 20");
    			add_location(svg1, file$5, 48, 190, 3090);
    			attr_dev(button0, "onclick", "toggleDD('myDropdown')");
    			attr_dev(button0, "class", "drop-button text-white focus:outline-none");
    			add_location(button0, file$5, 48, 24, 2924);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "drop-search p-2 text-gray-600");
    			attr_dev(input1, "placeholder", "Search..");
    			attr_dev(input1, "id", "myInput");
    			attr_dev(input1, "onkeyup", "filterDD('myDropdown','myInput')");
    			add_location(input1, file$5, 50, 28, 3459);
    			attr_dev(i1, "class", "fa fa-cog fa-fw");
    			add_location(i1, file$5, 54, 139, 4014);
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "class", "p-2 hover:bg-gray-800 text-white text-sm no-underline hover:no-underline block text-center");
    			add_location(a0, file$5, 54, 28, 3903);
    			attr_dev(div5, "class", "border border-gray-800");
    			add_location(div5, file$5, 55, 28, 4088);
    			attr_dev(i2, "class", "fas fa-sign-out-alt fa-fw");
    			add_location(i2, file$5, 56, 139, 4271);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "class", "p-2 hover:bg-gray-800 text-white text-sm no-underline hover:no-underline block text-center");
    			add_location(a1, file$5, 56, 28, 4160);
    			attr_dev(div6, "id", "myDropdown");
    			attr_dev(div6, "class", "dropdownlist absolute bg-gray-900 text-white right-0 mt-3 p-3 overflow-auto z-30 invisible");
    			add_location(div6, file$5, 49, 24, 3309);
    			attr_dev(div7, "class", "relative inline-block");
    			add_location(div7, file$5, 47, 20, 2863);
    			attr_dev(li2, "class", "flex-1 md:flex-none md:mr-3 text-right");
    			add_location(li2, file$5, 46, 16, 2790);
    			attr_dev(ul1, "class", "list-reset flex justify-between flex-1 md:flex-none items-center");
    			add_location(ul1, file$5, 45, 12, 2695);
    			attr_dev(div8, "class", "flex w-full pt-2 content-center justify-between md:w-1/3 md:justify-end");
    			add_location(div8, file$5, 24, 8, 1702);
    			attr_dev(div9, "class", "flex flex-wrap items-center");
    			add_location(div9, file$5, 6, 4, 381);
    			attr_dev(nav, "class", "bg-gray-900 pt-2 md:pt-1 pb-1 px-1 mt-0 h-auto fixed w-full z-20 top-0 ");
    			add_location(nav, file$5, 5, 0, 290);
    			attr_dev(li3, "class", "flex-1 md:flex-none md:mr-3");
    			add_location(li3, file$5, 67, 12, 4717);
    			attr_dev(li4, "class", "flex-1 md:flex-none md:mr-3");
    			add_location(li4, file$5, 74, 12, 5197);
    			attr_dev(i3, "class", "fas fa-chart-area pr-0 ml-4 md:pr-3");
    			add_location(i3, file$5, 83, 20, 5901);
    			attr_dev(span2, "class", "pb-1 md:pb-0 text-xs md:text-base text-white md:text-white block md:inline-block");
    			add_location(span2, file$5, 83, 71, 5952);
    			attr_dev(a2, "href", "#");
    			attr_dev(a2, "class", "block py-1 md:py-3 pl-1 align-middle text-white no-underline hover:text-white hover:border-purple-500");
    			add_location(a2, file$5, 82, 16, 5757);
    			attr_dev(li5, "class", "flex-1 md:flex-none md:mr-3");
    			add_location(li5, file$5, 81, 12, 5699);
    			attr_dev(ul2, "class", "list-reset flex justify-between flex-1");
    			add_location(ul2, file$5, 66, 8, 4652);
    			attr_dev(div10, "class", "flex w-full content-center justify-between md:justify-end");
    			add_location(div10, file$5, 65, 4, 4571);
    			attr_dev(div11, "class", "pl-10 pr-10 bg-red-900 flex flex-wrap items-center fixed w-full bottom-0 md:bottom-auto");
    			add_location(div11, file$5, 64, 0, 4464);
    			attr_dev(div12, "class", "h-16 md:h-12 w-full bg-gray-300");
    			add_location(div12, file$5, 89, 0, 6141);
    			attr_dev(label0, "class", "block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2");
    			attr_dev(label0, "for", "grid-first-name");
    			add_location(label0, file$5, 94, 24, 6493);
    			attr_dev(input2, "class", "appearance-none block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white");
    			attr_dev(input2, "id", "grid-first-name");
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "placeholder", "Имя");
    			add_location(input2, file$5, 97, 24, 6690);
    			attr_dev(p2, "class", "text-red-500 text-xs italic");
    			add_location(p2, file$5, 98, 24, 6930);
    			attr_dev(div13, "class", "w-full md:w-1/2 px-3 mb-6 md:mb-0");
    			add_location(div13, file$5, 93, 20, 6420);
    			attr_dev(label1, "class", "block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2");
    			attr_dev(label1, "for", "grid-last-name");
    			add_location(label1, file$5, 101, 24, 7114);
    			attr_dev(input3, "class", "appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500");
    			attr_dev(input3, "id", "grid-last-name");
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "placeholder", "Фамилия");
    			add_location(input3, file$5, 104, 24, 7314);
    			attr_dev(div14, "class", "w-full md:w-1/2 px-3");
    			add_location(div14, file$5, 100, 20, 7054);
    			attr_dev(div15, "class", "flex flex-wrap -mx-3 mb-6");
    			add_location(div15, file$5, 92, 16, 6359);
    			attr_dev(label2, "class", "block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2");
    			attr_dev(label2, "for", "grid-last-name");
    			add_location(label2, file$5, 109, 24, 7731);
    			attr_dev(input4, "class", "appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500");
    			attr_dev(input4, "id", "grid-last-name");
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "placeholder", "Логин");
    			add_location(input4, file$5, 112, 24, 7929);
    			attr_dev(div16, "class", "w-full px-3");
    			add_location(div16, file$5, 108, 20, 7680);
    			attr_dev(div17, "class", "flex flex-wrap -mx-3 mb-6");
    			add_location(div17, file$5, 107, 16, 7619);
    			attr_dev(label3, "class", "block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2");
    			attr_dev(label3, "for", "grid-password");
    			add_location(label3, file$5, 117, 24, 8344);
    			attr_dev(input5, "class", "appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500");
    			attr_dev(input5, "id", "grid-password");
    			attr_dev(input5, "type", "password");
    			attr_dev(input5, "placeholder", "******************");
    			add_location(input5, file$5, 120, 24, 8542);
    			attr_dev(p3, "class", "text-gray-600 text-xs italic");
    			add_location(p3, file$5, 121, 24, 8822);
    			attr_dev(div18, "class", "w-full px-3");
    			add_location(div18, file$5, 116, 20, 8293);
    			attr_dev(div19, "class", "flex flex-wrap -mx-3 mb-6");
    			add_location(div19, file$5, 115, 16, 8232);
    			attr_dev(label4, "class", "block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2");
    			attr_dev(label4, "for", "email");
    			add_location(label4, file$5, 126, 20, 9072);
    			attr_dev(input6, "class", "appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500");
    			attr_dev(input6, "id", "email");
    			attr_dev(input6, "type", "email");
    			attr_dev(input6, "placeholder", "Ваш email");
    			add_location(input6, file$5, 127, 20, 9201);
    			attr_dev(div20, "class", "w-full px-3");
    			add_location(div20, file$5, 125, 16, 9025);
    			attr_dev(div21, "class", "flex flex-wrap -mx-3 mb-6");
    			add_location(div21, file$5, 124, 12, 8968);
    			attr_dev(button1, "class", "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline");
    			attr_dev(button1, "type", "button");
    			add_location(button1, file$5, 131, 16, 9563);
    			attr_dev(div22, "class", "flex items-center justify-between mt-4");
    			add_location(div22, file$5, 130, 12, 9493);
    			attr_dev(form, "class", "bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4");
    			add_location(form, file$5, 91, 8, 6280);
    			attr_dev(p4, "class", "text-center text-gray-500 text-xs");
    			add_location(p4, file$5, 136, 8, 9816);
    			attr_dev(div23, "class", "w-full max-w-3xl items-center w-full mx-auto content-end mt-48");
    			add_location(div23, file$5, 90, 0, 6194);
    			attr_dev(div24, "class", "h-56 md:h-56 w-full ");
    			add_location(div24, file$5, 140, 0, 9940);
    			attr_dev(div25, "class", "h-4 md:h-4 w-full ");
    			add_location(div25, file$5, 141, 0, 9982);
    			attr_dev(div26, "class", "h-1 md:h-1 w-full ");
    			add_location(div26, file$5, 142, 0, 10022);
    			attr_dev(div27, "class", "h-1 md:h-1 w-full ");
    			add_location(div27, file$5, 143, 0, 10062);
    			attr_dev(div28, "class", "h-1 md:h-1 w-full ");
    			add_location(div28, file$5, 144, 0, 10102);
    			attr_dev(div29, "class", "h-1 md:h-1 w-full ");
    			add_location(div29, file$5, 145, 0, 10142);
    			attr_dev(div30, "class", "h-1 md:h-1 w-full ");
    			add_location(div30, file$5, 146, 0, 10182);
    			attr_dev(div31, "class", "h-1 md:h-1 w-full ");
    			add_location(div31, file$5, 147, 0, 10222);
    			add_location(script, file$5, 148, 0, 10262);
    			attr_dev(body, "class", "mt-20 font-sans antialiased text-gray-900 leading-normal tracking-wider bg-cover");
    			set_style(body, "background-image", "url('https://i.ibb.co/sb44Pbm/imgonline-com-ua-Auto-Enrich-RAxu-F7e7-RIOZs-D-1.jpg')");
    			add_location(body, file$5, 4, 0, 82);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, nav);
    			append_dev(nav, div9);
    			append_dev(div9, div0);
    			mount_component(link0, div0, null);
    			append_dev(div9, t0);
    			append_dev(div9, div2);
    			append_dev(div2, span0);
    			append_dev(span0, input0);
    			append_dev(span0, t1);
    			append_dev(span0, div1);
    			append_dev(div1, svg0);
    			append_dev(svg0, path0);
    			append_dev(div9, t2);
    			append_dev(div9, div8);
    			append_dev(div8, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, div3);
    			append_dev(div3, p0);
    			mount_component(link1, p0, null);
    			append_dev(ul0, t3);
    			append_dev(ul0, li1);
    			append_dev(li1, div4);
    			append_dev(div4, p1);
    			mount_component(link2, p1, null);
    			append_dev(div8, t4);
    			append_dev(div8, ul1);
    			append_dev(ul1, li2);
    			append_dev(li2, div7);
    			append_dev(div7, button0);
    			append_dev(button0, span1);
    			append_dev(span1, i0);
    			append_dev(button0, t5);
    			append_dev(button0, svg1);
    			append_dev(svg1, path1);
    			append_dev(div7, t6);
    			append_dev(div7, div6);
    			append_dev(div6, input1);
    			append_dev(div6, t7);
    			mount_component(link3, div6, null);
    			append_dev(div6, t8);
    			append_dev(div6, a0);
    			append_dev(a0, i1);
    			append_dev(a0, t9);
    			append_dev(div6, t10);
    			append_dev(div6, div5);
    			append_dev(div6, t11);
    			append_dev(div6, a1);
    			append_dev(a1, i2);
    			append_dev(a1, t12);
    			append_dev(body, t13);
    			append_dev(body, div11);
    			append_dev(div11, div10);
    			append_dev(div10, ul2);
    			append_dev(ul2, li3);
    			mount_component(link4, li3, null);
    			append_dev(ul2, t14);
    			append_dev(ul2, li4);
    			mount_component(link5, li4, null);
    			append_dev(ul2, t15);
    			append_dev(ul2, li5);
    			append_dev(li5, a2);
    			append_dev(a2, i3);
    			append_dev(a2, span2);
    			append_dev(body, t17);
    			append_dev(body, div12);
    			append_dev(body, t18);
    			append_dev(body, div23);
    			append_dev(div23, form);
    			append_dev(form, div15);
    			append_dev(div15, div13);
    			append_dev(div13, label0);
    			append_dev(div13, t20);
    			append_dev(div13, input2);
    			append_dev(div13, t21);
    			append_dev(div13, p2);
    			append_dev(div15, t23);
    			append_dev(div15, div14);
    			append_dev(div14, label1);
    			append_dev(div14, t25);
    			append_dev(div14, input3);
    			append_dev(form, t26);
    			append_dev(form, div17);
    			append_dev(div17, div16);
    			append_dev(div16, label2);
    			append_dev(div16, t28);
    			append_dev(div16, input4);
    			append_dev(form, t29);
    			append_dev(form, div19);
    			append_dev(div19, div18);
    			append_dev(div18, label3);
    			append_dev(div18, t31);
    			append_dev(div18, input5);
    			append_dev(div18, t32);
    			append_dev(div18, p3);
    			append_dev(form, t34);
    			append_dev(form, div21);
    			append_dev(div21, div20);
    			append_dev(div20, label4);
    			append_dev(div20, t36);
    			append_dev(div20, input6);
    			append_dev(form, t37);
    			append_dev(form, div22);
    			append_dev(div22, button1);
    			append_dev(div23, t39);
    			append_dev(div23, p4);
    			append_dev(body, t41);
    			append_dev(body, div24);
    			append_dev(body, t42);
    			append_dev(body, div25);
    			append_dev(body, t43);
    			append_dev(body, div26);
    			append_dev(body, t44);
    			append_dev(body, div27);
    			append_dev(body, t45);
    			append_dev(body, div28);
    			append_dev(body, t46);
    			append_dev(body, div29);
    			append_dev(body, t47);
    			append_dev(body, div30);
    			append_dev(body, t48);
    			append_dev(body, div31);
    			append_dev(body, t49);
    			append_dev(body, script);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const link0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link0_changes.$$scope = { dirty, ctx };
    			}

    			link0.$set(link0_changes);
    			const link1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link1_changes.$$scope = { dirty, ctx };
    			}

    			link1.$set(link1_changes);
    			const link2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link2_changes.$$scope = { dirty, ctx };
    			}

    			link2.$set(link2_changes);
    			const link3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link3_changes.$$scope = { dirty, ctx };
    			}

    			link3.$set(link3_changes);
    			const link4_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link4_changes.$$scope = { dirty, ctx };
    			}

    			link4.$set(link4_changes);
    			const link5_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link5_changes.$$scope = { dirty, ctx };
    			}

    			link5.$set(link5_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);
    			transition_in(link2.$$.fragment, local);
    			transition_in(link3.$$.fragment, local);
    			transition_in(link4.$$.fragment, local);
    			transition_in(link5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			transition_out(link2.$$.fragment, local);
    			transition_out(link3.$$.fragment, local);
    			transition_out(link4.$$.fragment, local);
    			transition_out(link5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			destroy_component(link0);
    			destroy_component(link1);
    			destroy_component(link2);
    			destroy_component(link3);
    			destroy_component(link4);
    			destroy_component(link5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Register> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Register", $$slots, []);
    	$$self.$capture_state = () => ({ Router, Link, Route });
    	return [];
    }

    class Register extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Register",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\Login.svelte generated by Svelte v3.22.2 */
    const file$6 = "src\\Login.svelte";

    // (9:12) <Link to="/">
    function create_default_slot_5$4(ctx) {
    	let a;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			img = element("img");
    			attr_dev(img, "class", "object-left-top bg-gray-400 w-20 h-20");
    			if (img.src !== (img_src_value = "https://i.ibb.co/1n212y8/Ignat-Japan.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Ignat-Japan");
    			attr_dev(img, "border", "0");
    			add_location(img, file$6, 10, 20, 593);
    			attr_dev(a, "href", "#");
    			add_location(a, file$6, 9, 16, 559);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$4.name,
    		type: "slot",
    		source: "(9:12) <Link to=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (30:28) <Link to="Register">
    function create_default_slot_4$4(ctx) {
    	let a;
    	let span;

    	const block = {
    		c: function create() {
    			a = element("a");
    			span = element("span");
    			span.textContent = "Регистрация";
    			attr_dev(span, "class", "text-white underline");
    			add_location(span, file$6, 30, 44, 2067);
    			attr_dev(a, "href", "#");
    			add_location(a, file$6, 30, 32, 2055);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$4.name,
    		type: "slot",
    		source: "(30:28) <Link to=\\\"Register\\\">",
    		ctx
    	});

    	return block;
    }

    // (39:28) <Link to="Login">
    function create_default_slot_3$4(ctx) {
    	let a;
    	let span;

    	const block = {
    		c: function create() {
    			a = element("a");
    			span = element("span");
    			span.textContent = "Войти";
    			attr_dev(span, "class", "text-white underline ml-6");
    			add_location(span, file$6, 39, 44, 2488);
    			attr_dev(a, "href", "#");
    			add_location(a, file$6, 39, 32, 2476);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$4.name,
    		type: "slot",
    		source: "(39:28) <Link to=\\\"Login\\\">",
    		ctx
    	});

    	return block;
    }

    // (52:28) <Link to="Mainprofile">
    function create_default_slot_2$4(ctx) {
    	let a;
    	let i;
    	let t;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			t = text("Profile");
    			attr_dev(i, "class", "fa fa-user fa-fw");
    			add_location(i, file$6, 52, 143, 3793);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "p-2 hover:bg-gray-800 text-white text-sm no-underline hover:no-underline block text-center");
    			add_location(a, file$6, 52, 32, 3682);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    			append_dev(a, t);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$4.name,
    		type: "slot",
    		source: "(52:28) <Link to=\\\"Mainprofile\\\">",
    		ctx
    	});

    	return block;
    }

    // (69:16) <Link to="/">
    function create_default_slot_1$4(ctx) {
    	let a;
    	let i;
    	let span;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			span = element("span");
    			span.textContent = "Главное меню";
    			attr_dev(i, "class", "fas fa-home pr-0 ml-4 md:ml-0 md:pr-3");
    			add_location(i, file$6, 70, 24, 4956);
    			attr_dev(span, "class", "pb-1 md:pb-0 text-xs md:text-base  md:text-white block md:inline-block");
    			add_location(span, file$6, 70, 77, 5009);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "block py-1 md:py-3 pl-1 align-middle text-white no-underline hover:text-white hover:border-pink-500");
    			add_location(a, file$6, 69, 20, 4810);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    			append_dev(a, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$4.name,
    		type: "slot",
    		source: "(69:16) <Link to=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (76:16) <Link to="Japanliterature">
    function create_default_slot$5(ctx) {
    	let a;
    	let i;
    	let span;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			span = element("span");
    			span.textContent = "Японская литература";
    			attr_dev(i, "class", "fa fa-book pr-0 md:pr-3 ml-6 md:ml-0");
    			add_location(i, file$6, 77, 24, 5452);
    			attr_dev(span, "class", "pb-1 md:pb-0 text-xs md:text-base  md:text-white block md:inline-block");
    			add_location(span, file$6, 77, 76, 5504);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "block py-1 md:py-3 pl-1 align-middle text-white no-underline hover:text-white hover:border-purple-500");
    			add_location(a, file$6, 76, 20, 5304);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    			append_dev(a, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(76:16) <Link to=\\\"Japanliterature\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let body;
    	let nav;
    	let div9;
    	let div0;
    	let t0;
    	let div2;
    	let span0;
    	let input0;
    	let t1;
    	let div1;
    	let svg0;
    	let path0;
    	let t2;
    	let div8;
    	let ul0;
    	let li0;
    	let div3;
    	let p0;
    	let t3;
    	let li1;
    	let div4;
    	let p1;
    	let t4;
    	let ul1;
    	let li2;
    	let div7;
    	let button0;
    	let span1;
    	let i0;
    	let t5;
    	let svg1;
    	let path1;
    	let t6;
    	let div6;
    	let input1;
    	let t7;
    	let t8;
    	let a0;
    	let i1;
    	let t9;
    	let t10;
    	let div5;
    	let t11;
    	let a1;
    	let i2;
    	let t12;
    	let t13;
    	let div11;
    	let div10;
    	let ul2;
    	let li3;
    	let t14;
    	let li4;
    	let t15;
    	let li5;
    	let a2;
    	let i3;
    	let span2;
    	let t17;
    	let div12;
    	let t18;
    	let div16;
    	let form;
    	let div13;
    	let label0;
    	let t20;
    	let input2;
    	let t21;
    	let div14;
    	let label1;
    	let t23;
    	let input3;
    	let t24;
    	let p2;
    	let t26;
    	let div15;
    	let button1;
    	let t28;
    	let p3;
    	let t30;
    	let div17;
    	let t31;
    	let div18;
    	let t32;
    	let div19;
    	let t33;
    	let div20;
    	let t34;
    	let div21;
    	let t35;
    	let div22;
    	let t36;
    	let div23;
    	let t37;
    	let div24;
    	let t38;
    	let script;
    	let current;

    	const link0 = new Link({
    			props: {
    				to: "/",
    				$$slots: { default: [create_default_slot_5$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link1 = new Link({
    			props: {
    				to: "Register",
    				$$slots: { default: [create_default_slot_4$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link2 = new Link({
    			props: {
    				to: "Login",
    				$$slots: { default: [create_default_slot_3$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link3 = new Link({
    			props: {
    				to: "Mainprofile",
    				$$slots: { default: [create_default_slot_2$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link4 = new Link({
    			props: {
    				to: "/",
    				$$slots: { default: [create_default_slot_1$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link5 = new Link({
    			props: {
    				to: "Japanliterature",
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			body = element("body");
    			nav = element("nav");
    			div9 = element("div");
    			div0 = element("div");
    			create_component(link0.$$.fragment);
    			t0 = space();
    			div2 = element("div");
    			span0 = element("span");
    			input0 = element("input");
    			t1 = space();
    			div1 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t2 = space();
    			div8 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			div3 = element("div");
    			p0 = element("p");
    			create_component(link1.$$.fragment);
    			t3 = space();
    			li1 = element("li");
    			div4 = element("div");
    			p1 = element("p");
    			create_component(link2.$$.fragment);
    			t4 = space();
    			ul1 = element("ul");
    			li2 = element("li");
    			div7 = element("div");
    			button0 = element("button");
    			span1 = element("span");
    			i0 = element("i");
    			t5 = text(" Привет, пользователь ");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t6 = space();
    			div6 = element("div");
    			input1 = element("input");
    			t7 = space();
    			create_component(link3.$$.fragment);
    			t8 = space();
    			a0 = element("a");
    			i1 = element("i");
    			t9 = text(" Settings");
    			t10 = space();
    			div5 = element("div");
    			t11 = space();
    			a1 = element("a");
    			i2 = element("i");
    			t12 = text(" Log Out");
    			t13 = space();
    			div11 = element("div");
    			div10 = element("div");
    			ul2 = element("ul");
    			li3 = element("li");
    			create_component(link4.$$.fragment);
    			t14 = space();
    			li4 = element("li");
    			create_component(link5.$$.fragment);
    			t15 = space();
    			li5 = element("li");
    			a2 = element("a");
    			i3 = element("i");
    			span2 = element("span");
    			span2.textContent = "Analytics";
    			t17 = space();
    			div12 = element("div");
    			t18 = space();
    			div16 = element("div");
    			form = element("form");
    			div13 = element("div");
    			label0 = element("label");
    			label0.textContent = "Логин";
    			t20 = space();
    			input2 = element("input");
    			t21 = space();
    			div14 = element("div");
    			label1 = element("label");
    			label1.textContent = "Пароль";
    			t23 = space();
    			input3 = element("input");
    			t24 = space();
    			p2 = element("p");
    			p2.textContent = "Пожалуйста, заполните пароль..";
    			t26 = space();
    			div15 = element("div");
    			button1 = element("button");
    			button1.textContent = "Авторизоваться";
    			t28 = space();
    			p3 = element("p");
    			p3.textContent = "©2020 Acme Corp. Все права защищены.";
    			t30 = space();
    			div17 = element("div");
    			t31 = space();
    			div18 = element("div");
    			t32 = space();
    			div19 = element("div");
    			t33 = space();
    			div20 = element("div");
    			t34 = space();
    			div21 = element("div");
    			t35 = space();
    			div22 = element("div");
    			t36 = space();
    			div23 = element("div");
    			t37 = space();
    			div24 = element("div");
    			t38 = space();
    			script = element("script");
    			script.textContent = "/*Toggle dropdown list*/\r\n    function toggleDD(myDropMenu) {\r\n        document.getElementById(myDropMenu).classList.toggle(\"invisible\");\r\n    }\r\n    /*Filter dropdown options*/\r\n    function filterDD(myDropMenu, myDropMenuSearch) {\r\n        var input, filter, ul, li, a, i;\r\n        input = document.getElementById(myDropMenuSearch);\r\n        filter = input.value.toUpperCase();\r\n        div = document.getElementById(myDropMenu);\r\n        a = div.getElementsByTagName(\"a\");\r\n        for (i = 0; i < a.length; i++) {\r\n            if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {\r\n                a[i].style.display = \"\";\r\n            } else {\r\n                a[i].style.display = \"none\";\r\n            }\r\n        }\r\n    }\r\n    // Close the dropdown menu if the user clicks outside of it\r\n    window.onclick = function(event) {\r\n        if (!event.target.matches('.drop-button') && !event.target.matches('.drop-search')) {\r\n            var dropdowns = document.getElementsByClassName(\"dropdownlist\");\r\n            for (var i = 0; i < dropdowns.length; i++) {\r\n                var openDropdown = dropdowns[i];\r\n                if (!openDropdown.classList.contains('invisible')) {\r\n                    openDropdown.classList.add('invisible');\r\n                }\r\n            }\r\n        }\r\n    }";
    			attr_dev(div0, "class", "flex flex-shrink md:w-1/3 justify-center md:justify-start text-white");
    			add_location(div0, file$6, 7, 8, 432);
    			attr_dev(input0, "type", "search");
    			attr_dev(input0, "placeholder", "Search");
    			attr_dev(input0, "class", "w-full bg-gray-800 text-sm text-white transition border border-transparent focus:outline-none focus:border-gray-700 rounded py-1 px-2 pl-10 appearance-none leading-normal");
    			add_location(input0, file$6, 16, 24, 970);
    			attr_dev(path0, "d", "M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z");
    			add_location(path0, file$6, 19, 32, 1468);
    			attr_dev(svg0, "class", "fill-current pointer-events-none text-white w-4 h-4");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 20 20");
    			add_location(svg0, file$6, 18, 28, 1314);
    			attr_dev(div1, "class", "absolute search-icon");
    			set_style(div1, "top", ".5rem");
    			set_style(div1, "left", ".8rem");
    			add_location(div1, file$6, 17, 24, 1217);
    			attr_dev(span0, "class", "relative w-full");
    			add_location(span0, file$6, 15, 28, 914);
    			attr_dev(div2, "class", "flex flex-1 w-full justify-center md:justify-start text-white px-2 mr-0 md:mr-20");
    			add_location(div2, file$6, 14, 8, 790);
    			attr_dev(p0, "class", "text-white");
    			add_location(p0, file$6, 28, 24, 1949);
    			attr_dev(div3, "class", "relative inline-block");
    			add_location(div3, file$6, 27, 20, 1888);
    			attr_dev(li0, "class", "flex-none md:mr-3");
    			add_location(li0, file$6, 26, 16, 1836);
    			attr_dev(p1, "class", "text-white");
    			add_location(p1, file$6, 37, 24, 2373);
    			attr_dev(div4, "class", "relative inline-block");
    			add_location(div4, file$6, 36, 20, 2312);
    			attr_dev(li1, "class", "flex-none md:mr-3");
    			add_location(li1, file$6, 35, 16, 2260);
    			attr_dev(ul0, "class", "pr-1");
    			add_location(ul0, file$6, 25, 12, 1801);
    			attr_dev(i0, "class", "fa fa-user");
    			add_location(i0, file$6, 48, 135, 3035);
    			attr_dev(span1, "class", "pr-2");
    			add_location(span1, file$6, 48, 116, 3016);
    			attr_dev(path1, "d", "M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z");
    			add_location(path1, file$6, 48, 282, 3182);
    			attr_dev(svg1, "class", "h-3 fill-current inline");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 20 20");
    			add_location(svg1, file$6, 48, 190, 3090);
    			attr_dev(button0, "onclick", "toggleDD('myDropdown')");
    			attr_dev(button0, "class", "drop-button text-white focus:outline-none");
    			add_location(button0, file$6, 48, 24, 2924);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "drop-search p-2 text-gray-600");
    			attr_dev(input1, "placeholder", "Search..");
    			attr_dev(input1, "id", "myInput");
    			attr_dev(input1, "onkeyup", "filterDD('myDropdown','myInput')");
    			add_location(input1, file$6, 50, 28, 3459);
    			attr_dev(i1, "class", "fa fa-cog fa-fw");
    			add_location(i1, file$6, 54, 139, 4014);
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "class", "p-2 hover:bg-gray-800 text-white text-sm no-underline hover:no-underline block text-center");
    			add_location(a0, file$6, 54, 28, 3903);
    			attr_dev(div5, "class", "border border-gray-800");
    			add_location(div5, file$6, 55, 28, 4088);
    			attr_dev(i2, "class", "fas fa-sign-out-alt fa-fw");
    			add_location(i2, file$6, 56, 139, 4271);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "class", "p-2 hover:bg-gray-800 text-white text-sm no-underline hover:no-underline block text-center");
    			add_location(a1, file$6, 56, 28, 4160);
    			attr_dev(div6, "id", "myDropdown");
    			attr_dev(div6, "class", "dropdownlist absolute bg-gray-900 text-white right-0 mt-3 p-3 overflow-auto z-30 invisible");
    			add_location(div6, file$6, 49, 24, 3309);
    			attr_dev(div7, "class", "relative inline-block");
    			add_location(div7, file$6, 47, 20, 2863);
    			attr_dev(li2, "class", "flex-1 md:flex-none md:mr-3 text-right");
    			add_location(li2, file$6, 46, 16, 2790);
    			attr_dev(ul1, "class", "list-reset flex justify-between flex-1 md:flex-none items-center");
    			add_location(ul1, file$6, 45, 12, 2695);
    			attr_dev(div8, "class", "flex w-full pt-2 content-center justify-between md:w-1/3 md:justify-end");
    			add_location(div8, file$6, 24, 8, 1702);
    			attr_dev(div9, "class", "flex flex-wrap items-center");
    			add_location(div9, file$6, 6, 4, 381);
    			attr_dev(nav, "class", "bg-gray-900 pt-2 md:pt-1 pb-1 px-1 mt-0 h-auto fixed w-full z-20 top-0 ");
    			add_location(nav, file$6, 5, 0, 290);
    			attr_dev(li3, "class", "flex-1 md:flex-none md:mr-3");
    			add_location(li3, file$6, 67, 12, 4717);
    			attr_dev(li4, "class", "flex-1 md:flex-none md:mr-3");
    			add_location(li4, file$6, 74, 12, 5197);
    			attr_dev(i3, "class", "fas fa-chart-area pr-0 ml-4 md:pr-3");
    			add_location(i3, file$6, 83, 20, 5901);
    			attr_dev(span2, "class", "pb-1 md:pb-0 text-xs md:text-base text-white md:text-white block md:inline-block");
    			add_location(span2, file$6, 83, 71, 5952);
    			attr_dev(a2, "href", "#");
    			attr_dev(a2, "class", "block py-1 md:py-3 pl-1 align-middle text-white no-underline hover:text-white hover:border-purple-500");
    			add_location(a2, file$6, 82, 16, 5757);
    			attr_dev(li5, "class", "flex-1 md:flex-none md:mr-3");
    			add_location(li5, file$6, 81, 12, 5699);
    			attr_dev(ul2, "class", "list-reset flex justify-between flex-1");
    			add_location(ul2, file$6, 66, 8, 4652);
    			attr_dev(div10, "class", "flex w-full content-center justify-between md:justify-end");
    			add_location(div10, file$6, 65, 4, 4571);
    			attr_dev(div11, "class", "pl-10 pr-10 bg-red-900 flex flex-wrap items-center fixed w-full bottom-0 md:bottom-auto");
    			add_location(div11, file$6, 64, 0, 4464);
    			attr_dev(div12, "class", "h-16 md:h-12 w-full bg-gray-300");
    			add_location(div12, file$6, 89, 0, 6141);
    			attr_dev(label0, "class", "block text-gray-700 text-sm font-bold mb-2");
    			attr_dev(label0, "for", "username");
    			add_location(label0, file$6, 93, 12, 6378);
    			attr_dev(input2, "class", "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline");
    			attr_dev(input2, "id", "username");
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "placeholder", "Логин");
    			add_location(input2, file$6, 96, 12, 6510);
    			attr_dev(div13, "class", "mb-4");
    			add_location(div13, file$6, 92, 8, 6346);
    			attr_dev(label1, "class", "block text-gray-700 text-sm font-bold mb-2");
    			attr_dev(label1, "for", "password");
    			add_location(label1, file$6, 99, 12, 6752);
    			attr_dev(input3, "class", "shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline");
    			attr_dev(input3, "id", "password");
    			attr_dev(input3, "type", "password");
    			attr_dev(input3, "placeholder", "******************");
    			add_location(input3, file$6, 102, 12, 6885);
    			attr_dev(p2, "class", "text-red-500 text-xs italic");
    			add_location(p2, file$6, 103, 12, 7120);
    			attr_dev(div14, "class", "mb-6");
    			add_location(div14, file$6, 98, 8, 6720);
    			attr_dev(button1, "class", "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline");
    			attr_dev(button1, "type", "button");
    			add_location(button1, file$6, 106, 12, 7280);
    			attr_dev(div15, "class", "flex items-center justify-between");
    			add_location(div15, file$6, 105, 8, 7219);
    			attr_dev(form, "class", "bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4");
    			add_location(form, file$6, 91, 4, 6275);
    			attr_dev(p3, "class", "text-center text-gray-500 text-xs");
    			add_location(p3, file$6, 111, 4, 7509);
    			attr_dev(div16, "class", "w-full max-w-xs items-center w-full mx-auto content-end mt-56");
    			add_location(div16, file$6, 90, 0, 6194);
    			attr_dev(div17, "class", "h-56 md:h-56 w-full ");
    			add_location(div17, file$6, 115, 0, 7625);
    			attr_dev(div18, "class", "h-4 md:h-4 w-full ");
    			add_location(div18, file$6, 116, 0, 7667);
    			attr_dev(div19, "class", "h-1 md:h-1 w-full ");
    			add_location(div19, file$6, 117, 0, 7707);
    			attr_dev(div20, "class", "h-1 md:h-1 w-full ");
    			add_location(div20, file$6, 118, 0, 7747);
    			attr_dev(div21, "class", "h-1 md:h-1 w-full ");
    			add_location(div21, file$6, 119, 0, 7787);
    			attr_dev(div22, "class", "h-1 md:h-1 w-full ");
    			add_location(div22, file$6, 120, 0, 7827);
    			attr_dev(div23, "class", "h-1 md:h-1 w-full ");
    			add_location(div23, file$6, 121, 0, 7867);
    			attr_dev(div24, "class", "h-1 md:h-1 w-full ");
    			add_location(div24, file$6, 122, 0, 7907);
    			add_location(script, file$6, 123, 0, 7947);
    			attr_dev(body, "class", "mt-20 font-sans antialiased text-gray-900 leading-normal tracking-wider bg-cover");
    			set_style(body, "background-image", "url('https://i.ibb.co/sb44Pbm/imgonline-com-ua-Auto-Enrich-RAxu-F7e7-RIOZs-D-1.jpg')");
    			add_location(body, file$6, 4, 0, 82);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, nav);
    			append_dev(nav, div9);
    			append_dev(div9, div0);
    			mount_component(link0, div0, null);
    			append_dev(div9, t0);
    			append_dev(div9, div2);
    			append_dev(div2, span0);
    			append_dev(span0, input0);
    			append_dev(span0, t1);
    			append_dev(span0, div1);
    			append_dev(div1, svg0);
    			append_dev(svg0, path0);
    			append_dev(div9, t2);
    			append_dev(div9, div8);
    			append_dev(div8, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, div3);
    			append_dev(div3, p0);
    			mount_component(link1, p0, null);
    			append_dev(ul0, t3);
    			append_dev(ul0, li1);
    			append_dev(li1, div4);
    			append_dev(div4, p1);
    			mount_component(link2, p1, null);
    			append_dev(div8, t4);
    			append_dev(div8, ul1);
    			append_dev(ul1, li2);
    			append_dev(li2, div7);
    			append_dev(div7, button0);
    			append_dev(button0, span1);
    			append_dev(span1, i0);
    			append_dev(button0, t5);
    			append_dev(button0, svg1);
    			append_dev(svg1, path1);
    			append_dev(div7, t6);
    			append_dev(div7, div6);
    			append_dev(div6, input1);
    			append_dev(div6, t7);
    			mount_component(link3, div6, null);
    			append_dev(div6, t8);
    			append_dev(div6, a0);
    			append_dev(a0, i1);
    			append_dev(a0, t9);
    			append_dev(div6, t10);
    			append_dev(div6, div5);
    			append_dev(div6, t11);
    			append_dev(div6, a1);
    			append_dev(a1, i2);
    			append_dev(a1, t12);
    			append_dev(body, t13);
    			append_dev(body, div11);
    			append_dev(div11, div10);
    			append_dev(div10, ul2);
    			append_dev(ul2, li3);
    			mount_component(link4, li3, null);
    			append_dev(ul2, t14);
    			append_dev(ul2, li4);
    			mount_component(link5, li4, null);
    			append_dev(ul2, t15);
    			append_dev(ul2, li5);
    			append_dev(li5, a2);
    			append_dev(a2, i3);
    			append_dev(a2, span2);
    			append_dev(body, t17);
    			append_dev(body, div12);
    			append_dev(body, t18);
    			append_dev(body, div16);
    			append_dev(div16, form);
    			append_dev(form, div13);
    			append_dev(div13, label0);
    			append_dev(div13, t20);
    			append_dev(div13, input2);
    			append_dev(form, t21);
    			append_dev(form, div14);
    			append_dev(div14, label1);
    			append_dev(div14, t23);
    			append_dev(div14, input3);
    			append_dev(div14, t24);
    			append_dev(div14, p2);
    			append_dev(form, t26);
    			append_dev(form, div15);
    			append_dev(div15, button1);
    			append_dev(div16, t28);
    			append_dev(div16, p3);
    			append_dev(body, t30);
    			append_dev(body, div17);
    			append_dev(body, t31);
    			append_dev(body, div18);
    			append_dev(body, t32);
    			append_dev(body, div19);
    			append_dev(body, t33);
    			append_dev(body, div20);
    			append_dev(body, t34);
    			append_dev(body, div21);
    			append_dev(body, t35);
    			append_dev(body, div22);
    			append_dev(body, t36);
    			append_dev(body, div23);
    			append_dev(body, t37);
    			append_dev(body, div24);
    			append_dev(body, t38);
    			append_dev(body, script);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const link0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link0_changes.$$scope = { dirty, ctx };
    			}

    			link0.$set(link0_changes);
    			const link1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link1_changes.$$scope = { dirty, ctx };
    			}

    			link1.$set(link1_changes);
    			const link2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link2_changes.$$scope = { dirty, ctx };
    			}

    			link2.$set(link2_changes);
    			const link3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link3_changes.$$scope = { dirty, ctx };
    			}

    			link3.$set(link3_changes);
    			const link4_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link4_changes.$$scope = { dirty, ctx };
    			}

    			link4.$set(link4_changes);
    			const link5_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link5_changes.$$scope = { dirty, ctx };
    			}

    			link5.$set(link5_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);
    			transition_in(link2.$$.fragment, local);
    			transition_in(link3.$$.fragment, local);
    			transition_in(link4.$$.fragment, local);
    			transition_in(link5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			transition_out(link2.$$.fragment, local);
    			transition_out(link3.$$.fragment, local);
    			transition_out(link4.$$.fragment, local);
    			transition_out(link5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			destroy_component(link0);
    			destroy_component(link1);
    			destroy_component(link2);
    			destroy_component(link3);
    			destroy_component(link4);
    			destroy_component(link5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Login", $$slots, []);
    	$$self.$capture_state = () => ({ Router, Link, Route });
    	return [];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\profileliteratur.svelte generated by Svelte v3.22.2 */

    const file$7 = "src\\profileliteratur.svelte";

    function create_fragment$a(ctx) {
    	let div8;
    	let style;
    	let t1;
    	let div7;
    	let div2_1;
    	let div0;
    	let span0;
    	let t3;
    	let div1_1;
    	let span1;
    	let t5;
    	let div6;
    	let div3;
    	let input0;
    	let t6;
    	let div5;
    	let div4;
    	let input1;
    	let t7;
    	let button;

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			style = element("style");
    			style.textContent = "input[type=\"number\"] {\n  -webkit-appearance: textfield;\n  -moz-appearance: textfield;\n  appearance: initial;\n}\n\ninput[type=number]::-webkit-inner-spin-button,\r\ninput[type=number]::-webkit-outer-spin-button {\n  -webkit-appearance: none;\n}\n\n.number-input {\n  display: inline-flex;\n}\n\n.number-input,\r\n.number-input * {\n  box-sizing: border-box;\n}\n\n.number-input button {\n  outline:none;\n  -webkit-appearance: none;\n  background-color: transparent;\n  border: none;\n  align-items: center;\n  justify-content: center;\n  width: 1rem;\n  height: 2rem;\n  cursor: pointer;\n  margin: 0;\n  position: relative;\n}\n\n.number-input button:before,\r\n.number-input button:after {\n  display: inline-block;\n  position: absolute;\n  content: '';\n  width: 0.75rem;\n  height: 1px;\n  background-color: #3a415e;\n  transform: translate(-50%, -50%);\n}\n\n.number-input button.plus:after {\n  transform: translate(-50%, -50%) rotate(90deg);\n}\n\n.number-input button:hover:after,.number-input button:hover:before\r\n{\n  background-color: #ffcf00;\n}\n\n.number-input input[type=number] {\n  max-width: 3rem;\n  font-size: 1.25rem;\n  height: 2rem;\n  text-align: center;\n  border-color: white;\n  border-width: 2px;\n}\n\n.inputers input:hover{\n  border-color: #ffcf00;\n}\n\n.inputers input:focus{\n  border-color:#ffcf00 ;\n}\n\n.rating input{\n  color: #3a415e;\n}\r\n    \r\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9wcm9maWxlbGl0ZXJhdHVyLnN2ZWx0ZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtFQUNJLDZCQUE2QjtFQUM3QiwwQkFBMEI7RUFDMUIsbUJBQW1CO0FBQ3ZCOztBQUVBOztFQUVJLHdCQUF3QjtBQUM1Qjs7QUFFQTtFQUNJLG9CQUFvQjtBQUN4Qjs7QUFFQTs7RUFFSSxzQkFBc0I7QUFDMUI7O0FBRUE7RUFDSSxZQUFZO0VBQ1osd0JBQXdCO0VBQ3hCLDZCQUE2QjtFQUM3QixZQUFZO0VBQ1osbUJBQW1CO0VBQ25CLHVCQUF1QjtFQUN2QixXQUFXO0VBQ1gsWUFBWTtFQUNaLGVBQWU7RUFDZixTQUFTO0VBQ1Qsa0JBQWtCO0FBQ3RCOztBQUVBOztFQUVJLHFCQUFxQjtFQUNyQixrQkFBa0I7RUFDbEIsV0FBVztFQUNYLGNBQWM7RUFDZCxXQUFXO0VBQ1gseUJBQXlCO0VBQ3pCLGdDQUFnQztBQUNwQzs7QUFDQTtFQUNJLDhDQUE4QztBQUNsRDs7QUFDQTs7RUFFSSx5QkFBeUI7QUFDN0I7O0FBRUE7RUFDSSxlQUFlO0VBQ2Ysa0JBQWtCO0VBQ2xCLFlBQVk7RUFDWixrQkFBa0I7RUFDbEIsbUJBQW1CO0VBQ25CLGlCQUFpQjtBQUVyQjs7QUFDQTtFQUNJLHFCQUFxQjtBQUN6Qjs7QUFDQTtFQUNJLHFCQUFxQjtBQUN6Qjs7QUFDQTtFQUNJLGNBQWM7QUFDbEIiLCJmaWxlIjoic3JjL3Byb2ZpbGVsaXRlcmF0dXIuc3ZlbHRlIiwic291cmNlc0NvbnRlbnQiOlsiXHJcbmlucHV0W3R5cGU9XCJudW1iZXJcIl0ge1xyXG4gICAgLXdlYmtpdC1hcHBlYXJhbmNlOiB0ZXh0ZmllbGQ7XHJcbiAgICAtbW96LWFwcGVhcmFuY2U6IHRleHRmaWVsZDtcclxuICAgIGFwcGVhcmFuY2U6IGluaXRpYWw7XHJcbn1cclxuXHJcbmlucHV0W3R5cGU9bnVtYmVyXTo6LXdlYmtpdC1pbm5lci1zcGluLWJ1dHRvbixcclxuaW5wdXRbdHlwZT1udW1iZXJdOjotd2Via2l0LW91dGVyLXNwaW4tYnV0dG9uIHtcclxuICAgIC13ZWJraXQtYXBwZWFyYW5jZTogbm9uZTtcclxufVxyXG5cclxuLm51bWJlci1pbnB1dCB7XHJcbiAgICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcclxufVxyXG5cclxuLm51bWJlci1pbnB1dCxcclxuLm51bWJlci1pbnB1dCAqIHtcclxuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XHJcbn1cclxuXHJcbi5udW1iZXItaW5wdXQgYnV0dG9uIHtcclxuICAgIG91dGxpbmU6bm9uZTtcclxuICAgIC13ZWJraXQtYXBwZWFyYW5jZTogbm9uZTtcclxuICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xyXG4gICAgYm9yZGVyOiBub25lO1xyXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcclxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xyXG4gICAgd2lkdGg6IDFyZW07XHJcbiAgICBoZWlnaHQ6IDJyZW07XHJcbiAgICBjdXJzb3I6IHBvaW50ZXI7XHJcbiAgICBtYXJnaW46IDA7XHJcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbn1cclxuXHJcbi5udW1iZXItaW5wdXQgYnV0dG9uOmJlZm9yZSxcclxuLm51bWJlci1pbnB1dCBidXR0b246YWZ0ZXIge1xyXG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xyXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xyXG4gICAgY29udGVudDogJyc7XHJcbiAgICB3aWR0aDogMC43NXJlbTtcclxuICAgIGhlaWdodDogMXB4O1xyXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzNhNDE1ZTtcclxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpO1xyXG59XHJcbi5udW1iZXItaW5wdXQgYnV0dG9uLnBsdXM6YWZ0ZXIge1xyXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSkgcm90YXRlKDkwZGVnKTtcclxufVxyXG4ubnVtYmVyLWlucHV0IGJ1dHRvbjpob3ZlcjphZnRlciwubnVtYmVyLWlucHV0IGJ1dHRvbjpob3ZlcjpiZWZvcmVcclxue1xyXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmY2YwMDtcclxufVxyXG5cclxuLm51bWJlci1pbnB1dCBpbnB1dFt0eXBlPW51bWJlcl0ge1xyXG4gICAgbWF4LXdpZHRoOiAzcmVtO1xyXG4gICAgZm9udC1zaXplOiAxLjI1cmVtO1xyXG4gICAgaGVpZ2h0OiAycmVtO1xyXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xyXG4gICAgYm9yZGVyLWNvbG9yOiB3aGl0ZTtcclxuICAgIGJvcmRlci13aWR0aDogMnB4O1xyXG5cclxufVxyXG4uaW5wdXRlcnMgaW5wdXQ6aG92ZXJ7XHJcbiAgICBib3JkZXItY29sb3I6ICNmZmNmMDA7XHJcbn1cclxuLmlucHV0ZXJzIGlucHV0OmZvY3Vze1xyXG4gICAgYm9yZGVyLWNvbG9yOiNmZmNmMDAgO1xyXG59XHJcbi5yYXRpbmcgaW5wdXR7XHJcbiAgICBjb2xvcjogIzNhNDE1ZTtcclxufVxyXG4gICAgIl19 */";
    			t1 = space();
    			div7 = element("div");
    			div2_1 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			span0.textContent = "120";
    			t3 = space();
    			div1_1 = element("div");
    			span1 = element("span");
    			span1.textContent = "Непризнанный школой владыка демонов! Сильнейший владыка демонов в истории поступает в академию, переродившись своим потомком";
    			t5 = space();
    			div6 = element("div");
    			div3 = element("div");
    			input0 = element("input");
    			t6 = space();
    			div5 = element("div");
    			div4 = element("div");
    			input1 = element("input");
    			t7 = space();
    			button = element("button");
    			add_location(style, file$7, 1, 4, 46);
    			attr_dev(span0, "class", "cursor-default truncate text-indigo-700 hover:text-orange-900 hover:underline");
    			add_location(span0, file$7, 81, 0, 4632);
    			add_location(div0, file$7, 80, 12, 4625);
    			attr_dev(span1, "class", "cursor-pointer hover:text-orange-900 hover:underline");
    			add_location(span1, file$7, 86, 0, 4841);
    			attr_dev(div1_1, "class", "md:col-start-2 col-start-3 col-end-12 text-indigo-700");
    			add_location(div1_1, file$7, 85, 12, 4772);
    			attr_dev(div2_1, "class", "grid col-start-1 md:col-end-10 col-end-9 grid-cols-12");
    			add_location(div2_1, file$7, 79, 8, 4544);
    			attr_dev(input0, "class", "text-indigo-700 hover:text-orange-900 border-2 border-white rounded h-6 w-12\r\nmb-3 focus:outline-none text-center\r\nfocus:border-orange-900 hover:border-orange-900");
    			attr_dev(input0, "id", "comment");
    			attr_dev(input0, "min", "0");
    			attr_dev(input0, "max", "10");
    			attr_dev(input0, "aria-valuemax", "10");
    			attr_dev(input0, "placeholder", "─");
    			attr_dev(input0, "type", "number");
    			add_location(input0, file$7, 93, 16, 5235);
    			attr_dev(div3, "class", "rating ml-1 text-indigo-700");
    			add_location(div3, file$7, 92, 12, 5176);
    			attr_dev(input1, "class", "quantity focus:outline-none rounded");
    			attr_dev(input1, "min", "0");
    			attr_dev(input1, "name", "quantity");
    			input1.value = "0";
    			attr_dev(input1, "type", "number");
    			add_location(input1, file$7, 100, 20, 5674);
    			attr_dev(button, "onclick", "this.parentNode.querySelector('input[type=number]').stepUp()");
    			attr_dev(button, "class", "plus");
    			add_location(button, file$7, 101, 20, 5795);
    			attr_dev(div4, "class", "number-input ml-2 text-indigo-700 hover:text-orange-900");
    			add_location(div4, file$7, 99, 16, 5583);
    			attr_dev(div5, "class", "");
    			add_location(div5, file$7, 98, 12, 5551);
    			attr_dev(div6, "class", "inputers col-start-10 col-end-13 md:grid grid-cols-2 hidden");
    			add_location(div6, file$7, 91, 8, 5089);
    			attr_dev(div7, "class", "grid md:grid-cols-12 grid-cols-2 w-full");
    			add_location(div7, file$7, 78, 4, 4481);
    			attr_dev(div8, "class", "p-1 mt-1 hover:bg-gray-300");
    			add_location(div8, file$7, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, style);
    			append_dev(div8, t1);
    			append_dev(div8, div7);
    			append_dev(div7, div2_1);
    			append_dev(div2_1, div0);
    			append_dev(div0, span0);
    			append_dev(div2_1, t3);
    			append_dev(div2_1, div1_1);
    			append_dev(div1_1, span1);
    			append_dev(div7, t5);
    			append_dev(div7, div6);
    			append_dev(div6, div3);
    			append_dev(div3, input0);
    			append_dev(div6, t6);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, input1);
    			append_dev(div4, t7);
    			append_dev(div4, button);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function filterDD1(myDropMenu_1, myDropMenu_2, myDropMenu_3, myDropMenuSearch_1) {
    	var input, filter_1, filter_2, filter_3, a, i, b, c;
    	input = document.getElementById(myDropMenuSearch_1);
    	filter_1 = input.value.toUpperCase();
    	filter_2 = input.value.toUpperCase();
    	filter_3 = input.value.toUpperCase();
    	div = document.getElementById(myDropMenu_1);
    	div1 = document.getElementById(myDropMenu_2);
    	div2 = document.getElementById(myDropMenu_3);
    	a = div.getElementsByTagName("a");
    	b = div1.getElementsByTagName("b");
    	c = div2.getElementsByTagName("c");

    	for (i = 0; i < a.length; i++) {
    		if (a[i].innerHTML.toUpperCase().indexOf(filter_1) > -1) {
    			a[i].style.display = "";
    		} else {
    			a[i].style.display = "none";
    		}
    	}

    	for (i = 0; i < b.length; i++) {
    		if (b[i].innerHTML.toUpperCase().indexOf(filter_2) > -1) {
    			b[i].style.display = "";
    		} else {
    			b[i].style.display = "none";
    		}
    	}

    	for (i = 0; i < c.length; i++) {
    		if (c[i].innerHTML.toUpperCase().indexOf(filter_3) > -1) {
    			c[i].style.display = "";
    		} else {
    			c[i].style.display = "none";
    		}
    	}
    }

    function instance$a($$self, $$props, $$invalidate) {
    	window.onclick = function (event) {
    		if (!event.target.matches(".drop-button_1") && !event.target.matches(".drop-search_1")) {
    			var dropdowns = document.getElementsByClassName("dropdownlist_1");

    			for (var i = 0; i < dropdowns.length; i++) {
    				var openDropdown = dropdowns[i];

    				if (!openDropdown.classList.contains("invisible")) {
    					openDropdown.classList.add("invisible");
    				}
    			}
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Profileliteratur> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Profileliteratur", $$slots, []);
    	$$self.$capture_state = () => ({ filterDD1 });
    	return [];
    }

    class Profileliteratur extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Profileliteratur",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\mainprofile.svelte generated by Svelte v3.22.2 */
    const file$8 = "src\\mainprofile.svelte";

    // (9:12) <Link to="/">
    function create_default_slot_5$5(ctx) {
    	let a;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			img = element("img");
    			attr_dev(img, "class", "object-left-top bg-gray-400 w-20 h-20");
    			if (img.src !== (img_src_value = "https://i.ibb.co/1n212y8/Ignat-Japan.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Ignat-Japan");
    			attr_dev(img, "border", "0");
    			add_location(img, file$8, 10, 20, 646);
    			attr_dev(a, "href", "#");
    			add_location(a, file$8, 9, 16, 612);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$5.name,
    		type: "slot",
    		source: "(9:12) <Link to=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (30:28) <Link to="Register">
    function create_default_slot_4$5(ctx) {
    	let a;
    	let span;

    	const block = {
    		c: function create() {
    			a = element("a");
    			span = element("span");
    			span.textContent = "Регистрация";
    			attr_dev(span, "class", "text-white underline");
    			add_location(span, file$8, 30, 44, 2120);
    			attr_dev(a, "href", "#");
    			add_location(a, file$8, 30, 32, 2108);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$5.name,
    		type: "slot",
    		source: "(30:28) <Link to=\\\"Register\\\">",
    		ctx
    	});

    	return block;
    }

    // (39:28) <Link to="Login">
    function create_default_slot_3$5(ctx) {
    	let a;
    	let span;

    	const block = {
    		c: function create() {
    			a = element("a");
    			span = element("span");
    			span.textContent = "Войти";
    			attr_dev(span, "class", "text-white underline ml-6");
    			add_location(span, file$8, 39, 44, 2541);
    			attr_dev(a, "href", "#");
    			add_location(a, file$8, 39, 32, 2529);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$5.name,
    		type: "slot",
    		source: "(39:28) <Link to=\\\"Login\\\">",
    		ctx
    	});

    	return block;
    }

    // (52:28) <Link to="Mainprofile">
    function create_default_slot_2$5(ctx) {
    	let a;
    	let i;
    	let t;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			t = text("Profile");
    			attr_dev(i, "class", "fa fa-user fa-fw");
    			add_location(i, file$8, 52, 143, 3841);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "p-2 hover:bg-gray-800 text-white text-sm no-underline hover:no-underline block text-center");
    			add_location(a, file$8, 52, 32, 3730);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    			append_dev(a, t);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$5.name,
    		type: "slot",
    		source: "(52:28) <Link to=\\\"Mainprofile\\\">",
    		ctx
    	});

    	return block;
    }

    // (69:16) <Link to="/">
    function create_default_slot_1$5(ctx) {
    	let a;
    	let i;
    	let span;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			span = element("span");
    			span.textContent = "Главное меню";
    			attr_dev(i, "class", "fas fa-home pr-0 ml-4 md:ml-0 md:pr-3");
    			add_location(i, file$8, 70, 24, 5019);
    			attr_dev(span, "class", "pb-1 md:pb-0 text-xs md:text-base  md:text-white block md:inline-block");
    			add_location(span, file$8, 70, 77, 5072);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "block py-1 md:py-3 pl-1 align-middle text-white no-underline hover:text-white hover:border-pink-500");
    			add_location(a, file$8, 69, 20, 4873);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    			append_dev(a, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$5.name,
    		type: "slot",
    		source: "(69:16) <Link to=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (76:16) <Link to="Japanliterature">
    function create_default_slot$6(ctx) {
    	let a;
    	let i;
    	let span;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			span = element("span");
    			span.textContent = "Японская литература";
    			attr_dev(i, "class", "fa fa-book pr-0 md:pr-3 ml-6 md:ml-0");
    			add_location(i, file$8, 77, 24, 5515);
    			attr_dev(span, "class", "pb-1 md:pb-0 text-xs md:text-base  md:text-white block md:inline-block");
    			add_location(span, file$8, 77, 76, 5567);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "block py-1 md:py-3 pl-1 align-middle text-white no-underline hover:text-white hover:border-purple-500");
    			add_location(a, file$8, 76, 20, 5367);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    			append_dev(a, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(76:16) <Link to=\\\"Japanliterature\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let body;
    	let nav;
    	let div9;
    	let div0;
    	let t0;
    	let div2;
    	let span0;
    	let input0;
    	let t1;
    	let div1;
    	let svg0;
    	let path0;
    	let t2;
    	let div8;
    	let ul0;
    	let li0;
    	let div3;
    	let p0;
    	let t3;
    	let li1;
    	let div4;
    	let p1;
    	let t4;
    	let ul1;
    	let li2;
    	let div7;
    	let button;
    	let span1;
    	let i0;
    	let t5;
    	let svg1;
    	let path1;
    	let t6;
    	let div6;
    	let input1;
    	let t7;
    	let t8;
    	let a0;
    	let i1;
    	let t9;
    	let t10;
    	let div5;
    	let t11;
    	let a1;
    	let i2;
    	let t12;
    	let t13;
    	let div11;
    	let div10;
    	let ul2;
    	let li3;
    	let t14;
    	let li4;
    	let t15;
    	let li5;
    	let a2;
    	let i3;
    	let span2;
    	let t17;
    	let div14;
    	let div13;
    	let div12;
    	let img;
    	let img_src_value;
    	let t18;
    	let h10;
    	let t20;
    	let div53;
    	let div52;
    	let div51;
    	let h11;
    	let t22;
    	let input2;
    	let t23;
    	let div15;
    	let t24;
    	let ul3;
    	let li6;
    	let div16;
    	let h30;
    	let t26;
    	let div26;
    	let div25;
    	let div23;
    	let div19;
    	let div17;
    	let span3;
    	let t28;
    	let div18;
    	let span4;
    	let t30;
    	let div22;
    	let div20;
    	let span5;
    	let t32;
    	let div21;
    	let span6;
    	let t34;
    	let div24;
    	let a3;
    	let t35;
    	let a4;
    	let t36;
    	let a5;
    	let t37;
    	let a6;
    	let t38;
    	let a7;
    	let t39;
    	let a8;
    	let t40;
    	let div27;
    	let t41;
    	let div28;
    	let h31;
    	let t43;
    	let div38;
    	let div37;
    	let div35;
    	let div31;
    	let div29;
    	let span7;
    	let t45;
    	let div30;
    	let span8;
    	let t47;
    	let div34;
    	let div32;
    	let span9;
    	let t49;
    	let div33;
    	let span10;
    	let t51;
    	let div36;
    	let a9;
    	let t52;
    	let a10;
    	let t53;
    	let a11;
    	let t54;
    	let a12;
    	let t55;
    	let a13;
    	let t56;
    	let a14;
    	let t57;
    	let div39;
    	let t58;
    	let div40;
    	let h32;
    	let t60;
    	let div50;
    	let div49;
    	let div47;
    	let div43;
    	let div41;
    	let span11;
    	let t62;
    	let div42;
    	let span12;
    	let t64;
    	let div46;
    	let div44;
    	let span13;
    	let t66;
    	let div45;
    	let span14;
    	let t68;
    	let div48;
    	let a15;
    	let t69;
    	let a16;
    	let t70;
    	let a17;
    	let t71;
    	let a18;
    	let t72;
    	let a19;
    	let t73;
    	let a20;
    	let t74;
    	let script;
    	let t76;
    	let style;
    	let current;

    	const link0 = new Link({
    			props: {
    				to: "/",
    				$$slots: { default: [create_default_slot_5$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link1 = new Link({
    			props: {
    				to: "Register",
    				$$slots: { default: [create_default_slot_4$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link2 = new Link({
    			props: {
    				to: "Login",
    				$$slots: { default: [create_default_slot_3$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link3 = new Link({
    			props: {
    				to: "Mainprofile",
    				$$slots: { default: [create_default_slot_2$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link4 = new Link({
    			props: {
    				to: "/",
    				$$slots: { default: [create_default_slot_1$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link5 = new Link({
    			props: {
    				to: "Japanliterature",
    				$$slots: { default: [create_default_slot$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const ranobe0 = new Profileliteratur({ $$inline: true });
    	const ranobe1 = new Profileliteratur({ $$inline: true });
    	const ranobe2 = new Profileliteratur({ $$inline: true });
    	const ranobe3 = new Profileliteratur({ $$inline: true });
    	const ranobe4 = new Profileliteratur({ $$inline: true });
    	const ranobe5 = new Profileliteratur({ $$inline: true });
    	const ranobe6 = new Profileliteratur({ $$inline: true });
    	const ranobe7 = new Profileliteratur({ $$inline: true });
    	const ranobe8 = new Profileliteratur({ $$inline: true });
    	const ranobe9 = new Profileliteratur({ $$inline: true });
    	const ranobe10 = new Profileliteratur({ $$inline: true });
    	const ranobe11 = new Profileliteratur({ $$inline: true });
    	const ranobe12 = new Profileliteratur({ $$inline: true });
    	const ranobe13 = new Profileliteratur({ $$inline: true });
    	const ranobe14 = new Profileliteratur({ $$inline: true });
    	const ranobe15 = new Profileliteratur({ $$inline: true });
    	const ranobe16 = new Profileliteratur({ $$inline: true });
    	const ranobe17 = new Profileliteratur({ $$inline: true });

    	const block = {
    		c: function create() {
    			body = element("body");
    			nav = element("nav");
    			div9 = element("div");
    			div0 = element("div");
    			create_component(link0.$$.fragment);
    			t0 = space();
    			div2 = element("div");
    			span0 = element("span");
    			input0 = element("input");
    			t1 = space();
    			div1 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t2 = space();
    			div8 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			div3 = element("div");
    			p0 = element("p");
    			create_component(link1.$$.fragment);
    			t3 = space();
    			li1 = element("li");
    			div4 = element("div");
    			p1 = element("p");
    			create_component(link2.$$.fragment);
    			t4 = space();
    			ul1 = element("ul");
    			li2 = element("li");
    			div7 = element("div");
    			button = element("button");
    			span1 = element("span");
    			i0 = element("i");
    			t5 = text(" Привет, пользователь ");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t6 = space();
    			div6 = element("div");
    			input1 = element("input");
    			t7 = space();
    			create_component(link3.$$.fragment);
    			t8 = space();
    			a0 = element("a");
    			i1 = element("i");
    			t9 = text(" Settings");
    			t10 = space();
    			div5 = element("div");
    			t11 = space();
    			a1 = element("a");
    			i2 = element("i");
    			t12 = text(" Log Out");
    			t13 = space();
    			div11 = element("div");
    			div10 = element("div");
    			ul2 = element("ul");
    			li3 = element("li");
    			create_component(link4.$$.fragment);
    			t14 = space();
    			li4 = element("li");
    			create_component(link5.$$.fragment);
    			t15 = space();
    			li5 = element("li");
    			a2 = element("a");
    			i3 = element("i");
    			span2 = element("span");
    			span2.textContent = "Analytics";
    			t17 = space();
    			div14 = element("div");
    			div13 = element("div");
    			div12 = element("div");
    			img = element("img");
    			t18 = space();
    			h10 = element("h1");
    			h10.textContent = "Shruken";
    			t20 = space();
    			div53 = element("div");
    			div52 = element("div");
    			div51 = element("div");
    			h11 = element("h1");
    			h11.textContent = "Список японских литератур";
    			t22 = space();
    			input2 = element("input");
    			t23 = space();
    			div15 = element("div");
    			t24 = space();
    			ul3 = element("ul");
    			li6 = element("li");
    			div16 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Запланировано";
    			t26 = space();
    			div26 = element("div");
    			div25 = element("div");
    			div23 = element("div");
    			div19 = element("div");
    			div17 = element("div");
    			span3 = element("span");
    			span3.textContent = "#";
    			t28 = space();
    			div18 = element("div");
    			span4 = element("span");
    			span4.textContent = "Название";
    			t30 = space();
    			div22 = element("div");
    			div20 = element("div");
    			span5 = element("span");
    			span5.textContent = "Оценка";
    			t32 = space();
    			div21 = element("div");
    			span6 = element("span");
    			span6.textContent = "Страницы";
    			t34 = space();
    			div24 = element("div");
    			a3 = element("a");
    			create_component(ranobe0.$$.fragment);
    			t35 = space();
    			a4 = element("a");
    			create_component(ranobe1.$$.fragment);
    			t36 = space();
    			a5 = element("a");
    			create_component(ranobe2.$$.fragment);
    			t37 = space();
    			a6 = element("a");
    			create_component(ranobe3.$$.fragment);
    			t38 = space();
    			a7 = element("a");
    			create_component(ranobe4.$$.fragment);
    			t39 = space();
    			a8 = element("a");
    			create_component(ranobe5.$$.fragment);
    			t40 = space();
    			div27 = element("div");
    			t41 = space();
    			div28 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Хочу читать";
    			t43 = space();
    			div38 = element("div");
    			div37 = element("div");
    			div35 = element("div");
    			div31 = element("div");
    			div29 = element("div");
    			span7 = element("span");
    			span7.textContent = "#";
    			t45 = space();
    			div30 = element("div");
    			span8 = element("span");
    			span8.textContent = "Название";
    			t47 = space();
    			div34 = element("div");
    			div32 = element("div");
    			span9 = element("span");
    			span9.textContent = "Оценка";
    			t49 = space();
    			div33 = element("div");
    			span10 = element("span");
    			span10.textContent = "Страницы";
    			t51 = space();
    			div36 = element("div");
    			a9 = element("a");
    			create_component(ranobe6.$$.fragment);
    			t52 = space();
    			a10 = element("a");
    			create_component(ranobe7.$$.fragment);
    			t53 = space();
    			a11 = element("a");
    			create_component(ranobe8.$$.fragment);
    			t54 = space();
    			a12 = element("a");
    			create_component(ranobe9.$$.fragment);
    			t55 = space();
    			a13 = element("a");
    			create_component(ranobe10.$$.fragment);
    			t56 = space();
    			a14 = element("a");
    			create_component(ranobe11.$$.fragment);
    			t57 = space();
    			div39 = element("div");
    			t58 = space();
    			div40 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Прочитано";
    			t60 = space();
    			div50 = element("div");
    			div49 = element("div");
    			div47 = element("div");
    			div43 = element("div");
    			div41 = element("div");
    			span11 = element("span");
    			span11.textContent = "#";
    			t62 = space();
    			div42 = element("div");
    			span12 = element("span");
    			span12.textContent = "Название";
    			t64 = space();
    			div46 = element("div");
    			div44 = element("div");
    			span13 = element("span");
    			span13.textContent = "Оценка";
    			t66 = space();
    			div45 = element("div");
    			span14 = element("span");
    			span14.textContent = "Страницы";
    			t68 = space();
    			div48 = element("div");
    			a15 = element("a");
    			create_component(ranobe12.$$.fragment);
    			t69 = space();
    			a16 = element("a");
    			create_component(ranobe13.$$.fragment);
    			t70 = space();
    			a17 = element("a");
    			create_component(ranobe14.$$.fragment);
    			t71 = space();
    			a18 = element("a");
    			create_component(ranobe15.$$.fragment);
    			t72 = space();
    			a19 = element("a");
    			create_component(ranobe16.$$.fragment);
    			t73 = space();
    			a20 = element("a");
    			create_component(ranobe17.$$.fragment);
    			t74 = space();
    			script = element("script");
    			script.textContent = "/*Toggle dropdown list*/\r\n    function toggleD(myDropMen) {\r\n        document.getElementById(myDropMen).classList.toggle(\"invisible\");\r\n    }\r\n    /*Filter dropdown options*/\r\n    function filterD(myDropMen, myDropMenuSearc) {\r\n        var input, filter, ul, li, a, i;\r\n        input = document.getElementById(myDropMenuSearc);\r\n        filter = input.value.toUpperCase();\r\n        div = document.getElementById(myDropMen);\r\n        a = div.getElementsByTagName(\"a\");\r\n        for (i = 0; i < a.length; i++) {\r\n            if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {\r\n                a[i].style.display = \"\";\r\n            } else {\r\n                a[i].style.display = \"none\";\r\n            }\r\n        }\r\n    }\r\n    // Close the dropdown menu if the user clicks outside of it\r\n    window.onclick = function(event) {\r\n        if (!event.target.matches('.drop-butto') && !event.target.matches('.drop-searc')) {\r\n            var dropdowns = document.getElementsByClassName(\"dropdownlis\");\r\n            for (var i = 0; i < dropdowns.length; i++) {\r\n                var openDropdown = dropdowns[i];\r\n                if (!openDropdown.classList.contains('invisible')) {\r\n                    openDropdown.classList.add('invisible');\r\n                }\r\n            }\r\n        }\r\n    }\r\n    /*Toggle dropdown list*/\r\n    function toggleDD(myDropMenu) {\r\n        document.getElementById(myDropMenu).classList.toggle(\"invisible\");\r\n    }\r\n    /*Filter dropdown options*/\r\n    function filterDD(myDropMenu, myDropMenuSearch) {\r\n        var input, filter, ul, li, a, i;\r\n        input = document.getElementById(myDropMenuSearch);\r\n        filter = input.value.toUpperCase();\r\n        div = document.getElementById(myDropMenu);\r\n        a = div.getElementsByTagName(\"a\");\r\n        for (i = 0; i < a.length; i++) {\r\n            if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {\r\n                a[i].style.display = \"\";\r\n            } else {\r\n                a[i].style.display = \"none\";\r\n            }\r\n        }\r\n    }\r\n    // Close the dropdown menu if the user clicks outside of it\r\n    window.onclick = function(event) {\r\n        if (!event.target.matches('.drop-button') && !event.target.matches('.drop-search')) {\r\n            var dropdowns = document.getElementsByClassName(\"dropdownlist\");\r\n            for (var i = 0; i < dropdowns.length; i++) {\r\n                var openDropdown = dropdowns[i];\r\n                if (!openDropdown.classList.contains('invisible')) {\r\n                    openDropdown.classList.add('invisible');\r\n                }\r\n            }\r\n        }\r\n    }\r\n\r\n\r\n    function filterDD1(myDropMenu_1,myDropMenu_2,myDropMenu_3, myDropMenuSearch_1) {\r\n        var input, filter_1, filter_2, filter_3, ul, li, a, i,b,c;\r\n        input = document.getElementById(myDropMenuSearch_1);\r\n        filter_1 = input.value.toUpperCase();\r\n        filter_2 = input.value.toUpperCase();\r\n        filter_3 = input.value.toUpperCase();\r\n        div = document.getElementById(myDropMenu_1);\r\n        div1 = document.getElementById(myDropMenu_2);\r\n        div2 = document.getElementById(myDropMenu_3);\r\n        a = div.getElementsByTagName(\"a\");\r\n        b = div1.getElementsByTagName(\"a\");\r\n        c = div2.getElementsByTagName(\"a\");\r\n        for (i = 0; i < a.length; i++) {\r\n            if (a[i].innerHTML.toUpperCase().indexOf(filter_1) > -1) {\r\n                a[i].style.display = \"\";\r\n            } else {\r\n                a[i].style.display = \"none\";\r\n            }\r\n            if (b[i].innerHTML.toUpperCase().indexOf(filter_2) > -1) {\r\n                b[i].style.display = \"\";\r\n            } else {\r\n                b[i].style.display = \"none\";\r\n            }\r\n            if (c[i].innerHTML.toUpperCase().indexOf(filter_3) > -1) {\r\n                c[i].style.display = \"\";\r\n            } else {\r\n                c[i].style.display = \"none\";\r\n            }\r\n        }\r\n    }\r\n    window.onclick = function(event) {\r\n        if (!event.target.matches('.drop-button_1') && !event.target.matches('.drop-search_1')) {\r\n            var dropdowns = document.getElementsByClassName(\"dropdownlist_1\");\r\n            for (var i = 0; i < dropdowns.length; i++) {\r\n                var openDropdown = dropdowns[i];\r\n                if (!openDropdown.classList.contains('visible')) {\r\n                    openDropdown.classList.add('visible');\r\n                }\r\n            }\r\n        }\r\n    }";
    			t76 = space();
    			style = element("style");
    			style.textContent = ".mega-menu_9 {\n  display: none;\n  left: 0;\n  position: absolute;\n  text-align: left;\n  width: 100%;\n}\n\n.toggle-input_9 {\n  display: none;\n}\n\n.toggle-input_9:not(checked) ~ .mega-menu_9 {\n  display: none;\n}\n\n.toggleable_9 > label:after\r\n{\n  content: \"\\25BC\";\n  font-size: 10px;\n  padding-left: 6px;\n  position: relative;\n  top: -1px;\n}\n\n.toggle-input_9:checked ~ .mega-menu_9 {\n  display: block;\n}\n\n.toggle-input_9:checked ~ label:after {\n  content: \"\\25B2\";\n  font-size: 10px;\n  padding-left: 6px;\n  position: relative;\n  top: -1px;\n}\n\n.mega-menu_8 {\n  display: none;\n  left: 0;\n  position: absolute;\n  text-align: left;\n  width: 100%;\n}\n\n.toggle-input_8 {\n  display: none;\n}\n\n.toggle-input_8:not(checked) ~ .mega-menu_8 {\n  display: none;\n}\n\n.toggleable_8 > label:after\r\n{\n  content: \"\\25BC\";\n  font-size: 10px;\n  padding-left: 6px;\n  position: relative;\n  top: -1px;\n}\n\n.toggle-input_8:checked ~ .mega-menu_8 {\n  display: block;\n}\n\n.toggle-input_8:checked ~ label:after {\n  content: \"\\25B2\";\n  font-size: 10px;\n  padding-left: 6px;\n  position: relative;\n  top: -1px;\n}\n\n.mega-menu_7 {\n  display: none;\n  left: 0;\n  position: absolute;\n  text-align: left;\n  width: 100%;\n}\n\n.toggle-input_7 {\n  display: none;\n}\n\n.toggle-input_7:not(checked) ~ .mega-menu_7 {\n  display: none;\n}\n\n.toggleable_7 > label:after\r\n{\n  content: \"\\25BC\";\n  font-size: 10px;\n  padding-left: 6px;\n  position: relative;\n  top: -1px;\n}\n\n.toggle-input_7:checked ~ .mega-menu_7 {\n  display: block;\n}\n\n.toggle-input_7:checked ~ label:after {\n  content: \"\\25B2\";\n  font-size: 10px;\n  padding-left: 6px;\n  position: relative;\n  top: -1px;\n}\n\n.mega-menu_6 {\n  display: none;\n  left: 0;\n  position: absolute;\n  text-align: left;\n  width: 100%;\n}\n\n.toggle-input_6 {\n  display: none;\n}\n\n.toggle-input_6:not(checked) ~ .mega-menu_6 {\n  display: none;\n}\n\n.toggleable_6 > label:after\r\n{\n  content: \"\\25BC\";\n  font-size: 10px;\n  padding-left: 6px;\n  position: relative;\n  top: -1px;\n}\n\n.toggle-input_6:checked ~ .mega-menu_6 {\n  display: block;\n}\n\n.toggle-input_6:checked ~ label:after {\n  content: \"\\25B2\";\n  font-size: 10px;\n  padding-left: 6px;\n  position: relative;\n  top: -1px;\n}\n\n.mega-menu_5 {\n  display: none;\n  left: 0;\n  position: absolute;\n  text-align: left;\n  width: 100%;\n}\n\n.toggle-input_5 {\n  display: none;\n}\n\n.toggle-input_5:not(checked) ~ .mega-menu_5 {\n  display: none;\n}\n\n.toggleable_5 > label:after\r\n{\n  content: \"\\25BC\";\n  font-size: 10px;\n  padding-left: 6px;\n  position: relative;\n  top: -1px;\n}\n\n.toggle-input_5:checked ~ .mega-menu_5 {\n  display: block;\n}\n\n.toggle-input_5:checked ~ label:after {\n  content: \"\\25B2\";\n  font-size: 10px;\n  padding-left: 6px;\n  position: relative;\n  top: -1px;\n}\n\n.mega-menu_4 {\n  display: none;\n  left: 0;\n  position: absolute;\n  text-align: left;\n  width: 100%;\n}\n\n.toggle-input_4 {\n  display: none;\n}\n\n.toggle-input_4:not(checked) ~ .mega-menu_4 {\n  display: none;\n}\n\n.toggleable_4 > label:after\r\n{\n  content: \"\\25BC\";\n  font-size: 10px;\n  padding-left: 6px;\n  position: relative;\n  top: -1px;\n}\n\n.toggle-input_4:checked ~ .mega-menu_4 {\n  display: block;\n}\n\n.toggle-input_4:checked ~ label:after {\n  content: \"\\25B2\";\n  font-size: 10px;\n  padding-left: 6px;\n  position: relative;\n  top: -1px;\n}\n\n.mega-menu_3 {\n  display: none;\n  left: 0;\n  position: absolute;\n  text-align: left;\n  width: 100%;\n}\n\n.toggle-input_3 {\n  display: none;\n}\n\n.toggle-input_3:not(checked) ~ .mega-menu_3 {\n  display: none;\n}\n\n.toggleable_3 > label:after\r\n{\n  content: \"\\25BC\";\n  font-size: 10px;\n  padding-left: 6px;\n  position: relative;\n  top: -1px;\n}\n\n.toggle-input_3:checked ~ .mega-menu_3 {\n  display: block;\n}\n\n.toggle-input_3:checked ~ label:after {\n  content: \"\\25B2\";\n  font-size: 10px;\n  padding-left: 6px;\n  position: relative;\n  top: -1px;\n}\n\n.mega-menu_2 {\n  display: none;\n  left: 0;\n  position: absolute;\n  text-align: left;\n  width: 100%;\n}\n\n.toggleable_2  > label:after {\n  content: \"\\25BC\";\n  font-size: 10px;\n  padding-left: 6px;\n  position: relative;\n  top: -1px;\n}\n\n.toggle-input_2 {\n  display: none;\n}\n\n.toggle-input_2:not(checked) ~ .mega-menu_2 {\n  display: none;\n}\n\n.toggle-input_2:checked ~ .mega-menu_2 {\n  display: block;\n}\n\n.toggle-input_2:checked ~ label:after {\n  content: \"\\25B2\";\n  font-size: 10px;\n  padding-left: 6px;\n  position: relative;\n  top: -1px;\n}\n\n.mega-menu_1 {\n  display: none;\n  left: 0;\n  position: absolute;\n  text-align: left;\n  width: 100%;\n}\n\n.toggleable_1 > label:after\r\n{\n  content: \"\\25BC\";\n  font-size: 10px;\n  padding-left: 6px;\n  position: relative;\n  top: -1px;\n}\n\n.toggle-input_1 {\n  display: none;\n}\n\n.toggle-input_1:not(checked) ~ .mega-menu_1 {\n  display: none;\n}\n\n.toggle-input_1:checked ~ .mega-menu_1 {\n  display: block;\n}\n\n.toggle-input_1:checked ~ label:after {\n  content: \"\\25B2\";\n  font-size: 10px;\n  padding-left: 6px;\n  position: relative;\n  top: -1px;\n}\n\n.mega-menu {\n  display: none;\n  left: 0;\n  position: absolute;\n  text-align: left;\n  width: 100%;\n}\n\n.toggleable  > label:after {\n  content: \"\\25BC\";\n  font-size: 10px;\n  padding-left: 6px;\n  position: relative;\n  top: -1px;\n}\n\n.toggle-input {\n  display: none;\n}\n\n.toggle-input:not(checked) ~ .mega-menu {\n  display: none;\n}\n\n.toggle-input:checked ~ .mega-menu {\n  display: block;\n}\n\n.toggle-input:checked ~ label:after {\n  content: \"\\25B2\";\n  font-size: 10px;\n  padding-left: 6px;\n  position: relative;\n  top: -1px;\n}\n\ninput[type=\"number\"]::-webkit-outer-spin-button,\r\n input[type=\"number\"]::-webkit-inner-spin-button {\n  -webkit-appearance: none;\n}\n\ninput[type=number]::-webkit-inner-spin-button,\r\ninput[type=number]::-webkit-outer-spin-button {\n  -webkit-appearance: none;\n  margin: 0;\n}\r\n\r\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tYWlucHJvZmlsZS5zdmVsdGUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7RUFDSSxhQUFhO0VBQ2IsT0FBTztFQUNQLGtCQUFrQjtFQUNsQixnQkFBZ0I7RUFDaEIsV0FBVztBQUNmOztBQUNBO0VBQ0ksYUFBYTtBQUNqQjs7QUFDQTtFQUNJLGFBQWE7QUFDakI7O0FBQ0E7O0VBRUksZ0JBQWdCO0VBQ2hCLGVBQWU7RUFDZixpQkFBaUI7RUFDakIsa0JBQWtCO0VBQ2xCLFNBQVM7QUFDYjs7QUFDQTtFQUNJLGNBQWM7QUFDbEI7O0FBQ0E7RUFDSSxnQkFBZ0I7RUFDaEIsZUFBZTtFQUNmLGlCQUFpQjtFQUNqQixrQkFBa0I7RUFDbEIsU0FBUztBQUNiOztBQUNBO0VBQ0ksYUFBYTtFQUNiLE9BQU87RUFDUCxrQkFBa0I7RUFDbEIsZ0JBQWdCO0VBQ2hCLFdBQVc7QUFDZjs7QUFDQTtFQUNJLGFBQWE7QUFDakI7O0FBQ0E7RUFDSSxhQUFhO0FBQ2pCOztBQUNBOztFQUVJLGdCQUFnQjtFQUNoQixlQUFlO0VBQ2YsaUJBQWlCO0VBQ2pCLGtCQUFrQjtFQUNsQixTQUFTO0FBQ2I7O0FBQ0E7RUFDSSxjQUFjO0FBQ2xCOztBQUNBO0VBQ0ksZ0JBQWdCO0VBQ2hCLGVBQWU7RUFDZixpQkFBaUI7RUFDakIsa0JBQWtCO0VBQ2xCLFNBQVM7QUFDYjs7QUFDQTtFQUNJLGFBQWE7RUFDYixPQUFPO0VBQ1Asa0JBQWtCO0VBQ2xCLGdCQUFnQjtFQUNoQixXQUFXO0FBQ2Y7O0FBQ0E7RUFDSSxhQUFhO0FBQ2pCOztBQUNBO0VBQ0ksYUFBYTtBQUNqQjs7QUFDQTs7RUFFSSxnQkFBZ0I7RUFDaEIsZUFBZTtFQUNmLGlCQUFpQjtFQUNqQixrQkFBa0I7RUFDbEIsU0FBUztBQUNiOztBQUNBO0VBQ0ksY0FBYztBQUNsQjs7QUFDQTtFQUNJLGdCQUFnQjtFQUNoQixlQUFlO0VBQ2YsaUJBQWlCO0VBQ2pCLGtCQUFrQjtFQUNsQixTQUFTO0FBQ2I7O0FBQ0E7RUFDSSxhQUFhO0VBQ2IsT0FBTztFQUNQLGtCQUFrQjtFQUNsQixnQkFBZ0I7RUFDaEIsV0FBVztBQUNmOztBQUNBO0VBQ0ksYUFBYTtBQUNqQjs7QUFDQTtFQUNJLGFBQWE7QUFDakI7O0FBQ0E7O0VBRUksZ0JBQWdCO0VBQ2hCLGVBQWU7RUFDZixpQkFBaUI7RUFDakIsa0JBQWtCO0VBQ2xCLFNBQVM7QUFDYjs7QUFDQTtFQUNJLGNBQWM7QUFDbEI7O0FBQ0E7RUFDSSxnQkFBZ0I7RUFDaEIsZUFBZTtFQUNmLGlCQUFpQjtFQUNqQixrQkFBa0I7RUFDbEIsU0FBUztBQUNiOztBQUNBO0VBQ0ksYUFBYTtFQUNiLE9BQU87RUFDUCxrQkFBa0I7RUFDbEIsZ0JBQWdCO0VBQ2hCLFdBQVc7QUFDZjs7QUFDQTtFQUNJLGFBQWE7QUFDakI7O0FBQ0E7RUFDSSxhQUFhO0FBQ2pCOztBQUNBOztFQUVJLGdCQUFnQjtFQUNoQixlQUFlO0VBQ2YsaUJBQWlCO0VBQ2pCLGtCQUFrQjtFQUNsQixTQUFTO0FBQ2I7O0FBQ0E7RUFDSSxjQUFjO0FBQ2xCOztBQUNBO0VBQ0ksZ0JBQWdCO0VBQ2hCLGVBQWU7RUFDZixpQkFBaUI7RUFDakIsa0JBQWtCO0VBQ2xCLFNBQVM7QUFDYjs7QUFDQTtFQUNJLGFBQWE7RUFDYixPQUFPO0VBQ1Asa0JBQWtCO0VBQ2xCLGdCQUFnQjtFQUNoQixXQUFXO0FBQ2Y7O0FBQ0E7RUFDSSxhQUFhO0FBQ2pCOztBQUNBO0VBQ0ksYUFBYTtBQUNqQjs7QUFDQTs7RUFFSSxnQkFBZ0I7RUFDaEIsZUFBZTtFQUNmLGlCQUFpQjtFQUNqQixrQkFBa0I7RUFDbEIsU0FBUztBQUNiOztBQUNBO0VBQ0ksY0FBYztBQUNsQjs7QUFDQTtFQUNJLGdCQUFnQjtFQUNoQixlQUFlO0VBQ2YsaUJBQWlCO0VBQ2pCLGtCQUFrQjtFQUNsQixTQUFTO0FBQ2I7O0FBQ0E7RUFDSSxhQUFhO0VBQ2IsT0FBTztFQUNQLGtCQUFrQjtFQUNsQixnQkFBZ0I7RUFDaEIsV0FBVztBQUNmOztBQUNBO0VBQ0ksYUFBYTtBQUNqQjs7QUFDQTtFQUNJLGFBQWE7QUFDakI7O0FBQ0E7O0VBRUksZ0JBQWdCO0VBQ2hCLGVBQWU7RUFDZixpQkFBaUI7RUFDakIsa0JBQWtCO0VBQ2xCLFNBQVM7QUFDYjs7QUFDQTtFQUNJLGNBQWM7QUFDbEI7O0FBQ0E7RUFDSSxnQkFBZ0I7RUFDaEIsZUFBZTtFQUNmLGlCQUFpQjtFQUNqQixrQkFBa0I7RUFDbEIsU0FBUztBQUNiOztBQUNBO0VBQ0ksYUFBYTtFQUNiLE9BQU87RUFDUCxrQkFBa0I7RUFDbEIsZ0JBQWdCO0VBQ2hCLFdBQVc7QUFDZjs7QUFDQTtFQUNJLGdCQUFnQjtFQUNoQixlQUFlO0VBQ2YsaUJBQWlCO0VBQ2pCLGtCQUFrQjtFQUNsQixTQUFTO0FBQ2I7O0FBRUE7RUFDSSxhQUFhO0FBQ2pCOztBQUNBO0VBQ0ksYUFBYTtBQUNqQjs7QUFFQTtFQUNJLGNBQWM7QUFDbEI7O0FBQ0E7RUFDSSxnQkFBZ0I7RUFDaEIsZUFBZTtFQUNmLGlCQUFpQjtFQUNqQixrQkFBa0I7RUFDbEIsU0FBUztBQUNiOztBQUVBO0VBQ0ksYUFBYTtFQUNiLE9BQU87RUFDUCxrQkFBa0I7RUFDbEIsZ0JBQWdCO0VBQ2hCLFdBQVc7QUFDZjs7QUFDQTs7RUFFSSxnQkFBZ0I7RUFDaEIsZUFBZTtFQUNmLGlCQUFpQjtFQUNqQixrQkFBa0I7RUFDbEIsU0FBUztBQUNiOztBQUNBO0VBQ0ksYUFBYTtBQUNqQjs7QUFDQTtFQUNJLGFBQWE7QUFDakI7O0FBRUE7RUFDSSxjQUFjO0FBQ2xCOztBQUNBO0VBQ0ksZ0JBQWdCO0VBQ2hCLGVBQWU7RUFDZixpQkFBaUI7RUFDakIsa0JBQWtCO0VBQ2xCLFNBQVM7QUFDYjs7QUFFQTtFQUNJLGFBQWE7RUFDYixPQUFPO0VBQ1Asa0JBQWtCO0VBQ2xCLGdCQUFnQjtFQUNoQixXQUFXO0FBQ2Y7O0FBQ0E7RUFDSSxnQkFBZ0I7RUFDaEIsZUFBZTtFQUNmLGlCQUFpQjtFQUNqQixrQkFBa0I7RUFDbEIsU0FBUztBQUNiOztBQUVBO0VBQ0ksYUFBYTtBQUNqQjs7QUFDQTtFQUNJLGFBQWE7QUFDakI7O0FBRUE7RUFDSSxjQUFjO0FBQ2xCOztBQUNBO0VBQ0ksZ0JBQWdCO0VBQ2hCLGVBQWU7RUFDZixpQkFBaUI7RUFDakIsa0JBQWtCO0VBQ2xCLFNBQVM7QUFDYjs7QUFDQzs7RUFFSSx3QkFBd0I7QUFDNUI7O0FBQ0Q7O0VBRUksd0JBQXdCO0VBQ3hCLFNBQVM7QUFDYiIsImZpbGUiOiJzcmMvbWFpbnByb2ZpbGUuc3ZlbHRlIiwic291cmNlc0NvbnRlbnQiOlsiXHJcbi5tZWdhLW1lbnVfOSB7XHJcbiAgICBkaXNwbGF5OiBub25lO1xyXG4gICAgbGVmdDogMDtcclxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICAgIHRleHQtYWxpZ246IGxlZnQ7XHJcbiAgICB3aWR0aDogMTAwJTtcclxufVxyXG4udG9nZ2xlLWlucHV0Xzkge1xyXG4gICAgZGlzcGxheTogbm9uZTtcclxufVxyXG4udG9nZ2xlLWlucHV0Xzk6bm90KGNoZWNrZWQpIH4gLm1lZ2EtbWVudV85IHtcclxuICAgIGRpc3BsYXk6IG5vbmU7XHJcbn1cclxuLnRvZ2dsZWFibGVfOSA+IGxhYmVsOmFmdGVyXHJcbntcclxuICAgIGNvbnRlbnQ6IFwiXFwyNUJDXCI7XHJcbiAgICBmb250LXNpemU6IDEwcHg7XHJcbiAgICBwYWRkaW5nLWxlZnQ6IDZweDtcclxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcclxuICAgIHRvcDogLTFweDtcclxufVxyXG4udG9nZ2xlLWlucHV0Xzk6Y2hlY2tlZCB+IC5tZWdhLW1lbnVfOSB7XHJcbiAgICBkaXNwbGF5OiBibG9jaztcclxufVxyXG4udG9nZ2xlLWlucHV0Xzk6Y2hlY2tlZCB+IGxhYmVsOmFmdGVyIHtcclxuICAgIGNvbnRlbnQ6IFwiXFwyNUIyXCI7XHJcbiAgICBmb250LXNpemU6IDEwcHg7XHJcbiAgICBwYWRkaW5nLWxlZnQ6IDZweDtcclxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcclxuICAgIHRvcDogLTFweDtcclxufVxyXG4ubWVnYS1tZW51Xzgge1xyXG4gICAgZGlzcGxheTogbm9uZTtcclxuICAgIGxlZnQ6IDA7XHJcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgICB0ZXh0LWFsaWduOiBsZWZ0O1xyXG4gICAgd2lkdGg6IDEwMCU7XHJcbn1cclxuLnRvZ2dsZS1pbnB1dF84IHtcclxuICAgIGRpc3BsYXk6IG5vbmU7XHJcbn1cclxuLnRvZ2dsZS1pbnB1dF84Om5vdChjaGVja2VkKSB+IC5tZWdhLW1lbnVfOCB7XHJcbiAgICBkaXNwbGF5OiBub25lO1xyXG59XHJcbi50b2dnbGVhYmxlXzggPiBsYWJlbDphZnRlclxyXG57XHJcbiAgICBjb250ZW50OiBcIlxcMjVCQ1wiO1xyXG4gICAgZm9udC1zaXplOiAxMHB4O1xyXG4gICAgcGFkZGluZy1sZWZ0OiA2cHg7XHJcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbiAgICB0b3A6IC0xcHg7XHJcbn1cclxuLnRvZ2dsZS1pbnB1dF84OmNoZWNrZWQgfiAubWVnYS1tZW51Xzgge1xyXG4gICAgZGlzcGxheTogYmxvY2s7XHJcbn1cclxuLnRvZ2dsZS1pbnB1dF84OmNoZWNrZWQgfiBsYWJlbDphZnRlciB7XHJcbiAgICBjb250ZW50OiBcIlxcMjVCMlwiO1xyXG4gICAgZm9udC1zaXplOiAxMHB4O1xyXG4gICAgcGFkZGluZy1sZWZ0OiA2cHg7XHJcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbiAgICB0b3A6IC0xcHg7XHJcbn1cclxuLm1lZ2EtbWVudV83IHtcclxuICAgIGRpc3BsYXk6IG5vbmU7XHJcbiAgICBsZWZ0OiAwO1xyXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xyXG4gICAgdGV4dC1hbGlnbjogbGVmdDtcclxuICAgIHdpZHRoOiAxMDAlO1xyXG59XHJcbi50b2dnbGUtaW5wdXRfNyB7XHJcbiAgICBkaXNwbGF5OiBub25lO1xyXG59XHJcbi50b2dnbGUtaW5wdXRfNzpub3QoY2hlY2tlZCkgfiAubWVnYS1tZW51Xzcge1xyXG4gICAgZGlzcGxheTogbm9uZTtcclxufVxyXG4udG9nZ2xlYWJsZV83ID4gbGFiZWw6YWZ0ZXJcclxue1xyXG4gICAgY29udGVudDogXCJcXDI1QkNcIjtcclxuICAgIGZvbnQtc2l6ZTogMTBweDtcclxuICAgIHBhZGRpbmctbGVmdDogNnB4O1xyXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gICAgdG9wOiAtMXB4O1xyXG59XHJcbi50b2dnbGUtaW5wdXRfNzpjaGVja2VkIH4gLm1lZ2EtbWVudV83IHtcclxuICAgIGRpc3BsYXk6IGJsb2NrO1xyXG59XHJcbi50b2dnbGUtaW5wdXRfNzpjaGVja2VkIH4gbGFiZWw6YWZ0ZXIge1xyXG4gICAgY29udGVudDogXCJcXDI1QjJcIjtcclxuICAgIGZvbnQtc2l6ZTogMTBweDtcclxuICAgIHBhZGRpbmctbGVmdDogNnB4O1xyXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gICAgdG9wOiAtMXB4O1xyXG59XHJcbi5tZWdhLW1lbnVfNiB7XHJcbiAgICBkaXNwbGF5OiBub25lO1xyXG4gICAgbGVmdDogMDtcclxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICAgIHRleHQtYWxpZ246IGxlZnQ7XHJcbiAgICB3aWR0aDogMTAwJTtcclxufVxyXG4udG9nZ2xlLWlucHV0XzYge1xyXG4gICAgZGlzcGxheTogbm9uZTtcclxufVxyXG4udG9nZ2xlLWlucHV0XzY6bm90KGNoZWNrZWQpIH4gLm1lZ2EtbWVudV82IHtcclxuICAgIGRpc3BsYXk6IG5vbmU7XHJcbn1cclxuLnRvZ2dsZWFibGVfNiA+IGxhYmVsOmFmdGVyXHJcbntcclxuICAgIGNvbnRlbnQ6IFwiXFwyNUJDXCI7XHJcbiAgICBmb250LXNpemU6IDEwcHg7XHJcbiAgICBwYWRkaW5nLWxlZnQ6IDZweDtcclxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcclxuICAgIHRvcDogLTFweDtcclxufVxyXG4udG9nZ2xlLWlucHV0XzY6Y2hlY2tlZCB+IC5tZWdhLW1lbnVfNiB7XHJcbiAgICBkaXNwbGF5OiBibG9jaztcclxufVxyXG4udG9nZ2xlLWlucHV0XzY6Y2hlY2tlZCB+IGxhYmVsOmFmdGVyIHtcclxuICAgIGNvbnRlbnQ6IFwiXFwyNUIyXCI7XHJcbiAgICBmb250LXNpemU6IDEwcHg7XHJcbiAgICBwYWRkaW5nLWxlZnQ6IDZweDtcclxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcclxuICAgIHRvcDogLTFweDtcclxufVxyXG4ubWVnYS1tZW51XzUge1xyXG4gICAgZGlzcGxheTogbm9uZTtcclxuICAgIGxlZnQ6IDA7XHJcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgICB0ZXh0LWFsaWduOiBsZWZ0O1xyXG4gICAgd2lkdGg6IDEwMCU7XHJcbn1cclxuLnRvZ2dsZS1pbnB1dF81IHtcclxuICAgIGRpc3BsYXk6IG5vbmU7XHJcbn1cclxuLnRvZ2dsZS1pbnB1dF81Om5vdChjaGVja2VkKSB+IC5tZWdhLW1lbnVfNSB7XHJcbiAgICBkaXNwbGF5OiBub25lO1xyXG59XHJcbi50b2dnbGVhYmxlXzUgPiBsYWJlbDphZnRlclxyXG57XHJcbiAgICBjb250ZW50OiBcIlxcMjVCQ1wiO1xyXG4gICAgZm9udC1zaXplOiAxMHB4O1xyXG4gICAgcGFkZGluZy1sZWZ0OiA2cHg7XHJcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbiAgICB0b3A6IC0xcHg7XHJcbn1cclxuLnRvZ2dsZS1pbnB1dF81OmNoZWNrZWQgfiAubWVnYS1tZW51XzUge1xyXG4gICAgZGlzcGxheTogYmxvY2s7XHJcbn1cclxuLnRvZ2dsZS1pbnB1dF81OmNoZWNrZWQgfiBsYWJlbDphZnRlciB7XHJcbiAgICBjb250ZW50OiBcIlxcMjVCMlwiO1xyXG4gICAgZm9udC1zaXplOiAxMHB4O1xyXG4gICAgcGFkZGluZy1sZWZ0OiA2cHg7XHJcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbiAgICB0b3A6IC0xcHg7XHJcbn1cclxuLm1lZ2EtbWVudV80IHtcclxuICAgIGRpc3BsYXk6IG5vbmU7XHJcbiAgICBsZWZ0OiAwO1xyXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xyXG4gICAgdGV4dC1hbGlnbjogbGVmdDtcclxuICAgIHdpZHRoOiAxMDAlO1xyXG59XHJcbi50b2dnbGUtaW5wdXRfNCB7XHJcbiAgICBkaXNwbGF5OiBub25lO1xyXG59XHJcbi50b2dnbGUtaW5wdXRfNDpub3QoY2hlY2tlZCkgfiAubWVnYS1tZW51XzQge1xyXG4gICAgZGlzcGxheTogbm9uZTtcclxufVxyXG4udG9nZ2xlYWJsZV80ID4gbGFiZWw6YWZ0ZXJcclxue1xyXG4gICAgY29udGVudDogXCJcXDI1QkNcIjtcclxuICAgIGZvbnQtc2l6ZTogMTBweDtcclxuICAgIHBhZGRpbmctbGVmdDogNnB4O1xyXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gICAgdG9wOiAtMXB4O1xyXG59XHJcbi50b2dnbGUtaW5wdXRfNDpjaGVja2VkIH4gLm1lZ2EtbWVudV80IHtcclxuICAgIGRpc3BsYXk6IGJsb2NrO1xyXG59XHJcbi50b2dnbGUtaW5wdXRfNDpjaGVja2VkIH4gbGFiZWw6YWZ0ZXIge1xyXG4gICAgY29udGVudDogXCJcXDI1QjJcIjtcclxuICAgIGZvbnQtc2l6ZTogMTBweDtcclxuICAgIHBhZGRpbmctbGVmdDogNnB4O1xyXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gICAgdG9wOiAtMXB4O1xyXG59XHJcbi5tZWdhLW1lbnVfMyB7XHJcbiAgICBkaXNwbGF5OiBub25lO1xyXG4gICAgbGVmdDogMDtcclxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICAgIHRleHQtYWxpZ246IGxlZnQ7XHJcbiAgICB3aWR0aDogMTAwJTtcclxufVxyXG4udG9nZ2xlLWlucHV0XzMge1xyXG4gICAgZGlzcGxheTogbm9uZTtcclxufVxyXG4udG9nZ2xlLWlucHV0XzM6bm90KGNoZWNrZWQpIH4gLm1lZ2EtbWVudV8zIHtcclxuICAgIGRpc3BsYXk6IG5vbmU7XHJcbn1cclxuLnRvZ2dsZWFibGVfMyA+IGxhYmVsOmFmdGVyXHJcbntcclxuICAgIGNvbnRlbnQ6IFwiXFwyNUJDXCI7XHJcbiAgICBmb250LXNpemU6IDEwcHg7XHJcbiAgICBwYWRkaW5nLWxlZnQ6IDZweDtcclxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcclxuICAgIHRvcDogLTFweDtcclxufVxyXG4udG9nZ2xlLWlucHV0XzM6Y2hlY2tlZCB+IC5tZWdhLW1lbnVfMyB7XHJcbiAgICBkaXNwbGF5OiBibG9jaztcclxufVxyXG4udG9nZ2xlLWlucHV0XzM6Y2hlY2tlZCB+IGxhYmVsOmFmdGVyIHtcclxuICAgIGNvbnRlbnQ6IFwiXFwyNUIyXCI7XHJcbiAgICBmb250LXNpemU6IDEwcHg7XHJcbiAgICBwYWRkaW5nLWxlZnQ6IDZweDtcclxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcclxuICAgIHRvcDogLTFweDtcclxufVxyXG4ubWVnYS1tZW51XzIge1xyXG4gICAgZGlzcGxheTogbm9uZTtcclxuICAgIGxlZnQ6IDA7XHJcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgICB0ZXh0LWFsaWduOiBsZWZ0O1xyXG4gICAgd2lkdGg6IDEwMCU7XHJcbn1cclxuLnRvZ2dsZWFibGVfMiAgPiBsYWJlbDphZnRlciB7XHJcbiAgICBjb250ZW50OiBcIlxcMjVCQ1wiO1xyXG4gICAgZm9udC1zaXplOiAxMHB4O1xyXG4gICAgcGFkZGluZy1sZWZ0OiA2cHg7XHJcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbiAgICB0b3A6IC0xcHg7XHJcbn1cclxuXHJcbi50b2dnbGUtaW5wdXRfMiB7XHJcbiAgICBkaXNwbGF5OiBub25lO1xyXG59XHJcbi50b2dnbGUtaW5wdXRfMjpub3QoY2hlY2tlZCkgfiAubWVnYS1tZW51XzIge1xyXG4gICAgZGlzcGxheTogbm9uZTtcclxufVxyXG5cclxuLnRvZ2dsZS1pbnB1dF8yOmNoZWNrZWQgfiAubWVnYS1tZW51XzIge1xyXG4gICAgZGlzcGxheTogYmxvY2s7XHJcbn1cclxuLnRvZ2dsZS1pbnB1dF8yOmNoZWNrZWQgfiBsYWJlbDphZnRlciB7XHJcbiAgICBjb250ZW50OiBcIlxcMjVCMlwiO1xyXG4gICAgZm9udC1zaXplOiAxMHB4O1xyXG4gICAgcGFkZGluZy1sZWZ0OiA2cHg7XHJcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbiAgICB0b3A6IC0xcHg7XHJcbn1cclxuXHJcbi5tZWdhLW1lbnVfMSB7XHJcbiAgICBkaXNwbGF5OiBub25lO1xyXG4gICAgbGVmdDogMDtcclxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICAgIHRleHQtYWxpZ246IGxlZnQ7XHJcbiAgICB3aWR0aDogMTAwJTtcclxufVxyXG4udG9nZ2xlYWJsZV8xID4gbGFiZWw6YWZ0ZXJcclxue1xyXG4gICAgY29udGVudDogXCJcXDI1QkNcIjtcclxuICAgIGZvbnQtc2l6ZTogMTBweDtcclxuICAgIHBhZGRpbmctbGVmdDogNnB4O1xyXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gICAgdG9wOiAtMXB4O1xyXG59XHJcbi50b2dnbGUtaW5wdXRfMSB7XHJcbiAgICBkaXNwbGF5OiBub25lO1xyXG59XHJcbi50b2dnbGUtaW5wdXRfMTpub3QoY2hlY2tlZCkgfiAubWVnYS1tZW51XzEge1xyXG4gICAgZGlzcGxheTogbm9uZTtcclxufVxyXG5cclxuLnRvZ2dsZS1pbnB1dF8xOmNoZWNrZWQgfiAubWVnYS1tZW51XzEge1xyXG4gICAgZGlzcGxheTogYmxvY2s7XHJcbn1cclxuLnRvZ2dsZS1pbnB1dF8xOmNoZWNrZWQgfiBsYWJlbDphZnRlciB7XHJcbiAgICBjb250ZW50OiBcIlxcMjVCMlwiO1xyXG4gICAgZm9udC1zaXplOiAxMHB4O1xyXG4gICAgcGFkZGluZy1sZWZ0OiA2cHg7XHJcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbiAgICB0b3A6IC0xcHg7XHJcbn1cclxuXHJcbi5tZWdhLW1lbnUge1xyXG4gICAgZGlzcGxheTogbm9uZTtcclxuICAgIGxlZnQ6IDA7XHJcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgICB0ZXh0LWFsaWduOiBsZWZ0O1xyXG4gICAgd2lkdGg6IDEwMCU7XHJcbn1cclxuLnRvZ2dsZWFibGUgID4gbGFiZWw6YWZ0ZXIge1xyXG4gICAgY29udGVudDogXCJcXDI1QkNcIjtcclxuICAgIGZvbnQtc2l6ZTogMTBweDtcclxuICAgIHBhZGRpbmctbGVmdDogNnB4O1xyXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gICAgdG9wOiAtMXB4O1xyXG59XHJcblxyXG4udG9nZ2xlLWlucHV0IHtcclxuICAgIGRpc3BsYXk6IG5vbmU7XHJcbn1cclxuLnRvZ2dsZS1pbnB1dDpub3QoY2hlY2tlZCkgfiAubWVnYS1tZW51IHtcclxuICAgIGRpc3BsYXk6IG5vbmU7XHJcbn1cclxuXHJcbi50b2dnbGUtaW5wdXQ6Y2hlY2tlZCB+IC5tZWdhLW1lbnUge1xyXG4gICAgZGlzcGxheTogYmxvY2s7XHJcbn1cclxuLnRvZ2dsZS1pbnB1dDpjaGVja2VkIH4gbGFiZWw6YWZ0ZXIge1xyXG4gICAgY29udGVudDogXCJcXDI1QjJcIjtcclxuICAgIGZvbnQtc2l6ZTogMTBweDtcclxuICAgIHBhZGRpbmctbGVmdDogNnB4O1xyXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gICAgdG9wOiAtMXB4O1xyXG59XHJcbiBpbnB1dFt0eXBlPVwibnVtYmVyXCJdOjotd2Via2l0LW91dGVyLXNwaW4tYnV0dG9uLFxyXG4gaW5wdXRbdHlwZT1cIm51bWJlclwiXTo6LXdlYmtpdC1pbm5lci1zcGluLWJ1dHRvbiB7XHJcbiAgICAgLXdlYmtpdC1hcHBlYXJhbmNlOiBub25lO1xyXG4gfVxyXG5pbnB1dFt0eXBlPW51bWJlcl06Oi13ZWJraXQtaW5uZXItc3Bpbi1idXR0b24sXHJcbmlucHV0W3R5cGU9bnVtYmVyXTo6LXdlYmtpdC1vdXRlci1zcGluLWJ1dHRvbiB7XHJcbiAgICAtd2Via2l0LWFwcGVhcmFuY2U6IG5vbmU7XHJcbiAgICBtYXJnaW46IDA7XHJcbn1cclxuIl19 */";
    			attr_dev(div0, "class", "flex flex-shrink md:w-1/3 justify-center md:justify-start text-white");
    			add_location(div0, file$8, 7, 8, 485);
    			attr_dev(input0, "type", "search");
    			attr_dev(input0, "placeholder", "Search");
    			attr_dev(input0, "class", "w-full bg-gray-800 text-sm text-white transition border border-transparent focus:outline-none focus:border-gray-700 rounded py-1 px-2 pl-10 appearance-none leading-normal");
    			add_location(input0, file$8, 16, 24, 1023);
    			attr_dev(path0, "d", "M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z");
    			add_location(path0, file$8, 19, 32, 1521);
    			attr_dev(svg0, "class", "fill-current pointer-events-none text-white w-4 h-4");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 20 20");
    			add_location(svg0, file$8, 18, 28, 1367);
    			attr_dev(div1, "class", "absolute search-icon");
    			set_style(div1, "top", ".5rem");
    			set_style(div1, "left", ".8rem");
    			add_location(div1, file$8, 17, 24, 1270);
    			attr_dev(span0, "class", "relative w-full");
    			add_location(span0, file$8, 15, 28, 967);
    			attr_dev(div2, "class", "flex flex-1 w-full justify-center md:justify-start text-white px-2 mr-0 md:mr-20");
    			add_location(div2, file$8, 14, 8, 843);
    			attr_dev(p0, "class", "text-white");
    			add_location(p0, file$8, 28, 24, 2002);
    			attr_dev(div3, "class", "relative inline-block");
    			add_location(div3, file$8, 27, 20, 1941);
    			attr_dev(li0, "class", "flex-none md:mr-3");
    			add_location(li0, file$8, 26, 16, 1889);
    			attr_dev(p1, "class", "text-white");
    			add_location(p1, file$8, 37, 24, 2426);
    			attr_dev(div4, "class", "relative inline-block");
    			add_location(div4, file$8, 36, 20, 2365);
    			attr_dev(li1, "class", "flex-none md:mr-3");
    			add_location(li1, file$8, 35, 16, 2313);
    			attr_dev(ul0, "class", "pr-1");
    			add_location(ul0, file$8, 25, 12, 1854);
    			attr_dev(i0, "class", "fa fa-user");
    			add_location(i0, file$8, 48, 135, 3088);
    			attr_dev(span1, "class", "pr-2");
    			add_location(span1, file$8, 48, 116, 3069);
    			attr_dev(path1, "d", "M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z");
    			add_location(path1, file$8, 48, 282, 3235);
    			attr_dev(svg1, "class", "h-3 fill-current inline");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 20 20");
    			add_location(svg1, file$8, 48, 190, 3143);
    			attr_dev(button, "onclick", "toggleDD('myDropdown')");
    			attr_dev(button, "class", "drop-button text-white focus:outline-none");
    			add_location(button, file$8, 48, 24, 2977);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "drop-search p-2 text-gray-600");
    			attr_dev(input1, "placeholder", "Search..");
    			attr_dev(input1, "id", "myInput");
    			attr_dev(input1, "onkeyup", "filterDD('myDropdown','myInput')");
    			add_location(input1, file$8, 50, 28, 3507);
    			attr_dev(i1, "class", "fa fa-cog fa-fw");
    			add_location(i1, file$8, 54, 139, 4062);
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "class", "p-2 hover:bg-gray-800 text-white text-sm no-underline hover:no-underline block text-center");
    			add_location(a0, file$8, 54, 28, 3951);
    			attr_dev(div5, "class", "border border-gray-800");
    			add_location(div5, file$8, 55, 28, 4136);
    			attr_dev(i2, "class", "fas fa-sign-out-alt fa-fw");
    			add_location(i2, file$8, 56, 139, 4319);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "class", "p-2 hover:bg-gray-800 text-white text-sm no-underline hover:no-underline block text-center");
    			add_location(a1, file$8, 56, 28, 4208);
    			attr_dev(div6, "id", "myDropdown");
    			attr_dev(div6, "class", "dropdownlist absolute bg-gray-900 text-white right-0 mt-3 p-3 overflow-auto invisible");
    			add_location(div6, file$8, 49, 24, 3362);
    			attr_dev(div7, "class", "relative inline-block");
    			add_location(div7, file$8, 47, 20, 2916);
    			attr_dev(li2, "class", "flex-1 md:flex-none md:mr-3 text-right");
    			add_location(li2, file$8, 46, 16, 2843);
    			attr_dev(ul1, "class", "list-reset flex justify-between flex-1 md:flex-none items-center");
    			add_location(ul1, file$8, 45, 12, 2748);
    			attr_dev(div8, "class", "flex w-full pt-2 content-center justify-between md:w-1/3 md:justify-end");
    			add_location(div8, file$8, 24, 8, 1755);
    			attr_dev(div9, "class", "flex flex-wrap items-center");
    			add_location(div9, file$8, 6, 4, 434);
    			attr_dev(nav, "class", "bg-gray-900 pt-2 md:pt-1 pb-1 px-1 mt-0 h-auto fixed w-full top-0 z-50");
    			add_location(nav, file$8, 5, 0, 344);
    			attr_dev(li3, "class", "flex-1 md:flex-none md:mr-3 ");
    			add_location(li3, file$8, 67, 12, 4779);
    			attr_dev(li4, "class", "flex-1 md:flex-none md:mr-3");
    			add_location(li4, file$8, 74, 12, 5260);
    			attr_dev(i3, "class", "fas fa-chart-area pr-0 ml-4 md:pr-3");
    			add_location(i3, file$8, 83, 20, 5964);
    			attr_dev(span2, "class", "pb-1 md:pb-0 text-xs md:text-base text-white md:text-white block md:inline-block");
    			add_location(span2, file$8, 83, 71, 6015);
    			attr_dev(a2, "href", "#");
    			attr_dev(a2, "class", "block py-1 md:py-3 pl-1 align-middle text-white no-underline hover:text-white hover:border-purple-500");
    			add_location(a2, file$8, 82, 16, 5820);
    			attr_dev(li5, "class", "flex-1 md:flex-none md:mr-3");
    			add_location(li5, file$8, 81, 12, 5762);
    			attr_dev(ul2, "class", "list-reset flex justify-between flex-1");
    			add_location(ul2, file$8, 66, 8, 4714);
    			attr_dev(div10, "class", "flex w-full content-center justify-between md:justify-end0");
    			add_location(div10, file$8, 65, 4, 4632);
    			attr_dev(div11, "class", "pl-10 pr-10 bg-red-900 flex flex-wrap items-center fixed w-full bottom-0 md:bottom-auto z-50 md:z-40");
    			add_location(div11, file$8, 64, 0, 4512);
    			if (img.src !== (img_src_value = "https://i.ibb.co/ZNqNwsL/302564114176201.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "w-32 h-32 rounded-full border-solid border-white border-2 mt-32 ");
    			add_location(img, file$8, 92, 12, 6335);
    			attr_dev(div12, "class", "flex justify-center");
    			add_location(div12, file$8, 91, 8, 6288);
    			attr_dev(h10, "class", "ml-24 font-bold text-3xl text-black");
    			add_location(h10, file$8, 94, 8, 6490);
    			attr_dev(div13, "class", "");
    			add_location(div13, file$8, 90, 4, 6264);
    			attr_dev(div14, "class", "w-full max-w-xs mx-auto content-end mt-4");
    			add_location(div14, file$8, 89, 0, 6204);
    			attr_dev(h11, "class", "text-black w-full border border-transparent mb-2 pl-2 font-bold bg-gray-300 border-2 border-gray-500 ");
    			add_location(h11, file$8, 100, 16, 6796);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "class", "w-full bg-white text-sm text-black transition border border-transparent focus:outline-none\r\n                    focus:border-gray-700 rounded py-1 px-2 pl-2 appearance-none leading-normal border-2 border-gray-300");
    			attr_dev(input2, "placeholder", "Поиск по названию");
    			attr_dev(input2, "id", "myInput_1");
    			attr_dev(input2, "onkeyup", "filterDD1('myDropdown_1','myDropdown_2','myDropdown_3','myInput_1')");
    			add_location(input2, file$8, 101, 16, 6958);
    			attr_dev(div15, "class", "h-8 w-full ");
    			add_location(div15, file$8, 103, 16, 7341);
    			attr_dev(h30, "class", "ml-4 text-black font-bold text-2x1");
    			add_location(h30, file$8, 107, 28, 7602);
    			attr_dev(div16, "class", "w-full border border-transparent border-gray-500 bg-gray-300");
    			add_location(div16, file$8, 106, 24, 7498);
    			attr_dev(span3, "class", "сursor-default font-bold text-black");
    			add_location(span3, file$8, 114, 52, 8211);
    			attr_dev(div17, "class", "ml-4");
    			add_location(div17, file$8, 113, 44, 8139);
    			attr_dev(span4, "class", "cursor-default font-bold text-black");
    			add_location(span4, file$8, 119, 52, 8596);
    			attr_dev(div18, "class", "md:col-start-2 col-start-3 col-end-12 text-indigo-700");
    			add_location(div18, file$8, 118, 44, 8475);
    			attr_dev(div19, "class", "grid col-start-1 md:col-end-10 col-end-9 grid-cols-12");
    			add_location(div19, file$8, 112, 40, 8026);
    			add_location(span5, file$8, 126, 52, 9128);
    			attr_dev(div20, "class", "cursor-default font-bold text-black");
    			add_location(div20, file$8, 125, 44, 9025);
    			add_location(span6, file$8, 131, 52, 9456);
    			attr_dev(div21, "class", "cursor-default font-bold text-black");
    			add_location(div21, file$8, 130, 44, 9353);
    			attr_dev(div22, "class", "col-start-10 col-end-13 md:grid grid-cols-2 hidden");
    			add_location(div22, file$8, 124, 40, 8915);
    			attr_dev(div23, "class", "border-b border-b-2 grid md:grid-cols-12 grid-cols-2 w-full font-bold");
    			add_location(div23, file$8, 111, 36, 7901);
    			add_location(a3, file$8, 138, 40, 9832);
    			add_location(a4, file$8, 141, 40, 9979);
    			add_location(a5, file$8, 144, 40, 10126);
    			add_location(a6, file$8, 147, 40, 10273);
    			add_location(a7, file$8, 150, 40, 10420);
    			add_location(a8, file$8, 153, 40, 10567);
    			attr_dev(div24, "id", "myDropdown_1");
    			add_location(div24, file$8, 137, 36, 9767);
    			attr_dev(div25, "class", "container mx-auto w-full flex flex-wrap justify-between mx-2 mt-10");
    			add_location(div25, file$8, 110, 32, 7783);
    			attr_dev(div26, "class", "w-full");
    			add_location(div26, file$8, 109, 28, 7729);
    			attr_dev(div27, "class", "h-8 bg-white");
    			add_location(div27, file$8, 159, 24, 10818);
    			attr_dev(h31, "class", "ml-4 text-black font-bold text-2x1");
    			add_location(h31, file$8, 161, 28, 10980);
    			attr_dev(div28, "class", "w-full border border-transparent border-gray-500 bg-gray-300");
    			add_location(div28, file$8, 160, 24, 10876);
    			attr_dev(span7, "class", "сursor-default font-bold text-black");
    			add_location(span7, file$8, 168, 52, 11567);
    			attr_dev(div29, "class", "ml-4");
    			add_location(div29, file$8, 167, 40, 11495);
    			attr_dev(span8, "class", "cursor-default font-bold text-black");
    			add_location(span8, file$8, 173, 52, 11944);
    			attr_dev(div30, "class", "md:col-start-2 col-start-3 col-end-12 text-indigo-700");
    			add_location(div30, file$8, 172, 40, 11823);
    			attr_dev(div31, "class", "grid col-start-1 md:col-end-10 col-end-9 grid-cols-12");
    			add_location(div31, file$8, 166, 36, 11386);
    			add_location(span9, file$8, 180, 52, 12460);
    			attr_dev(div32, "class", "cursor-default font-bold text-black");
    			add_location(div32, file$8, 179, 40, 12357);
    			add_location(span10, file$8, 185, 52, 12780);
    			attr_dev(div33, "class", "cursor-default font-bold text-black");
    			add_location(div33, file$8, 184, 40, 12677);
    			attr_dev(div34, "class", "col-start-10 col-end-13 md:grid grid-cols-2 hidden");
    			add_location(div34, file$8, 178, 36, 12251);
    			attr_dev(div35, "class", "border-b border-b-2 grid md:grid-cols-12 grid-cols-2 w-full font-bold");
    			add_location(div35, file$8, 165, 32, 11265);
    			add_location(a9, file$8, 192, 36, 13136);
    			add_location(a10, file$8, 195, 36, 13271);
    			add_location(a11, file$8, 198, 36, 13406);
    			add_location(a12, file$8, 201, 36, 13541);
    			add_location(a13, file$8, 204, 36, 13676);
    			add_location(a14, file$8, 207, 36, 13811);
    			attr_dev(div36, "id", "myDropdown_2");
    			add_location(div36, file$8, 191, 32, 13075);
    			attr_dev(div37, "class", "container mx-auto w-full flex flex-wrap justify-between mx-2 mt-10");
    			add_location(div37, file$8, 164, 28, 11151);
    			attr_dev(div38, "class", "w-full");
    			add_location(div38, file$8, 163, 24, 11101);
    			attr_dev(div39, "class", "h-8 bg-white");
    			add_location(div39, file$8, 213, 24, 14042);
    			attr_dev(h32, "class", "ml-4 text-black font-bold text-2x1");
    			add_location(h32, file$8, 215, 28, 14204);
    			attr_dev(div40, "class", "w-full border border-transparent border-gray-500 bg-gray-300");
    			add_location(div40, file$8, 214, 24, 14100);
    			attr_dev(span11, "class", "сursor-default font-bold text-black");
    			add_location(span11, file$8, 222, 52, 14789);
    			attr_dev(div41, "class", "ml-4");
    			add_location(div41, file$8, 221, 40, 14717);
    			attr_dev(span12, "class", "cursor-default font-bold text-black");
    			add_location(span12, file$8, 227, 52, 15166);
    			attr_dev(div42, "class", "md:col-start-2 col-start-3 col-end-12 text-indigo-700");
    			add_location(div42, file$8, 226, 40, 15045);
    			attr_dev(div43, "class", "grid col-start-1 md:col-end-10 col-end-9 grid-cols-12");
    			add_location(div43, file$8, 220, 36, 14608);
    			add_location(span13, file$8, 234, 52, 15682);
    			attr_dev(div44, "class", "cursor-default font-bold text-black");
    			add_location(div44, file$8, 233, 40, 15579);
    			add_location(span14, file$8, 239, 52, 16002);
    			attr_dev(div45, "class", "cursor-default font-bold text-black");
    			add_location(div45, file$8, 238, 40, 15899);
    			attr_dev(div46, "class", "col-start-10 col-end-13 md:grid grid-cols-2 hidden");
    			add_location(div46, file$8, 232, 36, 15473);
    			attr_dev(div47, "class", "border-b border-b-2 grid md:grid-cols-12 grid-cols-2 w-full font-bold");
    			add_location(div47, file$8, 219, 32, 14487);
    			add_location(a15, file$8, 246, 36, 16358);
    			add_location(a16, file$8, 249, 36, 16493);
    			add_location(a17, file$8, 252, 36, 16628);
    			add_location(a18, file$8, 255, 36, 16763);
    			add_location(a19, file$8, 258, 36, 16898);
    			add_location(a20, file$8, 261, 36, 17033);
    			attr_dev(div48, "id", "myDropdown_3");
    			add_location(div48, file$8, 245, 32, 16297);
    			attr_dev(div49, "class", "container mx-auto w-full flex flex-wrap justify-between mx-2 mt-10");
    			add_location(div49, file$8, 218, 28, 14373);
    			attr_dev(div50, "class", "w-full");
    			add_location(div50, file$8, 217, 24, 14323);
    			attr_dev(li6, "class", "toggleable_1 text-blue-500 ");
    			add_location(li6, file$8, 105, 20, 7432);
    			attr_dev(ul3, "class", "w-full ");
    			add_location(ul3, file$8, 104, 16, 7390);
    			attr_dev(div51, "class", "container mx-auto w-full flex flex-wrap justify-between mx-2 bg-white p-2 md:px-20 block");
    			add_location(div51, file$8, 99, 12, 6676);
    			attr_dev(div52, "class", "p-6 mb-16 sm:mb-0 bg-white md:bg-transparent");
    			add_location(div52, file$8, 98, 8, 6604);
    			attr_dev(div53, "class", "bg-white");
    			add_location(div53, file$8, 97, 0, 6572);
    			add_location(script, file$8, 272, 0, 17334);
    			add_location(style, file$8, 379, 0, 21773);
    			attr_dev(body, "class", "mt-20 font-sans antialiased text-gray-900 leading-normal tracking-wider bg-cover");
    			set_style(body, "background-image", "url('https://i.ibb.co/NnJ4qn2/DFqzjt4-S66-CPV6-IHiy-Fz-CDNIRQKPFu-UDSvzn-Wp-Jdp-Q.png')");
    			add_location(body, file$8, 4, 0, 133);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, nav);
    			append_dev(nav, div9);
    			append_dev(div9, div0);
    			mount_component(link0, div0, null);
    			append_dev(div9, t0);
    			append_dev(div9, div2);
    			append_dev(div2, span0);
    			append_dev(span0, input0);
    			append_dev(span0, t1);
    			append_dev(span0, div1);
    			append_dev(div1, svg0);
    			append_dev(svg0, path0);
    			append_dev(div9, t2);
    			append_dev(div9, div8);
    			append_dev(div8, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, div3);
    			append_dev(div3, p0);
    			mount_component(link1, p0, null);
    			append_dev(ul0, t3);
    			append_dev(ul0, li1);
    			append_dev(li1, div4);
    			append_dev(div4, p1);
    			mount_component(link2, p1, null);
    			append_dev(div8, t4);
    			append_dev(div8, ul1);
    			append_dev(ul1, li2);
    			append_dev(li2, div7);
    			append_dev(div7, button);
    			append_dev(button, span1);
    			append_dev(span1, i0);
    			append_dev(button, t5);
    			append_dev(button, svg1);
    			append_dev(svg1, path1);
    			append_dev(div7, t6);
    			append_dev(div7, div6);
    			append_dev(div6, input1);
    			append_dev(div6, t7);
    			mount_component(link3, div6, null);
    			append_dev(div6, t8);
    			append_dev(div6, a0);
    			append_dev(a0, i1);
    			append_dev(a0, t9);
    			append_dev(div6, t10);
    			append_dev(div6, div5);
    			append_dev(div6, t11);
    			append_dev(div6, a1);
    			append_dev(a1, i2);
    			append_dev(a1, t12);
    			append_dev(body, t13);
    			append_dev(body, div11);
    			append_dev(div11, div10);
    			append_dev(div10, ul2);
    			append_dev(ul2, li3);
    			mount_component(link4, li3, null);
    			append_dev(ul2, t14);
    			append_dev(ul2, li4);
    			mount_component(link5, li4, null);
    			append_dev(ul2, t15);
    			append_dev(ul2, li5);
    			append_dev(li5, a2);
    			append_dev(a2, i3);
    			append_dev(a2, span2);
    			append_dev(body, t17);
    			append_dev(body, div14);
    			append_dev(div14, div13);
    			append_dev(div13, div12);
    			append_dev(div12, img);
    			append_dev(div13, t18);
    			append_dev(div13, h10);
    			append_dev(body, t20);
    			append_dev(body, div53);
    			append_dev(div53, div52);
    			append_dev(div52, div51);
    			append_dev(div51, h11);
    			append_dev(div51, t22);
    			append_dev(div51, input2);
    			append_dev(div51, t23);
    			append_dev(div51, div15);
    			append_dev(div51, t24);
    			append_dev(div51, ul3);
    			append_dev(ul3, li6);
    			append_dev(li6, div16);
    			append_dev(div16, h30);
    			append_dev(li6, t26);
    			append_dev(li6, div26);
    			append_dev(div26, div25);
    			append_dev(div25, div23);
    			append_dev(div23, div19);
    			append_dev(div19, div17);
    			append_dev(div17, span3);
    			append_dev(div19, t28);
    			append_dev(div19, div18);
    			append_dev(div18, span4);
    			append_dev(div23, t30);
    			append_dev(div23, div22);
    			append_dev(div22, div20);
    			append_dev(div20, span5);
    			append_dev(div22, t32);
    			append_dev(div22, div21);
    			append_dev(div21, span6);
    			append_dev(div25, t34);
    			append_dev(div25, div24);
    			append_dev(div24, a3);
    			mount_component(ranobe0, a3, null);
    			append_dev(div24, t35);
    			append_dev(div24, a4);
    			mount_component(ranobe1, a4, null);
    			append_dev(div24, t36);
    			append_dev(div24, a5);
    			mount_component(ranobe2, a5, null);
    			append_dev(div24, t37);
    			append_dev(div24, a6);
    			mount_component(ranobe3, a6, null);
    			append_dev(div24, t38);
    			append_dev(div24, a7);
    			mount_component(ranobe4, a7, null);
    			append_dev(div24, t39);
    			append_dev(div24, a8);
    			mount_component(ranobe5, a8, null);
    			append_dev(li6, t40);
    			append_dev(li6, div27);
    			append_dev(li6, t41);
    			append_dev(li6, div28);
    			append_dev(div28, h31);
    			append_dev(li6, t43);
    			append_dev(li6, div38);
    			append_dev(div38, div37);
    			append_dev(div37, div35);
    			append_dev(div35, div31);
    			append_dev(div31, div29);
    			append_dev(div29, span7);
    			append_dev(div31, t45);
    			append_dev(div31, div30);
    			append_dev(div30, span8);
    			append_dev(div35, t47);
    			append_dev(div35, div34);
    			append_dev(div34, div32);
    			append_dev(div32, span9);
    			append_dev(div34, t49);
    			append_dev(div34, div33);
    			append_dev(div33, span10);
    			append_dev(div37, t51);
    			append_dev(div37, div36);
    			append_dev(div36, a9);
    			mount_component(ranobe6, a9, null);
    			append_dev(div36, t52);
    			append_dev(div36, a10);
    			mount_component(ranobe7, a10, null);
    			append_dev(div36, t53);
    			append_dev(div36, a11);
    			mount_component(ranobe8, a11, null);
    			append_dev(div36, t54);
    			append_dev(div36, a12);
    			mount_component(ranobe9, a12, null);
    			append_dev(div36, t55);
    			append_dev(div36, a13);
    			mount_component(ranobe10, a13, null);
    			append_dev(div36, t56);
    			append_dev(div36, a14);
    			mount_component(ranobe11, a14, null);
    			append_dev(li6, t57);
    			append_dev(li6, div39);
    			append_dev(li6, t58);
    			append_dev(li6, div40);
    			append_dev(div40, h32);
    			append_dev(li6, t60);
    			append_dev(li6, div50);
    			append_dev(div50, div49);
    			append_dev(div49, div47);
    			append_dev(div47, div43);
    			append_dev(div43, div41);
    			append_dev(div41, span11);
    			append_dev(div43, t62);
    			append_dev(div43, div42);
    			append_dev(div42, span12);
    			append_dev(div47, t64);
    			append_dev(div47, div46);
    			append_dev(div46, div44);
    			append_dev(div44, span13);
    			append_dev(div46, t66);
    			append_dev(div46, div45);
    			append_dev(div45, span14);
    			append_dev(div49, t68);
    			append_dev(div49, div48);
    			append_dev(div48, a15);
    			mount_component(ranobe12, a15, null);
    			append_dev(div48, t69);
    			append_dev(div48, a16);
    			mount_component(ranobe13, a16, null);
    			append_dev(div48, t70);
    			append_dev(div48, a17);
    			mount_component(ranobe14, a17, null);
    			append_dev(div48, t71);
    			append_dev(div48, a18);
    			mount_component(ranobe15, a18, null);
    			append_dev(div48, t72);
    			append_dev(div48, a19);
    			mount_component(ranobe16, a19, null);
    			append_dev(div48, t73);
    			append_dev(div48, a20);
    			mount_component(ranobe17, a20, null);
    			append_dev(body, t74);
    			append_dev(body, script);
    			append_dev(body, t76);
    			append_dev(body, style);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const link0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link0_changes.$$scope = { dirty, ctx };
    			}

    			link0.$set(link0_changes);
    			const link1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link1_changes.$$scope = { dirty, ctx };
    			}

    			link1.$set(link1_changes);
    			const link2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link2_changes.$$scope = { dirty, ctx };
    			}

    			link2.$set(link2_changes);
    			const link3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link3_changes.$$scope = { dirty, ctx };
    			}

    			link3.$set(link3_changes);
    			const link4_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link4_changes.$$scope = { dirty, ctx };
    			}

    			link4.$set(link4_changes);
    			const link5_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link5_changes.$$scope = { dirty, ctx };
    			}

    			link5.$set(link5_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);
    			transition_in(link2.$$.fragment, local);
    			transition_in(link3.$$.fragment, local);
    			transition_in(link4.$$.fragment, local);
    			transition_in(link5.$$.fragment, local);
    			transition_in(ranobe0.$$.fragment, local);
    			transition_in(ranobe1.$$.fragment, local);
    			transition_in(ranobe2.$$.fragment, local);
    			transition_in(ranobe3.$$.fragment, local);
    			transition_in(ranobe4.$$.fragment, local);
    			transition_in(ranobe5.$$.fragment, local);
    			transition_in(ranobe6.$$.fragment, local);
    			transition_in(ranobe7.$$.fragment, local);
    			transition_in(ranobe8.$$.fragment, local);
    			transition_in(ranobe9.$$.fragment, local);
    			transition_in(ranobe10.$$.fragment, local);
    			transition_in(ranobe11.$$.fragment, local);
    			transition_in(ranobe12.$$.fragment, local);
    			transition_in(ranobe13.$$.fragment, local);
    			transition_in(ranobe14.$$.fragment, local);
    			transition_in(ranobe15.$$.fragment, local);
    			transition_in(ranobe16.$$.fragment, local);
    			transition_in(ranobe17.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			transition_out(link2.$$.fragment, local);
    			transition_out(link3.$$.fragment, local);
    			transition_out(link4.$$.fragment, local);
    			transition_out(link5.$$.fragment, local);
    			transition_out(ranobe0.$$.fragment, local);
    			transition_out(ranobe1.$$.fragment, local);
    			transition_out(ranobe2.$$.fragment, local);
    			transition_out(ranobe3.$$.fragment, local);
    			transition_out(ranobe4.$$.fragment, local);
    			transition_out(ranobe5.$$.fragment, local);
    			transition_out(ranobe6.$$.fragment, local);
    			transition_out(ranobe7.$$.fragment, local);
    			transition_out(ranobe8.$$.fragment, local);
    			transition_out(ranobe9.$$.fragment, local);
    			transition_out(ranobe10.$$.fragment, local);
    			transition_out(ranobe11.$$.fragment, local);
    			transition_out(ranobe12.$$.fragment, local);
    			transition_out(ranobe13.$$.fragment, local);
    			transition_out(ranobe14.$$.fragment, local);
    			transition_out(ranobe15.$$.fragment, local);
    			transition_out(ranobe16.$$.fragment, local);
    			transition_out(ranobe17.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			destroy_component(link0);
    			destroy_component(link1);
    			destroy_component(link2);
    			destroy_component(link3);
    			destroy_component(link4);
    			destroy_component(link5);
    			destroy_component(ranobe0);
    			destroy_component(ranobe1);
    			destroy_component(ranobe2);
    			destroy_component(ranobe3);
    			destroy_component(ranobe4);
    			destroy_component(ranobe5);
    			destroy_component(ranobe6);
    			destroy_component(ranobe7);
    			destroy_component(ranobe8);
    			destroy_component(ranobe9);
    			destroy_component(ranobe10);
    			destroy_component(ranobe11);
    			destroy_component(ranobe12);
    			destroy_component(ranobe13);
    			destroy_component(ranobe14);
    			destroy_component(ranobe15);
    			destroy_component(ranobe16);
    			destroy_component(ranobe17);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Mainprofile> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Mainprofile", $$slots, []);
    	$$self.$capture_state = () => ({ Router, Link, Route, Ranobe: Profileliteratur });
    	return [];
    }

    class Mainprofile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Mainprofile",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.22.2 */
    const file$9 = "src\\App.svelte";

    // (14:1) <Router url="{url}">
    function create_default_slot$7(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let current;

    	const route0 = new Route({
    			props: {
    				path: "Japanliterature",
    				component: Japanliterature
    			},
    			$$inline: true
    		});

    	const route1 = new Route({
    			props: { path: "Register", component: Register },
    			$$inline: true
    		});

    	const route2 = new Route({
    			props: { path: "Login", component: Login },
    			$$inline: true
    		});

    	const route3 = new Route({
    			props: {
    				path: "Mainprofile",
    				component: Mainprofile
    			},
    			$$inline: true
    		});

    	const route4 = new Route({
    			props: {
    				path: "Literaturepage",
    				component: LiteraturePage
    			},
    			$$inline: true
    		});

    	const route5 = new Route({
    			props: { path: "/", component: Mainmenu },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(route0.$$.fragment);
    			t0 = space();
    			create_component(route1.$$.fragment);
    			t1 = space();
    			create_component(route2.$$.fragment);
    			t2 = space();
    			create_component(route3.$$.fragment);
    			t3 = space();
    			create_component(route4.$$.fragment);
    			t4 = space();
    			create_component(route5.$$.fragment);
    			add_location(div, file$9, 14, 2, 494);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(route0, div, null);
    			append_dev(div, t0);
    			mount_component(route1, div, null);
    			append_dev(div, t1);
    			mount_component(route2, div, null);
    			append_dev(div, t2);
    			mount_component(route3, div, null);
    			append_dev(div, t3);
    			mount_component(route4, div, null);
    			append_dev(div, t4);
    			mount_component(route5, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			transition_in(route4.$$.fragment, local);
    			transition_in(route5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			transition_out(route4.$$.fragment, local);
    			transition_out(route5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(route0);
    			destroy_component(route1);
    			destroy_component(route2);
    			destroy_component(route3);
    			destroy_component(route4);
    			destroy_component(route5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(14:1) <Router url=\\\"{url}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let t;
    	let main;
    	let current;
    	const tailwindcss = new Tailwindcss({ $$inline: true });

    	const router = new Router({
    			props: {
    				url: /*url*/ ctx[0],
    				$$slots: { default: [create_default_slot$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tailwindcss.$$.fragment);
    			t = space();
    			main = element("main");
    			create_component(router.$$.fragment);
    			add_location(main, file$9, 12, 0, 461);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(tailwindcss, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(router, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};
    			if (dirty & /*url*/ 1) router_changes.url = /*url*/ ctx[0];

    			if (dirty & /*$$scope*/ 2) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tailwindcss.$$.fragment, local);
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tailwindcss.$$.fragment, local);
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tailwindcss, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(main);
    			destroy_component(router);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { url = "" } = $$props;
    	const writable_props = ["url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$set = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({
    		Router,
    		Link,
    		Route,
    		Tailwindcss,
    		Mainmenu,
    		Japanliterature,
    		Literaturepage: LiteraturePage,
    		Register,
    		Login,
    		Mainprofile,
    		url
    	});

    	$$self.$inject_state = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [url];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { url: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get url() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
