'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var sirv = _interopDefault(require('sirv'));
var polka = _interopDefault(require('polka'));
var compression = _interopDefault(require('compression'));
var bodyParser = _interopDefault(require('body-parser'));
var session = _interopDefault(require('express-session'));
var sessionFileStore = _interopDefault(require('session-file-store'));
var fs = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));
var getName$1 = _interopDefault(require('namey-mcnameface'));
var marked = _interopDefault(require('marked'));
var Stream = _interopDefault(require('stream'));
var http = _interopDefault(require('http'));
var Url = _interopDefault(require('url'));
var https = _interopDefault(require('https'));
var zlib = _interopDefault(require('zlib'));

function rand(min, max) {
    return min + ~~(Math.random() * (max - min));
}

function fill(len, fn) {
    return Array(len).fill().map((_, i) => fn(i));
}

function createRandomGarbage() {
    const numWords = rand(4, 50);
    return fill(numWords, () => {
        const numLetters = rand(3, 12);
        return fill(numLetters, () => String.fromCharCode(rand(97,122))).join('')
    }).join(' ');
}
const avatars = [
    // images from https://www.pexels.com/search/dog/
    'https://images.pexels.com/photos/356378/pexels-photo-356378.jpeg?auto=compress&cs=tinysrgb&h=75',
    'https://images.pexels.com/photos/59523/pexels-photo-59523.jpeg?auto=compress&cs=tinysrgb&h=75',
    'https://images.pexels.com/photos/406014/pexels-photo-406014.jpeg?auto=compress&cs=tinysrgb&h=75',
    'https://images.pexels.com/photos/460823/pexels-photo-460823.jpeg?auto=compress&cs=tinysrgb&h=75',
    'https://images.pexels.com/photos/58997/pexels-photo-58997.jpeg?auto=compress&cs=tinysrgb&h=75',
    'https://images.pexels.com/photos/374906/pexels-photo-374906.jpeg?auto=compress&cs=tinysrgb&h=75',
    'https://images.pexels.com/photos/434090/pexels-photo-434090.jpeg?auto=compress&cs=tinysrgb&h=75',
    'https://images.pexels.com/photos/551628/pexels-photo-551628.jpeg?auto=compress&cs=tinysrgb&h=75',
    'https://images.pexels.com/photos/532310/pexels-photo-532310.jpeg?auto=compress&cs=tinysrgb&h=75'
];

var items = fill(1000, (i) => {
    return {
        key: `_${i}`,
        name: getName$1(),
        content: createRandomGarbage(),
        avatar: avatars[rand(0, avatars.length)]
    };
});

var route_0 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': items
});

const base = 'http://95.216.111.166:8091/api';

function send({ method, path, data, token }) {
	const fetch =  require('node-fetch').default;

	const opts = { method, headers: {} };

	if (data) {
		opts.headers['Content-Type'] = 'application/json';
		opts.body = JSON.stringify(data);
	}

	if (token) {
		opts.headers['Authorization'] = `Token ${token}`;
	}

	return fetch(`${base}/${path}`, opts)
		.then(r => r.text())
		.then(json => {
			try {
				return JSON.parse(json);
			} catch (err) {
				return json;
			}
		});
}

function get(path, token) {
	return send({ method: 'GET', path, token });
}

function post(path, data, token) {
	return send({ method: 'POST', path, data, token });
}

function put(path, data, token) {
	return send({ method: 'PUT', path, data, token });
}

function post$1(req, res) {
	const user = req.body;

	post('users', { user }).then(response => {
		if (response.user) {
			req.session.user = response.user;
		}

		res.setHeader('Content-Type', 'application/json');

		res.end(JSON.stringify(response));
	});
}

var route_1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    post: post$1
});

function post$2(req, res) {
	delete req.session.user;
	res.end(JSON.stringify({ ok: true }));
}

var route_2 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    post: post$2
});

function post$3(req, res) {
	const user = req.body;

	post('users/login', { user }).then(response => {
		if (response.user) req.session.user = response.user;
		res.setHeader('Content-Type', 'application/json');

		res.end(JSON.stringify(response));
	});
}

var route_3 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    post: post$3
});

function post$4(req, res) {
	const user = req.body;

	put('user', { user }, req.session.user && req.session.user.token).then(response => {
		if (response.user) {
			req.session.user = response.user;
		}

		res.setHeader('Content-Type', 'application/json');

		res.end(JSON.stringify(response));
	});
}

var route_4 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    post: post$4
});

function get$1(req, res) {
	res.setHeader('Content-Type', 'application/json');

	res.end(JSON.stringify({ user: req.session.user || null }));
}

var route_5 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    get: get$1
});

function noop() { }
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function subscribe(store, callback) {
    const unsub = store.subscribe(callback);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function get_store_value(store) {
    let value;
    subscribe(store, _ => value = _)();
    return value;
}
function null_to_empty(value) {
    return value == null ? '' : value;
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
function beforeUpdate(fn) {
    get_current_component().$$.before_update.push(fn);
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
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
function tick() {
    schedule_update();
    return resolved_promise;
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
function flush() {
    const seen_callbacks = new Set();
    do {
        // first, call beforeUpdate functions
        // and update components
        while (dirty_components.length) {
            const component = dirty_components.shift();
            set_current_component(component);
            update(component.$$);
        }
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                callback();
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
}
function update($$) {
    if ($$.fragment) {
        $$.update($$.dirty);
        run_all($$.before_update);
        $$.fragment.p($$.dirty, $$.ctx);
        $$.dirty = null;
        $$.after_update.forEach(add_render_callback);
    }
}
const escaped = {
    '"': '&quot;',
    "'": '&#39;',
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
};
function escape(html) {
    return String(html).replace(/["'&<>]/g, match => escaped[match]);
}
function each(items, fn) {
    let str = '';
    for (let i = 0; i < items.length; i += 1) {
        str += fn(items[i], i);
    }
    return str;
}
const missing_component = {
    $$render: () => ''
};
function validate_component(component, name) {
    if (!component || !component.$$render) {
        if (name === 'svelte:component')
            name += ' this={...}';
        throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
    }
    return component;
}
let on_destroy;
function create_ssr_component(fn) {
    function $$render(result, props, bindings, slots) {
        const parent_component = current_component;
        const $$ = {
            on_destroy,
            context: new Map(parent_component ? parent_component.$$.context : []),
            // these will be immediately discarded
            on_mount: [],
            before_update: [],
            after_update: [],
            callbacks: blank_object()
        };
        set_current_component({ $$ });
        const html = fn(result, props, bindings, slots);
        set_current_component(parent_component);
        return html;
    }
    return {
        render: (props = {}, options = {}) => {
            on_destroy = [];
            const result = { head: '', css: new Set() };
            const html = $$render(result, props, {}, options);
            run_all(on_destroy);
            return {
                html,
                css: {
                    code: Array.from(result.css).map(css => css.code).join('\n'),
                    map: null // TODO
                },
                head: result.head
            };
        },
        $$render
    };
}
function add_attribute(name, value, boolean) {
    if (value == null || (boolean && !value))
        return '';
    return ` ${name}${value === true ? '' : `=${typeof value === 'string' ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
}
function add_classes(classes) {
    return classes ? ` class="${classes}"` : ``;
}

const subscriber_queue = [];
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

const CONTEXT_KEY = {};

/* src\routes\_components\Nav.svelte generated by Svelte v3.12.1 */

const Nav = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let $session, $page;

	const { page, session } = stores$1(); $page = get_store_value(page); $session = get_store_value(session);

	$session = get_store_value(session);
	$page = get_store_value(page);

	return `<nav class="navbar navbar-light">
		<div class="container">
			<a rel="prefetch" class="${[`navbar-brand nav-link`, $page.path === '/' ? "active" : ""].join(' ').trim() }" href="/">Ignat Japan</a>
			<ul class="nav navbar-nav pull-xs-right">
				<li class="nav-item">
					<a rel="prefetch" class="${[`nav-link`, $page.path === '/' ? "active" : ""].join(' ').trim() }" href="/">Главное меню</a>
				</li>
				<li class="nav-item">
					<a rel="prefetch" class="${[`nav-link`, $page.path === '/japanliterature' ? "active" : ""].join(' ').trim() }" href="/japanliterature">Японская литература</a>
				</li>
				${ $session.user ? `<li class="nav-item">
						<div class="dropdown show">
							<a rel="prefetch" role="button" aria-pressed="true" href="/profile/@${escape($session.user.username)}" style="text-align: center" aria-haspopup="true" aria-expanded="false" data-toggle="dropdown" class="nav-link ">
								${escape($session.user.username)}
							</a>
							<div class="nav-dropdown dropdown-menu dropdown-menu-right" style="text-align: center">
								<a rel="prefetch" href="/profile/@${escape($session.user.username)}/favorites" class="dropdown-item">Мой профиль</a>
								<a rel="prefetch" href="/admin" class="dropdown-item">Админ панель</a>
								<div class="dropdown-divider"></div>
								<button class="dropdown-item logout btn btn-outline-danger">
									<img src="https://img.icons8.com/ios-filled/50/000000/logout-rounded-up.png" alt="logout">
								</button>
							</div>
						</div>
					</li>` : `<li class="nav-item">
						<a rel="prefetch" href="/login" class="${[`nav-link`, $page.path === '/login' ? "active" : ""].join(' ').trim() }">
							Авторизация
						</a>
					</li>

					<li class="nav-item">
						<a rel="prefetch" href="/register" class="${[`nav-link`, $page.path === '/register' ? "active" : ""].join(' ').trim() }">
							Регистрация
						</a>
					</li>` }
			</ul>
		</div>
	</nav>`;
});

/* src\routes\_layout.svelte generated by Svelte v3.12.1 */

const Layout = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	

	let { segment } = $$props;

	if ($$props.segment === void 0 && $$bindings.segment && segment !== void 0) $$bindings.segment(segment);

	return `${validate_component(Nav, 'Nav').$$render($$result, { segment: segment }, {}, {})}

	<main>
		${$$slots.default ? $$slots.default({}) : ``}
	</main>`;
});

/* src\routes\_error.svelte generated by Svelte v3.12.1 */

const css = {
	code: "h1.svelte-y0j2fm,p.svelte-y0j2fm{margin:0 auto}h1.svelte-y0j2fm{font-size:2.8em;font-weight:700;margin:0 0 0.5em 0}p.svelte-y0j2fm{margin:1em auto}@media(min-width: 480px){h1.svelte-y0j2fm{font-size:4em}}",
	map: "{\"version\":3,\"file\":\"_error.svelte\",\"sources\":[\"_error.svelte\"],\"sourcesContent\":[\"<script>\\r\\n\\texport let error, status;\\r\\n\\r\\n\\tlet dev = undefined === \\\"development\\\";\\r\\n</script>\\r\\n\\r\\n<svelte:head>\\r\\n\\t<title>{status}</title>\\r\\n</svelte:head>\\r\\n\\r\\n<h1>{status}</h1>\\r\\n\\r\\n<p>{error.message}</p>\\r\\n\\r\\n{#if dev && error.stack}\\r\\n\\t<pre>{error.stack}</pre>\\r\\n{/if}\\r\\n\\r\\n<style>\\r\\n\\th1,\\r\\n\\tp {\\r\\n\\t\\tmargin: 0 auto;\\r\\n\\t}\\r\\n\\r\\n\\th1 {\\r\\n\\t\\tfont-size: 2.8em;\\r\\n\\t\\tfont-weight: 700;\\r\\n\\t\\tmargin: 0 0 0.5em 0;\\r\\n\\t}\\r\\n\\r\\n\\tp {\\r\\n\\t\\tmargin: 1em auto;\\r\\n\\t}\\r\\n\\r\\n\\t@media (min-width: 480px) {\\r\\n\\t\\th1 {\\r\\n\\t\\t\\tfont-size: 4em;\\r\\n\\t\\t}\\r\\n\\t}\\r\\n</style>\"],\"names\":[],\"mappings\":\"AAmBC,gBAAE,CACF,CAAC,cAAC,CAAC,AACF,MAAM,CAAE,CAAC,CAAC,IAAI,AACf,CAAC,AAED,EAAE,cAAC,CAAC,AACH,SAAS,CAAE,KAAK,CAChB,WAAW,CAAE,GAAG,CAChB,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,AACpB,CAAC,AAED,CAAC,cAAC,CAAC,AACF,MAAM,CAAE,GAAG,CAAC,IAAI,AACjB,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1B,EAAE,cAAC,CAAC,AACH,SAAS,CAAE,GAAG,AACf,CAAC,AACF,CAAC\"}"
};

const Error$1 = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let { error, status } = $$props;

	if ($$props.error === void 0 && $$bindings.error && error !== void 0) $$bindings.error(error);
	if ($$props.status === void 0 && $$bindings.status && status !== void 0) $$bindings.status(status);

	$$result.css.add(css);

	return `${($$result.head += `<title>${escape(status)}</title>`, "")}

	<h1 class="svelte-y0j2fm">${escape(status)}</h1>

	<p class="svelte-y0j2fm">${escape(error.message)}</p>

	${  `` }`;
});

/* src\node_modules\@sapper\internal\App.svelte generated by Svelte v3.12.1 */

const App = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	

	let { stores, error, status, segments, level0, level1 = null } = $$props;

	setContext(CONTEXT_KEY, stores);

	if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0) $$bindings.stores(stores);
	if ($$props.error === void 0 && $$bindings.error && error !== void 0) $$bindings.error(error);
	if ($$props.status === void 0 && $$bindings.status && status !== void 0) $$bindings.status(status);
	if ($$props.segments === void 0 && $$bindings.segments && segments !== void 0) $$bindings.segments(segments);
	if ($$props.level0 === void 0 && $$bindings.level0 && level0 !== void 0) $$bindings.level0(level0);
	if ($$props.level1 === void 0 && $$bindings.level1 && level1 !== void 0) $$bindings.level1(level1);

	return `


	${validate_component(Layout, 'Layout').$$render($$result, Object.assign({ segment: segments[0] }, level0.props), {}, {
		default: () => `
		${ error ? `${validate_component(Error$1, 'Error').$$render($$result, { error: error, status: status }, {}, {})}` : `${validate_component(((level1.component) || missing_component), 'svelte:component').$$render($$result, Object.assign(level1.props), {}, {})}` }
	`
	})}`;
});

const initial_data = typeof __SAPPER__ !== 'undefined' && __SAPPER__;

const stores = {
	page: writable({}),
	preloading: writable(null),
	session: writable(initial_data && initial_data.session)
};

stores.session.subscribe(async value => {

	return;
});

const stores$1 = () => getContext(CONTEXT_KEY);

/* src\routes\_components\ArticleList\Rate.svelte generated by Svelte v3.12.1 */

const css$1 = {
	code: ".icon.svelte-6qowvc{display:inline-block;width:16px;height:16px;stroke-width:0;stroke:currentColor;fill:currentColor;vertical-align:middle;top:-2px;position:relative;margin:0 5px}.Rate.svelte-6qowvc{cursor:default}.Rate__star.svelte-6qowvc{color:#dedbdb;display:inline-block;padding:7px;text-decoration:none;cursor:pointer;background:transparent none;border:0}.Rate__star.svelte-6qowvc .icon.svelte-6qowvc{top:0;vertical-align:middle}.Rate__star.hover.svelte-6qowvc{color:#efc20f}.Rate__star.filled.svelte-6qowvc{color:#efc20f}.Rate__star.svelte-6qowvc:hover,.Rate__star.svelte-6qowvc:focus{text-decoration:none}.Rate__view.svelte-6qowvc .count.svelte-6qowvc,.Rate__view.svelte-6qowvc .desc.svelte-6qowvc{display:inline-block;vertical-align:middle;padding:7px}.Rate__star[disabled].svelte-6qowvc{opacity:0.8}.Rate__star.hover[disabled].svelte-6qowvc,.Rate__star.filled[disabled].svelte-6qowvc{color:#efc20f;opacity:0.6}.Rate__view.disabled.svelte-6qowvc .count.svelte-6qowvc,.Rate__view.disabled.svelte-6qowvc .desc.svelte-6qowvc{color:#ccc}",
	map: "{\"version\":3,\"file\":\"Rate.svelte\",\"sources\":[\"Rate.svelte\"],\"sourcesContent\":[\"<script>\\r\\n    import { onMount, beforeUpdate } from \\\"svelte\\\";\\r\\n\\r\\n    export let value = 0;\\r\\n    export let name = \\\"rate\\\";\\r\\n    export let length = 5;\\r\\n    export let showCount = false;\\r\\n    export let required = false;\\r\\n    export let ratedesc = [];\\r\\n    export let beforeRate;\\r\\n    export let afterRate;\\r\\n    export let disabled = false;\\r\\n    export let readonly = false;\\r\\n\\r\\n    let arr = [];\\r\\n    let rate = 0;\\r\\n    let over = 0;\\r\\n    $: if (value) {\\r\\n        rate = convertValue(value);\\r\\n        over = convertValue(value);\\r\\n    }\\r\\n\\r\\n    const convertValue = val => {\\r\\n        if (val >= length) {\\r\\n            val = length;\\r\\n        } else if (val < 0) {\\r\\n            val = 0;\\r\\n        }\\r\\n        return val;\\r\\n    };\\r\\n    const onOver = index => {\\r\\n        if (!readonly) over = index;\\r\\n    };\\r\\n    const onOut = () => {\\r\\n        if (!readonly) over = rate;\\r\\n    };\\r\\n    const setRate = index => {\\r\\n        if (readonly) return false;\\r\\n        if (typeof beforeRate === \\\"function\\\") {\\r\\n            beforeRate(rate);\\r\\n        }\\r\\n        rate = index;\\r\\n        if (typeof afterRate === \\\"function\\\") {\\r\\n            afterRate(rate);\\r\\n        }\\r\\n    };\\r\\n    const isFilled = index => {\\r\\n        return index <= over;\\r\\n    };\\r\\n    const isEmpty = index => {\\r\\n        return index > over || (!value && !over);\\r\\n    };\\r\\n\\r\\n    const createArray = () => {\\r\\n        for (let i = 1; i <= length; i++) {\\r\\n            arr.push(i);\\r\\n        }\\r\\n    };\\r\\n    beforeUpdate(() => {\\r\\n        if (arr.length === 0) {\\r\\n            createArray();\\r\\n        }\\r\\n    });\\r\\n    onMount(() => {\\r\\n        value = convertValue(value);\\r\\n        rate = convertValue(value);\\r\\n        over = convertValue(value);\\r\\n    });\\r\\n</script>\\r\\n\\r\\n<style>\\r\\n    /*author : @SinanMtl  */\\r\\n    .icon {\\r\\n        display: inline-block;\\r\\n        width: 16px;\\r\\n        height: 16px;\\r\\n        stroke-width: 0;\\r\\n        stroke: currentColor;\\r\\n        fill: currentColor;\\r\\n        vertical-align: middle;\\r\\n        top: -2px;\\r\\n        position: relative;\\r\\n        margin: 0 5px;\\r\\n    }\\r\\n    .Rate {\\r\\n        cursor: default;\\r\\n    }\\r\\n    .Rate__star {\\r\\n        color: #dedbdb;\\r\\n        display: inline-block;\\r\\n        padding: 7px;\\r\\n        text-decoration: none;\\r\\n        cursor: pointer;\\r\\n        background: transparent none;\\r\\n        border: 0;\\r\\n    }\\r\\n    .Rate__star .icon {\\r\\n        top: 0;\\r\\n        vertical-align: middle;\\r\\n    }\\r\\n    .Rate__star.hover {\\r\\n        color: #efc20f;\\r\\n    }\\r\\n    .Rate__star.filled {\\r\\n        color: #efc20f;\\r\\n    }\\r\\n    .Rate__star:hover,\\r\\n    .Rate__star:focus {\\r\\n        text-decoration: none;\\r\\n    }\\r\\n    .Rate__view .count,\\r\\n    .Rate__view .desc {\\r\\n        display: inline-block;\\r\\n        vertical-align: middle;\\r\\n        padding: 7px;\\r\\n    }\\r\\n    .Rate.has-error .Rate__star {\\r\\n        color: #f37a77;\\r\\n    }\\r\\n    .Rate.has-error .Rate__star.hover {\\r\\n        color: #efc20f;\\r\\n    }\\r\\n    .Rate.has-error .Rate__star.filled {\\r\\n        color: #efc20f;\\r\\n    }\\r\\n    .Rate__star[disabled] {\\r\\n        opacity: 0.8;\\r\\n    }\\r\\n    .Rate__star.hover[disabled],\\r\\n    .Rate__star.filled[disabled] {\\r\\n        color: #efc20f;\\r\\n        opacity: 0.6;\\r\\n    }\\r\\n    .Rate__view.disabled .count,\\r\\n    .Rate__view.disabled .desc {\\r\\n        color: #ccc;\\r\\n    }\\r\\n</style>\\r\\n\\r\\n{#if length > 0}\\r\\n    <div class=\\\"Rate\\\">\\r\\n        <svg\\r\\n                style=\\\"position: absolute; width: 0; height: 0;\\\"\\r\\n                width=\\\"0\\\"\\r\\n                height=\\\"0\\\"\\r\\n                version=\\\"1.1\\\"\\r\\n                xmlns=\\\"http://www.w3.org/2000/svg\\\"\\r\\n                xmlns:xlink=\\\"http://www.w3.org/1999/xlink\\\">\\r\\n            <defs>\\r\\n                <symbol id=\\\"icon-star-full\\\" viewBox=\\\"0 0 32 32\\\">\\r\\n                    <title>star-full</title>\\r\\n                    <path\\r\\n                            d=\\\"M32 12.408l-11.056-1.607-4.944-10.018-4.944 10.018-11.056 1.607 8\\r\\n            7.798-1.889 11.011 9.889-5.199 9.889 5.199-1.889-11.011 8-7.798z\\\" />\\r\\n                </symbol>\\r\\n            </defs>\\r\\n        </svg>\\r\\n        {#each arr as n}\\r\\n            <button\\r\\n                    type=\\\"button\\\"\\r\\n                    key={n}\\r\\n                    class:hover={n <= over}\\r\\n                    class:filled={n <= rate || isFilled(n)}\\r\\n                    class={'Rate__star'}\\r\\n                    on:mouseover={() => {\\r\\n                    onOver(n);\\r\\n                    }}\\r\\n                    on:mouseout={() => {\\r\\n                    onOut(n);\\r\\n                    }}\\r\\n                            on:click={() => {\\r\\n                        setRate(n);\\r\\n                        }}\\r\\n                            on:keyup={() => {\\r\\n                        onOver(n);\\r\\n                        }}\\r\\n                            on:keyup.enter={() => {\\r\\n            setRate(n);\\r\\n            }}\\r\\n                {disabled}>\\r\\n                <svg class=\\\"icon\\\">\\r\\n                    <use xlink:href=\\\"#icon-star-full\\\" />\\r\\n                </svg>\\r\\n            </button>\\r\\n        {/each}\\r\\n        <div class=\\\"Rate__view\\\" class::disabled={disabled}>\\r\\n            {#if showCount && over > 0}\\r\\n                <span class=\\\"count\\\">{over}</span>\\r\\n            {/if}\\r\\n            {#if ratedesc.length > 0 && over > 0}\\r\\n                <span class=\\\"desc\\\">{ratedesc[over - 1]}</span>\\r\\n            {/if}\\r\\n        </div>\\r\\n    </div>\\r\\n{/if}\\r\\n\"],\"names\":[],\"mappings\":\"AAwEI,KAAK,cAAC,CAAC,AACH,OAAO,CAAE,YAAY,CACrB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,YAAY,CAAE,CAAC,CACf,MAAM,CAAE,YAAY,CACpB,IAAI,CAAE,YAAY,CAClB,cAAc,CAAE,MAAM,CACtB,GAAG,CAAE,IAAI,CACT,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,CAAC,CAAC,GAAG,AACjB,CAAC,AACD,KAAK,cAAC,CAAC,AACH,MAAM,CAAE,OAAO,AACnB,CAAC,AACD,WAAW,cAAC,CAAC,AACT,KAAK,CAAE,OAAO,CACd,OAAO,CAAE,YAAY,CACrB,OAAO,CAAE,GAAG,CACZ,eAAe,CAAE,IAAI,CACrB,MAAM,CAAE,OAAO,CACf,UAAU,CAAE,WAAW,CAAC,IAAI,CAC5B,MAAM,CAAE,CAAC,AACb,CAAC,AACD,yBAAW,CAAC,KAAK,cAAC,CAAC,AACf,GAAG,CAAE,CAAC,CACN,cAAc,CAAE,MAAM,AAC1B,CAAC,AACD,WAAW,MAAM,cAAC,CAAC,AACf,KAAK,CAAE,OAAO,AAClB,CAAC,AACD,WAAW,OAAO,cAAC,CAAC,AAChB,KAAK,CAAE,OAAO,AAClB,CAAC,AACD,yBAAW,MAAM,CACjB,yBAAW,MAAM,AAAC,CAAC,AACf,eAAe,CAAE,IAAI,AACzB,CAAC,AACD,yBAAW,CAAC,oBAAM,CAClB,yBAAW,CAAC,KAAK,cAAC,CAAC,AACf,OAAO,CAAE,YAAY,CACrB,cAAc,CAAE,MAAM,CACtB,OAAO,CAAE,GAAG,AAChB,CAAC,AAUD,WAAW,CAAC,QAAQ,CAAC,cAAC,CAAC,AACnB,OAAO,CAAE,GAAG,AAChB,CAAC,AACD,WAAW,MAAM,CAAC,QAAQ,eAAC,CAC3B,WAAW,OAAO,CAAC,QAAQ,CAAC,cAAC,CAAC,AAC1B,KAAK,CAAE,OAAO,CACd,OAAO,CAAE,GAAG,AAChB,CAAC,AACD,WAAW,uBAAS,CAAC,oBAAM,CAC3B,WAAW,uBAAS,CAAC,KAAK,cAAC,CAAC,AACxB,KAAK,CAAE,IAAI,AACf,CAAC\"}"
};

const Rate = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let { value = 0, name = "rate", length = 5, showCount = false, required = false, ratedesc = [], beforeRate, afterRate, disabled = false, readonly = false } = $$props;

    let arr = [];
    let rate = 0;
    let over = 0;

    const convertValue = val => {
        if (val >= length) {
            val = length;
        } else if (val < 0) {
            val = 0;
        }
        return val;
    };
    const isFilled = index => {
        return index <= over;
    };

    const createArray = () => {
        for (let i = 1; i <= length; i++) {
            arr.push(i);
        }
    };
    beforeUpdate(() => {
        if (arr.length === 0) {
            createArray();
        }
    });
    onMount(() => {
        value = convertValue(value);
        rate = convertValue(value);
        over = convertValue(value);
    });

	if ($$props.value === void 0 && $$bindings.value && value !== void 0) $$bindings.value(value);
	if ($$props.name === void 0 && $$bindings.name && name !== void 0) $$bindings.name(name);
	if ($$props.length === void 0 && $$bindings.length && length !== void 0) $$bindings.length(length);
	if ($$props.showCount === void 0 && $$bindings.showCount && showCount !== void 0) $$bindings.showCount(showCount);
	if ($$props.required === void 0 && $$bindings.required && required !== void 0) $$bindings.required(required);
	if ($$props.ratedesc === void 0 && $$bindings.ratedesc && ratedesc !== void 0) $$bindings.ratedesc(ratedesc);
	if ($$props.beforeRate === void 0 && $$bindings.beforeRate && beforeRate !== void 0) $$bindings.beforeRate(beforeRate);
	if ($$props.afterRate === void 0 && $$bindings.afterRate && afterRate !== void 0) $$bindings.afterRate(afterRate);
	if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0) $$bindings.disabled(disabled);
	if ($$props.readonly === void 0 && $$bindings.readonly && readonly !== void 0) $$bindings.readonly(readonly);

	$$result.css.add(css$1);

	if (value) {
                rate = convertValue(value);
                over = convertValue(value);
            }

	return `${ length > 0 ? `<div class="Rate svelte-6qowvc">
	        <svg style="position: absolute; width: 0; height: 0;" width="0" height="0" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
	            <defs>
	                <symbol id="icon-star-full" viewBox="0 0 32 32">
	                    <title>star-full</title>
	                    <path d="M32 12.408l-11.056-1.607-4.944-10.018-4.944 10.018-11.056 1.607 8
	            7.798-1.889 11.011 9.889-5.199 9.889 5.199-1.889-11.011 8-7.798z"></path>
	                </symbol>
	            </defs>
	        </svg>
	        ${each(arr, (n) => `<button type="button"${add_attribute("key", n, 0)} class="${[`${escape(null_to_empty('Rate__star'))} svelte-6qowvc`, n <= over ? "hover" : "", n <= rate || isFilled(n) ? "filled" : ""].join(' ').trim() }"${disabled ? " disabled" : "" }>
	                <svg class="icon svelte-6qowvc">
	                    <use xlink:href="#icon-star-full"></use>
	                </svg>
	            </button>`)}
	        <div class="${[`Rate__view svelte-6qowvc`, disabled ? ":disabled" : ""].join(' ').trim() }">
	            ${ showCount && over > 0 ? `<span class="count svelte-6qowvc">${escape(over)}</span>` : `` }
	            ${ ratedesc.length > 0 && over > 0 ? `<span class="desc svelte-6qowvc">${escape(ratedesc[over - 1])}</span>` : `` }
	        </div>
	    </div>` : `` }`;
});

/* src\routes\_components\ArticleList\ArticlePreview.svelte generated by Svelte v3.12.1 */

const css$2 = {
	code: ".teg.svelte-fubfs{margin-bottom:10px}.three.svelte-fubfs{flex-1:auto;background-color:#e2e8f0;box-shadow:2px 2px 8px rgba(0,0,0,0.1);border:black;border-radius:2px;border:1px solid #aaa;padding:4px}.four.svelte-fubfs{background-color:#f7fafc;padding:20px;border:1px solid #000;border-radius:4px;font-family:'Roboto', sans-serif}.five.svelte-fubfs{background-color:#718096;width:auto;height:256px;border:1px solid #000;border-radius:4px;font-family:'Roboto', sans-serif}.six.svelte-fubfs{padding:4px}.seven.svelte-fubfs{width:auto;height:auto;color:blue;font-weight:bold;align-items:center;font-family:'Roboto', sans-serif}.seven.svelte-fubfs h2.svelte-fubfs{color:blue}.eight.svelte-fubfs{font-weight:bold;font-family:'Roboto', sans-serif}.nine.svelte-fubfs{font-family:'Roboto', sans-serif}.ten.svelte-fubfs{padding:20px}",
	map: "{\"version\":3,\"file\":\"ArticlePreview.svelte\",\"sources\":[\"ArticlePreview.svelte\"],\"sourcesContent\":[\"<script>\\r\\n\\timport * as api from 'api.js';\\r\\n\\r\\n\\texport let article;\\r\\n\\texport let user;\\r\\n\\r\\n\\tasync function toggleFavorite() {\\r\\n\\t\\t// optimistic UI\\r\\n\\t\\tif (article.favorited) {\\r\\n\\t\\t\\tarticle.favoritesCount -= 1;\\r\\n\\t\\t\\tarticle.favorited = false;\\r\\n\\t\\t} else {\\r\\n\\t\\t\\tarticle.favoritesCount += 1;\\r\\n\\t\\t\\tarticle.favorited = true;\\r\\n\\t\\t}\\r\\n\\r\\n\\t\\t({ article } = await (article.favorited\\r\\n\\t\\t\\t\\t? api.post(`articles/${article.slug}/favorite`, null, user && user.token)\\r\\n\\t\\t\\t\\t: api.del(`articles/${article.slug}/favorite`, user && user.token)));\\r\\n\\t}\\r\\n\\timport Rate from \\\"../ArticleList/Rate.svelte\\\";\\r\\n\\r\\n\\tconst beforeRate = rate => {\\r\\n\\t\\tconsole.log(rate);\\r\\n\\t};\\r\\n\\tconst afterRate = rate => {\\r\\n\\t\\tconsole.log(rate);\\r\\n\\t};\\r\\n</script>\\r\\n\\r\\n<div class=\\\"article-preview\\\">\\r\\n\\t<div class=\\\"article-meta\\\">\\r\\n\\t\\t<div class=\\\"info\\\">\\r\\n\\t\\t\\t<span class=\\\"date\\\">\\r\\n\\t\\t\\t\\t{new Date(article.createdAt).toDateString()}\\r\\n\\t\\t\\t</span>\\r\\n\\t\\t</div>\\r\\n\\r\\n\\t\\t{#if user}\\r\\n\\t\\t\\t<div class=\\\"pull-xs-right\\\">\\r\\n\\t\\t\\t\\t<button class='btn btn-sm {article.favorited ? \\\"btn-primary\\\" : \\\"btn-outline-primary\\\"}' on:click={toggleFavorite}>\\r\\n\\t\\t\\t\\t\\t<i class=\\\"ion-plus-round\\\"></i>\\r\\n\\t\\t\\t\\t\\t{article.favoritesCount ? 'Убрать из списка' : 'Добавить в список'}\\r\\n\\t\\t\\t\\t</button>\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t{/if}\\r\\n\\t</div>\\r\\n\\t<a href='/article/{article.slug}' rel='prefetch' class=\\\"preview-link\\\">\\r\\n\\t\\t<div class=\\\"six\\\">\\r\\n\\t\\t\\t<div class=\\\"three container\\\">\\r\\n\\t\\t\\t\\t<div class=\\\"ten\\\">\\r\\n\\t\\t\\t\\t\\t<div class=\\\"five\\\"></div>\\r\\n\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t<div class=\\\"ten\\\">\\r\\n\\t\\t\\t\\t\\t<div class=\\\"four\\\">\\r\\n\\t\\t\\t\\t\\t\\t<div class=\\\"seven\\\" style=\\\"text-align: center\\\">\\r\\n\\t\\t\\t\\t\\t\\t\\t<h2>{article.title}</h2>\\r\\n\\t\\t\\t\\t\\t\\t\\t<div class=\\\"teg\\\">\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t{#each article.tagList as tag}\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t<li class=\\\"tag-default tag-pill tag-outline\\\">\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t{tag}\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t</li>\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t{/each}\\r\\n\\t\\t\\t\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t\\t\\t<div class=\\\"nine\\\">\\r\\n\\t\\t\\t\\t\\t\\t\\t<p class=\\\"leading-normal text-left slide-in-bottom-subtitle\\\">\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t{article.description}\\r\\n\\t\\t\\t\\t\\t\\t\\t</p>\\r\\n\\t\\t\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t</div>\\r\\n\\t</a>\\r\\n</div>\\r\\n<style>\\r\\n\\t.awe\\r\\n\\t{\\r\\n\\t}\\r\\n\\t.teg\\r\\n\\t{\\r\\n\\t\\tmargin-bottom: 10px;\\r\\n\\t}\\r\\n\\t.three\\r\\n\\t{\\r\\n\\t\\tflex-1: auto;\\r\\n\\t\\tbackground-color: #e2e8f0;\\r\\n\\t\\tbox-shadow: 2px 2px 8px rgba(0,0,0,0.1);\\r\\n\\t\\tborder: black;\\r\\n\\t\\tborder-radius: 2px;\\r\\n\\t\\tborder: 1px solid #aaa;\\r\\n\\t\\tpadding: 4px;\\r\\n\\t}\\r\\n\\t.four\\r\\n\\t{\\r\\n\\t\\tbackground-color: #f7fafc;\\r\\n\\t\\tpadding:20px;\\r\\n\\t\\tborder: 1px solid #000;\\r\\n\\t\\tborder-radius: 4px;\\r\\n\\t\\tfont-family: 'Roboto', sans-serif;\\r\\n\\t}\\r\\n\\t.five\\r\\n\\t{\\r\\n\\t\\tbackground-color: #718096;\\r\\n\\t\\twidth: auto;\\r\\n\\t\\theight: 256px;\\r\\n\\t\\tborder: 1px solid #000;\\r\\n\\t\\tborder-radius: 4px;\\r\\n\\t\\tfont-family: 'Roboto', sans-serif;\\r\\n\\t}\\r\\n\\t.six\\r\\n\\t{\\r\\n\\t\\tpadding: 4px;\\r\\n\\t}\\r\\n\\t.seven\\r\\n\\t{\\r\\n\\t\\twidth: auto;\\r\\n\\t\\theight: auto;\\r\\n\\t\\tcolor: blue;\\r\\n\\t\\tfont-weight: bold;\\r\\n\\t\\talign-items: center;\\r\\n\\t\\tfont-family: 'Roboto', sans-serif;\\r\\n\\t}\\r\\n\\t.seven h2\\r\\n\\t{\\r\\n\\t\\tcolor: blue;\\r\\n\\t}\\r\\n\\t.eight\\r\\n\\t{\\r\\n\\t\\tfont-weight: bold;\\r\\n\\t\\tfont-family: 'Roboto', sans-serif;\\r\\n\\t}\\r\\n\\t.nine\\r\\n\\t{\\r\\n\\t\\tfont-family: 'Roboto', sans-serif;\\r\\n\\t}\\r\\n\\t.ten\\r\\n\\t{\\r\\n\\t\\tpadding:20px;\\r\\n\\t}\\r\\n</style>\\r\\n\"],\"names\":[],\"mappings\":\"AAgFC,IAAI,aACJ,CAAC,AACA,aAAa,CAAE,IAAI,AACpB,CAAC,AACD,MAAM,aACN,CAAC,AACA,MAAM,CAAE,IAAI,CACZ,gBAAgB,CAAE,OAAO,CACzB,UAAU,CAAE,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CACvC,MAAM,CAAE,KAAK,CACb,aAAa,CAAE,GAAG,CAClB,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,CACtB,OAAO,CAAE,GAAG,AACb,CAAC,AACD,KAAK,aACL,CAAC,AACA,gBAAgB,CAAE,OAAO,CACzB,QAAQ,IAAI,CACZ,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,CACtB,aAAa,CAAE,GAAG,CAClB,WAAW,CAAE,QAAQ,CAAC,CAAC,UAAU,AAClC,CAAC,AACD,KAAK,aACL,CAAC,AACA,gBAAgB,CAAE,OAAO,CACzB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,KAAK,CACb,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,CACtB,aAAa,CAAE,GAAG,CAClB,WAAW,CAAE,QAAQ,CAAC,CAAC,UAAU,AAClC,CAAC,AACD,IAAI,aACJ,CAAC,AACA,OAAO,CAAE,GAAG,AACb,CAAC,AACD,MAAM,aACN,CAAC,AACA,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,CACX,WAAW,CAAE,IAAI,CACjB,WAAW,CAAE,MAAM,CACnB,WAAW,CAAE,QAAQ,CAAC,CAAC,UAAU,AAClC,CAAC,AACD,mBAAM,CAAC,EAAE,aACT,CAAC,AACA,KAAK,CAAE,IAAI,AACZ,CAAC,AACD,MAAM,aACN,CAAC,AACA,WAAW,CAAE,IAAI,CACjB,WAAW,CAAE,QAAQ,CAAC,CAAC,UAAU,AAClC,CAAC,AACD,KAAK,aACL,CAAC,AACA,WAAW,CAAE,QAAQ,CAAC,CAAC,UAAU,AAClC,CAAC,AACD,IAAI,aACJ,CAAC,AACA,QAAQ,IAAI,AACb,CAAC\"}"
};

const ArticlePreview = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let { article, user } = $$props;

	if ($$props.article === void 0 && $$bindings.article && article !== void 0) $$bindings.article(article);
	if ($$props.user === void 0 && $$bindings.user && user !== void 0) $$bindings.user(user);

	$$result.css.add(css$2);

	return `<div class="article-preview">
		<div class="article-meta">
			<div class="info">
				<span class="date">
					${escape(new Date(article.createdAt).toDateString())}
				</span>
			</div>

			${ user ? `<div class="pull-xs-right">
					<button class="btn btn-sm ${escape(article.favorited ? "btn-primary" : "btn-outline-primary")} svelte-fubfs">
						<i class="ion-plus-round"></i>
						${escape(article.favoritesCount ? 'Убрать из списка' : 'Добавить в список')}
					</button>
				</div>` : `` }
		</div>
		<a href="/article/${escape(article.slug)}" rel="prefetch" class="preview-link">
			<div class="six svelte-fubfs">
				<div class="three container svelte-fubfs">
					<div class="ten svelte-fubfs">
						<div class="five svelte-fubfs"></div>
					</div>
					<div class="ten svelte-fubfs">
						<div class="four svelte-fubfs">
							<div class="seven svelte-fubfs" style="text-align: center">
								<h2 class="svelte-fubfs">${escape(article.title)}</h2>
								<div class="teg svelte-fubfs">
									${each(article.tagList, (tag) => `<li class="tag-default tag-pill tag-outline">
											${escape(tag)}
										</li>`)}
								</div>
							</div>
							<div class="nine svelte-fubfs">
								<p class="leading-normal text-left slide-in-bottom-subtitle">
									${escape(article.description)}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</a>
	</div>`;
});

/* src\routes\_components\ArticleList\ListPagination.svelte generated by Svelte v3.12.1 */

const ListPagination = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let { articlesCount, page } = $$props;

	let range;

	if ($$props.articlesCount === void 0 && $$bindings.articlesCount && articlesCount !== void 0) $$bindings.articlesCount(articlesCount);
	if ($$props.page === void 0 && $$bindings.page && page !== void 0) $$bindings.page(page);

	{
				range = [];
				for (let i = 0; i < Math.ceil(articlesCount / 10); ++i) {
					range.push(i);
				}
			}

	return `${ articlesCount > 10 ? `<nav>
			<ul class="pagination">

				${each(range, (v) => `<li class="page-item ${escape(v === page ? "active": "")}">
						<a class="page-link" href="/${escape(v ? v + 1 : '')}">${escape(v + 1)}</a>
					</li>`)}
			</ul>
		</nav>` : `` }`;
});

/* src\routes\_components\ArticleList\index.svelte generated by Svelte v3.12.1 */

const Index = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let $session, $page;

	

	let { tab, username = false, favorites = false, tag, p } = $$props;

	const { session, page } = stores$1(); $session = get_store_value(session); $page = get_store_value(page);

	let query;
	let articles;
	let articlesCount;

	async function getData() {
		articles = null;

		// TODO do we need some error handling here?
		({ articles, articlesCount } = await get(query, $session.user && $session.user.token));
	}

	if ($$props.tab === void 0 && $$bindings.tab && tab !== void 0) $$bindings.tab(tab);
	if ($$props.username === void 0 && $$bindings.username && username !== void 0) $$bindings.username(username);
	if ($$props.favorites === void 0 && $$bindings.favorites && favorites !== void 0) $$bindings.favorites(favorites);
	if ($$props.tag === void 0 && $$bindings.tag && tag !== void 0) $$bindings.tag(tag);
	if ($$props.p === void 0 && $$bindings.p && p !== void 0) $$bindings.p(p);

	$session = get_store_value(session);
	$page = get_store_value(page);

	{
				const endpoint = tab === 'feed' ? 'articles/feed' : 'articles';
				const page_size = tab === 'feed' ? 5 : 10;
		
				let params = `limit=${page_size}&offset=${(p - 1) * page_size}`;
				if (tab === 'tag') params += `&tag=${tag}`;
				if (tab === 'profile') params += `&${favorites ? 'favorited' : 'author'}=${encodeURIComponent(username)}`;
		
				query = `${endpoint}?${params}`;
			}
	query && getData();

	return `${ articles ? `${ articles.length === 0 ? `<div class="article-preview">
				Тут ничего нет.
			</div>` : `<div>
				${each(articles, (article) => `${validate_component(ArticlePreview, 'ArticlePreview').$$render($$result, {
		article: article,
		user: $session.user
	}, {}, {})}`)}

				${validate_component(ListPagination, 'ListPagination').$$render($$result, {
		articlesCount: articlesCount,
		page: parseInt($page.params.user, 10)
	}, {}, {})}
			</div>` }` : `<div class="article-preview">Загрузка...</div>` }`;
});

/* src\routes\_components\MainView\index.svelte generated by Svelte v3.12.1 */

const Index$1 = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	

	let { tab = 'all', tag = null, p } = $$props;

	const { session } = stores$1();

	if ($$props.tab === void 0 && $$bindings.tab && tab !== void 0) $$bindings.tab(tab);
	if ($$props.tag === void 0 && $$bindings.tag && tag !== void 0) $$bindings.tag(tag);
	if ($$props.p === void 0 && $$bindings.p && p !== void 0) $$bindings.p(p);

	return `<div class="container page">
		${validate_component(Index, 'ArticleList').$$render($$result, {
		p: p,
		tab: tab,
		tag: tag
	}, {}, {})}
	</div>`;
});

/* src\routes\_components\Home.svelte generated by Svelte v3.12.1 */

const Home = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	

	let { p = 1 } = $$props;
	let tags;

	onMount(async () => {
		({ tags } = await get('tags'));
	});

	if ($$props.p === void 0 && $$bindings.p && p !== void 0) $$bindings.p(p);

	return `${($$result.head += `<title>Главное меню Ignat Japan</title>`, "")}

	<div class="home-page">
		<div class="banner">
			<div class="container">
				<p><img class="ignatimage" src="https://i.ibb.co/1n212y8/Ignat-Japan.jpg" alt="Ignat-Japan" border="0"></p>
			</div>
		</div>
		<div class="container page">
			<div class="maintext">
				<p> Ignat Japan - это ( в значительной степени ) академический сайт, посвященный различным аспектам одной из великих мировых литератур.
					Сайт имеет тенденцию расширяться неторопливо, тем не менее, здесь есть материал, который возможно недоступен в других местах, поэтому не стесняйтесь просматривать.</p>
				<p class="maintext2">Японская литература — литература на японском языке, хронологически охватывающая период почти в полтора тысячелетия: от летописи «Кодзики» (712 год) до произведений современных авторов.
					На ранней стадии своего развития испытала сильнейшее влияние китайской литературы и зачастую писалась на классическом китайском. Влияние китайского в разной степени ощущалось вплоть до конца периода
					Эдо, сведясь к минимуму в XIX веке, начиная с которого развитие японской литературы стало во многом обусловлено продолжающимся до настоящего времени диалогом с европейской литературой.</p>
			</div>
		</div>
	</div>`;
});

/* src\routes\index.svelte generated by Svelte v3.12.1 */

const Index$2 = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	return `${validate_component(Home, 'Home').$$render($$result, { p: 1 }, {}, {})}`;
});

var arrowDown = "M9 12.268l2.293-2.235a1.02 1.02 0 011.414 0c.39.38.39.998 0 1.379L8 16l-4.707-4.588a.957.957 0 010-1.379 1.02 1.02 0 011.414 0L7 12.268V.975A.988.988 0 018 0c.552 0 1 .436 1 .975v11.293z";

var arrowLeft = "M5.977 9H13a1 1 0 100-2H5.977l2.726-2.448a.845.845 0 000-1.286 1.095 1.095 0 00-1.431 0L2 8l5.272 4.734a1.095 1.095 0 001.431 0 .845.845 0 000-1.286L5.977 9z";

var arrowRight = "M10.023 9H3a1 1 0 110-2h7.023L7.297 4.552a.845.845 0 010-1.286 1.095 1.095 0 011.431 0L14 8l-5.272 4.734a1.095 1.095 0 01-1.431 0 .845.845 0 010-1.286L10.023 9z";

var arrowUp = "M9 3.732l2.293 2.235c.39.38 1.024.38 1.414 0a.957.957 0 000-1.379L8 0 3.293 4.588a.957.957 0 000 1.379c.39.38 1.024.38 1.414 0L7 3.732v11.293c0 .539.448.975 1 .975s1-.436 1-.975V3.732z";

var arrowsUpdown = "M8 2.646l-3.293 3.08a1.05 1.05 0 01-1.414 0 .893.893 0 010-1.323L8 0l4.707 4.403c.39.365.39.958 0 1.323a1.05 1.05 0 01-1.414 0L8 2.646zm0 10.708l3.293-3.08a1.05 1.05 0 011.414 0c.39.365.39.958 0 1.323L8 16l-4.707-4.403a.893.893 0 010-1.323 1.05 1.05 0 011.414 0L8 13.354z";

var attention = "M6 9V2a2 2 0 114 0v7a2 2 0 11-4 0zm2 7a2 2 0 110-4 2 2 0 010 4z";

var burger = "M1 5a1 1 0 110-2h13.986a1 1 0 010 2H1zm0 4a1 1 0 110-2h13.986a1 1 0 010 2H1zm0 4a1 1 0 010-2h13.986a1 1 0 010 2H1z";

var calendar = "M4 2V0h2v2h4V0h2v2h1c1.657 0 3 1.373 3 3.067v7.866C16 14.627 14.657 16 13 16H3c-1.657 0-3-1.373-3-3.067V5.067C0 3.373 1.343 2 3 2h1zm0 0zm2 0zm4 0zm2 0zM3 4c-.552 0-1 .462-1 1.032v7.936C2 13.538 2.448 14 3 14h10c.552 0 1-.462 1-1.032V5.032C14 4.462 13.552 4 13 4H3zm1 9v-2h2v2H4zm3 0v-2h2v2H7zm3 0v-2h2v2h-2zm-6-3V8h2v2H4zm3 0V8h2v2H7zm0-3V5h2v2H7zm3 3V8h2v2h-2zm0-3V5h2v2h-2z";

var cashbox = "M9 8V6H7a1 1 0 01-1-1V1a1 1 0 011-1h8a1 1 0 011 1v4a1 1 0 01-1 1h-2v2h2a1 1 0 011 1v6a1 1 0 01-1 1H1a1 1 0 01-1-1V9a1 1 0 011-1h8zm0-4h5V2H8v2h1zm-7 6v4h12v-4H2z";

var cashbox2 = "M4 5V1.5A1.5 1.5 0 015.5 0h3.293a1.5 1.5 0 011.06.44l1.708 1.706A1.5 1.5 0 0112 3.207V5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2zm2 0h4V3.414L8.586 2H6v3zm-.5 3h5a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-5a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5zM4 7v7h8V7H4z";

var catalog = "M9 4.711v6.727a10.236 10.236 0 015-.234V4.337A6.481 6.481 0 0011.969 4c-.97 0-1.955.232-2.969.711zm-2 .06C5.994 4.25 5.022 4 4.061 4c-.65 0-1.337.115-2.061.351v6.85a10.063 10.063 0 015 .26V4.77zM7.93 3h.015c1.341-.667 2.683-1 4.024-1 1.344 0 2.687.335 4.031 1.004v11C14.656 13.334 13.312 13 11.969 13c-1.344 0-2.688.335-4.031 1.004C6.643 13.334 5.332 13 4 13c-1.332 0-2.665.335-4 1.004v-11C1.411 2.334 2.765 2 4.061 2c1.294 0 2.584.333 3.87 1z";

var check = "M14.138 2.322a1.085 1.085 0 011.542 0c.427.43.427 1.126 0 1.555L6 13.602.32 7.877a1.106 1.106 0 010-1.555 1.085 1.085 0 011.542 0L6 10.492l8.138-8.17z";

var chevronDown = "M8 10.657l6.364-6.364a1 1 0 011.414 1.414l-7.07 7.071a1 1 0 01-1.415 0L.222 5.708a1 1 0 011.414-1.415L8 10.657z";

var chevronLeft = "M5.225 8.016l6.364-6.364A1 1 0 1010.174.237l-7.07 7.071a1 1 0 000 1.415l7.07 7.07a1 1 0 001.415-1.413L5.225 8.016z";

var chevronRight = "M10.538 8.016L4.174 1.652A1 1 0 115.59.237l7.07 7.071a1 1 0 010 1.415l-7.07 7.07a1 1 0 01-1.415-1.413l6.364-6.364z";

var chevronUp = "M8 5.343l6.364 6.364a1 1 0 001.414-1.414l-7.07-7.071a1 1 0 00-1.415 0l-7.071 7.07a1 1 0 001.414 1.415L8 5.343z";

var clear = "M10.347 12.186l3.863.028c.511.009.933.43.942.942a.888.888 0 01-.91.91H7.754a.767.767 0 01-.252-.048l-5.837-.04C.193 12.507.152 10.162 1.573 8.74L7.74 2.573c1.422-1.42 3.767-1.38 5.238.092l.78.78c1.472 1.472 1.513 3.817.092 5.238l-3.503 3.503zm-.056-2.609L6.866 6.113l-3.96 3.96c-.55.549-.662 1.374-.345 2.06l5.14.035 2.59-2.59zm1.287-1.287l.94-.94c.71-.71.69-1.882-.046-2.618l-.78-.78c-.736-.736-1.909-.757-2.62-.046l-.92.92 3.426 3.464z";

var close = "M8.047 9.555L8 9.602l-.047-.047-4.09 4.123c-.427.43-1.117.43-1.543 0a1.106 1.106 0 010-1.555L6.41 8 2.32 3.877a1.106 1.106 0 010-1.555 1.085 1.085 0 011.542 0l4.091 4.123L8 6.398l.047.047 4.09-4.123a1.085 1.085 0 011.543 0c.427.43.427 1.126 0 1.555L9.59 8l4.09 4.123c.427.43.427 1.126 0 1.555-.426.43-1.116.43-1.542 0L8.047 9.555z";

var column = "M9 1a1 1 0 112 0v14a1 1 0 11-2 0V1zm4 0a1 1 0 112 0v14a1 1 0 11-2 0V1zM5 1a1 1 0 112 0v14a1 1 0 11-2 0V1zM1 1a1 1 0 112 0v14a1 1 0 11-2 0V1z";

var copy = "M10 12H4V6H2v8h8v-2zm0 0V6H4v6h6zM4 4V1a1 1 0 011-1h10a1 1 0 011 1v10a1 1 0 01-1 1h-3v3a1 1 0 01-1 1H1a1 1 0 01-1-1V5a1 1 0 011-1h3zm2 0h5a1 1 0 011 1v5h2V2H6v2z";

var cycle = "M4.912 11.5a4.667 4.667 0 007.36-1.62 1.167 1.167 0 012.136.941A7 7 0 013.333 13.22v.614a1.167 1.167 0 11-2.333 0V9.167h4.667a1.167 1.167 0 110 2.333h-.755zm6.176-7a4.668 4.668 0 00-7.37 1.641 1.167 1.167 0 01-2.14-.93 7 7 0 0111.089-2.43v-.614a1.167 1.167 0 112.333 0v4.666h-4.667a1.167 1.167 0 010-2.333h.755z";

var visible = "M8 5c-1.9 0-3.707.955-5.464 3C4.293 10.045 6.101 11 8 11c1.9 0 3.707-.955 5.464-3C11.707 5.955 9.899 5 8 5zm0 8c-2.946 0-5.612-1.667-8-5 2.388-3.333 5.054-5 8-5 2.946 0 5.612 1.667 8 5-2.388 3.333-5.054 5-8 5zm0-3a2 2 0 110-4 2 2 0 010 4z";

var edit = "M4.204 10.126l1.724 1.748 5.994-6.034-1.73-1.743-5.988 6.029zm-.892 1.23l-.737 2.155 2.242-.63-1.505-1.525zm7.793-8.177l1.729 1.743.747-.752-1.73-1.741-.746.75zM6.207 14.442a1.004 1.004 0 01-.441.259l-4.489 1.26A1.004 1.004 0 01.056 14.67L1.66 9.98c.05-.144.13-.274.238-.382l9.24-9.302a1.004 1.004 0 011.425 0l3.145 3.166a1.004 1.004 0 010 1.415l-9.501 9.565z";

var favorite = "M10.776 11.127a3.075 3.075 0 01.813-2.614l1.434-1.48-1.992-.315c-.918-.145-1.712-.748-2.128-1.616L8 3.22l-.903 1.882a2.873 2.873 0 01-2.128 1.616l-1.992.316 1.434 1.479c.661.682.964 1.657.813 2.614l-.328 2.077 1.789-.968a2.752 2.752 0 012.63 0l1.79.968-.329-2.077zm-3.215 2.88l-3.477 1.881a.934.934 0 01-1.286-.427 1.036 1.036 0 01-.094-.62l.638-4.038c.05-.32-.05-.644-.271-.872L.284 7.056a1.029 1.029 0 01-.009-1.41.94.94 0 01.536-.285l3.872-.614a.958.958 0 00.71-.538L7.146.55a.936.936 0 011.28-.444.976.976 0 01.425.444l1.756 3.659c.139.29.403.49.71.538l3.871.614c.521.083.88.591.8 1.135-.03.213-.127.41-.273.56L12.93 9.931a1.03 1.03 0 00-.271.872l.638 4.038c.085.543-.266 1.056-.786 1.145a.918.918 0 01-.594-.098l-3.478-1.882a.917.917 0 00-.877 0z";

var favoriteFill = "M7.561 14.006l-3.477 1.882a.934.934 0 01-1.286-.427 1.036 1.036 0 01-.094-.62l.638-4.038c.05-.32-.05-.644-.271-.872L.284 7.056a1.029 1.029 0 01-.009-1.41.94.94 0 01.536-.285l3.872-.614a.958.958 0 00.71-.538L7.146.55a.936.936 0 011.28-.444.976.976 0 01.425.444l1.756 3.659c.139.29.403.49.71.538l3.871.614c.521.083.88.591.8 1.135-.03.213-.127.41-.273.56L12.93 9.931a1.03 1.03 0 00-.271.872l.638 4.038c.085.543-.266 1.056-.786 1.145a.918.918 0 01-.594-.098l-3.478-1.882a.917.917 0 00-.877 0z";

var file = "M4 0h5.158a2 2 0 011.422.593l2.842 2.872A2 2 0 0114 4.87V14a2 2 0 01-2 2H4a2 2 0 01-2-2V2a2 2 0 012-2zm0 2v12h8V4.871L9.158 2H4z";

var filter = "M3.437 2l3.33 3.287A1 1 0 017.064 6v7.363l1.919-.986V6a1 1 0 01.294-.709L12.58 2H3.437zm1.627 4.417L.297 1.712C-.339 1.084.106 0 1 0h14c.892 0 1.338 1.079.706 1.708l-4.723 4.706v6.573a1 1 0 01-.543.89L6.52 15.89A1 1 0 015.064 15V6.417z";

var history = "M6.027 12H4.923C4.413 12 4 11.552 4 11s.413-1 .923-1h1.333c.126-.356.295-.691.502-1H4.923C4.413 9 4 8.552 4 8s.413-1 .923-1h5.154a.86.86 0 01.128.01A4.568 4.568 0 0112 7.256V5.392L8.583 2H4a1 1 0 00-1 1v10a1 1 0 001 1h2.758a4.474 4.474 0 01-.73-2zm6.945 3.26A2.985 2.985 0 0111 16H4a3 3 0 01-3-3V3a3 3 0 013-3h4.995l.704.29 4.005 3.976.296.71V8.67c.625.773 1 1.757 1 2.829a4.496 4.496 0 01-4.5 4.5l2.472-.74zM10.5 14a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM4.923 6C4.413 6 4 5.552 4 5s.413-1 .923-1h3.154C8.587 4 9 4.448 9 5s-.413 1-.923 1H4.923zm6.577 5a.5.5 0 110 1H10v-1.5a.5.5 0 111 0v.5h.5z";

var inputCalendar = "M4 2V0h2v2h4V0h2v2h1c1.657 0 3 1.373 3 3.067v7.866C16 14.627 14.657 16 13 16H3c-1.657 0-3-1.373-3-3.067V5.067C0 3.373 1.343 2 3 2h1zm0 0zm2 0zm4 0zm2 0zM3 4c-.552 0-1 .462-1 1.032v7.936C2 13.538 2.448 14 3 14h10c.552 0 1-.462 1-1.032V5.032C14 4.462 13.552 4 13 4H3zm1 9v-2h2v2H4zm3 0v-2h2v2H7zm3 0v-2h2v2h-2zm-6-3V8h2v2H4zm3 0V8h2v2H7zm0-3V5h2v2H7zm3 3V8h2v2h-2zm0-3V5h2v2h-2z";

var invisible = "M3.85 9.32l-1.416 1.417C1.593 10.003.782 9.091 0 8c2.388-3.333 5.054-5 8-5a7.54 7.54 0 011.924.247L8.17 5.003A5.634 5.634 0 008 5c-1.9 0-3.707.955-5.464 3 .435.506.873.946 1.315 1.32zm3.981 1.677C7.887 11 7.944 11 8 11c1.9 0 3.707-.955 5.464-3a11.837 11.837 0 00-1.315-1.32l1.417-1.417C14.407 5.997 15.218 6.909 16 8c-2.388 3.333-5.054 5-8 5a7.54 7.54 0 01-1.924-.247l1.755-1.756zm5.826-8.654a1 1 0 010 1.414l-9.9 9.9a1 1 0 01-1.414-1.414l9.9-9.9a1 1 0 011.414 0z";

var key = "M6.166 6.283a5 5 0 113.579 3.558l-1.304.874-.795 2.905-2.576.31L4 16H0v-3.605l6.166-6.112zM11 8a3 3 0 100-6 3 3 0 000 6zm1-3a1 1 0 110-2 1 1 0 010 2zM2 13.229V14h.782l.997-1.929 2.293-.276.637-2.327 1-.67-.662-.572L2 13.23z";

var list3 = "M1 5a1 1 0 110-2 1 1 0 010 2zm0 4a1 1 0 110-2 1 1 0 010 2zm0 4a1 1 0 110-2 1 1 0 010 2zm4-8a1 1 0 110-2h9.986a1 1 0 010 2H5zm0 4a1 1 0 110-2h9.986a1 1 0 010 2H5zm0 4a1 1 0 010-2h9.986a1 1 0 010 2H5z";

var loader = "M8 0a1 1 0 110 2 6 6 0 106 6 1 1 0 012 0 8 8 0 11-8-8z";

var market = "M1.25 8.033A1.75 1.75 0 01-.046 5.768l1.334-4.005A.75.75 0 012 1.25h12a.75.75 0 01.712.513l1.334 4.005a1.75 1.75 0 01-1.296 2.265V10H15a1 1 0 011 1v4a1 1 0 01-1 1H1a1 1 0 01-1-1v-4a1 1 0 011-1h.25V8.033zm1.5-.17V10h10.5V7.863A7.4 7.4 0 0012 7.756c-.7 0-1.01.093-1.666.418-.845.42-1.367.576-2.334.576-.967 0-1.49-.156-2.334-.576C5.011 7.85 4.7 7.756 4 7.756a7.4 7.4 0 00-1.25.107zM1.5 11.5v3h13v-3h-13zm1.04-8.75L1.378 6.242a.25.25 0 00.3.32A9.043 9.043 0 014 6.257c.967 0 1.49.155 2.334.575.655.326.967.419 1.666.419.7 0 1.01-.093 1.666-.419.845-.42 1.367-.575 2.334-.575.775 0 1.55.102 2.322.307a.25.25 0 00.301-.321L13.46 2.75H2.541z";

var message = "M3 2c-.552 0-1 .462-1 1.032v6.936C2 10.538 2.448 11 3 11h5l2.786 1.683L11.39 11H13c.552 0 1-.462 1-1.032V3.032C14 2.462 13.552 2 13 2H3zm0-2h10c1.657 0 3 1.373 3 3.067v6.866C16 11.627 14.657 13 13 13l-1.048 3-4.866-3H3c-1.657 0-3-1.373-3-3.067V3.067C0 1.373 1.343 0 3 0zm2 4h6a1 1 0 010 2H5a1 1 0 110-2zm0 3h6a1 1 0 010 2H5a1 1 0 110-2z";

var minus = "M1 7h14c.554 0 1 .446 1 1s-.446 1-1 1H1c-.554 0-1-.446-1-1s.446-1 1-1z";

var moreHorizontal = "M14 10a2 2 0 110-4 2 2 0 010 4zm-6 0a2 2 0 110-4 2 2 0 010 4zm-6 0a2 2 0 110-4 2 2 0 010 4z";

var moreVertical = "M8 16a2 2 0 110-4 2 2 0 010 4zm0-6a2 2 0 110-4 2 2 0 010 4zm0-6a2 2 0 110-4 2 2 0 010 4z";

var phone = "M3.55.124c.243.092.475.227.727.405.064.046.127.093.197.146l.128.1c.366.258.665.52 1.154.988l.265.252c.388.388.553.571.746.872.616.973.46 1.622-.27 2.731a6.218 6.218 0 01-.432.544l-.05.058-.151.172a17.881 17.881 0 00.56.867c.31.437.677.858 1.083 1.245.381.363.834.714 1.374 1.067a16.235 16.235 0 00.885.555l.235-.234c.031-.031.068-.07.116-.125l.15-.171c.487-.55.866-.824 1.475-.847.439-.014.855.168 1.34.498.154.103.31.22.484.358.097.077.593.487.692.56 1.166.892 1.668 1.456 1.74 2.474.028.69-.319 1.29-.88 1.886-2.462 2.69-5.943 1.46-10.044-1.748C1.591 10.052-.41 7.003.071 3.701.303 2.164 1.21.577 2.408.116c.247-.123.52-.139.78-.09.122.02.242.053.361.098zM1.601 3.926c-.38 2.605 1.338 5.222 4.429 7.64 3.478 2.72 6.299 3.718 7.95 1.913.307-.326.477-.62.472-.754-.027-.38-.332-.722-1.128-1.33-.128-.095-.657-.531-.725-.585a6.527 6.527 0 00-.39-.29c-.232-.158-.4-.232-.414-.231-.043.002-.146.076-.367.326-.073.083-.122.14-.153.173a4.344 4.344 0 01-.18.192l-.599.599a.778.778 0 01-.615.233.98.98 0 01-.246-.043 1.948 1.948 0 01-.286-.117 7.39 7.39 0 01-.544-.301 16.939 16.939 0 01-.8-.51 10.927 10.927 0 01-1.57-1.224c-.477-.454-.909-.95-1.274-1.466a19.05 19.05 0 01-.515-.785 7.814 7.814 0 01-.3-.516 2.04 2.04 0 01-.117-.264.976.976 0 01-.051-.22c-.022-.198.008-.396.204-.638.114-.124.288-.316.46-.515l.046-.054a5.3 5.3 0 00.316-.39c.428-.65.451-.747.255-1.056-.11-.173-.224-.299-.522-.596l-.253-.243c-.438-.417-.693-.64-1.004-.861l-.15-.115a5.675 5.675 0 00-.155-.115A1.807 1.807 0 003 1.564a.502.502 0 00-.035-.011c-.616.299-1.211 1.367-1.364 2.373z";

var plus = "M7.036 7V1.036a1 1 0 112 0V7H15a1 1 0 010 2H9.036v5.964a1 1 0 01-2 0V9H1.07a1 1 0 010-2h5.965z";

var print = "M2 12H1a1 1 0 01-1-1V5a1 1 0 011-1h1V2a2 2 0 012-2h8a2 2 0 012 2v2h1a1 1 0 011 1v6a1 1 0 01-1 1h-1v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zm2-1v3h8V7H4v4zm0-7h8V2H4v2zm2 6a1 1 0 110-2h4a1 1 0 010 2H6zm0 3a1 1 0 010-2h4a1 1 0 010 2H6z";

var question = "M8.5 16a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0-16C10.981 0 13 2.05 13 4.571c0 2.127-1.436 3.918-3.375 4.427v1.86c0 .63-.504 1.142-1.125 1.142a1.134 1.134 0 01-1.125-1.143V8c0-.631.504-1.143 1.125-1.143 1.24 0 2.25-1.025 2.25-2.286 0-1.26-1.01-2.285-2.25-2.285S6.25 3.31 6.25 4.57c0 .632-.504 1.143-1.125 1.143A1.134 1.134 0 014 4.571C4 2.051 6.019 0 8.5 0z";

var rouble = "M4 11V9h-.995A1.002 1.002 0 012 8c0-.552.45-1 1.005-1H4V1a1 1 0 011-1h4.5a4.5 4.5 0 110 9H6v2h4.995c.555 0 1.005.448 1.005 1s-.45 1-1.005 1H6v2a1 1 0 01-2 0v-2h-.995A1.002 1.002 0 012 12c0-.552.45-1 1.005-1H4zm2-9v5h3.5a2.5 2.5 0 100-5H6z";

var save = "M11 2.414V4a2 2 0 01-2 2H6a2 2 0 01-2-2V2H3a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5.828a1 1 0 00-.293-.707L11 2.414zM3 0h7.172a3 3 0 012.12.879l2.83 2.828A3 3 0 0116 5.828V13a3 3 0 01-3 3H3a3 3 0 01-3-3V3a3 3 0 013-3zm3 2v2h3V2H6zM5 9v2h6V9H5zm0-2h6a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2z";

var set = "M13.962 10.33a3.494 3.494 0 010-4.516l-.128-.31A3.492 3.492 0 0110.64 2.31l-.31-.128a3.492 3.492 0 01-4.516 0l-.31.128A3.492 3.492 0 012.31 5.504l-.128.31a3.492 3.492 0 010 4.517l.128.31a3.492 3.492 0 013.194 3.193l.31.128a3.494 3.494 0 014.516 0l.31-.128a3.492 3.492 0 011.01-2.184 3.494 3.494 0 012.184-1.01l.128-.31zm-3.329 3.964l.013.257.109-.006.079-.07-.172-.191a3.479 3.479 0 00-.03-.034l.001.044zm-5.15-.01l-.172.19.079.071.108.006.013-.257.002-.044-.03.034zm-3.633-3.65l-.257.012.006.109.071.079.19-.173.034-.03-.044.002zm.01-5.151l-.19-.172-.071.078-.006.109.257.013.044.002-.033-.03zM5.512 1.85l-.013-.257-.109.006-.079.071.173.19.03.034-.002-.044zm5.15.01l.173-.19-.08-.071-.108-.006-.013.257-.002.044.03-.033zm3.633 3.651l.257-.013-.006-.109-.071-.078-.19.171-.034.031.044-.002zm-.01 5.15l.19.173.071-.08.006-.108-.257-.013-.044-.002.034.03zm.165 1.983l-.257-.013a1.493 1.493 0 00-1.128.433 1.492 1.492 0 00-.434 1.128l.014.257a1 1 0 01-.616.975l-1.553.644a1 1 0 01-1.126-.254l-.172-.19a1.493 1.493 0 00-1.105-.491c-.42 0-.824.18-1.105.491l-.172.19a1 1 0 01-1.125.254l-1.554-.644a1 1 0 01-.615-.975l.013-.257a1.491 1.491 0 00-1.562-1.562l-.257.014a1 1 0 01-.974-.616l-.645-1.553A1 1 0 01.33 9.349l.19-.172a1.492 1.492 0 000-2.21l-.19-.172A1 1 0 01.076 5.67l.645-1.554a1 1 0 01.974-.615l.257.013a1.492 1.492 0 001.561-1.561l-.012-.257A1 1 0 014.116.72L5.67.076A1 1 0 016.795.33l.172.19a1.492 1.492 0 002.21 0l.172-.19a1 1 0 011.125-.254l1.554.645a1 1 0 01.616.974l-.014.257a1.491 1.491 0 001.561 1.561l.258-.012a1 1 0 01.974.615l.645 1.554a1 1 0 01-.254 1.125l-.19.172a1.493 1.493 0 00-.491 1.105c0 .42.179.824.49 1.105l.191.172a1 1 0 01.254 1.125l-.644 1.554a1 1 0 01-.975.616zM8 10a2 2 0 100-4 2 2 0 000 4zm0 2a4 4 0 110-8 4 4 0 010 8z";

var settings = "M9 10.732V15a1 1 0 01-2 0v-4.268a2 2 0 112 0zm3.031-7.482A1.002 1.002 0 0112 3V1a1 1 0 012 0v2c0 .086-.01.17-.031.25a2 2 0 11-1.938 0zm-10 0A1.002 1.002 0 012 3V1a1 1 0 112 0v2c0 .086-.01.17-.031.25a2 2 0 11-1.938 0zM2 10a1 1 0 112 0v5a1 1 0 01-2 0v-5zm10 0a1 1 0 012 0v5a1 1 0 01-2 0v-5zM7 1a1 1 0 112 0v3a1 1 0 11-2 0V1z";

var sort = "M7 1v14a1 1 0 01-2 0V3.414L2.707 5.707a1 1 0 01-1.414-1.414l4-4A1 1 0 017 1zm2 14V1a1 1 0 112 0v11.586l2.293-2.293a1 1 0 011.414 1.414l-4 4A1 1 0 019 15z";

var sortDown = ["M9 15V1a1 1 0 112 0v11.586l2.293-2.293a1 1 0 011.414 1.414l-4 4A1 1 0 019 15z",{path:"M7 1v14a1 1 0 01-2 0V3.414L2.707 5.707a1 1 0 01-1.414-1.414l4-4A1 1 0 017 1z",color:"var(--palette-noactive-3)"}];

var sortUp = ["M7 1v14a1 1 0 11-2 0V3.414L2.707 5.707a1 1 0 01-1.414-1.414l4-4A1 1 0 017 1z",{path:"M9 15V1a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 1.414l-4 4A1 1 0 019 15z",color:"var(--palette-noactive-3)"}];

var trash = "M2 5h12V4h-3a1 1 0 01-1-1V2H6v1a1 1 0 01-1 1H2v1zm12 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V7H1a1 1 0 01-1-1V3a1 1 0 011-1h3V1a1 1 0 011-1h6a1 1 0 011 1v1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1zm-2 0H4v7h8V7zM5 9a1 1 0 112 0v3a1 1 0 01-2 0V9zm4 0a1 1 0 112 0v3a1 1 0 01-2 0V9z";

var upload = "M14 14v-4a1 1 0 012 0v6H0v-6a1 1 0 112 0v4h12zM7 3.828L4.207 6.621a1 1 0 11-1.414-1.414L8 0l5.207 5.207a1 1 0 11-1.414 1.414L9 3.828V11a1 1 0 01-2 0V3.828z";

var download = "M14 14v-4a1 1 0 012 0v6H0v-6a1 1 0 112 0v4h12zM7 8.172V1a1 1 0 112 0v7.172l2.793-2.793a1 1 0 011.414 1.414L8 12 2.793 6.793a1 1 0 011.414-1.414L7 8.172z";

var cashCheck = "M11.002 15.132l-1.587.785a1 1 0 01-.897-.005l-1.52-.774-1.519.774a1 1 0 01-.897.005l-2.026-1.005A1 1 0 012 14.016V1a1 1 0 011-1h10.033a1 1 0 011 1v14.02a1 1 0 01-1.444.897l-1.587-.785zM4 13.396l1.02.506 1.525-.777a1 1 0 01.907 0l1.526.777 1.581-.782a1 1 0 01.887 0l.587.29V2H4v11.396zM6 3h4a1 1 0 010 2H6a1 1 0 110-2zm0 3h4a1 1 0 010 2H6a1 1 0 110-2zm0 3h4a1 1 0 010 2H6a1 1 0 010-2z";

var move = "M5.65 7.063L3.292 4.707a1 1 0 011.414-1.414l2.356 2.356A1 1 0 019 6v2a.999.999 0 01-1 1H6a1 1 0 01-.35-1.937zM3 0h6a3 3 0 013 3v6a3 3 0 01-3 3H3a3 3 0 01-3-3V3a3 3 0 013-3zm0 2a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V3a1 1 0 00-1-1H3zm10 2a3 3 0 013 3v6a3 3 0 01-3 3H7a3 3 0 01-3-3h2a1 1 0 001 1h6a1 1 0 001-1V7a1 1 0 00-1-1V4z";

var tree = "M7 9h4a1 1 0 010 2H6a1 1 0 01-1-1V6H2v7h13a1 1 0 010 2H1a.997.997 0 01-1-1V1a1 1 0 112 0v3h13a1 1 0 010 2H7v3zm8 0a1 1 0 110 2 1 1 0 010-2z";

var list4 = "M14.986 3a1 1 0 100-2 1 1 0 000 2zm0 4a1 1 0 100-2 1 1 0 000 2zm0 4a1 1 0 100-2 1 1 0 000 2zm0 4a1 1 0 100-2 1 1 0 000 2zm-4-12a1 1 0 100-2H1a1 1 0 000 2h9.986zm0 4a1 1 0 100-2H1a1 1 0 000 2h9.986zm0 4a1 1 0 000-2H1a1 1 0 000 2h9.986zm0 4a1 1 0 000-2H1a1 1 0 000 2h9.986z";

var ok = "M13.462 6.304a7 7 0 11-2.621-3.157L9.62 4.74a5 5 0 102.328 3.541l1.513-1.978zm-6.755-.011L8.4 7.985 14.206.393a1 1 0 111.588 1.214l-6.5 8.5a1 1 0 01-1.501.1l-2.5-2.5a1 1 0 011.414-1.414z";

var monitor = "M9 12v2h3a1 1 0 010 2H4a1 1 0 010-2h3v-2H2a2 2 0 01-2-2V2a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H9zM2 2v8h12V2H2z";

var toggleOff = "M6 2h4a6 6 0 110 12H6A6 6 0 116 2zm4 9a3 3 0 100-6 3 3 0 000 6z";

var toggleOn = "M6 2h4a6 6 0 110 12H6A6 6 0 116 2zm0 2a4 4 0 100 8h4a4 4 0 100-8H6zm0 7a3 3 0 110-6 3 3 0 010 6z";

var mail = "M15.994 3.846a.94.94 0 01.006.187V12a2 2 0 01-2 2H2a2 2 0 01-2-2V4a2 2 0 012-2h12a2 2 0 011.994 1.846zM2.77 4l5.238 3.618L13.236 4H2.77zM14 5.854L8.009 10 2 5.849V12h12V5.854z";

var mailFull = "M15.535 2.718l-7.56 5.068-7.54-5.03C.8 2.296 1.364 2 2 2h12c.617 0 1.168.28 1.535.718zM16 4.814V12a2 2 0 01-2 2H2a2 2 0 01-2-2V4.87l7.978 5.322L16 4.814z";

var mailOk = "M16 6.033v7.149C16 14.73 14.778 16 13.25 16H2.75C1.222 16 0 14.73 0 13.182V6a.944.944 0 01.186-.593.996.996 0 01.521-.364L8.007 0l7.286 5.043a.99.99 0 01.52.363.944.944 0 01.187.627zM2 7.85v5.332c0 .46.345.818.75.818h10.5c.405 0 .75-.358.75-.818v-5.33L8.007 12 2 7.85zM2.768 6l5.238 3.618L13.234 6 8.006 2.382 2.768 6z";

var fullscreen = "M2 0h12a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V2a2 2 0 012-2zm0 2v12h12V2H2zm3 3v2a1 1 0 11-2 0V4a1 1 0 011-1h3a1 1 0 110 2H5zm6 6V9a1 1 0 012 0v3a1 1 0 01-1 1H9a1 1 0 010-2h2z";

var smallscreen = "M2 0h12a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V2a2 2 0 012-2zm0 2v12h12V2H2zm4 4V4a1 1 0 112 0v3a1 1 0 01-1 1H4a1 1 0 110-2h2zm4 4v2a1 1 0 01-2 0V9a1 1 0 011-1h3a1 1 0 010 2h-2z";

var cart = "M5.542 3h9.353C15.505 3 16 3.448 16 4c0 .045-.003.09-.01.133.024.174.005.357-.064.532l-1.773 5.01A2.073 2.073 0 0112.23 11H7.45a2.076 2.076 0 01-1.969-1.447L3.395 3.105H1.036A1.045 1.045 0 010 2.053C0 1.47.464 1 1.036 1h2.359c.895 0 1.689.584 1.968 1.447l.18.553zm.648 2l1.26 3.895h4.778L13.607 5H6.19zm.31 10a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm6 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z";

var notifyNot = "M11.584 12.998A1.524 1.524 0 0111.5 13h-10a1.5 1.5 0 010-3H3V5c0-.188.01-.373.03-.555L.293 1.707A1 1 0 111.707.293l14 14a1 1 0 01-1.414 1.414l-2.71-2.71zM4.678 1.263A5 5 0 0113 5v4.586L4.678 1.263zM10 14a2 2 0 11-4 0h4z";

var notify = "M13 10h1.5a1.5 1.5 0 010 3h-13a1.5 1.5 0 010-3H3V5a5 5 0 1110 0v5zm-3 4a2 2 0 11-4 0h4z";

var monitorNot = "M2 3.414V10h6.586L2 3.414zM10.586 12H9v2h2a1 1 0 010 2H4a1 1 0 010-2h3v-2H2a2 2 0 01-2-2V2a2 2 0 01.088-.589A1 1 0 011.708.293l14 14a1 1 0 01-1.415 1.414L10.586 12zM3.414 0H14a2 2 0 012 2v8c0 .702-.362 1.32-.91 1.677L13.415 10H14V2H5.414l-2-2z";

var start = "M8 16A8 8 0 118 0a8 8 0 010 16zm0-2A6 6 0 108 2a6 6 0 000 12zm-.972-9.297l4.156 2.434a1 1 0 010 1.726l-4.156 2.434a1 1 0 01-1.506-.862v-4.87a1 1 0 011.506-.862z";

var image = "M14 4.692V2H2v10.577l4.437-4.426 2.395 1.979 5.12-5.483.048.045zm0 2.834L9.009 12.87l-2.446-2.02L3.406 14H14V7.526zM2 0h12a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V2a2 2 0 012-2zm3 7a2 2 0 110-4 2 2 0 010 4z";

var hub = "M5 13.688l9-2.25V4.562l-9 2.25v6.876zm-2-.424V6.736l-1-.503v6.53l1 .5zM4 5l12-3v11L4 16l-4-2V2.99L4 5zm8-5l2 .938L16 2l-2.505.629L12 2 2.567 4.28 0 2.99 12 0zM8 7.234l.837-.257v4.766L8 12V7.234zM12.744 6v.943l-.008.002v3.743l-2.783.754v-.944l1.85-.5v-.944l-1.85.501V6.756L12.744 6zm-1.858 1.447v.912l.918-.249v-.912l-.918.249z";

var profile = "M10.635 7.01a3 3 0 012.256 1.326L15 11.5a2.894 2.894 0 01-2.408 4.5H3.408A2.894 2.894 0 011 11.5l2.11-3.164A3 3 0 015.364 7.01a4 4 0 115.27 0zM8 6a2 2 0 100-4 2 2 0 000 4zM5.606 9a1 1 0 00-.832.445l-2.11 3.164A.894.894 0 003.408 14h9.184a.894.894 0 00.744-1.39l-2.11-3.165A1 1 0 0010.394 9H5.606z";

var time = "M9 7h3a1 1 0 010 2H8a1 1 0 01-1-1V4a1 1 0 112 0v3zm-1 9A8 8 0 118 0a8 8 0 010 16zm0-2A6 6 0 108 2a6 6 0 000 12z";

var pin = "M7.698 16S3 7.761 3 5a5 5 0 1110 0c0 2.761-5.302 11-5.302 11zm-.552-5.342c.214.437.434.876.658 1.314.27-.467.537-.936.794-1.402.27-.492.526-.97.762-1.43C10.392 7.133 11 5.555 11 5a3 3 0 10-6 0c0 .6.543 2.191 1.47 4.226.209.46.435.939.676 1.432zM8 6.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z";

var mark = "M2 0h12a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V2a2 2 0 012-2zm0 2v12h12V2H2zm2 2h2v2H4zm0 2h2v2H4zm4-2h2v2H8zm0 4h2v2H8zM6 6h2v2H6zm4 0h2v2h-2zm0 2h2v2h-2zM6 8h2v2H6zm-2 2h2v2H4zm2 0h2v2H6zm4 0h2v2h-2z";

var copyLink = "M8.597 7.539c.78.766.78 2.005 0 2.77l-2.354 2.314c-.784.77-2.057.77-2.84 0a1.934 1.934 0 010-2.77.894.894 0 00.005-1.274.916.916 0 00-1.286-.005 3.72 3.72 0 000 5.326 3.866 3.866 0 005.401 0l2.355-2.313a3.72 3.72 0 000-5.326.916.916 0 00-1.286.005.894.894 0 00.005 1.273zm-1.194.922a1.934 1.934 0 010-2.77l2.354-2.314a2.035 2.035 0 012.84 0c.78.766.78 2.005 0 2.77a.894.894 0 00-.005 1.274.916.916 0 001.286.005 3.72 3.72 0 000-5.326 3.866 3.866 0 00-5.401 0L6.122 4.413a3.72 3.72 0 000 5.326.916.916 0 001.286-.005.894.894 0 00-.005-1.273z";

var document$1 = "M4 0a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4.87a2 2 0 00-.578-1.405L10.58.594A2 2 0 009.158 0H4zm0 2h5.158L12 4.871V14H4V2zm2 2a1 1 0 100 2h3.002a1 1 0 100-2H6zm0 3a1 1 0 100 2h4a1 1 0 100-2H6zm0 3a1 1 0 100 2h4a1 1 0 100-2H6z";

var tire = "M9.88 16l-3.68-.016c-.135 0-.903-.064-1.025-.064a.203.203 0 01-.037-.004 4.826 4.826 0 01-1.01-.32c-.132-.056-.28-.28-.096-.272.58-.06 1.188-.12 1.276-.158.1-.044-1.55-.236-1.942-.29-.026-.017-.418-.007-.586-.135-.297-.225-.232-.177-.506-.462-.107-.113-.132-.36.057-.369.188-.009 1.206-.052 1.294-.09.107-.047-1.799-.515-1.93-.54-.068-.013-.283-.127-.331-.199-.233-.34-.142-.224-.336-.606-.096-.19-.118-.452.092-.462.159-.006 1.163-.174 1.25-.212.107-.047-1.568-.645-1.7-.684a.462.462 0 01-.3-.282c-.133-.427-.138-.51-.211-.956-.03-.178.001-.396.25-.402.11-.004 1.182-.12 1.269-.157.106-.047-1.08-.556-1.31-.652-.17-.07-.35-.262-.357-.438a12.41 12.41 0 01-.007-.364c0-.34-.014-.34.017-.671.017-.177.118-.283.272-.285.154-.002 1.176-.215 1.374-.205.119.006-1.048-.686-1.202-.763a.376.376 0 01-.187-.427c.102-.435.13-.592.289-1.004.062-.163.202-.17.378-.17s.963-.145 1.37-.116c-.36-.263-.952-.51-1.077-.565-.125-.056-.132-.317-.05-.462.208-.367.234-.478.486-.791.101-.127.238-.14.497-.119.262.022 1.332-.044 1.42-.083.103-.045-.665-.493-.823-.557-.165-.068-.136-.285-.022-.385.287-.253.191-.21.5-.406.12-.077.408-.061.615-.048.52.031 1.35.059 1.413.031.077-.034-.55-.224-.715-.282-.149-.052-.078-.298.14-.375.332-.116.57-.147.917-.18.133-.008.867.02 1.039 0h3.002L9.666 0H10l-.013.003c.192.005.367.012.433.023a4.98 4.98 0 011.051.257c.135.05.215.233.176.408 0 .004-.004.005-.007.01l.143.061s.559-.07.688.01c.32.197.628.432.92.699.114.106.142.312.059.46-.003.006-.008.003-.011.009.137.138.255.266.289.314.002-.005.376-.019.475.11.25.326.48.682.684 1.058.08.15.051.355-.065.46l-.01.004c.092.187.238.492.238.492s.31.069.368.236c.15.416.275.85.368 1.291.037.176-.045.358-.181.405l-.01.001c.039.216.066.436.089.658l.011-.008c.156-.012.266.118.279.3a10.398 10.398 0 01-.065 2.103c-.022.16-.13.273-.254.273a.225.225 0 01-.044-.004c-.003-.001-.003-.006-.007-.007a9.326 9.326 0 01-.13.647c.003 0 .005-.002.007-.001.133.062.203.251.156.423a9.2 9.2 0 01-.447 1.249c-.049.106-.133.167-.222.167-.044 0-.156.011-.159.008-.093.191-.169.31-.272.489.004.004.009.001.013.006.11.116.124.323.035.464a7.347 7.347 0 01-.748.984.223.223 0 01-.167.08 3.18 3.18 0 01-.307-.025c-.137.138-.166.168-.31.29 0 .004.004.004.006.008.073.156.034.36-.087.452-.307.236-.63.439-.96.603a.21.21 0 01-.092.022c-.104 0-.605.02-.605.02s-.276.367-.415.401a3.17 3.17 0 01-.725.087l-.302-.001zM8.666.37c-.177.06-.34.124-.476.192-.54.033-1.916.25-1.843.28.077.031.54-.007 1.05-.001.089.001.247.026.052.145-.219.134-.416.296-.626.447-.245.176-.432.22-.566.25-.614.135-1.635.479-1.57.504.07.03.471-.001.933-.001.122 0 .325.031.141.266-.187.24-.385.476-.565.728a1.248 1.248 0 01-.633.483c-.6.218-1.243.542-1.187.565.06.024.366.007.741.001.148-.003.44.05.297.368-.158.351-.266.724-.393 1.096a.695.695 0 01-.357.422c-.486.261-.99.578-.939.6.052.02.405.005.754-.01.113-.005.318.055.278.354a7.26 7.26 0 00-.057.983c0 .099.015.197.007.295-.03.346-.193.395-.295.46-.38.248-.726.519-.68.538.052.022.402.018.747.009a.353.353 0 01.366.29c.072.404.19.793.297 1.178.074.267-.05.398-.128.455-.338.246-.674.523-.628.542.06.024.492.001.873.006.243.004.35.135.385.204.17.332.36.65.57.953.065.094.157.299-.07.458-.26.184-.528.379-.482.398.064.026.572.011.973.005a.577.577 0 01.441.168c.229.23.47.445.726.643.076.06.22.176.062.29-.136.097-.245.197-.195.218.062.025.334.03.65.008a.685.685 0 01.372.077c.255.137.555.261.868.372a7.916 7.916 0 01-1.12-.64c.294-.128-.456-.609-.519-.39a7.678 7.678 0 01-1.05-1.04c.41-.076-.31-.83-.452-.6a7.818 7.818 0 01-.714-1.305c.536-.134-.061-.98-.291-.788a8.996 8.996 0 01-.35-1.666c.504-.009.32-.984-.059-.849a9.904 9.904 0 01.088-1.655c.352.154.536-.913.146-.791.133-.58.32-1.126.553-1.635.296.33.8-.84.382-.734a7.92 7.92 0 01.967-1.315c.14.427.997-.496.536-.533.283-.255.582-.487.896-.695-.083.38 1.003-.269.523-.318.186-.103.377-.198.571-.286zm1.544 2.548c-1.973 0-3.572 2.276-3.572 5.084 0 2.807 1.6 5.083 3.572 5.083 1.973 0 3.571-2.277 3.571-5.083 0-2.808-1.598-5.084-3.571-5.084z";

var tShirt = "M14.983 3.158a.355.355 0 00-.167-.211l-2.67-1.417a11.585 11.585 0 00-1.73-.523.278.278 0 00-.06-.007c-.145 0-.275.115-.307.283C9.836 2.363 9.004 3.17 8 3.17s-1.836-.808-2.049-1.887C5.918 1.115 5.79 1 5.645 1a.26.26 0 00-.061.007c-.584.128-1.163.302-1.732.523L1.184 2.947a.348.348 0 00-.166.21.407.407 0 00.017.285L2.193 6.07c.055.125.165.2.282.2.03 0 .06-.005.09-.015l1.287-.439v8.82c0 .2.143.364.317.364h7.662c.174 0 .316-.163.316-.364v-8.82l1.288.439c.03.01.06.015.09.015a.314.314 0 00.282-.2l1.159-2.628a.415.415 0 00.017-.284z";

var cigarette = "M14 12v4H0v-4h14zm2 0v4h-1v-4h1zM14.779 1C15.472 2.06 16 2.96 16 5.072c0 2.11-1.172 2.937-1.221 4.928C13.965 9.289 13 8.646 13 6.379 13 4.6 14.8 3.012 14.779 1zm-1.593-1c.462.471.814.871.814 1.81 0 .938-.781 1.305-.814 2.19C12.643 3.684 12 3.398 12 2.39 12 1.6 13.2.895 13.186 0z";

var shoes = "M0 8.123l16 3.972c-.624 1.006-1.39 1.698-2.098 1.532L.93 10.59C.223 10.424-.033 9.267 0 8.123zm1.746-5.684a.719.719 0 01.828-.418.534.534 0 01.41.476l.02.265c.068.921.719 1.676 1.656 1.924 1.335.352 2.84-.406 3.353-1.69l.156-.39a.894.894 0 011.03-.518.69.69 0 01.41.29l.91 1.74-1.866.347.556.606 1.84-.364.454.51-1.863.345.549.582 1.716-.362.398.483-1.513.406.537.556 1.482-.391c.53.722.91 1.164 1.874 1.544l.521.26c.968.433.766 1.341.796 2.297L0 6.993z";

var bike = "M8.058 3.306c.263-.233 1.105-.646 1.796.213.335.418.36 1.01.155 1.48l.075.673 1.687-.691c.344-.143.733.05.863.43.13.382-.047.805-.394.947l-.153.063.47 2.554c.077-.006.154-.013.233-.013 1.77 0 3.21 1.579 3.21 3.519C16 14.42 14.56 16 12.79 16s-3.21-1.579-3.21-3.52c0-.506.1-.988.278-1.424l-.62-.41-.955 1.715a.925.925 0 01-.803.493.875.875 0 01-.488-.15c-.443-.297-.583-.93-.313-1.416l1.048-1.882-1.962-.873h-.578l-.356.915c.949.612 1.59 1.74 1.59 3.033C6.42 14.42 4.98 16 3.21 16S0 14.421 0 12.48c0-1.94 1.44-3.518 3.21-3.518.306 0 .6.05.881.138l.221-.567c-.295-.002-.534-.264-.534-.588 0-.31.22-.556.496-.58a1.12 1.12 0 01.05-.584c.059-.155.149-.283.257-.387zM3.21 9.845c-1.326 0-2.405 1.182-2.405 2.636 0 1.454 1.08 2.636 2.405 2.636 1.189 0 2.172-.951 2.364-2.195H3.88a.771.771 0 01-.67.42c-.433 0-.785-.386-.785-.861 0-.435.296-.791.678-.849l.667-1.708a2.19 2.19 0 00-.56-.08zm9.58 0l-.072.008.334 1.82a.856.856 0 01.523.808c0 .475-.352.86-.785.86-.433 0-.785-.385-.785-.86v-.003l-1.448-.96a2.83 2.83 0 00-.172.963c0 1.454 1.079 2.636 2.405 2.636 1.326 0 2.405-1.182 2.405-2.636 0-1.454-1.079-2.636-2.405-2.636zm-8.28.424l-.666 1.709.036.062h1.694a2.652 2.652 0 00-1.064-1.77zm7.418-.242a2.417 2.417 0 00-.95.74l1.237.818zm-3.13-3.774l-1.056.937 1.715.764a.999.999 0 01.54.631c.086.287.053.601-.091.859l-.25.448.619.41a3.238 3.238 0 011.492-1.153l-.444-2.415-1.566.642a.62.62 0 01-.583-.06.743.743 0 01-.318-.539l-.059-.524zM9.207.74a1.5 1.5 0 112.585 1.52A1.5 1.5 0 019.207.74z";

var pulse = "M8.991 0v9.46l1.643-2.451 5.366.04-.015 1.981-4.293-.032L7.002 16V5.42L3.946 9.022H0V7.041h3.023z";

var exit = "M9.03 0a2 2 0 012 1.997V5h-2l-.001-3H3.05l2.16 1.674a3 3 0 011.817 2.752l.025 4.572L5.72 11h3.314l-.001-2h2l.001 2.008a2 2 0 01-2 1.992H7.026v.765a2 2 0 01-2.894 1.79l-3.026-3.01A2 2 0 010 10.753l.023-8.756a2 2 0 012-1.997H9.03zM2.018 3.649L2 10.756l3.026 3.01V11h.027l-.025-4.57a1 1 0 00-.606-.918L2.02 3.65zm11.474 1.015l1.843 1.843a.697.697 0 010 .986l-1.843 1.843a.697.697 0 11-.986-.985l.351-.352L9.888 8C9.399 8 9 7.552 9 7s.398-1 .889-1h2.968l-.35-.35a.697.697 0 01.986-.986z";

var zoomIn = "M6 0a6 6 0 014.891 9.476l4.816 4.817a1 1 0 01-1.414 1.414l-4.817-4.816A6 6 0 116 0zm0 2a4 4 0 100 8 4 4 0 000-8zm0 1a1 1 0 011 1v1h1a1 1 0 110 2H7v1a1 1 0 11-2 0V7H4a1 1 0 110-2h1V4a1 1 0 011-1z";

var zoomOut = "M6 0a6 6 0 014.891 9.476l4.816 4.817a1 1 0 01-1.414 1.414l-4.817-4.816A6 6 0 116 0zm0 2a4 4 0 100 8 4 4 0 000-8zm2 3a1 1 0 110 2H4a1 1 0 110-2h4z";

var search = "M6 0a6 6 0 014.891 9.476l4.816 4.817a1 1 0 01-1.414 1.414l-4.817-4.816A6 6 0 116 0zm0 2a4 4 0 100 8 4 4 0 000-8z";

var flash = "M11.784.089l.07.057 4 4a.501.501 0 01.057.638l-.057.07L12.707 8l.147.146a.501.501 0 01.057.638l-.057.07-5.965 5.964a4.062 4.062 0 01-2.626 1.175L4.036 16a4.009 4.009 0 01-2.854-1.182A4.006 4.006 0 010 11.964a4.06 4.06 0 011.026-2.687l.156-.166 5.964-5.965a.501.501 0 01.638-.057l.07.057.146.147L11.146.146a.501.501 0 01.638-.057zM3.293 11.293a1 1 0 101.416 1.414 1 1 0 00-1.416-1.414zM11.5 1.207L8.707 4l1.011 1.011 1.463-1.463 1.362 1.362-1.464 1.462.921.921.007-.007L14.793 4.5 11.5 1.207z";

var questionInvert = "M8 0a8 8 0 110 16A8 8 0 018 0zm0 12a1 1 0 100 2 1 1 0 000-2zM8 2C5.794 2 4 3.73 4 5.857c0 .533.448.964 1 .964s1-.431 1-.964c0-1.063.897-1.928 2-1.928s2 .865 2 1.928c0 1.064-.897 1.929-2 1.929-.552 0-1 .431-1 .964v1.286l.007.112c.057.48.48.852.993.852.552 0 1-.432 1-.964v-.444l.19-.052C10.816 9.05 12 7.585 12 5.857 12 3.73 10.206 2 8 2z";

var info = "M8 0a8 8 0 110 16A8 8 0 018 0zm0 2a6 6 0 100 12A6 6 0 008 2zm0 5a1 1 0 011 1v3a1 1 0 01-2 0V8a1 1 0 011-1zm0-3a1 1 0 110 2 1 1 0 010-2z";

const icons = {
  "arrow-down": arrowDown,
  "arrow-left": arrowLeft,
  "arrow-right": arrowRight,
  "arrow-up": arrowUp,
  "arrows-updown": arrowsUpdown,
  attention,
  burger,
  calendar,
  cashbox,
  cashbox2,
  catalog,
  check,
  "chevron-down": chevronDown,
  "chevron-left": chevronLeft,
  "chevron-right": chevronRight,
  "chevron-up": chevronUp,
  clear,
  close,
  column,
  copy,
  cycle,
  visible,
  edit,
  favorite,
  "favorite-fill": favoriteFill,
  file,
  filter,
  history,
  "input-calendar": inputCalendar,
  invisible,
  key,
  list3,
  loader,
  market,
  message,
  minus,
  "more-horizontal": moreHorizontal,
  "more-vertical": moreVertical,
  phone,
  plus,
  print,
  question,
  rouble,
  save,
  set,
  settings,
  sort,
  "sort-down": sortDown,
  "sort-up": sortUp,
  trash,
  upload,
  download,
  "cash-check": cashCheck,
  move,
  tree,
  list4,
  ok,
  monitor,
  "toggle-off": toggleOff,
  "toggle-on": toggleOn,
  mail,
  "mail-full": mailFull,
  "mail-ok": mailOk,
  fullscreen,
  smallscreen,
  cart,
  "notify-not": notifyNot,
  notify,
  "monitor-not": monitorNot,
  start,
  image,
  hub,
  profile,
  time,
  pin,
  mark,
  "copy-link": copyLink,
  document: document$1,
  tire,
  cigarette,
  "t-shirt": tShirt,
  shoes,
  bike,
  pulse,
  exit,
  "zoom-in": zoomIn,
  "zoom-out": zoomOut,
  search,
  flash,
  "question-invert": questionInvert,
  info,
};

function getSVGIconObjet(input) {
  const iconObject = { viewbox: 16, pathes:[] };

  let raw = (icons[input]) ? icons[input] : input;

  if(typeof raw === 'string' && raw.startsWith("M")) return (iconObject.pathes.push({path:raw}),iconObject);

  if (Array.isArray(raw)) iconObject.pathes = raw;
  if( typeof raw === 'object'){
    if(raw.viewbox) iconObject.viewbox = raw.viewbox;
    if(raw.pathes) iconObject.pathes = Array.isArray(raw.pathes) ? raw.pathes : [raw.pathes];
  }

  iconObject.pathes = iconObject.pathes.map(p => {
    if(typeof p === 'string' && p.startsWith("M")) return {path:p};
    if(typeof p === 'object' && p.path) return p;
    return {};
  }).filter(p=>!!p.path);

  return iconObject;
}

/* node_modules\svelte-atoms\Icon.svelte generated by Svelte v3.12.1 */

const css$3 = {
	code: ".aa-icon.svelte-1gjxfeb{fill:var(--palette-main-1)}.aa-icon.primary.svelte-1gjxfeb{fill:var(--palette-primary-1)}.aa-icon.positive.svelte-1gjxfeb{fill:var(--palette-positive-1)}.aa-icon.negative.svelte-1gjxfeb{fill:var(--palette-negative-1)}.aa-icon.white.svelte-1gjxfeb{fill:var(--palette-white)}.aa-icon.disabled.svelte-1gjxfeb{fill:var(--palette-main-1)}.aa-icon.noactive.svelte-1gjxfeb{fill:var(--palette-noactive-3)}",
	map: "{\"version\":3,\"file\":\"Icon.svelte\",\"sources\":[\"Icon.svelte\"],\"sourcesContent\":[\"<script>\\n  import { getSVGIconObjet } from \\\"./utils\\\";\\n\\n  export let icon = \\\"\\\";\\n  export let size = 16;\\n  export let status = \\\"\\\";\\n\\n  $: iconObject = getSVGIconObjet(icon);\\n</script>\\n\\n<svg\\n  width={size}\\n  height={size}\\n  viewBox=\\\"0 0 {iconObject.viewbox}\\n  {iconObject.viewbox}\\\"\\n  class={`aa-icon ${status} ${$$props.class || ''}`}\\n  style={$$props.style || null}>\\n  <g>\\n    {#each iconObject.pathes as { path, color }}\\n      <path style={color ? `fill: ${color}` : null} d={path} />\\n    {/each}\\n  </g>\\n</svg>\\n\\n<style>\\n  .aa-icon {\\n    fill: var(--palette-main-1);\\n  }\\n  .aa-icon.primary {\\n    fill: var(--palette-primary-1);\\n  }\\n  .aa-icon.positive {\\n    fill: var(--palette-positive-1);\\n  }\\n  .aa-icon.negative {\\n    fill: var(--palette-negative-1);\\n  }\\n  .aa-icon.white {\\n    fill: var(--palette-white);\\n  }\\n  .aa-icon.disabled {\\n    fill: var(--palette-main-1);\\n  }\\n  .aa-icon.noactive {\\n    fill: var(--palette-noactive-3);\\n  }\\n</style>\\n\"],\"names\":[],\"mappings\":\"AAyBE,QAAQ,eAAC,CAAC,AACR,IAAI,CAAE,IAAI,gBAAgB,CAAC,AAC7B,CAAC,AACD,QAAQ,QAAQ,eAAC,CAAC,AAChB,IAAI,CAAE,IAAI,mBAAmB,CAAC,AAChC,CAAC,AACD,QAAQ,SAAS,eAAC,CAAC,AACjB,IAAI,CAAE,IAAI,oBAAoB,CAAC,AACjC,CAAC,AACD,QAAQ,SAAS,eAAC,CAAC,AACjB,IAAI,CAAE,IAAI,oBAAoB,CAAC,AACjC,CAAC,AACD,QAAQ,MAAM,eAAC,CAAC,AACd,IAAI,CAAE,IAAI,eAAe,CAAC,AAC5B,CAAC,AACD,QAAQ,SAAS,eAAC,CAAC,AACjB,IAAI,CAAE,IAAI,gBAAgB,CAAC,AAC7B,CAAC,AACD,QAAQ,SAAS,eAAC,CAAC,AACjB,IAAI,CAAE,IAAI,oBAAoB,CAAC,AACjC,CAAC\"}"
};

const Icon = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let { icon = "", size = 16, status = "" } = $$props;

	if ($$props.icon === void 0 && $$bindings.icon && icon !== void 0) $$bindings.icon(icon);
	if ($$props.size === void 0 && $$bindings.size && size !== void 0) $$bindings.size(size);
	if ($$props.status === void 0 && $$bindings.status && status !== void 0) $$bindings.status(status);

	$$result.css.add(css$3);

	let iconObject = getSVGIconObjet(icon);

	return `<svg${add_attribute("width", size, 0)}${add_attribute("height", size, 0)} viewBox="0 0 ${escape(iconObject.viewbox)}
	  ${escape(iconObject.viewbox)}" class="${escape(null_to_empty(`aa-icon ${status} ${$$props.class || ''}`))} svelte-1gjxfeb"${add_attribute("style", $$props.style || null, 0)}>
	  <g>
	    ${each(iconObject.pathes, ({ path, color }) => `<path${add_attribute("style", color ? `fill: ${color}` : null, 0)}${add_attribute("d", path, 0)}></path>`)}
	  </g>
	</svg>`;
});

/* node_modules\svelte-atoms\IconButton.svelte generated by Svelte v3.12.1 */

const css$4 = {
	code: ".aa-iconButton.svelte-1lwnqk1{background:none;border:none;outline:none;cursor:pointer;border-radius:50%;margin:0;padding:0}.large.svelte-1lwnqk1{width:40px;height:40px}.medium.svelte-1lwnqk1{width:30px;height:30px}.small.svelte-1lwnqk1{width:20px;height:20px}.aa-iconButton.filled.primary.svelte-1lwnqk1{box-shadow:3px 4px 17px 0 rgba(53, 142, 215, 0.3);background:var(--palette-primary-1)}.aa-iconButton.filled.positive.svelte-1lwnqk1{box-shadow:3px 4px 17px 0 rgba(126, 211, 33, 0.55);background:var(--palette-positive-1)}.aa-iconButton.filled.negative.svelte-1lwnqk1{box-shadow:3px 4px 17px 0 rgba(240, 21, 38, 0.3);background:var(--palette-negative-1)}.aa-iconButton.filled.noactive.svelte-1lwnqk1{background:var(--palette-noactive-2)}",
	map: "{\"version\":3,\"file\":\"IconButton.svelte\",\"sources\":[\"IconButton.svelte\"],\"sourcesContent\":[\"<script>\\n  import { getEventsAction } from \\\"./utils\\\";\\n  import { current_component } from \\\"svelte/internal\\\";\\n  import Icon from \\\"./Icon.svelte\\\";\\n\\n  export let icon = \\\"\\\";\\n  export let status = \\\"primary\\\";\\n  export let type = \\\"flat\\\";\\n  export let size = \\\"large\\\";\\n  export let disabled = false;\\n\\n  const sizes = {\\n    large: 16,\\n    medium: 14,\\n    small: 10\\n  };\\n  const events = getEventsAction(current_component);\\n</script>\\n\\n<button\\n  type=\\\"button\\\"\\n  style={$$props.style || ''}\\n  class={`aa-iconButton ${disabled ? 'noactive' : status} ${type} ${size} ${$$props.class || ''}`}\\n  {disabled}\\n  use:events>\\n  <Icon\\n    {icon}\\n    status={type === 'filled' ? 'white' : status}\\n    size={sizes[size]} />\\n</button>\\n\\n<style>\\n  .aa-iconButton {\\n    background: none;\\n    border: none;\\n    outline: none;\\n    cursor: pointer;\\n    border-radius: 50%;\\n    margin: 0;\\n    padding: 0;\\n  }\\n  .large {\\n    width: 40px;\\n    height: 40px;\\n  }\\n  .medium {\\n    width: 30px;\\n    height: 30px;\\n  }\\n  .small {\\n    width: 20px;\\n    height: 20px;\\n  }\\n  .aa-iconButton.filled.primary {\\n    box-shadow: 3px 4px 17px 0 rgba(53, 142, 215, 0.3);\\n    background: var(--palette-primary-1);\\n  }\\n  .aa-iconButton.filled.positive {\\n    box-shadow: 3px 4px 17px 0 rgba(126, 211, 33, 0.55);\\n    background: var(--palette-positive-1);\\n  }\\n  .aa-iconButton.filled.negative {\\n    box-shadow: 3px 4px 17px 0 rgba(240, 21, 38, 0.3);\\n    background: var(--palette-negative-1);\\n  }\\n  .aa-iconButton.filled.noactive {\\n    background: var(--palette-noactive-2);\\n  }\\n</style>\\n\"],\"names\":[],\"mappings\":\"AAgCE,cAAc,eAAC,CAAC,AACd,UAAU,CAAE,IAAI,CAChB,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,CACb,MAAM,CAAE,OAAO,CACf,aAAa,CAAE,GAAG,CAClB,MAAM,CAAE,CAAC,CACT,OAAO,CAAE,CAAC,AACZ,CAAC,AACD,MAAM,eAAC,CAAC,AACN,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,AACd,CAAC,AACD,OAAO,eAAC,CAAC,AACP,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,AACd,CAAC,AACD,MAAM,eAAC,CAAC,AACN,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,AACd,CAAC,AACD,cAAc,OAAO,QAAQ,eAAC,CAAC,AAC7B,UAAU,CAAE,GAAG,CAAC,GAAG,CAAC,IAAI,CAAC,CAAC,CAAC,KAAK,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAClD,UAAU,CAAE,IAAI,mBAAmB,CAAC,AACtC,CAAC,AACD,cAAc,OAAO,SAAS,eAAC,CAAC,AAC9B,UAAU,CAAE,GAAG,CAAC,GAAG,CAAC,IAAI,CAAC,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,EAAE,CAAC,CAAC,IAAI,CAAC,CACnD,UAAU,CAAE,IAAI,oBAAoB,CAAC,AACvC,CAAC,AACD,cAAc,OAAO,SAAS,eAAC,CAAC,AAC9B,UAAU,CAAE,GAAG,CAAC,GAAG,CAAC,IAAI,CAAC,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,EAAE,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CACjD,UAAU,CAAE,IAAI,oBAAoB,CAAC,AACvC,CAAC,AACD,cAAc,OAAO,SAAS,eAAC,CAAC,AAC9B,UAAU,CAAE,IAAI,oBAAoB,CAAC,AACvC,CAAC\"}"
};

const IconButton = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	

  let { icon = "", status = "primary", type = "flat", size = "large", disabled = false } = $$props;

  const sizes = {
    large: 16,
    medium: 14,
    small: 10
  };

	if ($$props.icon === void 0 && $$bindings.icon && icon !== void 0) $$bindings.icon(icon);
	if ($$props.status === void 0 && $$bindings.status && status !== void 0) $$bindings.status(status);
	if ($$props.type === void 0 && $$bindings.type && type !== void 0) $$bindings.type(type);
	if ($$props.size === void 0 && $$bindings.size && size !== void 0) $$bindings.size(size);
	if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0) $$bindings.disabled(disabled);

	$$result.css.add(css$4);

	return `<button type="button"${add_attribute("style", $$props.style || '', 0)} class="${escape(null_to_empty(`aa-iconButton ${disabled ? 'noactive' : status} ${type} ${size} ${$$props.class || ''}`))} svelte-1lwnqk1"${disabled ? " disabled" : "" }>
	  ${validate_component(Icon, 'Icon').$$render($$result, {
		icon: icon,
		status: type === 'filled' ? 'white' : status,
		size: sizes[size]
	}, {}, {})}
	</button>`;
});

/* node_modules\svelte-atoms\IconStatus.svelte generated by Svelte v3.12.1 */

const css$5 = {
	code: "circle.svelte-zi7gjk{fill:none}.icon.flat.svelte-zi7gjk{fill:var(--palette-main-1)}.icon.filled.svelte-zi7gjk{fill:var(--palette-white)}.primary.svelte-zi7gjk{stroke:var(--palette-primary-1)}.positive.svelte-zi7gjk{stroke:var(--palette-positive-1)}.negative.svelte-zi7gjk{stroke:var(--palette-negative-1)}.disabled.svelte-zi7gjk{stroke:var(--palette-main-1)}.noactive.svelte-zi7gjk{stroke:var(--palette-noactive-3)}.warning.svelte-zi7gjk{stroke:var(--palette-warning-1)}.primary.filled.svelte-zi7gjk{fill:var(--palette-primary-1)}.positive.filled.svelte-zi7gjk{fill:var(--palette-positive-1)}.negative.filled.svelte-zi7gjk{fill:var(--palette-negative-1)}.disabled.filled.svelte-zi7gjk{fill:var(--palette-main-1)}.noactive.filled.svelte-zi7gjk{fill:var(--palette-noactive-3)}.warning.filled.svelte-zi7gjk{fill:var(--palette-warning-1)}",
	map: "{\"version\":3,\"file\":\"IconStatus.svelte\",\"sources\":[\"IconStatus.svelte\"],\"sourcesContent\":[\"<script>\\n  import { getSVGIconObjet } from \\\"./utils\\\";\\n\\n  export let icon = \\\"\\\";\\n  export let size = 24;\\n  export let status = \\\"primary\\\";\\n  export let type = \\\"flat\\\";\\n\\n  $: iconObject = getSVGIconObjet(icon);\\n\\n  $: viewBoxAdjusted = iconObject.viewbox + 6;\\n  $: translate = (viewBoxAdjusted - iconObject.viewbox * 0.8) / 2;\\n</script>\\n\\n<svg\\n  width={size}\\n  height={size}\\n  viewBox=\\\"0 0 {viewBoxAdjusted}\\n  {viewBoxAdjusted}\\\"\\n  class={`aa-iconStatus ${$$props.class || ''}`}\\n  style={$$props.style || ''}>\\n  <circle\\n    cx={viewBoxAdjusted / 2}\\n    cy={viewBoxAdjusted / 2}\\n    r={(viewBoxAdjusted - 2) / 2}\\n    class={`${status} ${type}`}\\n    stroke-width=\\\"2\\\" />\\n  <g\\n    transform=\\\"translate({translate},{translate}) scale(0.8)\\\"\\n    class={`icon ${type}`}>\\n    {#each iconObject.pathes as { path, color }}\\n      <path style={color ? `fill: ${color}` : null} d={path} />\\n    {/each}\\n  </g>\\n</svg>\\n\\n<style>\\n  circle {\\n    fill: none;\\n  }\\n  .icon.flat {\\n    fill: var(--palette-main-1);\\n  }\\n  .icon.filled {\\n    fill: var(--palette-white);\\n  }\\n  .primary {\\n    stroke: var(--palette-primary-1);\\n  }\\n  .positive {\\n    stroke: var(--palette-positive-1);\\n  }\\n  .negative {\\n    stroke: var(--palette-negative-1);\\n  }\\n  .disabled {\\n    stroke: var(--palette-main-1);\\n  }\\n  .noactive {\\n    stroke: var(--palette-noactive-3);\\n  }\\n  .warning {\\n    stroke: var(--palette-warning-1);\\n  }\\n  .primary.filled {\\n    fill: var(--palette-primary-1);\\n  }\\n  .positive.filled {\\n    fill: var(--palette-positive-1);\\n  }\\n  .negative.filled {\\n    fill: var(--palette-negative-1);\\n  }\\n\\n  .disabled.filled {\\n    fill: var(--palette-main-1);\\n  }\\n  .noactive.filled {\\n    fill: var(--palette-noactive-3);\\n  }\\n  .warning.filled {\\n    fill: var(--palette-warning-1);\\n  }\\n</style>\\n\"],\"names\":[],\"mappings\":\"AAqCE,MAAM,cAAC,CAAC,AACN,IAAI,CAAE,IAAI,AACZ,CAAC,AACD,KAAK,KAAK,cAAC,CAAC,AACV,IAAI,CAAE,IAAI,gBAAgB,CAAC,AAC7B,CAAC,AACD,KAAK,OAAO,cAAC,CAAC,AACZ,IAAI,CAAE,IAAI,eAAe,CAAC,AAC5B,CAAC,AACD,QAAQ,cAAC,CAAC,AACR,MAAM,CAAE,IAAI,mBAAmB,CAAC,AAClC,CAAC,AACD,SAAS,cAAC,CAAC,AACT,MAAM,CAAE,IAAI,oBAAoB,CAAC,AACnC,CAAC,AACD,SAAS,cAAC,CAAC,AACT,MAAM,CAAE,IAAI,oBAAoB,CAAC,AACnC,CAAC,AACD,SAAS,cAAC,CAAC,AACT,MAAM,CAAE,IAAI,gBAAgB,CAAC,AAC/B,CAAC,AACD,SAAS,cAAC,CAAC,AACT,MAAM,CAAE,IAAI,oBAAoB,CAAC,AACnC,CAAC,AACD,QAAQ,cAAC,CAAC,AACR,MAAM,CAAE,IAAI,mBAAmB,CAAC,AAClC,CAAC,AACD,QAAQ,OAAO,cAAC,CAAC,AACf,IAAI,CAAE,IAAI,mBAAmB,CAAC,AAChC,CAAC,AACD,SAAS,OAAO,cAAC,CAAC,AAChB,IAAI,CAAE,IAAI,oBAAoB,CAAC,AACjC,CAAC,AACD,SAAS,OAAO,cAAC,CAAC,AAChB,IAAI,CAAE,IAAI,oBAAoB,CAAC,AACjC,CAAC,AAED,SAAS,OAAO,cAAC,CAAC,AAChB,IAAI,CAAE,IAAI,gBAAgB,CAAC,AAC7B,CAAC,AACD,SAAS,OAAO,cAAC,CAAC,AAChB,IAAI,CAAE,IAAI,oBAAoB,CAAC,AACjC,CAAC,AACD,QAAQ,OAAO,cAAC,CAAC,AACf,IAAI,CAAE,IAAI,mBAAmB,CAAC,AAChC,CAAC\"}"
};

const IconStatus = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let { icon = "", size = 24, status = "primary", type = "flat" } = $$props;

	if ($$props.icon === void 0 && $$bindings.icon && icon !== void 0) $$bindings.icon(icon);
	if ($$props.size === void 0 && $$bindings.size && size !== void 0) $$bindings.size(size);
	if ($$props.status === void 0 && $$bindings.status && status !== void 0) $$bindings.status(status);
	if ($$props.type === void 0 && $$bindings.type && type !== void 0) $$bindings.type(type);

	$$result.css.add(css$5);

	let iconObject = getSVGIconObjet(icon);
	let viewBoxAdjusted = iconObject.viewbox + 6;
	let translate = (viewBoxAdjusted - iconObject.viewbox * 0.8) / 2;

	return `<svg${add_attribute("width", size, 0)}${add_attribute("height", size, 0)} viewBox="0 0 ${escape(viewBoxAdjusted)}
	  ${escape(viewBoxAdjusted)}" class="${escape(null_to_empty(`aa-iconStatus ${$$props.class || ''}`))} svelte-zi7gjk"${add_attribute("style", $$props.style || '', 0)}>
	  <circle${add_attribute("cx", viewBoxAdjusted / 2, 0)}${add_attribute("cy", viewBoxAdjusted / 2, 0)}${add_attribute("r", (viewBoxAdjusted - 2) / 2, 0)} class="${escape(null_to_empty(`${status} ${type}`))} svelte-zi7gjk" stroke-width="2"></circle>
	  <g transform="translate(${escape(translate)},${escape(translate)}) scale(0.8)" class="${escape(null_to_empty(`icon ${type}`))} svelte-zi7gjk">
	    ${each(iconObject.pathes, ({ path, color }) => `<path${add_attribute("style", color ? `fill: ${color}` : null, 0)}${add_attribute("d", path, 0)}></path>`)}
	  </g>
	</svg>`;
});

/* node_modules\svelte-atoms\Notifications.svelte generated by Svelte v3.12.1 */

const css$6 = {
	code: ".container.svelte-r0qz2h{position:fixed;top:0;right:16px;width:448px;border-bottom-left-radius:8px;border-bottom-right-radius:8px;box-shadow:3px 3px 18px 0 rgba(54, 71, 79, 0.2);overflow:hidden;background-color:white}.aa-notification.svelte-r0qz2h{display:flex;justify-content:space-between;align-items:flex-start;padding:8px 16px 8px 16px;font-family:var(--preferred-font);font-size:16px;line-height:1.5}.aa-notification.svelte-r0qz2h .closeButton{width:auto;height:auto;margin-top:4px}.text.svelte-r0qz2h{flex-grow:1;padding-right:8px;color:green}.light.svelte-r0qz2h{box-shadow:3px 3px 18px 0 rgba(54, 71, 79, 0.2)}.statusIcon.svelte-r0qz2h{margin:3px 8px 0 0}.aa-notification.light.svelte-r0qz2h{background-color:var(--palette-white);color:var(--palette-main-1)}.aa-notification.dark.svelte-r0qz2h{background-color:var(--palette-main-1);color:var(--palette-white)}.aa-notification.negative.svelte-r0qz2h{background-color:var(--palette-negative-5);color:var(--palette-main-1)}.aa-notification.warning.svelte-r0qz2h{background-color:var(--palette-warning-2);color:var(--palette-main-1)}.aa-notification.primary.svelte-r0qz2h{background-color:var(--palette-primary-7);color:var(--palette-main-1)}.aa-notification.positive.svelte-r0qz2h{background-color:var(--palette-positive-5);color:var(--palette-main-1)}@media(max-width: 680px){.container.svelte-r0qz2h{width:100%;right:0px}}",
	map: "{\"version\":3,\"file\":\"Notifications.svelte\",\"sources\":[\"Notifications.svelte\"],\"sourcesContent\":[\"<script context=\\\"module\\\">\\n  let addNotificationCallback = null;\\n  export function sendNotification(text, options) {\\n    if (!addNotificationCallback)\\n      console.warn(\\\"<Notification /> component wasn`t used in the app\\\");\\n    options = options || {};\\n    options.text = text;\\n    addNotificationCallback(options);\\n  }\\n</script>\\n\\n<script>\\n  import { onMount } from \\\"svelte\\\";\\n  import { slide } from \\\"svelte/transition\\\";\\n  import IconButton from \\\"./IconButton.svelte\\\";\\n  import IconStatus from \\\"./IconStatus.svelte\\\";\\n  import { createEventDispatcher } from \\\"svelte\\\";\\n\\n  export let notifications = [];\\n  export let delay = 4000;\\n  export let type = \\\"dark\\\";\\n\\n  const dispatch = createEventDispatcher();\\n\\n  let containerRef;\\n  onMount(() => {\\n    document.body.appendChild(containerRef);\\n    addNotificationCallback = notificationObject =>\\n      (notifications = [...notifications, notificationObject]);\\n\\n    return () => {\\n      document.body.removeChild(containerRef);\\n      addNotificationCallback = null;\\n    };\\n  });\\n\\n  const close = notificationObject => {\\n    notifications = notifications.filter(item => item !== notificationObject);\\n  };\\n  const autoClose = (node, notificationObject) => {\\n    const timer = setTimeout(\\n      () => close(notificationObject),\\n      notificationObject.delay || delay\\n    );\\n    return {\\n      destroy() {\\n        clearTimeout(timer);\\n      }\\n    };\\n  };\\n</script>\\n\\n<div>\\n  <div\\n    bind:this={containerRef}\\n    class=\\\"container\\\"\\n    class:light={type === 'light'}>\\n    {#each notifications as notification, i (notification)}\\n      <div\\n        class={`aa-notification ${notification.status || type} ${$$props.class || ''}`}\\n        transition:slide|local\\n        use:autoClose={notification}\\n        on:outroend={() => dispatch('close', notification)}>\\n        {#if notification.status && !notification.noIcon}\\n          <div class=\\\"statusIcon\\\"><IconStatus icon={notification.icon || \\\"attention\\\"} status={notification.status} size={16}/></div>\\n        {/if}\\n        <div class=\\\"text\\\">{notification.text}</div>\\n        <IconButton\\n          icon=\\\"close\\\"\\n          status=\\\"noactive\\\"\\n          class=\\\"closeButton\\\"\\n          on:click={() => close(notification)} />\\n      </div>\\n    {/each}\\n  </div>\\n</div>\\n\\n<style>\\n  .container {\\n    position: fixed;\\n    top: 0;\\n    right: 16px;\\n    width: 448px;\\n    border-bottom-left-radius: 8px;\\n    border-bottom-right-radius: 8px;\\n    box-shadow: 3px 3px 18px 0 rgba(54, 71, 79, 0.2);\\n    overflow: hidden;\\n    background-color: white;\\n  }\\n  .aa-notification {\\n    display: flex;\\n    justify-content: space-between;\\n    align-items: flex-start;\\n    padding: 8px 16px 8px 16px;\\n    font-family: var(--preferred-font);\\n    font-size: 16px;\\n    line-height: 1.5;\\n    /* margin-top: -8px; */\\n  }\\n  .aa-notification :global(.closeButton){\\n    width: auto;\\n    height: auto;\\n    margin-top: 4px;\\n  }\\n  .text {\\n    flex-grow: 1;\\n    padding-right: 8px;\\n    color:green;\\n  }\\n  .light {\\n    box-shadow: 3px 3px 18px 0 rgba(54, 71, 79, 0.2);\\n  }\\n  .statusIcon{\\n    margin: 3px 8px 0 0;\\n\\n  }\\n  .aa-notification.light {\\n    background-color: var(--palette-white);\\n    color: var(--palette-main-1);\\n  }\\n  .aa-notification.dark {\\n    background-color: var(--palette-main-1);\\n    color: var(--palette-white);\\n  }\\n  .aa-notification.negative {\\n    background-color: var(--palette-negative-5);\\n    color: var(--palette-main-1);\\n  }\\n  .aa-notification.warning {\\n    background-color: var(--palette-warning-2);\\n    color: var(--palette-main-1);\\n  }\\n  .aa-notification.primary {\\n    background-color: var(--palette-primary-7);\\n    color: var(--palette-main-1);\\n  }\\n  .aa-notification.positive {\\n    background-color: var(--palette-positive-5);\\n    color: var(--palette-main-1);\\n  }\\n  @media (max-width: 680px) {\\n    .container {\\n      width: 100%;\\n      right: 0px;\\n    }\\n  }\\n</style>\\n\"],\"names\":[],\"mappings\":\"AA8EE,UAAU,cAAC,CAAC,AACV,QAAQ,CAAE,KAAK,CACf,GAAG,CAAE,CAAC,CACN,KAAK,CAAE,IAAI,CACX,KAAK,CAAE,KAAK,CACZ,yBAAyB,CAAE,GAAG,CAC9B,0BAA0B,CAAE,GAAG,CAC/B,UAAU,CAAE,GAAG,CAAC,GAAG,CAAC,IAAI,CAAC,CAAC,CAAC,KAAK,EAAE,CAAC,CAAC,EAAE,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CAChD,QAAQ,CAAE,MAAM,CAChB,gBAAgB,CAAE,KAAK,AACzB,CAAC,AACD,gBAAgB,cAAC,CAAC,AAChB,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,aAAa,CAC9B,WAAW,CAAE,UAAU,CACvB,OAAO,CAAE,GAAG,CAAC,IAAI,CAAC,GAAG,CAAC,IAAI,CAC1B,WAAW,CAAE,IAAI,gBAAgB,CAAC,CAClC,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,GAAG,AAElB,CAAC,AACD,8BAAgB,CAAC,AAAQ,YAAY,AAAC,CAAC,AACrC,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,GAAG,AACjB,CAAC,AACD,KAAK,cAAC,CAAC,AACL,SAAS,CAAE,CAAC,CACZ,aAAa,CAAE,GAAG,CAClB,MAAM,KAAK,AACb,CAAC,AACD,MAAM,cAAC,CAAC,AACN,UAAU,CAAE,GAAG,CAAC,GAAG,CAAC,IAAI,CAAC,CAAC,CAAC,KAAK,EAAE,CAAC,CAAC,EAAE,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,AAClD,CAAC,AACD,yBAAW,CAAC,AACV,MAAM,CAAE,GAAG,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,AAErB,CAAC,AACD,gBAAgB,MAAM,cAAC,CAAC,AACtB,gBAAgB,CAAE,IAAI,eAAe,CAAC,CACtC,KAAK,CAAE,IAAI,gBAAgB,CAAC,AAC9B,CAAC,AACD,gBAAgB,KAAK,cAAC,CAAC,AACrB,gBAAgB,CAAE,IAAI,gBAAgB,CAAC,CACvC,KAAK,CAAE,IAAI,eAAe,CAAC,AAC7B,CAAC,AACD,gBAAgB,SAAS,cAAC,CAAC,AACzB,gBAAgB,CAAE,IAAI,oBAAoB,CAAC,CAC3C,KAAK,CAAE,IAAI,gBAAgB,CAAC,AAC9B,CAAC,AACD,gBAAgB,QAAQ,cAAC,CAAC,AACxB,gBAAgB,CAAE,IAAI,mBAAmB,CAAC,CAC1C,KAAK,CAAE,IAAI,gBAAgB,CAAC,AAC9B,CAAC,AACD,gBAAgB,QAAQ,cAAC,CAAC,AACxB,gBAAgB,CAAE,IAAI,mBAAmB,CAAC,CAC1C,KAAK,CAAE,IAAI,gBAAgB,CAAC,AAC9B,CAAC,AACD,gBAAgB,SAAS,cAAC,CAAC,AACzB,gBAAgB,CAAE,IAAI,oBAAoB,CAAC,CAC3C,KAAK,CAAE,IAAI,gBAAgB,CAAC,AAC9B,CAAC,AACD,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,UAAU,cAAC,CAAC,AACV,KAAK,CAAE,IAAI,CACX,KAAK,CAAE,GAAG,AACZ,CAAC,AACH,CAAC\"}"
};

const Notifications = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	

  let { notifications = [], delay = 4000, type = "dark" } = $$props;

  let containerRef;
  onMount(() => {
    document.body.appendChild(containerRef);

    return () => {
      document.body.removeChild(containerRef);
    };
  });

	if ($$props.notifications === void 0 && $$bindings.notifications && notifications !== void 0) $$bindings.notifications(notifications);
	if ($$props.delay === void 0 && $$bindings.delay && delay !== void 0) $$bindings.delay(delay);
	if ($$props.type === void 0 && $$bindings.type && type !== void 0) $$bindings.type(type);

	$$result.css.add(css$6);

	return `<div>
	  <div class="${[`container svelte-r0qz2h`, type === 'light' ? "light" : ""].join(' ').trim() }"${add_attribute("this", containerRef, 1)}>
	    ${each(notifications, (notification, i) => `<div class="${escape(null_to_empty(`aa-notification ${notification.status || type} ${$$props.class || ''}`))} svelte-r0qz2h">
	        ${ notification.status && !notification.noIcon ? `<div class="statusIcon svelte-r0qz2h">${validate_component(IconStatus, 'IconStatus').$$render($$result, {
		icon: notification.icon || "attention",
		status: notification.status,
		size: 16
	}, {}, {})}</div>` : `` }
	        <div class="text svelte-r0qz2h">${escape(notification.text)}</div>
	        ${validate_component(IconButton, 'IconButton').$$render($$result, {
		icon: "close",
		status: "noactive",
		class: "closeButton"
	}, {}, {})}
	      </div>`)}
	  </div>
	</div>`;
});

/* src\routes\japanliterature\VirtualList.svelte generated by Svelte v3.12.1 */

const css$7 = {
	code: "svelte-virtual-list-viewport.svelte-5kyq2f{position:relative;overflow-y:auto;-webkit-overflow-scrolling:touch;display:block}svelte-virtual-list-contents.svelte-5kyq2f,svelte-virtual-list-row.svelte-5kyq2f{display:block}svelte-virtual-list-row.svelte-5kyq2f{overflow:hidden}",
	map: "{\"version\":3,\"file\":\"VirtualList.svelte\",\"sources\":[\"VirtualList.svelte\"],\"sourcesContent\":[\"<script>\\r\\n    import { onMount, tick } from 'svelte';\\r\\n    // props\\r\\n    export let items;\\r\\n    export let height = '100%';\\r\\n    export let itemHeight = undefined;\\r\\n    let foo;\\r\\n    // read-only, but visible to consumers via bind:start\\r\\n    export let start = 0;\\r\\n    export let end = 0;\\r\\n    // local state\\r\\n    let height_map = [];\\r\\n    let rows;\\r\\n    let viewport;\\r\\n    let contents;\\r\\n    let viewport_height = 0;\\r\\n    let visible;\\r\\n    let mounted;\\r\\n    let top = 0;\\r\\n    let bottom = 0;\\r\\n    let average_height;\\r\\n\\r\\n    $: visible = items.slice(start, end).map((data, i) => {\\r\\n        return { index: i + start, data };\\r\\n    });\\r\\n\\r\\n    // whenever `items` changes, invalidate the current heightmap\\r\\n    $: if (mounted && (viewport_height || true) && (itemHeight || true)) refresh();\\r\\n\\r\\n    $: if (mounted && items) refreshItems()\\r\\n\\r\\n    let itemLength\\r\\n    let oldItemsLength = items.length\\r\\n    $: itemLength = items.length\\r\\n\\r\\n    async function refreshItems() {\\r\\n        let itemsLength = items.length\\r\\n        rows = contents.getElementsByTagName('svelte-virtual-list-row');\\r\\n        top = 0\\r\\n        bottom = 0\\r\\n        height_map = []\\r\\n\\r\\n        if (itemsLength == 0) {\\r\\n            start = 0\\r\\n            end = 0\\r\\n            return\\r\\n        }\\r\\n        if (start > items.length - 1) {\\r\\n            start = items.length - 1\\r\\n            end = items.length - 1\\r\\n        }\\r\\n        refresh()\\r\\n        handle_scroll()\\r\\n    }\\r\\n\\r\\n    async function refresh() {\\r\\n\\r\\n        const { scrollTop } = viewport;\\r\\n\\r\\n        // if items has changed, we have to check to see if start and end are still in range\\r\\n\\r\\n        await tick(); // wait until the DOM is up to date\\r\\n        let content_height = top - scrollTop;\\r\\n\\r\\n        let i = start;\\r\\n\\r\\n        while (content_height < viewport_height && i < items.length) {\\r\\n            let row = rows[i - start];\\r\\n            if (!row) {\\r\\n                end = i + 1;\\r\\n                await tick(); // render the newly visible row\\r\\n                row = rows[i - start];\\r\\n            }\\r\\n            const row_height = height_map[i] = itemHeight || row.offsetHeight;\\r\\n            content_height += row_height;\\r\\n            i += 1;\\r\\n        }\\r\\n\\r\\n        end = i;\\r\\n        const remaining = items.length - end;\\r\\n        average_height = (top + content_height) / end;\\r\\n        bottom = remaining * average_height;\\r\\n        height_map.length = items.length;\\r\\n    }\\r\\n\\r\\n    async function handle_scroll() {\\r\\n        const { scrollTop } = viewport;\\r\\n        const old_start = start;\\r\\n        for (let v = 0; v < rows.length; v += 1) {\\r\\n            height_map[start + v] = itemHeight || rows[v].offsetHeight;\\r\\n        }\\r\\n        let i = 0;\\r\\n        let y = 0;\\r\\n        while (i < items.length) {\\r\\n            const row_height = height_map[i] || average_height;\\r\\n            if (y + row_height > scrollTop) {\\r\\n                start = i;\\r\\n                top = y;\\r\\n                break;\\r\\n            }\\r\\n            y += row_height;\\r\\n            i += 1;\\r\\n        }\\r\\n        while (i < items.length) {\\r\\n            y += height_map[i] || average_height;\\r\\n            i += 1;\\r\\n            if (y > scrollTop + viewport_height) break;\\r\\n        }\\r\\n        end = i;\\r\\n        const remaining = items.length - end;\\r\\n        average_height = y / end;\\r\\n        while (i < items.length) height_map[i++] = average_height;\\r\\n        bottom = remaining * average_height;\\r\\n        // prevent jumping if we scrolled up into unknown territory\\r\\n        if (start < old_start) {\\r\\n            await tick();\\r\\n            let expected_height = 0;\\r\\n            let actual_height = 0;\\r\\n            for (let i = start; i < old_start; i +=1) {\\r\\n                if (rows[i - start]) {\\r\\n                    expected_height += height_map[i];\\r\\n                    actual_height += itemHeight || rows[i - start].offsetHeight;\\r\\n                }\\r\\n            }\\r\\n            const d = actual_height - expected_height;\\r\\n            viewport.scrollTo(0, scrollTop + d);\\r\\n        }\\r\\n        // TODO if we overestimated the space these\\r\\n        // rows would occupy we may need to add some\\r\\n        // more. maybe we can just call handle_scroll again?\\r\\n    }\\r\\n    // trigger initial refresh\\r\\n    onMount(() => {\\r\\n        rows = contents.getElementsByTagName('svelte-virtual-list-row');\\r\\n        mounted = true;\\r\\n    });\\r\\n</script>\\r\\n\\r\\n<style>\\r\\n    svelte-virtual-list-viewport {\\r\\n        position: relative;\\r\\n        overflow-y: auto;\\r\\n        -webkit-overflow-scrolling:touch;\\r\\n        display: block;\\r\\n    }\\r\\n    svelte-virtual-list-contents, svelte-virtual-list-row {\\r\\n        display: block;\\r\\n    }\\r\\n    svelte-virtual-list-row {\\r\\n        overflow: hidden;\\r\\n    }\\r\\n</style>\\r\\n\\r\\n<svelte-virtual-list-viewport\\r\\n        bind:this={viewport}\\r\\n        bind:offsetHeight={viewport_height}\\r\\n        on:scroll={handle_scroll}\\r\\n        style=\\\"height: {height};\\\"\\r\\n>\\r\\n    <svelte-virtual-list-contents\\r\\n            bind:this={contents}\\r\\n            style=\\\"padding-top: {top}px; padding-bottom: {bottom}px;\\\"\\r\\n    >\\r\\n        {#each visible as row (row.index)}\\r\\n            <svelte-virtual-list-row>\\r\\n                <slot item={row.data}>Missing template</slot>\\r\\n            </svelte-virtual-list-row>\\r\\n        {/each}\\r\\n    </svelte-virtual-list-contents>\\r\\n</svelte-virtual-list-viewport>\\r\\n\"],\"names\":[],\"mappings\":\"AA2II,4BAA4B,cAAC,CAAC,AAC1B,QAAQ,CAAE,QAAQ,CAClB,UAAU,CAAE,IAAI,CAChB,2BAA2B,KAAK,CAChC,OAAO,CAAE,KAAK,AAClB,CAAC,AACD,0CAA4B,CAAE,uBAAuB,cAAC,CAAC,AACnD,OAAO,CAAE,KAAK,AAClB,CAAC,AACD,uBAAuB,cAAC,CAAC,AACrB,QAAQ,CAAE,MAAM,AACpB,CAAC\"}"
};

const VirtualList = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	// props
    let { items, height = '100%', itemHeight = undefined } = $$props;
    // read-only, but visible to consumers via bind:start
    let { start = 0, end = 0 } = $$props;
    // local state
    let height_map = [];
    let rows;
    let viewport;
    let contents;
    let viewport_height = 0;
    let visible;
    let mounted;
    let top = 0;
    let bottom = 0;
    let average_height;

    let itemLength;
    let oldItemsLength = items.length;

    async function refreshItems() {
        let itemsLength = items.length;
        rows = contents.getElementsByTagName('svelte-virtual-list-row');
        top = 0;
        bottom = 0;
        height_map = [];

        if (itemsLength == 0) {
            start = 0;
            end = 0;
            return
        }
        if (start > items.length - 1) {
            start = items.length - 1;
            end = items.length - 1;
        }
        refresh();
        handle_scroll();
    }

    async function refresh() {

        const { scrollTop } = viewport;

        // if items has changed, we have to check to see if start and end are still in range

        await tick(); // wait until the DOM is up to date
        let content_height = top - scrollTop;

        let i = start;

        while (content_height < viewport_height && i < items.length) {
            let row = rows[i - start];
            if (!row) {
                end = i + 1;
                await tick(); // render the newly visible row
                row = rows[i - start];
            }
            const row_height = height_map[i] = itemHeight || row.offsetHeight;
            content_height += row_height;
            i += 1;
        }

        end = i;
        const remaining = items.length - end;
        average_height = (top + content_height) / end;
        bottom = remaining * average_height;
        height_map.length = items.length;
    }

    async function handle_scroll() {
        const { scrollTop } = viewport;
        const old_start = start;
        for (let v = 0; v < rows.length; v += 1) {
            height_map[start + v] = itemHeight || rows[v].offsetHeight;
        }
        let i = 0;
        let y = 0;
        while (i < items.length) {
            const row_height = height_map[i] || average_height;
            if (y + row_height > scrollTop) {
                start = i;
                top = y;
                break;
            }
            y += row_height;
            i += 1;
        }
        while (i < items.length) {
            y += height_map[i] || average_height;
            i += 1;
            if (y > scrollTop + viewport_height) break;
        }
        end = i;
        const remaining = items.length - end;
        average_height = y / end;
        while (i < items.length) height_map[i++] = average_height;
        bottom = remaining * average_height;
        // prevent jumping if we scrolled up into unknown territory
        if (start < old_start) {
            await tick();
            let expected_height = 0;
            let actual_height = 0;
            for (let i = start; i < old_start; i +=1) {
                if (rows[i - start]) {
                    expected_height += height_map[i];
                    actual_height += itemHeight || rows[i - start].offsetHeight;
                }
            }
            const d = actual_height - expected_height;
            viewport.scrollTo(0, scrollTop + d);
        }
        // TODO if we overestimated the space these
        // rows would occupy we may need to add some
        // more. maybe we can just call handle_scroll again?
    }
    // trigger initial refresh
    onMount(() => {
        rows = contents.getElementsByTagName('svelte-virtual-list-row');
        mounted = true;
    });

	if ($$props.items === void 0 && $$bindings.items && items !== void 0) $$bindings.items(items);
	if ($$props.height === void 0 && $$bindings.height && height !== void 0) $$bindings.height(height);
	if ($$props.itemHeight === void 0 && $$bindings.itemHeight && itemHeight !== void 0) $$bindings.itemHeight(itemHeight);
	if ($$props.start === void 0 && $$bindings.start && start !== void 0) $$bindings.start(start);
	if ($$props.end === void 0 && $$bindings.end && end !== void 0) $$bindings.end(end);

	$$result.css.add(css$7);

	visible = items.slice(start, end).map((data, i) => {
                return { index: i + start, data };
            });
	if (mounted && ( true) && (itemHeight || true)) refresh();
	if (mounted && items) refreshItems();
	itemLength = items.length;

	return `<svelte-virtual-list-viewport style="height: ${escape(height)};" class="svelte-5kyq2f"${add_attribute("this", viewport, 1)}>
	    <svelte-virtual-list-contents style="padding-top: ${escape(top)}px; padding-bottom: ${escape(bottom)}px;" class="svelte-5kyq2f"${add_attribute("this", contents, 1)}>
	        ${each(visible, (row) => `<svelte-virtual-list-row class="svelte-5kyq2f">
	                ${$$slots.default ? $$slots.default({ item: row.data }) : `Missing template`}
	            </svelte-virtual-list-row>`)}
	    </svelte-virtual-list-contents>
	</svelte-virtual-list-viewport>`;
});

/* src\routes\japanliterature\ListItem.svelte generated by Svelte v3.12.1 */

const css$8 = {
	code: ".card.svelte-1swm2tl{position:relative;margin:0.5em;padding:0.5em 0.5em 0.5em 6em;border:1px solid #eee;border-radius:4px;box-shadow:2px 2px 4px rgba(0,0,0,0.1);min-height:5em}.card.svelte-1swm2tl::after{clear:both;display:block}.avatar.svelte-1swm2tl{position:absolute;width:5em;height:5em;left:0.5em;top:0.5em;border-radius:50%;background:no-repeat 50% 50%;background-size:cover}h2.svelte-1swm2tl{margin:0 0 0.5em 0;font-size:16px}p.svelte-1swm2tl{margin:0;font-size:14px}",
	map: "{\"version\":3,\"file\":\"ListItem.svelte\",\"sources\":[\"ListItem.svelte\"],\"sourcesContent\":[\"<script>\\r\\n    export let avatar;\\r\\n    export let name;\\r\\n    export let content;\\r\\n</script>\\r\\n\\r\\n<div class='card'>\\r\\n    <span class='avatar' style='background: url({avatar})' ></span>\\r\\n    <h2>{name}</h2>\\r\\n    <p>{content}</p>\\r\\n</div>\\r\\n\\r\\n<style>\\r\\n    .card {\\r\\n        position: relative;\\r\\n        margin: 0.5em;\\r\\n        padding: 0.5em 0.5em 0.5em 6em;\\r\\n        border: 1px solid #eee;\\r\\n        border-radius: 4px;\\r\\n        box-shadow: 2px 2px 4px rgba(0,0,0,0.1);\\r\\n        min-height: 5em;\\r\\n    }\\r\\n\\r\\n    .card::after {\\r\\n        clear: both;\\r\\n        display: block;\\r\\n    }\\r\\n\\r\\n    .avatar {\\r\\n        position: absolute;\\r\\n        width: 5em;\\r\\n        height: 5em;\\r\\n        left: 0.5em;\\r\\n        top: 0.5em;\\r\\n        border-radius: 50%;\\r\\n        background: no-repeat 50% 50%;\\r\\n        background-size: cover;\\r\\n    }\\r\\n\\r\\n    h2 {\\r\\n        margin: 0 0 0.5em 0;\\r\\n        font-size: 16px;\\r\\n    }\\r\\n\\r\\n    p {\\r\\n        margin: 0;\\r\\n        font-size: 14px;\\r\\n    }\\r\\n</style>\"],\"names\":[],\"mappings\":\"AAaI,KAAK,eAAC,CAAC,AACH,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,KAAK,CACb,OAAO,CAAE,KAAK,CAAC,KAAK,CAAC,KAAK,CAAC,GAAG,CAC9B,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,CACtB,aAAa,CAAE,GAAG,CAClB,UAAU,CAAE,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CACvC,UAAU,CAAE,GAAG,AACnB,CAAC,AAED,oBAAK,OAAO,AAAC,CAAC,AACV,KAAK,CAAE,IAAI,CACX,OAAO,CAAE,KAAK,AAClB,CAAC,AAED,OAAO,eAAC,CAAC,AACL,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,CACX,IAAI,CAAE,KAAK,CACX,GAAG,CAAE,KAAK,CACV,aAAa,CAAE,GAAG,CAClB,UAAU,CAAE,SAAS,CAAC,GAAG,CAAC,GAAG,CAC7B,eAAe,CAAE,KAAK,AAC1B,CAAC,AAED,EAAE,eAAC,CAAC,AACA,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,CACnB,SAAS,CAAE,IAAI,AACnB,CAAC,AAED,CAAC,eAAC,CAAC,AACC,MAAM,CAAE,CAAC,CACT,SAAS,CAAE,IAAI,AACnB,CAAC\"}"
};

const ListItem = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let { avatar, name, content } = $$props;

	if ($$props.avatar === void 0 && $$bindings.avatar && avatar !== void 0) $$bindings.avatar(avatar);
	if ($$props.name === void 0 && $$bindings.name && name !== void 0) $$bindings.name(name);
	if ($$props.content === void 0 && $$bindings.content && content !== void 0) $$bindings.content(content);

	$$result.css.add(css$8);

	return `<div class="card svelte-1swm2tl">
	    <span class="avatar svelte-1swm2tl" style="background: url(${escape(avatar)})"></span>
	    <h2 class="svelte-1swm2tl">${escape(name)}</h2>
	    <p class="svelte-1swm2tl">${escape(content)}</p>
	</div>`;
});

/* src\routes\japanliterature\index.svelte generated by Svelte v3.12.1 */

let searchTerm = "";

const Index$3 = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let $session, $page;

	
    let { p = 1 } = $$props;

    let tab;
    let tag;
    let tags;
    onMount(async () => {
        ({ tags } = await get('tags'));
    });
    const { page, session } = stores$1(); $page = get_store_value(page); $session = get_store_value(session);

    let start;
    let end;

	if ($$props.p === void 0 && $$bindings.p && p !== void 0) $$bindings.p(p);

	let $$settled;
	let $$rendered;

	do {
		$$settled = true;

		$session = get_store_value(session);
		$page = get_store_value(page);

		let filteredList = items.filter(item => item.name.indexOf(searchTerm) !== -1);

		$$rendered = `${($$result.head += `<title>Японская литература</title>`, "")}
		<div class="first">
		    <div class="second" id="myDropdown">
		        ${ $session.user ? `<div class="container page">
		            <a rel="" href="/editor"${add_classes([$page.path === '/editor' ? "active" : ""].join(' ').trim())}>
		                <i class="ion-compose">Добавить японскую литературу</i> 
		            </a>
		        </div>
		            ${validate_component(VirtualList, 'VirtualList').$$render($$result, {
			items: filteredList,
			start: start,
			end: end
		}, {
			start: $$value => { start = $$value; $$settled = false; },
			end: $$value => { end = $$value; $$settled = false; }
		}, {
			default: ({ item }) => `
		                ${validate_component(Index$1, 'MainView').$$render($$result, Object.assign(item, { p: p }, { tag: tag }, { tab: tab }), {
			tab: $$value => { tab = $$value; $$settled = false; }
		}, {})}
		            `
		})}` : `${validate_component(Index$1, 'MainView').$$render($$result, {
			p: p,
			tag: tag,
			tab: tab
		}, {
			tab: $$value => { tab = $$value; $$settled = false; }
		}, {})}` }
		    </div>
		</div>`;
	} while (!$$settled);

	return $$rendered;
});

/* src\routes\pageliterature\index.svelte generated by Svelte v3.12.1 */

const css$9 = {
	code: ".first.svelte-uh0hx6{font-family:'Roboto', sans-serif;padding:1px;width:100%}.second.svelte-uh0hx6{background-color:#f7fafc;border:2px;border-color:black;padding:4px;height:auto;box-shadow:2px 2px 8px rgba(0,0,0,0.1);border-radius:2px;width:100%}.three.svelte-uh0hx6{color:white;margin-bottom:3px;background-color:blue;box-shadow:2px 2px 8px rgba(0,0,0,0.1);width:100%}.four.svelte-uh0hx6{flex:auto;width:100%;padding:1.25rem}.five.svelte-uh0hx6{background-color:#718096;width:auto;height:256px;border:1px solid #000;border-radius:4px;font-family:'Roboto', sans-serif}.six.svelte-uh0hx6{width:100%}.seven.svelte-uh0hx6{margin-left:4px;color:#718096;width:100%}.eight.svelte-uh0hx6{width:100%;padding:1.25rem;border:1px solid #000;border-radius:4px;font-family:'Roboto', sans-serif}.seven-up.svelte-uh0hx6{margin-top:20px}",
	map: "{\"version\":3,\"file\":\"index.svelte\",\"sources\":[\"index.svelte\"],\"sourcesContent\":[\"<script>\\r\\n\\r\\n</script>\\r\\n<svelte:head>\\r\\n    <title></title>\\r\\n</svelte:head>\\r\\n<style>\\r\\n    .first\\r\\n    {\\r\\n        font-family: 'Roboto', sans-serif;\\r\\n        padding: 1px;\\r\\n        width: 100%;\\r\\n    }\\r\\n    .second\\r\\n    {\\r\\n        background-color: #f7fafc;\\r\\n        border: 2px;\\r\\n        border-color: black;\\r\\n        padding: 4px;\\r\\n        height: auto;\\r\\n        box-shadow: 2px 2px 8px rgba(0,0,0,0.1);\\r\\n        border-radius: 2px;\\r\\n        width: 100%;\\r\\n    }\\r\\n    .three\\r\\n    {\\r\\n        color: white;\\r\\n        margin-bottom: 3px;\\r\\n        background-color: blue;\\r\\n        box-shadow: 2px 2px 8px rgba(0,0,0,0.1);\\r\\n        width: 100%;\\r\\n    }\\r\\n    .four\\r\\n    {\\r\\n        flex: auto;\\r\\n\\r\\n        width: 100%;\\r\\n        padding: 1.25rem;\\r\\n    }\\r\\n    .five\\r\\n    {\\r\\n        background-color: #718096;\\r\\n        width: auto;\\r\\n        height: 256px;\\r\\n        border: 1px solid #000;\\r\\n        border-radius: 4px;\\r\\n        font-family: 'Roboto', sans-serif;\\r\\n    }\\r\\n    .six\\r\\n    {\\r\\n        width: 100%;\\r\\n    }\\r\\n    .seven\\r\\n    {\\r\\n        margin-left: 4px;\\r\\n        color: #718096;\\r\\n        width: 100%;\\r\\n\\r\\n    }\\r\\n    .eight\\r\\n    {\\r\\n        width: 100%;\\r\\n        padding: 1.25rem;\\r\\n        border: 1px solid #000;\\r\\n        border-radius: 4px;\\r\\n        font-family: 'Roboto', sans-serif;\\r\\n    }\\r\\n    .seven-up\\r\\n    {\\r\\n        margin-top: 20px;\\r\\n    }\\r\\n</style>\\r\\n<div class=\\\"first\\\">\\r\\n    <div class=\\\"second container\\\">\\r\\n        <div class=\\\"\\\"><h1 class=\\\"three\\\" style=\\\"text-align: center\\\">Название</h1></div>\\r\\n        <div class=\\\"four\\\">\\r\\n            <div class=\\\"five\\\"></div>\\r\\n            <div class=\\\"six\\\">\\r\\n                <div class=\\\"seven seven-up ml-4\\\"><p class=\\\"text-gray-600 mb-8 \\\">Автор:</p></div>\\r\\n                <div class=\\\"seven ml-4\\\"><p class=\\\"text-gray-600 mb-8 \\\">Жанр:</p></div>\\r\\n                <div class=\\\"seven ml-4\\\"><p class=\\\"text-gray-600 mb-8 \\\">Год:</p></div>\\r\\n                <div class=\\\"seven ml-4\\\"><p class=\\\"text-gray-600 mb-8 \\\">Метки:</p></div>\\r\\n            </div>\\r\\n        </div>\\r\\n        <div class=\\\"\\\"><h1 class=\\\"three\\\" style=\\\"text-align: center\\\">Описание</h1></div>\\r\\n        <div class=\\\"\\\">\\r\\n            <p class=\\\"eight leading-normal slide-in-bottom-subtitle\\\">Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-то\\r\\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-то\\r\\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-то\\r\\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т\\r\\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т\\r\\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т\\r\\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т\\r\\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т\\r\\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т\\r\\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т\\r\\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т\\r\\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т\\r\\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т\\r\\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т\\r\\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т\\r\\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т\\r\\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т\\r\\n                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т</p>\\r\\n        </div>\\r\\n    </div>\\r\\n</div>\"],\"names\":[],\"mappings\":\"AAOI,MAAM,cACN,CAAC,AACG,WAAW,CAAE,QAAQ,CAAC,CAAC,UAAU,CACjC,OAAO,CAAE,GAAG,CACZ,KAAK,CAAE,IAAI,AACf,CAAC,AACD,OAAO,cACP,CAAC,AACG,gBAAgB,CAAE,OAAO,CACzB,MAAM,CAAE,GAAG,CACX,YAAY,CAAE,KAAK,CACnB,OAAO,CAAE,GAAG,CACZ,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CACvC,aAAa,CAAE,GAAG,CAClB,KAAK,CAAE,IAAI,AACf,CAAC,AACD,MAAM,cACN,CAAC,AACG,KAAK,CAAE,KAAK,CACZ,aAAa,CAAE,GAAG,CAClB,gBAAgB,CAAE,IAAI,CACtB,UAAU,CAAE,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CACvC,KAAK,CAAE,IAAI,AACf,CAAC,AACD,KAAK,cACL,CAAC,AACG,IAAI,CAAE,IAAI,CAEV,KAAK,CAAE,IAAI,CACX,OAAO,CAAE,OAAO,AACpB,CAAC,AACD,KAAK,cACL,CAAC,AACG,gBAAgB,CAAE,OAAO,CACzB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,KAAK,CACb,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,CACtB,aAAa,CAAE,GAAG,CAClB,WAAW,CAAE,QAAQ,CAAC,CAAC,UAAU,AACrC,CAAC,AACD,IAAI,cACJ,CAAC,AACG,KAAK,CAAE,IAAI,AACf,CAAC,AACD,MAAM,cACN,CAAC,AACG,WAAW,CAAE,GAAG,CAChB,KAAK,CAAE,OAAO,CACd,KAAK,CAAE,IAAI,AAEf,CAAC,AACD,MAAM,cACN,CAAC,AACG,KAAK,CAAE,IAAI,CACX,OAAO,CAAE,OAAO,CAChB,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,CACtB,aAAa,CAAE,GAAG,CAClB,WAAW,CAAE,QAAQ,CAAC,CAAC,UAAU,AACrC,CAAC,AACD,SAAS,cACT,CAAC,AACG,UAAU,CAAE,IAAI,AACpB,CAAC\"}"
};

const Index$4 = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	$$result.css.add(css$9);

	return `${($$result.head += `<title></title>`, "")}

	<div class="first svelte-uh0hx6">
	    <div class="second container svelte-uh0hx6">
	        <div class=""><h1 class="three svelte-uh0hx6" style="text-align: center">Название</h1></div>
	        <div class="four svelte-uh0hx6">
	            <div class="five svelte-uh0hx6"></div>
	            <div class="six svelte-uh0hx6">
	                <div class="seven seven-up ml-4 svelte-uh0hx6"><p class="text-gray-600 mb-8 ">Автор:</p></div>
	                <div class="seven ml-4 svelte-uh0hx6"><p class="text-gray-600 mb-8 ">Жанр:</p></div>
	                <div class="seven ml-4 svelte-uh0hx6"><p class="text-gray-600 mb-8 ">Год:</p></div>
	                <div class="seven ml-4 svelte-uh0hx6"><p class="text-gray-600 mb-8 ">Метки:</p></div>
	            </div>
	        </div>
	        <div class=""><h1 class="three svelte-uh0hx6" style="text-align: center">Описание</h1></div>
	        <div class="">
	            <p class="eight leading-normal slide-in-bottom-subtitle svelte-uh0hx6">Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-то
	                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-то
	                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-то
	                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т
	                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т
	                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т
	                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т
	                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т
	                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т
	                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т
	                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т
	                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т
	                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т
	                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т
	                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т
	                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т
	                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т
	                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т</p>
	        </div>
	    </div>
	</div>`;
});

/* src\routes\_components\ListErrors.svelte generated by Svelte v3.12.1 */

const ListErrors = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let { errors } = $$props;

	if ($$props.errors === void 0 && $$bindings.errors && errors !== void 0) $$bindings.errors(errors);

	return `${ errors ? `<ul class="error-messages">
			${each(Object.keys(errors), (key) => `<li>${escape(key)} ${escape(errors[key])}</li>`)}
		</ul>` : `` }`;
});

/* src\routes\register\index.svelte generated by Svelte v3.12.1 */

const Index$5 = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let $session;

	

	const { session } = stores$1(); $session = get_store_value(session);

	let username = '';
	let email = '';
	let password = '';

	let errors = null;

	$session = get_store_value(session);

	return `${($$result.head += `<title>Регистрация Ignat Japan</title>`, "")}

	<div class="auth-page">
		<div class="container page">
			<div class="row">
				<div class="col-md-6 offset-md-3 col-xs-12">
					<h1 class="text-xs-center h1-norm">Регистрация</h1>
					<p class="text-xs-center">
						<a href="/login">Есть аккаунт?</a>
					</p>

					${validate_component(ListErrors, 'ListErrors').$$render($$result, { errors: errors }, {}, {})}

					<form>
						<fieldset class="form-group">
							<input class="form-control form-control-lg" type="text" placeholder="Логин"${add_attribute("value", username, 1)}>
						</fieldset>
						<fieldset class="form-group">
							<input class="form-control form-control-lg" type="email" placeholder="Почта"${add_attribute("value", email, 1)}>
						</fieldset>
						<fieldset class="form-group">
							<input class="form-control form-control-lg" type="password" placeholder="Пароль"${add_attribute("value", password, 1)}>
						</fieldset>
						<fieldset class="form-group">
							<input class="form-control form-control-lg" type="text" placeholder="invite-код">
						</fieldset>
						<button class="btn btn-lg btn-primary pull-xs-right">
							Зарегистрироваться
						</button>
					</form>
				</div>
			</div>
		</div>
	</div>`;
});

/* src\routes\settings\_SettingsForm.svelte generated by Svelte v3.12.1 */

const SettingsForm = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let $session;

	
	const { page, session } = stores$1(); $session = get_store_value(session);
	let { inProgress, image, username, bio, email = '' } = $$props;

	if ($$props.inProgress === void 0 && $$bindings.inProgress && inProgress !== void 0) $$bindings.inProgress(inProgress);
	if ($$props.image === void 0 && $$bindings.image && image !== void 0) $$bindings.image(image);
	if ($$props.username === void 0 && $$bindings.username && username !== void 0) $$bindings.username(username);
	if ($$props.bio === void 0 && $$bindings.bio && bio !== void 0) $$bindings.bio(bio);
	if ($$props.email === void 0 && $$bindings.email && email !== void 0) $$bindings.email(email);

	$session = get_store_value(session);

	return `<form>
		<fieldset>
			<fieldset class="form-group">
				<input class="form-control" type="text" placeholder="URL картинка для иконки"${add_attribute("value", image, 1)}>
			</fieldset>

			<fieldset class="form-group">
				<input class="form-control form-control-lg" type="text" placeholder="Логин"${add_attribute("value", username, 1)}>
			</fieldset>

			<fieldset class="form-group">
				<textarea class="form-control form-control-lg" rows="8" placeholder="Биография о вас">${(bio) || ""}</textarea>
			</fieldset>

			<fieldset class="form-group">
				<input class="form-control form-control-lg" type="email" placeholder="Почта"${add_attribute("value", email, 1)}>
			</fieldset>

			<button class="btn btn-lg btn-primary pull-xs-right" type="submit"${inProgress ? " disabled" : "" }>
				Обновить настройки
			</button>

			<button class="btn btn-lg btn-primary pull-xs-left" type="submit">
				<a class="h3-norm" href="/profile/@${escape($session.user.username)}/favorites">Вернуться в профиль</a>
			</button>
		</fieldset>
	</form>`;
});

/* src\routes\settings\index.svelte generated by Svelte v3.12.1 */

const Index$6 = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let $session;

	

	let inProgress;
	let errors;

	const { session } = stores$1(); $session = get_store_value(session);

	$session = get_store_value(session);

	return `${($$result.head += `<title>Настройки Ignat Japan</title>`, "")}

	<div class="settings-page">
		<div class="container page">
			<div class="row">
				<div class="col-md-6 offset-md-3 col-xs-12">

					<h1 class="text-xs-center">Настройки профиля</h1>

					${validate_component(ListErrors, 'ListErrors').$$render($$result, { errors: errors }, {}, {})}

					${validate_component(SettingsForm, 'SettingsForm').$$render($$result, Object.assign($session.user, { inProgress: inProgress }), {}, {})}

					<hr>
				</div>
			</div>
		</div>
	</div>`;
});

/* src\routes\article\_ArticleMeta.svelte generated by Svelte v3.12.1 */

const ArticleMeta = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	

	let { article, user } = $$props;

	if ($$props.article === void 0 && $$bindings.article && article !== void 0) $$bindings.article(article);
	if ($$props.user === void 0 && $$bindings.user && user !== void 0) $$bindings.user(user);

	let canModify = user && article.author.username === user.username;

	return `<div class="article-meta">
		${ canModify ? `<div class="dropdown sf">
					<a rel="prefetch" role="button" aria-pressed="true" href="/" style="text-align: center" aria-haspopup="true" aria-expanded="false" data-toggle="dropdown" class="nav-dropdown_2 dropdown-menu-right_2">
						Список функции
					</a>
					<div class="nav-dropdown_2 dropdown-menu dropdown-menu-right_2" style="text-align: center">
						<span>
							<a href="/editor/${escape(article.slug)}" class="btn btn-outline-secondary btn-sm">
								<i class="ion-edit"></i> Редактировать
							</a>
							<button class="btn btn-outline-danger btn-sm" status="positive">
								<i class="ion-trash-a"></i> Удалить литературу
							</button>
							${validate_component(Notifications, 'Notifications').$$render($$result, {}, {}, {})}
						</span>
					</div>
				</div>` : `` }
	</div>`;
});

/* src\routes\article\_CommentInput.svelte generated by Svelte v3.12.1 */

const CommentInput = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	

	let { slug, user } = $$props;

	if ($$props.slug === void 0 && $$bindings.slug && slug !== void 0) $$bindings.slug(slug);
	if ($$props.user === void 0 && $$bindings.user && user !== void 0) $$bindings.user(user);

	return `<form class="card comment-form">
		<div class="card-block">
			<textarea class="form-control" placeholder="Напишите комментарии" rows="3">${ ""}</textarea>
		</div>

		<div class="card-footer">
			<img${add_attribute("src", user.image, 0)} class="comment-author-img"${add_attribute("alt", user.username, 0)}>
			<button class="btn btn-sm btn-primary" type="submit">Отправить</button>
		</div>
	</form>`;
});

/* src\routes\article\_Comment.svelte generated by Svelte v3.12.1 */

const Comment = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	

	let { comment, slug, user } = $$props;

	if ($$props.comment === void 0 && $$bindings.comment && comment !== void 0) $$bindings.comment(comment);
	if ($$props.slug === void 0 && $$bindings.slug && slug !== void 0) $$bindings.slug(slug);
	if ($$props.user === void 0 && $$bindings.user && user !== void 0) $$bindings.user(user);

	return `<div class="card">
		<div class="card-block">
			<p class="card-text">${escape(comment.body)}</p>
		</div>

		<div class="card-footer">
			<a href="/profile/@${escape(comment.author.username)}" class="comment-author">
				<img${add_attribute("src", comment.author.image, 0)} class="comment-author-img"${add_attribute("alt", comment.author.username, 0)}>
			</a>

			<a href="/profile/@${escape(comment.author.username)}" class="comment-author">${escape(comment.author.username)}</a>

			<span class="date-posted">
				${escape(new Date(comment.createdAt).toDateString())}
			</span>
			${ user && comment.author.username === user.username ? `<span class="mod-options">
					<i class="ion-trash-a"></i>
				</span>` : `` }
		</div>
	</div>`;
});

/* src\routes\article\_CommentContainer.svelte generated by Svelte v3.12.1 */

const CommentContainer = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	

	let { comments, errors, slug, user } = $$props;

	const beforeRate = rate => {
		console.log(rate);
	};
	const afterRate = rate => {
		console.log(rate);
	};

	if ($$props.comments === void 0 && $$bindings.comments && comments !== void 0) $$bindings.comments(comments);
	if ($$props.errors === void 0 && $$bindings.errors && errors !== void 0) $$bindings.errors(errors);
	if ($$props.slug === void 0 && $$bindings.slug && slug !== void 0) $$bindings.slug(slug);
	if ($$props.user === void 0 && $$bindings.user && user !== void 0) $$bindings.user(user);

	return `<div class="col-xs-12 col-md-8 offset-md-2">
		${ user ? `<div>
				${validate_component(ListErrors, 'ListErrors').$$render($$result, { errors: errors }, {}, {})}
				${validate_component(CommentInput, 'CommentInput').$$render($$result, { slug: slug, user: user }, {}, {})}
				${validate_component(Rate, 'Rate').$$render($$result, {
		beforeRate: beforeRate,
		afterRate: afterRate
	}, {}, {})}
			</div>` : `<p>
				<a href="/login" class="commentariy">Войдите</a> или <a class="commentariy" href="/register">зарегистрируйтесь</a> чтобы добавить комментарий.
			</p>` }

		${each(comments, (comment, i) => `${validate_component(Comment, 'Comment').$$render($$result, {
		comment: comment,
		slug: slug,
		user: user
	}, {}, {})}`)}
	</div>`;
});

/* src\routes\article\[slug].svelte generated by Svelte v3.12.1 */

const css$a = {
	code: ".we.svelte-1wq1h6l{margin-top:30px}.desc.svelte-1wq1h6l{padding:1.25rem;background-color:#f7fafc;border:4px;border-color:black;height:auto;box-shadow:2px 2px 8px rgba(0,0,0,0.1);border-radius:4px;width:100%}",
	map: "{\"version\":3,\"file\":\"[slug].svelte\",\"sources\":[\"[slug].svelte\"],\"sourcesContent\":[\"<script context=\\\"module\\\">\\r\\n\\timport * as api from 'api.js';\\r\\n\\r\\n\\texport async function preload({ params }) {\\r\\n\\t\\tconst { slug } = params;\\r\\n\\t\\tconst { article } = await api.get(`articles/${params.slug}`, null);\\r\\n\\r\\n\\t\\treturn { article, slug };\\r\\n\\t}\\r\\n</script>\\r\\n\\r\\n<script>\\r\\n\\timport { onMount } from 'svelte';\\r\\n\\timport { stores } from '@sapper/app';\\r\\n\\timport marked from 'marked';\\r\\n\\r\\n\\timport ArticleMeta from './_ArticleMeta.svelte';\\r\\n\\timport CommentContainer from './_CommentContainer.svelte';\\r\\n\\r\\n\\texport let article;\\r\\n\\texport let slug;\\r\\n\\r\\n\\tconst { session } = stores();\\r\\n\\r\\n\\tlet commentErrors, comments = []; // we'll lazy-load these in onMount\\r\\n\\t$: markup = marked(article.body);\\r\\n\\r\\n\\tonMount(() => {\\r\\n\\t\\tapi.get(`articles/${slug}/comments`).then((res) => {\\r\\n\\t\\t\\tcomments = res.comments;\\r\\n\\t\\t});\\r\\n\\t});\\r\\n</script>\\r\\n\\r\\n<svelte:head>\\r\\n\\t<title>{article.title}</title>\\r\\n</svelte:head>\\r\\n\\r\\n<div class=\\\"article-page\\\">\\r\\n\\r\\n\\t<div class=\\\"banner\\\">\\r\\n\\t\\t<div class=\\\"container\\\">\\r\\n\\t\\t\\t<h1>{article.title}</h1>\\r\\n\\t\\t\\t<ArticleMeta {article} user={$session.user}/>\\r\\n\\t\\t</div>\\r\\n\\t</div>\\r\\n\\r\\n\\t<div class=\\\"container page\\\">\\r\\n\\t\\t<div class=\\\"row article-content\\\">\\r\\n\\t\\t\\t<div class=\\\"col-xs-12\\\">\\r\\n\\r\\n\\t\\t\\t\\t<div class=\\\"desc\\\">{@html markup}</div>\\r\\n\\r\\n\\t\\t\\t\\t<ul class=\\\"tag-list we\\\">\\r\\n\\t\\t\\t\\t\\t{#each article.tagList as tag}\\r\\n\\t\\t\\t\\t\\t\\t<li class=\\\"tag-default tag-pill tag-outline\\\">\\r\\n\\t\\t\\t\\t\\t\\t\\t{tag}\\r\\n\\t\\t\\t\\t\\t\\t</li>\\r\\n\\t\\t\\t\\t\\t{/each}\\r\\n\\t\\t\\t\\t</ul>\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t</div>\\r\\n\\r\\n\\t\\t<hr />\\r\\n\\r\\n\\t\\t<div class=\\\"article-actions\\\"></div>\\r\\n\\r\\n\\t\\t<div class=\\\"row\\\">\\r\\n\\t\\t\\t<CommentContainer {slug} {comments} user={$session.user} errors={commentErrors}/>\\r\\n\\t\\t</div>\\r\\n\\t</div>\\r\\n</div>\\r\\n<style>\\r\\n\\t.we\\r\\n\\t{\\r\\n\\t\\tmargin-top: 30px;\\r\\n\\t}\\r\\n\\t.desc\\r\\n\\t{\\r\\n\\t\\tpadding: 1.25rem;\\r\\n\\t\\tbackground-color: #f7fafc;\\r\\n\\t\\tborder: 4px;\\r\\n\\t\\tborder-color: black;\\r\\n\\t\\theight: auto;\\r\\n\\t\\tbox-shadow: 2px 2px 8px rgba(0,0,0,0.1);\\r\\n\\t\\tborder-radius: 4px;\\r\\n\\t\\twidth: 100%;\\r\\n\\t}\\r\\n</style>\"],\"names\":[],\"mappings\":\"AAyEC,GAAG,eACH,CAAC,AACA,UAAU,CAAE,IAAI,AACjB,CAAC,AACD,KAAK,eACL,CAAC,AACA,OAAO,CAAE,OAAO,CAChB,gBAAgB,CAAE,OAAO,CACzB,MAAM,CAAE,GAAG,CACX,YAAY,CAAE,KAAK,CACnB,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CACvC,aAAa,CAAE,GAAG,CAClB,KAAK,CAAE,IAAI,AACZ,CAAC\"}"
};

async function preload({ params }) {
	const { slug } = params;
	const { article } = await get(`articles/${params.slug}`, null);

	return { article, slug };
}

const Slug = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let $session;

	

	let { article, slug } = $$props;

	const { session } = stores$1(); $session = get_store_value(session);

	let commentErrors, comments = [];

	onMount(() => {
		get(`articles/${slug}/comments`).then((res) => {
			comments = res.comments;
		});
	});

	if ($$props.article === void 0 && $$bindings.article && article !== void 0) $$bindings.article(article);
	if ($$props.slug === void 0 && $$bindings.slug && slug !== void 0) $$bindings.slug(slug);

	$$result.css.add(css$a);

	$session = get_store_value(session);

	let markup = marked(article.body);

	return `${($$result.head += `<title>${escape(article.title)}</title>`, "")}

	<div class="article-page">

		<div class="banner">
			<div class="container">
				<h1>${escape(article.title)}</h1>
				${validate_component(ArticleMeta, 'ArticleMeta').$$render($$result, {
		article: article,
		user: $session.user
	}, {}, {})}
			</div>
		</div>

		<div class="container page">
			<div class="row article-content">
				<div class="col-xs-12">

					<div class="desc svelte-1wq1h6l">${markup}</div>

					<ul class="tag-list we svelte-1wq1h6l">
						${each(article.tagList, (tag) => `<li class="tag-default tag-pill tag-outline">
								${escape(tag)}
							</li>`)}
					</ul>
				</div>
			</div>

			<hr>

			<div class="article-actions"></div>

			<div class="row">
				${validate_component(CommentContainer, 'CommentContainer').$$render($$result, {
		slug: slug,
		comments: comments,
		user: $session.user,
		errors: commentErrors
	}, {}, {})}
			</div>
		</div>
	</div>`;
});

/* src\routes\profile\index.svelte generated by Svelte v3.12.1 */

function preload$1({ params }, { user }) {
	if (user) {
		this.redirect(302, `/profile/@${user.username}`);
	} else {
		this.redirect(302, `/`);
	}
}

const Index$7 = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	return ``;
});

/* src\routes\profile\[user]\_Profile.svelte generated by Svelte v3.12.1 */

const Profile = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	

	let { profile, favorites, user } = $$props;

	if ($$props.profile === void 0 && $$bindings.profile && profile !== void 0) $$bindings.profile(profile);
	if ($$props.favorites === void 0 && $$bindings.favorites && favorites !== void 0) $$bindings.favorites(favorites);
	if ($$props.user === void 0 && $$bindings.user && user !== void 0) $$bindings.user(user);

	let isUser = user && (profile.username === user.username);

	return `${($$result.head += `<title>${escape(profile.username)} Ignat Japan</title>`, "")}
	<div class="profile-page">
		<div class="user-info">
			<div class="container">
				<div class="row">
					<div class="col-xs-12 col-md-10 offset-md-1">
						<img${add_attribute("src", profile.image, 0)} class="user-img"${add_attribute("alt", profile.username, 0)}>
						<h4>${escape(profile.username)}</h4>
						<p>${escape(profile.bio)}</p>
						${ isUser ? `<a href="/settings" class="btn btn-sm btn-outline-secondary action-btn">
								<i class="ion-gear-a">
								</i>
								Настройки
							</a>` : `` }
					</div>
				</div>
			</div>
		</div>
		<div class="container">
			<div class="row">
				<div class="col-xs-12 col-md-10 offset-md-1">
					<div class="articles-toggle">
						<ul class="nav nav-pills outline-active">
							<li class="nav-item">
								<a class="nav-link ${escape(favorites ? 'active' : '')}" href="/profile/@${escape(profile.username)}/favorites">Список запланированных литератур</a>
							</li>
						</ul>
					</div>
					${validate_component(Index, 'ArticleList').$$render($$result, {
		tab: "profile",
		username: profile.username,
		favorites: favorites
	}, {}, {})}
				</div>
			</div>
		</div>
	</div>`;
});

/* src\routes\profile\[user]\index.svelte generated by Svelte v3.12.1 */

async function preload$2({ params }, { user }) {
	const username = params.user.slice(1);

	const { profile } = await get(`profiles/${username}`, user && user.token);
	return { profile, favorites: params.view === 'favorites' };
}

const Index$8 = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let $session;

	

	let { profile, favorites } = $$props;

	const { session } = stores$1(); $session = get_store_value(session);

	if ($$props.profile === void 0 && $$bindings.profile && profile !== void 0) $$bindings.profile(profile);
	if ($$props.favorites === void 0 && $$bindings.favorites && favorites !== void 0) $$bindings.favorites(favorites);

	$session = get_store_value(session);

	return `${($$result.head += `<title>${escape(profile.username)} Ignat Japan</title>`, "")}

	${validate_component(Profile, 'Profile').$$render($$result, {
		profile: profile,
		favorites: favorites,
		user: $session.user
	}, {}, {})}`;
});

/* src\routes\profile\[user]\[view].svelte generated by Svelte v3.12.1 */

async function preload$3({ params }, { user }) {
	const username = params.user.slice(1);

	const { profile } = await get(`profiles/${username}`, user && user.token);
	return { profile, favorites: params.view === 'favorites' };
}

const View = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let $session;

	

	let { profile, favorites } = $$props;
	const { session } = stores$1(); $session = get_store_value(session);

	if ($$props.profile === void 0 && $$bindings.profile && profile !== void 0) $$bindings.profile(profile);
	if ($$props.favorites === void 0 && $$bindings.favorites && favorites !== void 0) $$bindings.favorites(favorites);

	$session = get_store_value(session);

	return `${($$result.head += `<title>${escape(profile.username)} Ignat Japan</title>`, "")}

	${validate_component(Profile, 'Profile').$$render($$result, {
		profile: profile,
		favorites: favorites,
		user: $session.user
	}, {}, {})}`;
});

/* src\routes\editor\_Editor.svelte generated by Svelte v3.12.1 */

const Editor = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let $session;

	

	let { article, slug } = $$props;
	let errors;

	const { session } = stores$1(); $session = get_store_value(session);

	if ($$props.article === void 0 && $$bindings.article && article !== void 0) $$bindings.article(article);
	if ($$props.slug === void 0 && $$bindings.slug && slug !== void 0) $$bindings.slug(slug);

	$session = get_store_value(session);

	return `<div class="editor-page">
		<div class="container page">
			<div class="row">
				<div class="col-md-10 offset-md-1 col-xs-12">
					${validate_component(ListErrors, 'ListErrors').$$render($$result, { errors: errors }, {}, {})}

					<form>
						<fieldset>
							<fieldset class="form-group">
								<input class="form-control form-control-lg" type="text" placeholder="Название"${add_attribute("value", article.title, 1)}>
							</fieldset>

							<fieldset class="form-group">
								<input class="form-control" type="text" placeholder="Краткое описание"${add_attribute("value", article.description, 1)}>
							</fieldset>

							<fieldset class="form-group">
								<textarea class="form-control" rows="8" placeholder="Подробное описание">${(article.body) || ""}</textarea>
							</fieldset>

							<fieldset class="form-group">
								<input class="form-control" type="text" placeholder="Теги/жанры">

								<div class="tag-list">
									${each(article.tagList, (tag, i) => `<span class="tag-default tag-pill">
											<i class="ion-close-round"></i>
											${escape(tag)}
										</span>`)}
								</div>
							</fieldset>
							<button class="btn btn-lg pull-xs-right btn-primary" type="button"${ "" } status="positive">
								Опубликовать литературу
							</button>
							${validate_component(Notifications, 'Notifications').$$render($$result, {}, {}, {})}
						</fieldset>
					</form>
				</div>
			</div>
		</div>
	</div>`;
});

/* src\routes\editor\index.svelte generated by Svelte v3.12.1 */

const Index$9 = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let article = { title: '', description: '', body: '', tagList: [] };

	return `${validate_component(Editor, 'Editor').$$render($$result, { article: article }, {}, {})}`;
});

/* src\routes\editor\[slug].svelte generated by Svelte v3.12.1 */

async function preload$4({ params }) {
	const { slug } = params;
	const { article } = await get(`articles/${slug}`, null);
	return { article, slug };
}

const Slug$1 = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let { slug, article } = $$props;

	if ($$props.slug === void 0 && $$bindings.slug && slug !== void 0) $$bindings.slug(slug);
	if ($$props.article === void 0 && $$bindings.article && article !== void 0) $$bindings.article(article);

	return `${validate_component(Editor, 'Editor').$$render($$result, { article: article, slug: slug }, {}, {})}`;
});

/* src\routes\admin\index.svelte generated by Svelte v3.12.1 */

const css$b = {
	code: ".hash.svelte-130bq71{width:25%;border:1px solid #000;border-radius:4px;background-color:#f7fafc;font-family:'Roboto', sans-serif;padding:1.25rem}.invite.svelte-130bq71{margin-top:50px}",
	map: "{\"version\":3,\"file\":\"index.svelte\",\"sources\":[\"index.svelte\"],\"sourcesContent\":[\"<svelte:head>\\r\\n    <title>Admin Panel Ignat Japan</title>\\r\\n</svelte:head>\\r\\n<script>\\r\\n    function reOrderArray(){\\r\\n        //for each Element inside our numbers array\\r\\n        for(var i = 0; i<numbers.length; i++){\\r\\n\\r\\n            // for each Element inisde our numbers array and i\\r\\n            for(var x=0; x<numbers.length; x++){\\r\\n\\r\\n                // if the number from the i loop is smaller then the number\\r\\n                // from the x loop\\r\\n                if(numbers[i] < numbers[x]){\\r\\n\\r\\n                    // save the value i quickly.\\r\\n                    var num = numbers[i];\\r\\n                    // change the value i to the value x\\r\\n                    numbers[i] = numbers[x];\\r\\n                    // reorder the i value (stored as num here to x)\\r\\n                    numbers[x] = num;\\r\\n                }\\r\\n\\r\\n            }\\r\\n\\r\\n        }\\r\\n\\r\\n    }\\r\\n    const numbers = [];\\r\\n    var number;\\r\\n    function addNumbers(){\\r\\n            var random = Math.floor(Math.random() * 99999999999)\\r\\n            numbers.push(random)\\r\\n            numbers = numbers;\\r\\n            reOrderArray();\\r\\n            console.log(random)\\r\\n    }\\r\\n    function remove(num)\\r\\n    {\\r\\n        for(var z=0; z<numbers.length; z++)\\r\\n        {\\r\\n            if(numbers[z] === num)\\r\\n            {\\r\\n                numbers.splice(z, 1)\\r\\n                numbers = numbers;\\r\\n            }\\r\\n        }\\r\\n    }\\r\\n</script>\\r\\n<div class=\\\"container invite\\\">\\r\\n    <button class=\\\"btn btn-sm btn-outline-secondary action-btn\\\" on:click={addNumbers}>\\r\\n        Сгенерировать хэш-пароль\\r\\n    </button>\\r\\n    <p class=\\\"invite\\\">Хэш-пароль:</p>\\r\\n    <ul class=\\\"nav navbar-nav hash\\\">\\r\\n        {#each numbers as num}\\r\\n            <li>\\r\\n                {num}\\r\\n                <button class=\\\"btn btn-sm btn-outline-secondary action-btn\\\" on:click={() => remove(num)}>\\r\\n                Remove\\r\\n            </button>\\r\\n            </li>\\r\\n        {/each}\\r\\n    </ul>\\r\\n</div>\\r\\n<style>\\r\\n    .hash\\r\\n    {\\r\\n        width: 25%;\\r\\n        border: 1px solid #000;\\r\\n        border-radius: 4px;\\r\\n        background-color: #f7fafc;\\r\\n        font-family: 'Roboto', sans-serif;\\r\\n        padding: 1.25rem;\\r\\n    }\\r\\n    .invite\\r\\n    {\\r\\n        margin-top: 50px;\\r\\n    }\\r\\n</style>\"],\"names\":[],\"mappings\":\"AAkEI,KAAK,eACL,CAAC,AACG,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,CACtB,aAAa,CAAE,GAAG,CAClB,gBAAgB,CAAE,OAAO,CACzB,WAAW,CAAE,QAAQ,CAAC,CAAC,UAAU,CACjC,OAAO,CAAE,OAAO,AACpB,CAAC,AACD,OAAO,eACP,CAAC,AACG,UAAU,CAAE,IAAI,AACpB,CAAC\"}"
};

const Index$a = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
    const numbers = [];

	$$result.css.add(css$b);

	return `${($$result.head += `<title>Admin Panel Ignat Japan</title>`, "")}

	<div class="container invite svelte-130bq71">
	    <button class="btn btn-sm btn-outline-secondary action-btn">
	        Сгенерировать хэш-пароль
	    </button>
	    <p class="invite svelte-130bq71">Хэш-пароль:</p>
	    <ul class="nav navbar-nav hash svelte-130bq71">
	        ${each(numbers, (num) => `<li>
	                ${escape(num)}
	                <button class="btn btn-sm btn-outline-secondary action-btn">
	                Remove
	            </button>
	            </li>`)}
	    </ul>
	</div>`;
});

/* src\routes\login\index.svelte generated by Svelte v3.12.1 */

const Index$b = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let $session;

	

	const { session } = stores$1(); $session = get_store_value(session);
	let email = '';
	let password = '';
	let errors = null;

	$session = get_store_value(session);

	return `${($$result.head += `<title>Авторизация Ignat Japan</title>`, "")}

	<div class="auth-page">
		<div class="container page">
			<div class="row">
				<div class="col-md-6 offset-md-3 col-xs-12">
					<h1 class="text-xs-center h1-norm">Авторизация</h1>
					<p class="text-xs-center">
						<a href="/register">Нужен аккаунт?</a>
					</p>

					${validate_component(ListErrors, 'ListErrors').$$render($$result, { errors: errors }, {}, {})}

					<form>
						<fieldset class="form-group">
							<input class="form-control form-control-lg" type="text" placeholder="Почта"${add_attribute("value", email, 1)}>
						</fieldset>
						<fieldset class="form-group">
							<input class="form-control form-control-lg" type="password" placeholder="Пароль"${add_attribute("value", password, 1)}>
						</fieldset>
						<button class="btn btn-lg btn-primary pull-xs-right" type="submit"${ " disabled"  }>
							Авторизоваться
						</button>
					</form>
				</div>
			</div>
		</div>
	</div>`;
});

/* src\routes\[p].svelte generated by Svelte v3.12.1 */

function preload$5({ params }) {
	return {
		p: +params.p
	};
}

const P = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let { p } = $$props;

	if ($$props.p === void 0 && $$bindings.p && p !== void 0) $$bindings.p(p);

	return `${validate_component(Home, 'Home').$$render($$result, { p: p }, {}, {})}`;
});

// This file is generated by Sapper — do not edit it!

const d = decodeURIComponent;

const manifest = {
	server_routes: [
		{
			// japanliterature/data.js
			pattern: /^\/japanliterature\/data\/?$/,
			handlers: route_0,
			params: () => ({})
		},

		{
			// auth/register.js
			pattern: /^\/auth\/register\/?$/,
			handlers: route_1,
			params: () => ({})
		},

		{
			// auth/logout.js
			pattern: /^\/auth\/logout\/?$/,
			handlers: route_2,
			params: () => ({})
		},

		{
			// auth/login.js
			pattern: /^\/auth\/login\/?$/,
			handlers: route_3,
			params: () => ({})
		},

		{
			// auth/save.js
			pattern: /^\/auth\/save\/?$/,
			handlers: route_4,
			params: () => ({})
		},

		{
			// auth/user.js
			pattern: /^\/auth\/user\/?$/,
			handlers: route_5,
			params: () => ({})
		}
	],

	pages: [
		{
			// index.svelte
			pattern: /^\/$/,
			parts: [
				{ name: "index", file: "index.svelte", component: Index$2 }
			]
		},

		{
			// japanliterature/index.svelte
			pattern: /^\/japanliterature\/?$/,
			parts: [
				{ name: "japanliterature", file: "japanliterature/index.svelte", component: Index$3 }
			]
		},

		{
			// japanliterature/VirtualList.svelte
			pattern: /^\/japanliterature\/VirtualList\/?$/,
			parts: [
				null,
				{ name: "japanliterature_VirtualList", file: "japanliterature/VirtualList.svelte", component: VirtualList }
			]
		},

		{
			// japanliterature/ListItem.svelte
			pattern: /^\/japanliterature\/ListItem\/?$/,
			parts: [
				null,
				{ name: "japanliterature_ListItem", file: "japanliterature/ListItem.svelte", component: ListItem }
			]
		},

		{
			// pageliterature/index.svelte
			pattern: /^\/pageliterature\/?$/,
			parts: [
				{ name: "pageliterature", file: "pageliterature/index.svelte", component: Index$4 }
			]
		},

		{
			// register/index.svelte
			pattern: /^\/register\/?$/,
			parts: [
				{ name: "register", file: "register/index.svelte", component: Index$5 }
			]
		},

		{
			// settings/index.svelte
			pattern: /^\/settings\/?$/,
			parts: [
				{ name: "settings", file: "settings/index.svelte", component: Index$6 }
			]
		},

		{
			// article/[slug].svelte
			pattern: /^\/article\/([^\/]+?)\/?$/,
			parts: [
				null,
				{ name: "article_$slug", file: "article/[slug].svelte", component: Slug, preload: preload, params: match => ({ slug: d(match[1]) }) }
			]
		},

		{
			// profile/index.svelte
			pattern: /^\/profile\/?$/,
			parts: [
				{ name: "profile", file: "profile/index.svelte", component: Index$7, preload: preload$1 }
			]
		},

		{
			// profile/[user]/index.svelte
			pattern: /^\/profile\/([^\/]+?)\/?$/,
			parts: [
				null,
				{ name: "profile_$user", file: "profile/[user]/index.svelte", component: Index$8, preload: preload$2, params: match => ({ user: d(match[1]) }) }
			]
		},

		{
			// profile/[user]/[view].svelte
			pattern: /^\/profile\/([^\/]+?)\/([^\/]+?)\/?$/,
			parts: [
				null,
				null,
				{ name: "profile_$user$93_$91view", file: "profile/[user]/[view].svelte", component: View, preload: preload$3, params: match => ({ user: d(match[1]), view: d(match[2]) }) }
			]
		},

		{
			// editor/index.svelte
			pattern: /^\/editor\/?$/,
			parts: [
				{ name: "editor", file: "editor/index.svelte", component: Index$9 }
			]
		},

		{
			// editor/[slug].svelte
			pattern: /^\/editor\/([^\/]+?)\/?$/,
			parts: [
				null,
				{ name: "editor_$slug", file: "editor/[slug].svelte", component: Slug$1, preload: preload$4, params: match => ({ slug: d(match[1]) }) }
			]
		},

		{
			// admin/index.svelte
			pattern: /^\/admin\/?$/,
			parts: [
				{ name: "admin", file: "admin/index.svelte", component: Index$a }
			]
		},

		{
			// login/index.svelte
			pattern: /^\/login\/?$/,
			parts: [
				{ name: "login", file: "login/index.svelte", component: Index$b }
			]
		},

		{
			// [p].svelte
			pattern: /^\/([^\/]+?)\/?$/,
			parts: [
				{ name: "$p", file: "[p].svelte", component: P, preload: preload$5, params: match => ({ p: d(match[1]) }) }
			]
		}
	],

	root: Layout,
	root_preload: () => {},
	error: Error$1
};

const build_dir = "__sapper__/build";

function get_server_route_handler(routes) {
	async function handle_route(route, req, res, next) {
		req.params = route.params(route.pattern.exec(req.path));

		const method = req.method.toLowerCase();
		// 'delete' cannot be exported from a module because it is a keyword,
		// so check for 'del' instead
		const method_export = method === 'delete' ? 'del' : method;
		const handle_method = route.handlers[method_export];
		if (handle_method) {
			if (process.env.SAPPER_EXPORT) {
				const { write, end, setHeader } = res;
				const chunks = [];
				const headers = {};

				// intercept data so that it can be exported
				res.write = function(chunk) {
					chunks.push(Buffer.from(chunk));
					write.apply(res, arguments);
				};

				res.setHeader = function(name, value) {
					headers[name.toLowerCase()] = value;
					setHeader.apply(res, arguments);
				};

				res.end = function(chunk) {
					if (chunk) chunks.push(Buffer.from(chunk));
					end.apply(res, arguments);

					process.send({
						__sapper__: true,
						event: 'file',
						url: req.url,
						method: req.method,
						status: res.statusCode,
						type: headers['content-type'],
						body: Buffer.concat(chunks).toString()
					});
				};
			}

			const handle_next = (err) => {
				if (err) {
					res.statusCode = 500;
					res.end(err.message);
				} else {
					process.nextTick(next);
				}
			};

			try {
				await handle_method(req, res, handle_next);
			} catch (err) {
				console.error(err);
				handle_next(err);
			}
		} else {
			// no matching handler for method
			process.nextTick(next);
		}
	}

	return function find_route(req, res, next) {
		for (const route of routes) {
			if (route.pattern.test(req.path)) {
				handle_route(route, req, res, next);
				return;
			}
		}

		next();
	};
}

/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 * @public
 */

var parse_1 = parse;
var serialize_1 = serialize;

/**
 * Module variables.
 * @private
 */

var decode = decodeURIComponent;
var encode = encodeURIComponent;
var pairSplitRegExp = /; */;

/**
 * RegExp to match field-content in RFC 7230 sec 3.2
 *
 * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
 * field-vchar   = VCHAR / obs-text
 * obs-text      = %x80-FF
 */

var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

/**
 * Parse a cookie header.
 *
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 *
 * @param {string} str
 * @param {object} [options]
 * @return {object}
 * @public
 */

function parse(str, options) {
  if (typeof str !== 'string') {
    throw new TypeError('argument str must be a string');
  }

  var obj = {};
  var opt = options || {};
  var pairs = str.split(pairSplitRegExp);
  var dec = opt.decode || decode;

  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i];
    var eq_idx = pair.indexOf('=');

    // skip things that don't look like key=value
    if (eq_idx < 0) {
      continue;
    }

    var key = pair.substr(0, eq_idx).trim();
    var val = pair.substr(++eq_idx, pair.length).trim();

    // quoted values
    if ('"' == val[0]) {
      val = val.slice(1, -1);
    }

    // only assign once
    if (undefined == obj[key]) {
      obj[key] = tryDecode(val, dec);
    }
  }

  return obj;
}

/**
 * Serialize data into a cookie header.
 *
 * Serialize the a name value pair into a cookie string suitable for
 * http headers. An optional options object specified cookie parameters.
 *
 * serialize('foo', 'bar', { httpOnly: true })
 *   => "foo=bar; httpOnly"
 *
 * @param {string} name
 * @param {string} val
 * @param {object} [options]
 * @return {string}
 * @public
 */

function serialize(name, val, options) {
  var opt = options || {};
  var enc = opt.encode || encode;

  if (typeof enc !== 'function') {
    throw new TypeError('option encode is invalid');
  }

  if (!fieldContentRegExp.test(name)) {
    throw new TypeError('argument name is invalid');
  }

  var value = enc(val);

  if (value && !fieldContentRegExp.test(value)) {
    throw new TypeError('argument val is invalid');
  }

  var str = name + '=' + value;

  if (null != opt.maxAge) {
    var maxAge = opt.maxAge - 0;
    if (isNaN(maxAge)) throw new Error('maxAge should be a Number');
    str += '; Max-Age=' + Math.floor(maxAge);
  }

  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new TypeError('option domain is invalid');
    }

    str += '; Domain=' + opt.domain;
  }

  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new TypeError('option path is invalid');
    }

    str += '; Path=' + opt.path;
  }

  if (opt.expires) {
    if (typeof opt.expires.toUTCString !== 'function') {
      throw new TypeError('option expires is invalid');
    }

    str += '; Expires=' + opt.expires.toUTCString();
  }

  if (opt.httpOnly) {
    str += '; HttpOnly';
  }

  if (opt.secure) {
    str += '; Secure';
  }

  if (opt.sameSite) {
    var sameSite = typeof opt.sameSite === 'string'
      ? opt.sameSite.toLowerCase() : opt.sameSite;

    switch (sameSite) {
      case true:
        str += '; SameSite=Strict';
        break;
      case 'lax':
        str += '; SameSite=Lax';
        break;
      case 'strict':
        str += '; SameSite=Strict';
        break;
      case 'none':
        str += '; SameSite=None';
        break;
      default:
        throw new TypeError('option sameSite is invalid');
    }
  }

  return str;
}

/**
 * Try decoding a string using a decoding function.
 *
 * @param {string} str
 * @param {function} decode
 * @private
 */

function tryDecode(str, decode) {
  try {
    return decode(str);
  } catch (e) {
    return str;
  }
}

var cookie = {
	parse: parse_1,
	serialize: serialize_1
};

var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$';
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
    '<': '\\u003C',
    '>': '\\u003E',
    '/': '\\u002F',
    '\\': '\\\\',
    '\b': '\\b',
    '\f': '\\f',
    '\n': '\\n',
    '\r': '\\r',
    '\t': '\\t',
    '\0': '\\0',
    '\u2028': '\\u2028',
    '\u2029': '\\u2029'
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join('\0');
function devalue(value) {
    var counts = new Map();
    function walk(thing) {
        if (typeof thing === 'function') {
            throw new Error("Cannot stringify a function");
        }
        if (counts.has(thing)) {
            counts.set(thing, counts.get(thing) + 1);
            return;
        }
        counts.set(thing, 1);
        if (!isPrimitive(thing)) {
            var type = getType(thing);
            switch (type) {
                case 'Number':
                case 'String':
                case 'Boolean':
                case 'Date':
                case 'RegExp':
                    return;
                case 'Array':
                    thing.forEach(walk);
                    break;
                case 'Set':
                case 'Map':
                    Array.from(thing).forEach(walk);
                    break;
                default:
                    var proto = Object.getPrototypeOf(thing);
                    if (proto !== Object.prototype &&
                        proto !== null &&
                        Object.getOwnPropertyNames(proto).sort().join('\0') !== objectProtoOwnPropertyNames) {
                        throw new Error("Cannot stringify arbitrary non-POJOs");
                    }
                    if (Object.getOwnPropertySymbols(thing).length > 0) {
                        throw new Error("Cannot stringify POJOs with symbolic keys");
                    }
                    Object.keys(thing).forEach(function (key) { return walk(thing[key]); });
            }
        }
    }
    walk(value);
    var names = new Map();
    Array.from(counts)
        .filter(function (entry) { return entry[1] > 1; })
        .sort(function (a, b) { return b[1] - a[1]; })
        .forEach(function (entry, i) {
        names.set(entry[0], getName(i));
    });
    function stringify(thing) {
        if (names.has(thing)) {
            return names.get(thing);
        }
        if (isPrimitive(thing)) {
            return stringifyPrimitive(thing);
        }
        var type = getType(thing);
        switch (type) {
            case 'Number':
            case 'String':
            case 'Boolean':
                return "Object(" + stringify(thing.valueOf()) + ")";
            case 'RegExp':
                return thing.toString();
            case 'Date':
                return "new Date(" + thing.getTime() + ")";
            case 'Array':
                var members = thing.map(function (v, i) { return i in thing ? stringify(v) : ''; });
                var tail = thing.length === 0 || (thing.length - 1 in thing) ? '' : ',';
                return "[" + members.join(',') + tail + "]";
            case 'Set':
            case 'Map':
                return "new " + type + "([" + Array.from(thing).map(stringify).join(',') + "])";
            default:
                var obj = "{" + Object.keys(thing).map(function (key) { return safeKey(key) + ":" + stringify(thing[key]); }).join(',') + "}";
                var proto = Object.getPrototypeOf(thing);
                if (proto === null) {
                    return Object.keys(thing).length > 0
                        ? "Object.assign(Object.create(null)," + obj + ")"
                        : "Object.create(null)";
                }
                return obj;
        }
    }
    var str = stringify(value);
    if (names.size) {
        var params_1 = [];
        var statements_1 = [];
        var values_1 = [];
        names.forEach(function (name, thing) {
            params_1.push(name);
            if (isPrimitive(thing)) {
                values_1.push(stringifyPrimitive(thing));
                return;
            }
            var type = getType(thing);
            switch (type) {
                case 'Number':
                case 'String':
                case 'Boolean':
                    values_1.push("Object(" + stringify(thing.valueOf()) + ")");
                    break;
                case 'RegExp':
                    values_1.push(thing.toString());
                    break;
                case 'Date':
                    values_1.push("new Date(" + thing.getTime() + ")");
                    break;
                case 'Array':
                    values_1.push("Array(" + thing.length + ")");
                    thing.forEach(function (v, i) {
                        statements_1.push(name + "[" + i + "]=" + stringify(v));
                    });
                    break;
                case 'Set':
                    values_1.push("new Set");
                    statements_1.push(name + "." + Array.from(thing).map(function (v) { return "add(" + stringify(v) + ")"; }).join('.'));
                    break;
                case 'Map':
                    values_1.push("new Map");
                    statements_1.push(name + "." + Array.from(thing).map(function (_a) {
                        var k = _a[0], v = _a[1];
                        return "set(" + stringify(k) + ", " + stringify(v) + ")";
                    }).join('.'));
                    break;
                default:
                    values_1.push(Object.getPrototypeOf(thing) === null ? 'Object.create(null)' : '{}');
                    Object.keys(thing).forEach(function (key) {
                        statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
                    });
            }
        });
        statements_1.push("return " + str);
        return "(function(" + params_1.join(',') + "){" + statements_1.join(';') + "}(" + values_1.join(',') + "))";
    }
    else {
        return str;
    }
}
function getName(num) {
    var name = '';
    do {
        name = chars[num % chars.length] + name;
        num = ~~(num / chars.length) - 1;
    } while (num >= 0);
    return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
    return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
    if (typeof thing === 'string')
        return stringifyString(thing);
    if (thing === void 0)
        return 'void 0';
    if (thing === 0 && 1 / thing < 0)
        return '-0';
    var str = String(thing);
    if (typeof thing === 'number')
        return str.replace(/^(-)?0\./, '$1.');
    return str;
}
function getType(thing) {
    return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
    return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
    return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
    return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
    return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
    var result = '"';
    for (var i = 0; i < str.length; i += 1) {
        var char = str.charAt(i);
        var code = char.charCodeAt(0);
        if (char === '"') {
            result += '\\"';
        }
        else if (char in escaped$1) {
            result += escaped$1[char];
        }
        else if (code >= 0xd800 && code <= 0xdfff) {
            var next = str.charCodeAt(i + 1);
            // If this is the beginning of a [high, low] surrogate pair,
            // add the next two characters, otherwise escape
            if (code <= 0xdbff && (next >= 0xdc00 && next <= 0xdfff)) {
                result += char + str[++i];
            }
            else {
                result += "\\u" + code.toString(16).toUpperCase();
            }
        }
        else {
            result += char;
        }
    }
    result += '"';
    return result;
}

// Based on https://github.com/tmpvar/jsdom/blob/aa85b2abf07766ff7bf5c1f6daafb3726f2f2db5/lib/jsdom/living/blob.js

// fix for "Readable" isn't a named export issue
const Readable = Stream.Readable;

const BUFFER = Symbol('buffer');
const TYPE = Symbol('type');

class Blob {
	constructor() {
		this[TYPE] = '';

		const blobParts = arguments[0];
		const options = arguments[1];

		const buffers = [];
		let size = 0;

		if (blobParts) {
			const a = blobParts;
			const length = Number(a.length);
			for (let i = 0; i < length; i++) {
				const element = a[i];
				let buffer;
				if (element instanceof Buffer) {
					buffer = element;
				} else if (ArrayBuffer.isView(element)) {
					buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
				} else if (element instanceof ArrayBuffer) {
					buffer = Buffer.from(element);
				} else if (element instanceof Blob) {
					buffer = element[BUFFER];
				} else {
					buffer = Buffer.from(typeof element === 'string' ? element : String(element));
				}
				size += buffer.length;
				buffers.push(buffer);
			}
		}

		this[BUFFER] = Buffer.concat(buffers);

		let type = options && options.type !== undefined && String(options.type).toLowerCase();
		if (type && !/[^\u0020-\u007E]/.test(type)) {
			this[TYPE] = type;
		}
	}
	get size() {
		return this[BUFFER].length;
	}
	get type() {
		return this[TYPE];
	}
	text() {
		return Promise.resolve(this[BUFFER].toString());
	}
	arrayBuffer() {
		const buf = this[BUFFER];
		const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		return Promise.resolve(ab);
	}
	stream() {
		const readable = new Readable();
		readable._read = function () {};
		readable.push(this[BUFFER]);
		readable.push(null);
		return readable;
	}
	toString() {
		return '[object Blob]';
	}
	slice() {
		const size = this.size;

		const start = arguments[0];
		const end = arguments[1];
		let relativeStart, relativeEnd;
		if (start === undefined) {
			relativeStart = 0;
		} else if (start < 0) {
			relativeStart = Math.max(size + start, 0);
		} else {
			relativeStart = Math.min(start, size);
		}
		if (end === undefined) {
			relativeEnd = size;
		} else if (end < 0) {
			relativeEnd = Math.max(size + end, 0);
		} else {
			relativeEnd = Math.min(end, size);
		}
		const span = Math.max(relativeEnd - relativeStart, 0);

		const buffer = this[BUFFER];
		const slicedBuffer = buffer.slice(relativeStart, relativeStart + span);
		const blob = new Blob([], { type: arguments[2] });
		blob[BUFFER] = slicedBuffer;
		return blob;
	}
}

Object.defineProperties(Blob.prototype, {
	size: { enumerable: true },
	type: { enumerable: true },
	slice: { enumerable: true }
});

Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
	value: 'Blob',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * fetch-error.js
 *
 * FetchError interface for operational errors
 */

/**
 * Create FetchError instance
 *
 * @param   String      message      Error message for human
 * @param   String      type         Error type for machine
 * @param   String      systemError  For Node.js system error
 * @return  FetchError
 */
function FetchError(message, type, systemError) {
  Error.call(this, message);

  this.message = message;
  this.type = type;

  // when err.type is `system`, err.code contains system error code
  if (systemError) {
    this.code = this.errno = systemError.code;
  }

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

FetchError.prototype = Object.create(Error.prototype);
FetchError.prototype.constructor = FetchError;
FetchError.prototype.name = 'FetchError';

let convert;
try {
	convert = require('encoding').convert;
} catch (e) {}

const INTERNALS = Symbol('Body internals');

// fix an issue where "PassThrough" isn't a named export for node <10
const PassThrough = Stream.PassThrough;

/**
 * Body mixin
 *
 * Ref: https://fetch.spec.whatwg.org/#body
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
function Body(body) {
	var _this = this;

	var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    _ref$size = _ref.size;

	let size = _ref$size === undefined ? 0 : _ref$size;
	var _ref$timeout = _ref.timeout;
	let timeout = _ref$timeout === undefined ? 0 : _ref$timeout;

	if (body == null) {
		// body is undefined or null
		body = null;
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		body = Buffer.from(body.toString());
	} else if (isBlob(body)) ; else if (Buffer.isBuffer(body)) ; else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		body = Buffer.from(body);
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
	} else if (body instanceof Stream) ; else {
		// none of the above
		// coerce to string then buffer
		body = Buffer.from(String(body));
	}
	this[INTERNALS] = {
		body,
		disturbed: false,
		error: null
	};
	this.size = size;
	this.timeout = timeout;

	if (body instanceof Stream) {
		body.on('error', function (err) {
			const error = err.name === 'AbortError' ? err : new FetchError(`Invalid response body while trying to fetch ${_this.url}: ${err.message}`, 'system', err);
			_this[INTERNALS].error = error;
		});
	}
}

Body.prototype = {
	get body() {
		return this[INTERNALS].body;
	},

	get bodyUsed() {
		return this[INTERNALS].disturbed;
	},

	/**
  * Decode response as ArrayBuffer
  *
  * @return  Promise
  */
	arrayBuffer() {
		return consumeBody.call(this).then(function (buf) {
			return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		});
	},

	/**
  * Return raw response as Blob
  *
  * @return Promise
  */
	blob() {
		let ct = this.headers && this.headers.get('content-type') || '';
		return consumeBody.call(this).then(function (buf) {
			return Object.assign(
			// Prevent copying
			new Blob([], {
				type: ct.toLowerCase()
			}), {
				[BUFFER]: buf
			});
		});
	},

	/**
  * Decode response as json
  *
  * @return  Promise
  */
	json() {
		var _this2 = this;

		return consumeBody.call(this).then(function (buffer) {
			try {
				return JSON.parse(buffer.toString());
			} catch (err) {
				return Body.Promise.reject(new FetchError(`invalid json response body at ${_this2.url} reason: ${err.message}`, 'invalid-json'));
			}
		});
	},

	/**
  * Decode response as text
  *
  * @return  Promise
  */
	text() {
		return consumeBody.call(this).then(function (buffer) {
			return buffer.toString();
		});
	},

	/**
  * Decode response as buffer (non-spec api)
  *
  * @return  Promise
  */
	buffer() {
		return consumeBody.call(this);
	},

	/**
  * Decode response as text, while automatically detecting the encoding and
  * trying to decode to UTF-8 (non-spec api)
  *
  * @return  Promise
  */
	textConverted() {
		var _this3 = this;

		return consumeBody.call(this).then(function (buffer) {
			return convertBody(buffer, _this3.headers);
		});
	}
};

// In browsers, all properties are enumerable.
Object.defineProperties(Body.prototype, {
	body: { enumerable: true },
	bodyUsed: { enumerable: true },
	arrayBuffer: { enumerable: true },
	blob: { enumerable: true },
	json: { enumerable: true },
	text: { enumerable: true }
});

Body.mixIn = function (proto) {
	for (const name of Object.getOwnPropertyNames(Body.prototype)) {
		// istanbul ignore else: future proof
		if (!(name in proto)) {
			const desc = Object.getOwnPropertyDescriptor(Body.prototype, name);
			Object.defineProperty(proto, name, desc);
		}
	}
};

/**
 * Consume and convert an entire Body to a Buffer.
 *
 * Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
 *
 * @return  Promise
 */
function consumeBody() {
	var _this4 = this;

	if (this[INTERNALS].disturbed) {
		return Body.Promise.reject(new TypeError(`body used already for: ${this.url}`));
	}

	this[INTERNALS].disturbed = true;

	if (this[INTERNALS].error) {
		return Body.Promise.reject(this[INTERNALS].error);
	}

	let body = this.body;

	// body is null
	if (body === null) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is blob
	if (isBlob(body)) {
		body = body.stream();
	}

	// body is buffer
	if (Buffer.isBuffer(body)) {
		return Body.Promise.resolve(body);
	}

	// istanbul ignore if: should never happen
	if (!(body instanceof Stream)) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is stream
	// get ready to actually consume the body
	let accum = [];
	let accumBytes = 0;
	let abort = false;

	return new Body.Promise(function (resolve, reject) {
		let resTimeout;

		// allow timeout on slow response body
		if (_this4.timeout) {
			resTimeout = setTimeout(function () {
				abort = true;
				reject(new FetchError(`Response timeout while trying to fetch ${_this4.url} (over ${_this4.timeout}ms)`, 'body-timeout'));
			}, _this4.timeout);
		}

		// handle stream errors
		body.on('error', function (err) {
			if (err.name === 'AbortError') {
				// if the request was aborted, reject with this Error
				abort = true;
				reject(err);
			} else {
				// other errors, such as incorrect content-encoding
				reject(new FetchError(`Invalid response body while trying to fetch ${_this4.url}: ${err.message}`, 'system', err));
			}
		});

		body.on('data', function (chunk) {
			if (abort || chunk === null) {
				return;
			}

			if (_this4.size && accumBytes + chunk.length > _this4.size) {
				abort = true;
				reject(new FetchError(`content size at ${_this4.url} over limit: ${_this4.size}`, 'max-size'));
				return;
			}

			accumBytes += chunk.length;
			accum.push(chunk);
		});

		body.on('end', function () {
			if (abort) {
				return;
			}

			clearTimeout(resTimeout);

			try {
				resolve(Buffer.concat(accum, accumBytes));
			} catch (err) {
				// handle streams that have accumulated too much data (issue #414)
				reject(new FetchError(`Could not create Buffer from response body for ${_this4.url}: ${err.message}`, 'system', err));
			}
		});
	});
}

/**
 * Detect buffer encoding and convert to target encoding
 * ref: http://www.w3.org/TR/2011/WD-html5-20110113/parsing.html#determining-the-character-encoding
 *
 * @param   Buffer  buffer    Incoming buffer
 * @param   String  encoding  Target encoding
 * @return  String
 */
function convertBody(buffer, headers) {
	if (typeof convert !== 'function') {
		throw new Error('The package `encoding` must be installed to use the textConverted() function');
	}

	const ct = headers.get('content-type');
	let charset = 'utf-8';
	let res, str;

	// header
	if (ct) {
		res = /charset=([^;]*)/i.exec(ct);
	}

	// no charset in content type, peek at response body for at most 1024 bytes
	str = buffer.slice(0, 1024).toString();

	// html5
	if (!res && str) {
		res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
	}

	// html4
	if (!res && str) {
		res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str);

		if (res) {
			res = /charset=(.*)/i.exec(res.pop());
		}
	}

	// xml
	if (!res && str) {
		res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
	}

	// found charset
	if (res) {
		charset = res.pop();

		// prevent decode issues when sites use incorrect encoding
		// ref: https://hsivonen.fi/encoding-menu/
		if (charset === 'gb2312' || charset === 'gbk') {
			charset = 'gb18030';
		}
	}

	// turn raw buffers into a single utf-8 buffer
	return convert(buffer, 'UTF-8', charset).toString();
}

/**
 * Detect a URLSearchParams object
 * ref: https://github.com/bitinn/node-fetch/issues/296#issuecomment-307598143
 *
 * @param   Object  obj     Object to detect by type or brand
 * @return  String
 */
function isURLSearchParams(obj) {
	// Duck-typing as a necessary condition.
	if (typeof obj !== 'object' || typeof obj.append !== 'function' || typeof obj.delete !== 'function' || typeof obj.get !== 'function' || typeof obj.getAll !== 'function' || typeof obj.has !== 'function' || typeof obj.set !== 'function') {
		return false;
	}

	// Brand-checking and more duck-typing as optional condition.
	return obj.constructor.name === 'URLSearchParams' || Object.prototype.toString.call(obj) === '[object URLSearchParams]' || typeof obj.sort === 'function';
}

/**
 * Check if `obj` is a W3C `Blob` object (which `File` inherits from)
 * @param  {*} obj
 * @return {boolean}
 */
function isBlob(obj) {
	return typeof obj === 'object' && typeof obj.arrayBuffer === 'function' && typeof obj.type === 'string' && typeof obj.stream === 'function' && typeof obj.constructor === 'function' && typeof obj.constructor.name === 'string' && /^(Blob|File)$/.test(obj.constructor.name) && /^(Blob|File)$/.test(obj[Symbol.toStringTag]);
}

/**
 * Clone body given Res/Req instance
 *
 * @param   Mixed  instance  Response or Request instance
 * @return  Mixed
 */
function clone(instance) {
	let p1, p2;
	let body = instance.body;

	// don't allow cloning a used body
	if (instance.bodyUsed) {
		throw new Error('cannot clone body after it is used');
	}

	// check that body is a stream and not form-data object
	// note: we can't clone the form-data object without having it as a dependency
	if (body instanceof Stream && typeof body.getBoundary !== 'function') {
		// tee instance body
		p1 = new PassThrough();
		p2 = new PassThrough();
		body.pipe(p1);
		body.pipe(p2);
		// set instance body to teed body and return the other teed body
		instance[INTERNALS].body = p1;
		body = p2;
	}

	return body;
}

/**
 * Performs the operation "extract a `Content-Type` value from |object|" as
 * specified in the specification:
 * https://fetch.spec.whatwg.org/#concept-bodyinit-extract
 *
 * This function assumes that instance.body is present.
 *
 * @param   Mixed  instance  Any options.body input
 */
function extractContentType(body) {
	if (body === null) {
		// body is null
		return null;
	} else if (typeof body === 'string') {
		// body is string
		return 'text/plain;charset=UTF-8';
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		return 'application/x-www-form-urlencoded;charset=UTF-8';
	} else if (isBlob(body)) {
		// body is blob
		return body.type || null;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return null;
	} else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		return null;
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		return null;
	} else if (typeof body.getBoundary === 'function') {
		// detect form data input from form-data module
		return `multipart/form-data;boundary=${body.getBoundary()}`;
	} else if (body instanceof Stream) {
		// body is stream
		// can't really do much about this
		return null;
	} else {
		// Body constructor defaults other things to string
		return 'text/plain;charset=UTF-8';
	}
}

/**
 * The Fetch Standard treats this as if "total bytes" is a property on the body.
 * For us, we have to explicitly get it with a function.
 *
 * ref: https://fetch.spec.whatwg.org/#concept-body-total-bytes
 *
 * @param   Body    instance   Instance of Body
 * @return  Number?            Number of bytes, or null if not possible
 */
function getTotalBytes(instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		return 0;
	} else if (isBlob(body)) {
		return body.size;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return body.length;
	} else if (body && typeof body.getLengthSync === 'function') {
		// detect form data input from form-data module
		if (body._lengthRetrievers && body._lengthRetrievers.length == 0 || // 1.x
		body.hasKnownLength && body.hasKnownLength()) {
			// 2.x
			return body.getLengthSync();
		}
		return null;
	} else {
		// body is stream
		return null;
	}
}

/**
 * Write a Body to a Node.js WritableStream (e.g. http.Request) object.
 *
 * @param   Body    instance   Instance of Body
 * @return  Void
 */
function writeToStream(dest, instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		dest.end();
	} else if (isBlob(body)) {
		body.stream().pipe(dest);
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		dest.write(body);
		dest.end();
	} else {
		// body is stream
		body.pipe(dest);
	}
}

// expose Promise
Body.Promise = global.Promise;

/**
 * headers.js
 *
 * Headers class offers convenient helpers
 */

const invalidTokenRegex = /[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/;
const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;

function validateName(name) {
	name = `${name}`;
	if (invalidTokenRegex.test(name) || name === '') {
		throw new TypeError(`${name} is not a legal HTTP header name`);
	}
}

function validateValue(value) {
	value = `${value}`;
	if (invalidHeaderCharRegex.test(value)) {
		throw new TypeError(`${value} is not a legal HTTP header value`);
	}
}

/**
 * Find the key in the map object given a header name.
 *
 * Returns undefined if not found.
 *
 * @param   String  name  Header name
 * @return  String|Undefined
 */
function find(map, name) {
	name = name.toLowerCase();
	for (const key in map) {
		if (key.toLowerCase() === name) {
			return key;
		}
	}
	return undefined;
}

const MAP = Symbol('map');
class Headers {
	/**
  * Headers class
  *
  * @param   Object  headers  Response headers
  * @return  Void
  */
	constructor() {
		let init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

		this[MAP] = Object.create(null);

		if (init instanceof Headers) {
			const rawHeaders = init.raw();
			const headerNames = Object.keys(rawHeaders);

			for (const headerName of headerNames) {
				for (const value of rawHeaders[headerName]) {
					this.append(headerName, value);
				}
			}

			return;
		}

		// We don't worry about converting prop to ByteString here as append()
		// will handle it.
		if (init == null) ; else if (typeof init === 'object') {
			const method = init[Symbol.iterator];
			if (method != null) {
				if (typeof method !== 'function') {
					throw new TypeError('Header pairs must be iterable');
				}

				// sequence<sequence<ByteString>>
				// Note: per spec we have to first exhaust the lists then process them
				const pairs = [];
				for (const pair of init) {
					if (typeof pair !== 'object' || typeof pair[Symbol.iterator] !== 'function') {
						throw new TypeError('Each header pair must be iterable');
					}
					pairs.push(Array.from(pair));
				}

				for (const pair of pairs) {
					if (pair.length !== 2) {
						throw new TypeError('Each header pair must be a name/value tuple');
					}
					this.append(pair[0], pair[1]);
				}
			} else {
				// record<ByteString, ByteString>
				for (const key of Object.keys(init)) {
					const value = init[key];
					this.append(key, value);
				}
			}
		} else {
			throw new TypeError('Provided initializer must be an object');
		}
	}

	/**
  * Return combined header value given name
  *
  * @param   String  name  Header name
  * @return  Mixed
  */
	get(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key === undefined) {
			return null;
		}

		return this[MAP][key].join(', ');
	}

	/**
  * Iterate over all headers
  *
  * @param   Function  callback  Executed for each item with parameters (value, name, thisArg)
  * @param   Boolean   thisArg   `this` context for callback function
  * @return  Void
  */
	forEach(callback) {
		let thisArg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

		let pairs = getHeaders(this);
		let i = 0;
		while (i < pairs.length) {
			var _pairs$i = pairs[i];
			const name = _pairs$i[0],
			      value = _pairs$i[1];

			callback.call(thisArg, value, name, this);
			pairs = getHeaders(this);
			i++;
		}
	}

	/**
  * Overwrite header values given name
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	set(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		this[MAP][key !== undefined ? key : name] = [value];
	}

	/**
  * Append a value onto existing header
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	append(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			this[MAP][key].push(value);
		} else {
			this[MAP][name] = [value];
		}
	}

	/**
  * Check for header name existence
  *
  * @param   String   name  Header name
  * @return  Boolean
  */
	has(name) {
		name = `${name}`;
		validateName(name);
		return find(this[MAP], name) !== undefined;
	}

	/**
  * Delete all header values given name
  *
  * @param   String  name  Header name
  * @return  Void
  */
	delete(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			delete this[MAP][key];
		}
	}

	/**
  * Return raw headers (non-spec api)
  *
  * @return  Object
  */
	raw() {
		return this[MAP];
	}

	/**
  * Get an iterator on keys.
  *
  * @return  Iterator
  */
	keys() {
		return createHeadersIterator(this, 'key');
	}

	/**
  * Get an iterator on values.
  *
  * @return  Iterator
  */
	values() {
		return createHeadersIterator(this, 'value');
	}

	/**
  * Get an iterator on entries.
  *
  * This is the default iterator of the Headers object.
  *
  * @return  Iterator
  */
	[Symbol.iterator]() {
		return createHeadersIterator(this, 'key+value');
	}
}
Headers.prototype.entries = Headers.prototype[Symbol.iterator];

Object.defineProperty(Headers.prototype, Symbol.toStringTag, {
	value: 'Headers',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Headers.prototype, {
	get: { enumerable: true },
	forEach: { enumerable: true },
	set: { enumerable: true },
	append: { enumerable: true },
	has: { enumerable: true },
	delete: { enumerable: true },
	keys: { enumerable: true },
	values: { enumerable: true },
	entries: { enumerable: true }
});

function getHeaders(headers) {
	let kind = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'key+value';

	const keys = Object.keys(headers[MAP]).sort();
	return keys.map(kind === 'key' ? function (k) {
		return k.toLowerCase();
	} : kind === 'value' ? function (k) {
		return headers[MAP][k].join(', ');
	} : function (k) {
		return [k.toLowerCase(), headers[MAP][k].join(', ')];
	});
}

const INTERNAL = Symbol('internal');

function createHeadersIterator(target, kind) {
	const iterator = Object.create(HeadersIteratorPrototype);
	iterator[INTERNAL] = {
		target,
		kind,
		index: 0
	};
	return iterator;
}

const HeadersIteratorPrototype = Object.setPrototypeOf({
	next() {
		// istanbul ignore if
		if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) {
			throw new TypeError('Value of `this` is not a HeadersIterator');
		}

		var _INTERNAL = this[INTERNAL];
		const target = _INTERNAL.target,
		      kind = _INTERNAL.kind,
		      index = _INTERNAL.index;

		const values = getHeaders(target, kind);
		const len = values.length;
		if (index >= len) {
			return {
				value: undefined,
				done: true
			};
		}

		this[INTERNAL].index = index + 1;

		return {
			value: values[index],
			done: false
		};
	}
}, Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));

Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
	value: 'HeadersIterator',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * Export the Headers object in a form that Node.js can consume.
 *
 * @param   Headers  headers
 * @return  Object
 */
function exportNodeCompatibleHeaders(headers) {
	const obj = Object.assign({ __proto__: null }, headers[MAP]);

	// http.request() only supports string as Host header. This hack makes
	// specifying custom Host header possible.
	const hostHeaderKey = find(headers[MAP], 'Host');
	if (hostHeaderKey !== undefined) {
		obj[hostHeaderKey] = obj[hostHeaderKey][0];
	}

	return obj;
}

/**
 * Create a Headers object from an object of headers, ignoring those that do
 * not conform to HTTP grammar productions.
 *
 * @param   Object  obj  Object of headers
 * @return  Headers
 */
function createHeadersLenient(obj) {
	const headers = new Headers();
	for (const name of Object.keys(obj)) {
		if (invalidTokenRegex.test(name)) {
			continue;
		}
		if (Array.isArray(obj[name])) {
			for (const val of obj[name]) {
				if (invalidHeaderCharRegex.test(val)) {
					continue;
				}
				if (headers[MAP][name] === undefined) {
					headers[MAP][name] = [val];
				} else {
					headers[MAP][name].push(val);
				}
			}
		} else if (!invalidHeaderCharRegex.test(obj[name])) {
			headers[MAP][name] = [obj[name]];
		}
	}
	return headers;
}

const INTERNALS$1 = Symbol('Response internals');

// fix an issue where "STATUS_CODES" aren't a named export for node <10
const STATUS_CODES = http.STATUS_CODES;

/**
 * Response class
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
class Response {
	constructor() {
		let body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
		let opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		Body.call(this, body, opts);

		const status = opts.status || 200;
		const headers = new Headers(opts.headers);

		if (body != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(body);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		this[INTERNALS$1] = {
			url: opts.url,
			status,
			statusText: opts.statusText || STATUS_CODES[status],
			headers,
			counter: opts.counter
		};
	}

	get url() {
		return this[INTERNALS$1].url || '';
	}

	get status() {
		return this[INTERNALS$1].status;
	}

	/**
  * Convenience property representing if the request ended normally
  */
	get ok() {
		return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
	}

	get redirected() {
		return this[INTERNALS$1].counter > 0;
	}

	get statusText() {
		return this[INTERNALS$1].statusText;
	}

	get headers() {
		return this[INTERNALS$1].headers;
	}

	/**
  * Clone this response
  *
  * @return  Response
  */
	clone() {
		return new Response(clone(this), {
			url: this.url,
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
			ok: this.ok,
			redirected: this.redirected
		});
	}
}

Body.mixIn(Response.prototype);

Object.defineProperties(Response.prototype, {
	url: { enumerable: true },
	status: { enumerable: true },
	ok: { enumerable: true },
	redirected: { enumerable: true },
	statusText: { enumerable: true },
	headers: { enumerable: true },
	clone: { enumerable: true }
});

Object.defineProperty(Response.prototype, Symbol.toStringTag, {
	value: 'Response',
	writable: false,
	enumerable: false,
	configurable: true
});

const INTERNALS$2 = Symbol('Request internals');

// fix an issue where "format", "parse" aren't a named export for node <10
const parse_url = Url.parse;
const format_url = Url.format;

const streamDestructionSupported = 'destroy' in Stream.Readable.prototype;

/**
 * Check if a value is an instance of Request.
 *
 * @param   Mixed   input
 * @return  Boolean
 */
function isRequest(input) {
	return typeof input === 'object' && typeof input[INTERNALS$2] === 'object';
}

function isAbortSignal(signal) {
	const proto = signal && typeof signal === 'object' && Object.getPrototypeOf(signal);
	return !!(proto && proto.constructor.name === 'AbortSignal');
}

/**
 * Request class
 *
 * @param   Mixed   input  Url or Request instance
 * @param   Object  init   Custom options
 * @return  Void
 */
class Request {
	constructor(input) {
		let init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		let parsedURL;

		// normalize input
		if (!isRequest(input)) {
			if (input && input.href) {
				// in order to support Node.js' Url objects; though WHATWG's URL objects
				// will fall into this branch also (since their `toString()` will return
				// `href` property anyway)
				parsedURL = parse_url(input.href);
			} else {
				// coerce input to a string before attempting to parse
				parsedURL = parse_url(`${input}`);
			}
			input = {};
		} else {
			parsedURL = parse_url(input.url);
		}

		let method = init.method || input.method || 'GET';
		method = method.toUpperCase();

		if ((init.body != null || isRequest(input) && input.body !== null) && (method === 'GET' || method === 'HEAD')) {
			throw new TypeError('Request with GET/HEAD method cannot have body');
		}

		let inputBody = init.body != null ? init.body : isRequest(input) && input.body !== null ? clone(input) : null;

		Body.call(this, inputBody, {
			timeout: init.timeout || input.timeout || 0,
			size: init.size || input.size || 0
		});

		const headers = new Headers(init.headers || input.headers || {});

		if (inputBody != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(inputBody);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		let signal = isRequest(input) ? input.signal : null;
		if ('signal' in init) signal = init.signal;

		if (signal != null && !isAbortSignal(signal)) {
			throw new TypeError('Expected signal to be an instanceof AbortSignal');
		}

		this[INTERNALS$2] = {
			method,
			redirect: init.redirect || input.redirect || 'follow',
			headers,
			parsedURL,
			signal
		};

		// node-fetch-only options
		this.follow = init.follow !== undefined ? init.follow : input.follow !== undefined ? input.follow : 20;
		this.compress = init.compress !== undefined ? init.compress : input.compress !== undefined ? input.compress : true;
		this.counter = init.counter || input.counter || 0;
		this.agent = init.agent || input.agent;
	}

	get method() {
		return this[INTERNALS$2].method;
	}

	get url() {
		return format_url(this[INTERNALS$2].parsedURL);
	}

	get headers() {
		return this[INTERNALS$2].headers;
	}

	get redirect() {
		return this[INTERNALS$2].redirect;
	}

	get signal() {
		return this[INTERNALS$2].signal;
	}

	/**
  * Clone this request
  *
  * @return  Request
  */
	clone() {
		return new Request(this);
	}
}

Body.mixIn(Request.prototype);

Object.defineProperty(Request.prototype, Symbol.toStringTag, {
	value: 'Request',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Request.prototype, {
	method: { enumerable: true },
	url: { enumerable: true },
	headers: { enumerable: true },
	redirect: { enumerable: true },
	clone: { enumerable: true },
	signal: { enumerable: true }
});

/**
 * Convert a Request to Node.js http request options.
 *
 * @param   Request  A Request instance
 * @return  Object   The options object to be passed to http.request
 */
function getNodeRequestOptions(request) {
	const parsedURL = request[INTERNALS$2].parsedURL;
	const headers = new Headers(request[INTERNALS$2].headers);

	// fetch step 1.3
	if (!headers.has('Accept')) {
		headers.set('Accept', '*/*');
	}

	// Basic fetch
	if (!parsedURL.protocol || !parsedURL.hostname) {
		throw new TypeError('Only absolute URLs are supported');
	}

	if (!/^https?:$/.test(parsedURL.protocol)) {
		throw new TypeError('Only HTTP(S) protocols are supported');
	}

	if (request.signal && request.body instanceof Stream.Readable && !streamDestructionSupported) {
		throw new Error('Cancellation of streamed requests with AbortSignal is not supported in node < 8');
	}

	// HTTP-network-or-cache fetch steps 2.4-2.7
	let contentLengthValue = null;
	if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
		contentLengthValue = '0';
	}
	if (request.body != null) {
		const totalBytes = getTotalBytes(request);
		if (typeof totalBytes === 'number') {
			contentLengthValue = String(totalBytes);
		}
	}
	if (contentLengthValue) {
		headers.set('Content-Length', contentLengthValue);
	}

	// HTTP-network-or-cache fetch step 2.11
	if (!headers.has('User-Agent')) {
		headers.set('User-Agent', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)');
	}

	// HTTP-network-or-cache fetch step 2.15
	if (request.compress && !headers.has('Accept-Encoding')) {
		headers.set('Accept-Encoding', 'gzip,deflate');
	}

	let agent = request.agent;
	if (typeof agent === 'function') {
		agent = agent(parsedURL);
	}

	if (!headers.has('Connection') && !agent) {
		headers.set('Connection', 'close');
	}

	// HTTP-network fetch step 4.2
	// chunked encoding is handled by Node.js

	return Object.assign({}, parsedURL, {
		method: request.method,
		headers: exportNodeCompatibleHeaders(headers),
		agent
	});
}

/**
 * abort-error.js
 *
 * AbortError interface for cancelled requests
 */

/**
 * Create AbortError instance
 *
 * @param   String      message      Error message for human
 * @return  AbortError
 */
function AbortError(message) {
  Error.call(this, message);

  this.type = 'aborted';
  this.message = message;

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

AbortError.prototype = Object.create(Error.prototype);
AbortError.prototype.constructor = AbortError;
AbortError.prototype.name = 'AbortError';

// fix an issue where "PassThrough", "resolve" aren't a named export for node <10
const PassThrough$1 = Stream.PassThrough;
const resolve_url = Url.resolve;

/**
 * Fetch function
 *
 * @param   Mixed    url   Absolute url or Request instance
 * @param   Object   opts  Fetch options
 * @return  Promise
 */
function fetch(url, opts) {

	// allow custom promise
	if (!fetch.Promise) {
		throw new Error('native promise missing, set fetch.Promise to your favorite alternative');
	}

	Body.Promise = fetch.Promise;

	// wrap http.request into fetch
	return new fetch.Promise(function (resolve, reject) {
		// build request object
		const request = new Request(url, opts);
		const options = getNodeRequestOptions(request);

		const send = (options.protocol === 'https:' ? https : http).request;
		const signal = request.signal;

		let response = null;

		const abort = function abort() {
			let error = new AbortError('The user aborted a request.');
			reject(error);
			if (request.body && request.body instanceof Stream.Readable) {
				request.body.destroy(error);
			}
			if (!response || !response.body) return;
			response.body.emit('error', error);
		};

		if (signal && signal.aborted) {
			abort();
			return;
		}

		const abortAndFinalize = function abortAndFinalize() {
			abort();
			finalize();
		};

		// send request
		const req = send(options);
		let reqTimeout;

		if (signal) {
			signal.addEventListener('abort', abortAndFinalize);
		}

		function finalize() {
			req.abort();
			if (signal) signal.removeEventListener('abort', abortAndFinalize);
			clearTimeout(reqTimeout);
		}

		if (request.timeout) {
			req.once('socket', function (socket) {
				reqTimeout = setTimeout(function () {
					reject(new FetchError(`network timeout at: ${request.url}`, 'request-timeout'));
					finalize();
				}, request.timeout);
			});
		}

		req.on('error', function (err) {
			reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, 'system', err));
			finalize();
		});

		req.on('response', function (res) {
			clearTimeout(reqTimeout);

			const headers = createHeadersLenient(res.headers);

			// HTTP fetch step 5
			if (fetch.isRedirect(res.statusCode)) {
				// HTTP fetch step 5.2
				const location = headers.get('Location');

				// HTTP fetch step 5.3
				const locationURL = location === null ? null : resolve_url(request.url, location);

				// HTTP fetch step 5.5
				switch (request.redirect) {
					case 'error':
						reject(new FetchError(`redirect mode is set to error: ${request.url}`, 'no-redirect'));
						finalize();
						return;
					case 'manual':
						// node-fetch-specific step: make manual redirect a bit easier to use by setting the Location header value to the resolved URL.
						if (locationURL !== null) {
							// handle corrupted header
							try {
								headers.set('Location', locationURL);
							} catch (err) {
								// istanbul ignore next: nodejs server prevent invalid response headers, we can't test this through normal request
								reject(err);
							}
						}
						break;
					case 'follow':
						// HTTP-redirect fetch step 2
						if (locationURL === null) {
							break;
						}

						// HTTP-redirect fetch step 5
						if (request.counter >= request.follow) {
							reject(new FetchError(`maximum redirect reached at: ${request.url}`, 'max-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 6 (counter increment)
						// Create a new Request object.
						const requestOpts = {
							headers: new Headers(request.headers),
							follow: request.follow,
							counter: request.counter + 1,
							agent: request.agent,
							compress: request.compress,
							method: request.method,
							body: request.body,
							signal: request.signal,
							timeout: request.timeout
						};

						// HTTP-redirect fetch step 9
						if (res.statusCode !== 303 && request.body && getTotalBytes(request) === null) {
							reject(new FetchError('Cannot follow redirect with body being a readable stream', 'unsupported-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 11
						if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === 'POST') {
							requestOpts.method = 'GET';
							requestOpts.body = undefined;
							requestOpts.headers.delete('content-length');
						}

						// HTTP-redirect fetch step 15
						resolve(fetch(new Request(locationURL, requestOpts)));
						finalize();
						return;
				}
			}

			// prepare response
			res.once('end', function () {
				if (signal) signal.removeEventListener('abort', abortAndFinalize);
			});
			let body = res.pipe(new PassThrough$1());

			const response_options = {
				url: request.url,
				status: res.statusCode,
				statusText: res.statusMessage,
				headers: headers,
				size: request.size,
				timeout: request.timeout,
				counter: request.counter
			};

			// HTTP-network fetch step 12.1.1.3
			const codings = headers.get('Content-Encoding');

			// HTTP-network fetch step 12.1.1.4: handle content codings

			// in following scenarios we ignore compression support
			// 1. compression support is disabled
			// 2. HEAD request
			// 3. no Content-Encoding header
			// 4. no content response (204)
			// 5. content not modified response (304)
			if (!request.compress || request.method === 'HEAD' || codings === null || res.statusCode === 204 || res.statusCode === 304) {
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// For Node v6+
			// Be less strict when decoding compressed responses, since sometimes
			// servers send slightly invalid responses that are still accepted
			// by common browsers.
			// Always using Z_SYNC_FLUSH is what cURL does.
			const zlibOptions = {
				flush: zlib.Z_SYNC_FLUSH,
				finishFlush: zlib.Z_SYNC_FLUSH
			};

			// for gzip
			if (codings == 'gzip' || codings == 'x-gzip') {
				body = body.pipe(zlib.createGunzip(zlibOptions));
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// for deflate
			if (codings == 'deflate' || codings == 'x-deflate') {
				// handle the infamous raw deflate response from old servers
				// a hack for old IIS and Apache servers
				const raw = res.pipe(new PassThrough$1());
				raw.once('data', function (chunk) {
					// see http://stackoverflow.com/questions/37519828
					if ((chunk[0] & 0x0F) === 0x08) {
						body = body.pipe(zlib.createInflate());
					} else {
						body = body.pipe(zlib.createInflateRaw());
					}
					response = new Response(body, response_options);
					resolve(response);
				});
				return;
			}

			// for br
			if (codings == 'br' && typeof zlib.createBrotliDecompress === 'function') {
				body = body.pipe(zlib.createBrotliDecompress());
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// otherwise, use response as-is
			response = new Response(body, response_options);
			resolve(response);
		});

		writeToStream(req, request);
	});
}
/**
 * Redirect code matching
 *
 * @param   Number   code  Status code
 * @return  Boolean
 */
fetch.isRedirect = function (code) {
	return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
};

// expose Promise
fetch.Promise = global.Promise;

function get_page_handler(
	manifest,
	session_getter
) {
	const get_build_info =  (assets => () => assets)(JSON.parse(fs.readFileSync(path.join(build_dir, 'build.json'), 'utf-8')));

	const template =  (str => () => str)(read_template(build_dir));

	const has_service_worker = fs.existsSync(path.join(build_dir, 'service-worker.js'));

	const { server_routes, pages } = manifest;
	const error_route = manifest.error;

	function bail(req, res, err) {
		console.error(err);

		const message =  'Internal server error';

		res.statusCode = 500;
		res.end(`<pre>${message}</pre>`);
	}

	function handle_error(req, res, statusCode, error) {
		handle_page({
			pattern: null,
			parts: [
				{ name: null, component: error_route }
			]
		}, req, res, statusCode, error || new Error('Unknown error in preload function'));
	}

	async function handle_page(page, req, res, status = 200, error = null) {
		const is_service_worker_index = req.path === '/service-worker-index.html';
		const build_info




 = get_build_info();

		res.setHeader('Content-Type', 'text/html');
		res.setHeader('Cache-Control',  'max-age=600');

		// preload main.js and current route
		// TODO detect other stuff we can preload? images, CSS, fonts?
		let preloaded_chunks = Array.isArray(build_info.assets.main) ? build_info.assets.main : [build_info.assets.main];
		if (!error && !is_service_worker_index) {
			page.parts.forEach(part => {
				if (!part) return;

				// using concat because it could be a string or an array. thanks webpack!
				preloaded_chunks = preloaded_chunks.concat(build_info.assets[part.name]);
			});
		}

		if (build_info.bundler === 'rollup') {
			// TODO add dependencies and CSS
			const link = preloaded_chunks
				.filter(file => file && !file.match(/\.map$/))
				.map(file => `<${req.baseUrl}/client/${file}>;rel="modulepreload"`)
				.join(', ');

			res.setHeader('Link', link);
		} else {
			const link = preloaded_chunks
				.filter(file => file && !file.match(/\.map$/))
				.map((file) => {
					const as = /\.css$/.test(file) ? 'style' : 'script';
					return `<${req.baseUrl}/client/${file}>;rel="preload";as="${as}"`;
				})
				.join(', ');

			res.setHeader('Link', link);
		}

		const session = session_getter(req, res);

		let redirect;
		let preload_error;

		const preload_context = {
			redirect: (statusCode, location) => {
				if (redirect && (redirect.statusCode !== statusCode || redirect.location !== location)) {
					throw new Error(`Conflicting redirects`);
				}
				location = location.replace(/^\//g, ''); // leading slash (only)
				redirect = { statusCode, location };
			},
			error: (statusCode, message) => {
				preload_error = { statusCode, message };
			},
			fetch: (url, opts) => {
				const parsed = new Url.URL(url, `http://127.0.0.1:${process.env.PORT}${req.baseUrl ? req.baseUrl + '/' :''}`);

				if (opts) {
					opts = Object.assign({}, opts);

					const include_cookies = (
						opts.credentials === 'include' ||
						opts.credentials === 'same-origin' && parsed.origin === `http://127.0.0.1:${process.env.PORT}`
					);

					if (include_cookies) {
						opts.headers = Object.assign({}, opts.headers);

						const cookies = Object.assign(
							{},
							cookie.parse(req.headers.cookie || ''),
							cookie.parse(opts.headers.cookie || '')
						);

						const set_cookie = res.getHeader('Set-Cookie');
						(Array.isArray(set_cookie) ? set_cookie : [set_cookie]).forEach(str => {
							const match = /([^=]+)=([^;]+)/.exec(str);
							if (match) cookies[match[1]] = match[2];
						});

						const str = Object.keys(cookies)
							.map(key => `${key}=${cookies[key]}`)
							.join('; ');

						opts.headers.cookie = str;
					}
				}

				return fetch(parsed.href, opts);
			}
		};

		let preloaded;
		let match;
		let params;

		try {
			const root_preloaded = manifest.root_preload
				? manifest.root_preload.call(preload_context, {
					host: req.headers.host,
					path: req.path,
					query: req.query,
					params: {}
				}, session)
				: {};

			match = error ? null : page.pattern.exec(req.path);


			let toPreload = [root_preloaded];
			if (!is_service_worker_index) {
				toPreload = toPreload.concat(page.parts.map(part => {
					if (!part) return null;

					// the deepest level is used below, to initialise the store
					params = part.params ? part.params(match) : {};

					return part.preload
						? part.preload.call(preload_context, {
							host: req.headers.host,
							path: req.path,
							query: req.query,
							params
						}, session)
						: {};
				}));
			}

			preloaded = await Promise.all(toPreload);
		} catch (err) {
			if (error) {
				return bail(req, res, err)
			}

			preload_error = { statusCode: 500, message: err };
			preloaded = []; // appease TypeScript
		}

		try {
			if (redirect) {
				const location = Url.resolve((req.baseUrl || '') + '/', redirect.location);

				res.statusCode = redirect.statusCode;
				res.setHeader('Location', location);
				res.end();

				return;
			}

			if (preload_error) {
				handle_error(req, res, preload_error.statusCode, preload_error.message);
				return;
			}

			const segments = req.path.split('/').filter(Boolean);

			// TODO make this less confusing
			const layout_segments = [segments[0]];
			let l = 1;

			page.parts.forEach((part, i) => {
				layout_segments[l] = segments[i + 1];
				if (!part) return null;
				l++;
			});

			const props = {
				stores: {
					page: {
						subscribe: writable({
							host: req.headers.host,
							path: req.path,
							query: req.query,
							params
						}).subscribe
					},
					preloading: {
						subscribe: writable(null).subscribe
					},
					session: writable(session)
				},
				segments: layout_segments,
				status: error ? status : 200,
				error: error ? error instanceof Error ? error : { message: error } : null,
				level0: {
					props: preloaded[0]
				},
				level1: {
					segment: segments[0],
					props: {}
				}
			};

			if (!is_service_worker_index) {
				let l = 1;
				for (let i = 0; i < page.parts.length; i += 1) {
					const part = page.parts[i];
					if (!part) continue;

					props[`level${l++}`] = {
						component: part.component,
						props: preloaded[i + 1] || {},
						segment: segments[i]
					};
				}
			}

			const { html, head, css } = App.render(props);

			const serialized = {
				preloaded: `[${preloaded.map(data => try_serialize(data)).join(',')}]`,
				session: session && try_serialize(session, err => {
					throw new Error(`Failed to serialize session data: ${err.message}`);
				}),
				error: error && try_serialize(props.error)
			};

			let script = `__SAPPER__={${[
				error && `error:${serialized.error},status:${status}`,
				`baseUrl:"${req.baseUrl}"`,
				serialized.preloaded && `preloaded:${serialized.preloaded}`,
				serialized.session && `session:${serialized.session}`
			].filter(Boolean).join(',')}};`;

			if (has_service_worker) {
				script += `if('serviceWorker' in navigator)navigator.serviceWorker.register('${req.baseUrl}/service-worker.js');`;
			}

			const file = [].concat(build_info.assets.main).filter(file => file && /\.js$/.test(file))[0];
			const main = `${req.baseUrl}/client/${file}`;

			if (build_info.bundler === 'rollup') {
				if (build_info.legacy_assets) {
					const legacy_main = `${req.baseUrl}/client/legacy/${build_info.legacy_assets.main}`;
					script += `(function(){try{eval("async function x(){}");var main="${main}"}catch(e){main="${legacy_main}"};var s=document.createElement("script");try{new Function("if(0)import('')")();s.src=main;s.type="module";s.crossOrigin="use-credentials";}catch(e){s.src="${req.baseUrl}/client/shimport@${build_info.shimport}.js";s.setAttribute("data-main",main);}document.head.appendChild(s);}());`;
				} else {
					script += `var s=document.createElement("script");try{new Function("if(0)import('')")();s.src="${main}";s.type="module";s.crossOrigin="use-credentials";}catch(e){s.src="${req.baseUrl}/client/shimport@${build_info.shimport}.js";s.setAttribute("data-main","${main}")}document.head.appendChild(s)`;
				}
			} else {
				script += `</script><script src="${main}">`;
			}

			let styles;

			// TODO make this consistent across apps
			// TODO embed build_info in placeholder.ts
			if (build_info.css && build_info.css.main) {
				const css_chunks = new Set();
				if (build_info.css.main) css_chunks.add(build_info.css.main);
				page.parts.forEach(part => {
					if (!part) return;
					const css_chunks_for_part = build_info.css.chunks[part.file];

					if (css_chunks_for_part) {
						css_chunks_for_part.forEach(file => {
							css_chunks.add(file);
						});
					}
				});

				styles = Array.from(css_chunks)
					.map(href => `<link rel="stylesheet" href="client/${href}">`)
					.join('');
			} else {
				styles = (css && css.code ? `<style>${css.code}</style>` : '');
			}

			// users can set a CSP nonce using res.locals.nonce
			const nonce_attr = (res.locals && res.locals.nonce) ? ` nonce="${res.locals.nonce}"` : '';

			const body = template()
				.replace('%sapper.base%', () => `<base href="${req.baseUrl}/">`)
				.replace('%sapper.scripts%', () => `<script${nonce_attr}>${script}</script>`)
				.replace('%sapper.html%', () => html)
				.replace('%sapper.head%', () => `<noscript id='sapper-head-start'></noscript>${head}<noscript id='sapper-head-end'></noscript>`)
				.replace('%sapper.styles%', () => styles);

			res.statusCode = status;
			res.end(body);
		} catch(err) {
			if (error) {
				bail(req, res, err);
			} else {
				handle_error(req, res, 500, err);
			}
		}
	}

	return function find_route(req, res, next) {
		if (req.path === '/service-worker-index.html') {
			const homePage = pages.find(page => page.pattern.test('/'));
			handle_page(homePage, req, res);
			return;
		}

		for (const page of pages) {
			if (page.pattern.test(req.path)) {
				handle_page(page, req, res);
				return;
			}
		}

		handle_error(req, res, 404, 'Not found');
	};
}

function read_template(dir = build_dir) {
	return fs.readFileSync(`${dir}/template.html`, 'utf-8');
}

function try_serialize(data, fail) {
	try {
		return devalue(data);
	} catch (err) {
		if (fail) fail(err);
		return null;
	}
}

var mime_raw = "application/andrew-inset\t\t\tez\napplication/applixware\t\t\t\taw\napplication/atom+xml\t\t\t\tatom\napplication/atomcat+xml\t\t\t\tatomcat\napplication/atomsvc+xml\t\t\t\tatomsvc\napplication/ccxml+xml\t\t\t\tccxml\napplication/cdmi-capability\t\t\tcdmia\napplication/cdmi-container\t\t\tcdmic\napplication/cdmi-domain\t\t\t\tcdmid\napplication/cdmi-object\t\t\t\tcdmio\napplication/cdmi-queue\t\t\t\tcdmiq\napplication/cu-seeme\t\t\t\tcu\napplication/davmount+xml\t\t\tdavmount\napplication/docbook+xml\t\t\t\tdbk\napplication/dssc+der\t\t\t\tdssc\napplication/dssc+xml\t\t\t\txdssc\napplication/ecmascript\t\t\t\tecma\napplication/emma+xml\t\t\t\temma\napplication/epub+zip\t\t\t\tepub\napplication/exi\t\t\t\t\texi\napplication/font-tdpfr\t\t\t\tpfr\napplication/gml+xml\t\t\t\tgml\napplication/gpx+xml\t\t\t\tgpx\napplication/gxf\t\t\t\t\tgxf\napplication/hyperstudio\t\t\t\tstk\napplication/inkml+xml\t\t\t\tink inkml\napplication/ipfix\t\t\t\tipfix\napplication/java-archive\t\t\tjar\napplication/java-serialized-object\t\tser\napplication/java-vm\t\t\t\tclass\napplication/javascript\t\t\t\tjs\napplication/json\t\t\t\tjson map\napplication/jsonml+json\t\t\t\tjsonml\napplication/lost+xml\t\t\t\tlostxml\napplication/mac-binhex40\t\t\thqx\napplication/mac-compactpro\t\t\tcpt\napplication/mads+xml\t\t\t\tmads\napplication/marc\t\t\t\tmrc\napplication/marcxml+xml\t\t\t\tmrcx\napplication/mathematica\t\t\t\tma nb mb\napplication/mathml+xml\t\t\t\tmathml\napplication/mbox\t\t\t\tmbox\napplication/mediaservercontrol+xml\t\tmscml\napplication/metalink+xml\t\t\tmetalink\napplication/metalink4+xml\t\t\tmeta4\napplication/mets+xml\t\t\t\tmets\napplication/mods+xml\t\t\t\tmods\napplication/mp21\t\t\t\tm21 mp21\napplication/mp4\t\t\t\t\tmp4s\napplication/msword\t\t\t\tdoc dot\napplication/mxf\t\t\t\t\tmxf\napplication/octet-stream\tbin dms lrf mar so dist distz pkg bpk dump elc deploy\napplication/oda\t\t\t\t\toda\napplication/oebps-package+xml\t\t\topf\napplication/ogg\t\t\t\t\togx\napplication/omdoc+xml\t\t\t\tomdoc\napplication/onenote\t\t\t\tonetoc onetoc2 onetmp onepkg\napplication/oxps\t\t\t\toxps\napplication/patch-ops-error+xml\t\t\txer\napplication/pdf\t\t\t\t\tpdf\napplication/pgp-encrypted\t\t\tpgp\napplication/pgp-signature\t\t\tasc sig\napplication/pics-rules\t\t\t\tprf\napplication/pkcs10\t\t\t\tp10\napplication/pkcs7-mime\t\t\t\tp7m p7c\napplication/pkcs7-signature\t\t\tp7s\napplication/pkcs8\t\t\t\tp8\napplication/pkix-attr-cert\t\t\tac\napplication/pkix-cert\t\t\t\tcer\napplication/pkix-crl\t\t\t\tcrl\napplication/pkix-pkipath\t\t\tpkipath\napplication/pkixcmp\t\t\t\tpki\napplication/pls+xml\t\t\t\tpls\napplication/postscript\t\t\t\tai eps ps\napplication/prs.cww\t\t\t\tcww\napplication/pskc+xml\t\t\t\tpskcxml\napplication/rdf+xml\t\t\t\trdf\napplication/reginfo+xml\t\t\t\trif\napplication/relax-ng-compact-syntax\t\trnc\napplication/resource-lists+xml\t\t\trl\napplication/resource-lists-diff+xml\t\trld\napplication/rls-services+xml\t\t\trs\napplication/rpki-ghostbusters\t\t\tgbr\napplication/rpki-manifest\t\t\tmft\napplication/rpki-roa\t\t\t\troa\napplication/rsd+xml\t\t\t\trsd\napplication/rss+xml\t\t\t\trss\napplication/rtf\t\t\t\t\trtf\napplication/sbml+xml\t\t\t\tsbml\napplication/scvp-cv-request\t\t\tscq\napplication/scvp-cv-response\t\t\tscs\napplication/scvp-vp-request\t\t\tspq\napplication/scvp-vp-response\t\t\tspp\napplication/sdp\t\t\t\t\tsdp\napplication/set-payment-initiation\t\tsetpay\napplication/set-registration-initiation\t\tsetreg\napplication/shf+xml\t\t\t\tshf\napplication/smil+xml\t\t\t\tsmi smil\napplication/sparql-query\t\t\trq\napplication/sparql-results+xml\t\t\tsrx\napplication/srgs\t\t\t\tgram\napplication/srgs+xml\t\t\t\tgrxml\napplication/sru+xml\t\t\t\tsru\napplication/ssdl+xml\t\t\t\tssdl\napplication/ssml+xml\t\t\t\tssml\napplication/tei+xml\t\t\t\ttei teicorpus\napplication/thraud+xml\t\t\t\ttfi\napplication/timestamped-data\t\t\ttsd\napplication/vnd.3gpp.pic-bw-large\t\tplb\napplication/vnd.3gpp.pic-bw-small\t\tpsb\napplication/vnd.3gpp.pic-bw-var\t\t\tpvb\napplication/vnd.3gpp2.tcap\t\t\ttcap\napplication/vnd.3m.post-it-notes\t\tpwn\napplication/vnd.accpac.simply.aso\t\taso\napplication/vnd.accpac.simply.imp\t\timp\napplication/vnd.acucobol\t\t\tacu\napplication/vnd.acucorp\t\t\t\tatc acutc\napplication/vnd.adobe.air-application-installer-package+zip\tair\napplication/vnd.adobe.formscentral.fcdt\t\tfcdt\napplication/vnd.adobe.fxp\t\t\tfxp fxpl\napplication/vnd.adobe.xdp+xml\t\t\txdp\napplication/vnd.adobe.xfdf\t\t\txfdf\napplication/vnd.ahead.space\t\t\tahead\napplication/vnd.airzip.filesecure.azf\t\tazf\napplication/vnd.airzip.filesecure.azs\t\tazs\napplication/vnd.amazon.ebook\t\t\tazw\napplication/vnd.americandynamics.acc\t\tacc\napplication/vnd.amiga.ami\t\t\tami\napplication/vnd.android.package-archive\t\tapk\napplication/vnd.anser-web-certificate-issue-initiation\tcii\napplication/vnd.anser-web-funds-transfer-initiation\tfti\napplication/vnd.antix.game-component\t\tatx\napplication/vnd.apple.installer+xml\t\tmpkg\napplication/vnd.apple.mpegurl\t\t\tm3u8\napplication/vnd.aristanetworks.swi\t\tswi\napplication/vnd.astraea-software.iota\t\tiota\napplication/vnd.audiograph\t\t\taep\napplication/vnd.blueice.multipass\t\tmpm\napplication/vnd.bmi\t\t\t\tbmi\napplication/vnd.businessobjects\t\t\trep\napplication/vnd.chemdraw+xml\t\t\tcdxml\napplication/vnd.chipnuts.karaoke-mmd\t\tmmd\napplication/vnd.cinderella\t\t\tcdy\napplication/vnd.claymore\t\t\tcla\napplication/vnd.cloanto.rp9\t\t\trp9\napplication/vnd.clonk.c4group\t\t\tc4g c4d c4f c4p c4u\napplication/vnd.cluetrust.cartomobile-config\t\tc11amc\napplication/vnd.cluetrust.cartomobile-config-pkg\tc11amz\napplication/vnd.commonspace\t\t\tcsp\napplication/vnd.contact.cmsg\t\t\tcdbcmsg\napplication/vnd.cosmocaller\t\t\tcmc\napplication/vnd.crick.clicker\t\t\tclkx\napplication/vnd.crick.clicker.keyboard\t\tclkk\napplication/vnd.crick.clicker.palette\t\tclkp\napplication/vnd.crick.clicker.template\t\tclkt\napplication/vnd.crick.clicker.wordbank\t\tclkw\napplication/vnd.criticaltools.wbs+xml\t\twbs\napplication/vnd.ctc-posml\t\t\tpml\napplication/vnd.cups-ppd\t\t\tppd\napplication/vnd.curl.car\t\t\tcar\napplication/vnd.curl.pcurl\t\t\tpcurl\napplication/vnd.dart\t\t\t\tdart\napplication/vnd.data-vision.rdz\t\t\trdz\napplication/vnd.dece.data\t\t\tuvf uvvf uvd uvvd\napplication/vnd.dece.ttml+xml\t\t\tuvt uvvt\napplication/vnd.dece.unspecified\t\tuvx uvvx\napplication/vnd.dece.zip\t\t\tuvz uvvz\napplication/vnd.denovo.fcselayout-link\t\tfe_launch\napplication/vnd.dna\t\t\t\tdna\napplication/vnd.dolby.mlp\t\t\tmlp\napplication/vnd.dpgraph\t\t\t\tdpg\napplication/vnd.dreamfactory\t\t\tdfac\napplication/vnd.ds-keypoint\t\t\tkpxx\napplication/vnd.dvb.ait\t\t\t\tait\napplication/vnd.dvb.service\t\t\tsvc\napplication/vnd.dynageo\t\t\t\tgeo\napplication/vnd.ecowin.chart\t\t\tmag\napplication/vnd.enliven\t\t\t\tnml\napplication/vnd.epson.esf\t\t\tesf\napplication/vnd.epson.msf\t\t\tmsf\napplication/vnd.epson.quickanime\t\tqam\napplication/vnd.epson.salt\t\t\tslt\napplication/vnd.epson.ssf\t\t\tssf\napplication/vnd.eszigno3+xml\t\t\tes3 et3\napplication/vnd.ezpix-album\t\t\tez2\napplication/vnd.ezpix-package\t\t\tez3\napplication/vnd.fdf\t\t\t\tfdf\napplication/vnd.fdsn.mseed\t\t\tmseed\napplication/vnd.fdsn.seed\t\t\tseed dataless\napplication/vnd.flographit\t\t\tgph\napplication/vnd.fluxtime.clip\t\t\tftc\napplication/vnd.framemaker\t\t\tfm frame maker book\napplication/vnd.frogans.fnc\t\t\tfnc\napplication/vnd.frogans.ltf\t\t\tltf\napplication/vnd.fsc.weblaunch\t\t\tfsc\napplication/vnd.fujitsu.oasys\t\t\toas\napplication/vnd.fujitsu.oasys2\t\t\toa2\napplication/vnd.fujitsu.oasys3\t\t\toa3\napplication/vnd.fujitsu.oasysgp\t\t\tfg5\napplication/vnd.fujitsu.oasysprs\t\tbh2\napplication/vnd.fujixerox.ddd\t\t\tddd\napplication/vnd.fujixerox.docuworks\t\txdw\napplication/vnd.fujixerox.docuworks.binder\txbd\napplication/vnd.fuzzysheet\t\t\tfzs\napplication/vnd.genomatix.tuxedo\t\ttxd\napplication/vnd.geogebra.file\t\t\tggb\napplication/vnd.geogebra.tool\t\t\tggt\napplication/vnd.geometry-explorer\t\tgex gre\napplication/vnd.geonext\t\t\t\tgxt\napplication/vnd.geoplan\t\t\t\tg2w\napplication/vnd.geospace\t\t\tg3w\napplication/vnd.gmx\t\t\t\tgmx\napplication/vnd.google-earth.kml+xml\t\tkml\napplication/vnd.google-earth.kmz\t\tkmz\napplication/vnd.grafeq\t\t\t\tgqf gqs\napplication/vnd.groove-account\t\t\tgac\napplication/vnd.groove-help\t\t\tghf\napplication/vnd.groove-identity-message\t\tgim\napplication/vnd.groove-injector\t\t\tgrv\napplication/vnd.groove-tool-message\t\tgtm\napplication/vnd.groove-tool-template\t\ttpl\napplication/vnd.groove-vcard\t\t\tvcg\napplication/vnd.hal+xml\t\t\t\thal\napplication/vnd.handheld-entertainment+xml\tzmm\napplication/vnd.hbci\t\t\t\thbci\napplication/vnd.hhe.lesson-player\t\tles\napplication/vnd.hp-hpgl\t\t\t\thpgl\napplication/vnd.hp-hpid\t\t\t\thpid\napplication/vnd.hp-hps\t\t\t\thps\napplication/vnd.hp-jlyt\t\t\t\tjlt\napplication/vnd.hp-pcl\t\t\t\tpcl\napplication/vnd.hp-pclxl\t\t\tpclxl\napplication/vnd.hydrostatix.sof-data\t\tsfd-hdstx\napplication/vnd.ibm.minipay\t\t\tmpy\napplication/vnd.ibm.modcap\t\t\tafp listafp list3820\napplication/vnd.ibm.rights-management\t\tirm\napplication/vnd.ibm.secure-container\t\tsc\napplication/vnd.iccprofile\t\t\ticc icm\napplication/vnd.igloader\t\t\tigl\napplication/vnd.immervision-ivp\t\t\tivp\napplication/vnd.immervision-ivu\t\t\tivu\napplication/vnd.insors.igm\t\t\tigm\napplication/vnd.intercon.formnet\t\txpw xpx\napplication/vnd.intergeo\t\t\ti2g\napplication/vnd.intu.qbo\t\t\tqbo\napplication/vnd.intu.qfx\t\t\tqfx\napplication/vnd.ipunplugged.rcprofile\t\trcprofile\napplication/vnd.irepository.package+xml\t\tirp\napplication/vnd.is-xpr\t\t\t\txpr\napplication/vnd.isac.fcs\t\t\tfcs\napplication/vnd.jam\t\t\t\tjam\napplication/vnd.jcp.javame.midlet-rms\t\trms\napplication/vnd.jisp\t\t\t\tjisp\napplication/vnd.joost.joda-archive\t\tjoda\napplication/vnd.kahootz\t\t\t\tktz ktr\napplication/vnd.kde.karbon\t\t\tkarbon\napplication/vnd.kde.kchart\t\t\tchrt\napplication/vnd.kde.kformula\t\t\tkfo\napplication/vnd.kde.kivio\t\t\tflw\napplication/vnd.kde.kontour\t\t\tkon\napplication/vnd.kde.kpresenter\t\t\tkpr kpt\napplication/vnd.kde.kspread\t\t\tksp\napplication/vnd.kde.kword\t\t\tkwd kwt\napplication/vnd.kenameaapp\t\t\thtke\napplication/vnd.kidspiration\t\t\tkia\napplication/vnd.kinar\t\t\t\tkne knp\napplication/vnd.koan\t\t\t\tskp skd skt skm\napplication/vnd.kodak-descriptor\t\tsse\napplication/vnd.las.las+xml\t\t\tlasxml\napplication/vnd.llamagraphics.life-balance.desktop\tlbd\napplication/vnd.llamagraphics.life-balance.exchange+xml\tlbe\napplication/vnd.lotus-1-2-3\t\t\t123\napplication/vnd.lotus-approach\t\t\tapr\napplication/vnd.lotus-freelance\t\t\tpre\napplication/vnd.lotus-notes\t\t\tnsf\napplication/vnd.lotus-organizer\t\t\torg\napplication/vnd.lotus-screencam\t\t\tscm\napplication/vnd.lotus-wordpro\t\t\tlwp\napplication/vnd.macports.portpkg\t\tportpkg\napplication/vnd.mcd\t\t\t\tmcd\napplication/vnd.medcalcdata\t\t\tmc1\napplication/vnd.mediastation.cdkey\t\tcdkey\napplication/vnd.mfer\t\t\t\tmwf\napplication/vnd.mfmp\t\t\t\tmfm\napplication/vnd.micrografx.flo\t\t\tflo\napplication/vnd.micrografx.igx\t\t\tigx\napplication/vnd.mif\t\t\t\tmif\napplication/vnd.mobius.daf\t\t\tdaf\napplication/vnd.mobius.dis\t\t\tdis\napplication/vnd.mobius.mbk\t\t\tmbk\napplication/vnd.mobius.mqy\t\t\tmqy\napplication/vnd.mobius.msl\t\t\tmsl\napplication/vnd.mobius.plc\t\t\tplc\napplication/vnd.mobius.txf\t\t\ttxf\napplication/vnd.mophun.application\t\tmpn\napplication/vnd.mophun.certificate\t\tmpc\napplication/vnd.mozilla.xul+xml\t\t\txul\napplication/vnd.ms-artgalry\t\t\tcil\napplication/vnd.ms-cab-compressed\t\tcab\napplication/vnd.ms-excel\t\t\txls xlm xla xlc xlt xlw\napplication/vnd.ms-excel.addin.macroenabled.12\t\txlam\napplication/vnd.ms-excel.sheet.binary.macroenabled.12\txlsb\napplication/vnd.ms-excel.sheet.macroenabled.12\t\txlsm\napplication/vnd.ms-excel.template.macroenabled.12\txltm\napplication/vnd.ms-fontobject\t\t\teot\napplication/vnd.ms-htmlhelp\t\t\tchm\napplication/vnd.ms-ims\t\t\t\tims\napplication/vnd.ms-lrm\t\t\t\tlrm\napplication/vnd.ms-officetheme\t\t\tthmx\napplication/vnd.ms-pki.seccat\t\t\tcat\napplication/vnd.ms-pki.stl\t\t\tstl\napplication/vnd.ms-powerpoint\t\t\tppt pps pot\napplication/vnd.ms-powerpoint.addin.macroenabled.12\t\tppam\napplication/vnd.ms-powerpoint.presentation.macroenabled.12\tpptm\napplication/vnd.ms-powerpoint.slide.macroenabled.12\t\tsldm\napplication/vnd.ms-powerpoint.slideshow.macroenabled.12\t\tppsm\napplication/vnd.ms-powerpoint.template.macroenabled.12\t\tpotm\napplication/vnd.ms-project\t\t\tmpp mpt\napplication/vnd.ms-word.document.macroenabled.12\tdocm\napplication/vnd.ms-word.template.macroenabled.12\tdotm\napplication/vnd.ms-works\t\t\twps wks wcm wdb\napplication/vnd.ms-wpl\t\t\t\twpl\napplication/vnd.ms-xpsdocument\t\t\txps\napplication/vnd.mseq\t\t\t\tmseq\napplication/vnd.musician\t\t\tmus\napplication/vnd.muvee.style\t\t\tmsty\napplication/vnd.mynfc\t\t\t\ttaglet\napplication/vnd.neurolanguage.nlu\t\tnlu\napplication/vnd.nitf\t\t\t\tntf nitf\napplication/vnd.noblenet-directory\t\tnnd\napplication/vnd.noblenet-sealer\t\t\tnns\napplication/vnd.noblenet-web\t\t\tnnw\napplication/vnd.nokia.n-gage.data\t\tngdat\napplication/vnd.nokia.n-gage.symbian.install\tn-gage\napplication/vnd.nokia.radio-preset\t\trpst\napplication/vnd.nokia.radio-presets\t\trpss\napplication/vnd.novadigm.edm\t\t\tedm\napplication/vnd.novadigm.edx\t\t\tedx\napplication/vnd.novadigm.ext\t\t\text\napplication/vnd.oasis.opendocument.chart\t\todc\napplication/vnd.oasis.opendocument.chart-template\totc\napplication/vnd.oasis.opendocument.database\t\todb\napplication/vnd.oasis.opendocument.formula\t\todf\napplication/vnd.oasis.opendocument.formula-template\todft\napplication/vnd.oasis.opendocument.graphics\t\todg\napplication/vnd.oasis.opendocument.graphics-template\totg\napplication/vnd.oasis.opendocument.image\t\todi\napplication/vnd.oasis.opendocument.image-template\toti\napplication/vnd.oasis.opendocument.presentation\t\todp\napplication/vnd.oasis.opendocument.presentation-template\totp\napplication/vnd.oasis.opendocument.spreadsheet\t\tods\napplication/vnd.oasis.opendocument.spreadsheet-template\tots\napplication/vnd.oasis.opendocument.text\t\t\todt\napplication/vnd.oasis.opendocument.text-master\t\todm\napplication/vnd.oasis.opendocument.text-template\tott\napplication/vnd.oasis.opendocument.text-web\t\toth\napplication/vnd.olpc-sugar\t\t\txo\napplication/vnd.oma.dd2+xml\t\t\tdd2\napplication/vnd.openofficeorg.extension\t\toxt\napplication/vnd.openxmlformats-officedocument.presentationml.presentation\tpptx\napplication/vnd.openxmlformats-officedocument.presentationml.slide\tsldx\napplication/vnd.openxmlformats-officedocument.presentationml.slideshow\tppsx\napplication/vnd.openxmlformats-officedocument.presentationml.template\tpotx\napplication/vnd.openxmlformats-officedocument.spreadsheetml.sheet\txlsx\napplication/vnd.openxmlformats-officedocument.spreadsheetml.template\txltx\napplication/vnd.openxmlformats-officedocument.wordprocessingml.document\tdocx\napplication/vnd.openxmlformats-officedocument.wordprocessingml.template\tdotx\napplication/vnd.osgeo.mapguide.package\t\tmgp\napplication/vnd.osgi.dp\t\t\t\tdp\napplication/vnd.osgi.subsystem\t\t\tesa\napplication/vnd.palm\t\t\t\tpdb pqa oprc\napplication/vnd.pawaafile\t\t\tpaw\napplication/vnd.pg.format\t\t\tstr\napplication/vnd.pg.osasli\t\t\tei6\napplication/vnd.picsel\t\t\t\tefif\napplication/vnd.pmi.widget\t\t\twg\napplication/vnd.pocketlearn\t\t\tplf\napplication/vnd.powerbuilder6\t\t\tpbd\napplication/vnd.previewsystems.box\t\tbox\napplication/vnd.proteus.magazine\t\tmgz\napplication/vnd.publishare-delta-tree\t\tqps\napplication/vnd.pvi.ptid1\t\t\tptid\napplication/vnd.quark.quarkxpress\t\tqxd qxt qwd qwt qxl qxb\napplication/vnd.realvnc.bed\t\t\tbed\napplication/vnd.recordare.musicxml\t\tmxl\napplication/vnd.recordare.musicxml+xml\t\tmusicxml\napplication/vnd.rig.cryptonote\t\t\tcryptonote\napplication/vnd.rim.cod\t\t\t\tcod\napplication/vnd.rn-realmedia\t\t\trm\napplication/vnd.rn-realmedia-vbr\t\trmvb\napplication/vnd.route66.link66+xml\t\tlink66\napplication/vnd.sailingtracker.track\t\tst\napplication/vnd.seemail\t\t\t\tsee\napplication/vnd.sema\t\t\t\tsema\napplication/vnd.semd\t\t\t\tsemd\napplication/vnd.semf\t\t\t\tsemf\napplication/vnd.shana.informed.formdata\t\tifm\napplication/vnd.shana.informed.formtemplate\titp\napplication/vnd.shana.informed.interchange\tiif\napplication/vnd.shana.informed.package\t\tipk\napplication/vnd.simtech-mindmapper\t\ttwd twds\napplication/vnd.smaf\t\t\t\tmmf\napplication/vnd.smart.teacher\t\t\tteacher\napplication/vnd.solent.sdkm+xml\t\t\tsdkm sdkd\napplication/vnd.spotfire.dxp\t\t\tdxp\napplication/vnd.spotfire.sfs\t\t\tsfs\napplication/vnd.stardivision.calc\t\tsdc\napplication/vnd.stardivision.draw\t\tsda\napplication/vnd.stardivision.impress\t\tsdd\napplication/vnd.stardivision.math\t\tsmf\napplication/vnd.stardivision.writer\t\tsdw vor\napplication/vnd.stardivision.writer-global\tsgl\napplication/vnd.stepmania.package\t\tsmzip\napplication/vnd.stepmania.stepchart\t\tsm\napplication/vnd.sun.xml.calc\t\t\tsxc\napplication/vnd.sun.xml.calc.template\t\tstc\napplication/vnd.sun.xml.draw\t\t\tsxd\napplication/vnd.sun.xml.draw.template\t\tstd\napplication/vnd.sun.xml.impress\t\t\tsxi\napplication/vnd.sun.xml.impress.template\tsti\napplication/vnd.sun.xml.math\t\t\tsxm\napplication/vnd.sun.xml.writer\t\t\tsxw\napplication/vnd.sun.xml.writer.global\t\tsxg\napplication/vnd.sun.xml.writer.template\t\tstw\napplication/vnd.sus-calendar\t\t\tsus susp\napplication/vnd.svd\t\t\t\tsvd\napplication/vnd.symbian.install\t\t\tsis sisx\napplication/vnd.syncml+xml\t\t\txsm\napplication/vnd.syncml.dm+wbxml\t\t\tbdm\napplication/vnd.syncml.dm+xml\t\t\txdm\napplication/vnd.tao.intent-module-archive\ttao\napplication/vnd.tcpdump.pcap\t\t\tpcap cap dmp\napplication/vnd.tmobile-livetv\t\t\ttmo\napplication/vnd.trid.tpt\t\t\ttpt\napplication/vnd.triscape.mxs\t\t\tmxs\napplication/vnd.trueapp\t\t\t\ttra\napplication/vnd.ufdl\t\t\t\tufd ufdl\napplication/vnd.uiq.theme\t\t\tutz\napplication/vnd.umajin\t\t\t\tumj\napplication/vnd.unity\t\t\t\tunityweb\napplication/vnd.uoml+xml\t\t\tuoml\napplication/vnd.vcx\t\t\t\tvcx\napplication/vnd.visio\t\t\t\tvsd vst vss vsw\napplication/vnd.visionary\t\t\tvis\napplication/vnd.vsf\t\t\t\tvsf\napplication/vnd.wap.wbxml\t\t\twbxml\napplication/vnd.wap.wmlc\t\t\twmlc\napplication/vnd.wap.wmlscriptc\t\t\twmlsc\napplication/vnd.webturbo\t\t\twtb\napplication/vnd.wolfram.player\t\t\tnbp\napplication/vnd.wordperfect\t\t\twpd\napplication/vnd.wqd\t\t\t\twqd\napplication/vnd.wt.stf\t\t\t\tstf\napplication/vnd.xara\t\t\t\txar\napplication/vnd.xfdl\t\t\t\txfdl\napplication/vnd.yamaha.hv-dic\t\t\thvd\napplication/vnd.yamaha.hv-script\t\thvs\napplication/vnd.yamaha.hv-voice\t\t\thvp\napplication/vnd.yamaha.openscoreformat\t\t\tosf\napplication/vnd.yamaha.openscoreformat.osfpvg+xml\tosfpvg\napplication/vnd.yamaha.smaf-audio\t\tsaf\napplication/vnd.yamaha.smaf-phrase\t\tspf\napplication/vnd.yellowriver-custom-menu\t\tcmp\napplication/vnd.zul\t\t\t\tzir zirz\napplication/vnd.zzazz.deck+xml\t\t\tzaz\napplication/voicexml+xml\t\t\tvxml\napplication/wasm\t\t\t\twasm\napplication/widget\t\t\t\twgt\napplication/winhlp\t\t\t\thlp\napplication/wsdl+xml\t\t\t\twsdl\napplication/wspolicy+xml\t\t\twspolicy\napplication/x-7z-compressed\t\t\t7z\napplication/x-abiword\t\t\t\tabw\napplication/x-ace-compressed\t\t\tace\napplication/x-apple-diskimage\t\t\tdmg\napplication/x-authorware-bin\t\t\taab x32 u32 vox\napplication/x-authorware-map\t\t\taam\napplication/x-authorware-seg\t\t\taas\napplication/x-bcpio\t\t\t\tbcpio\napplication/x-bittorrent\t\t\ttorrent\napplication/x-blorb\t\t\t\tblb blorb\napplication/x-bzip\t\t\t\tbz\napplication/x-bzip2\t\t\t\tbz2 boz\napplication/x-cbr\t\t\t\tcbr cba cbt cbz cb7\napplication/x-cdlink\t\t\t\tvcd\napplication/x-cfs-compressed\t\t\tcfs\napplication/x-chat\t\t\t\tchat\napplication/x-chess-pgn\t\t\t\tpgn\napplication/x-conference\t\t\tnsc\napplication/x-cpio\t\t\t\tcpio\napplication/x-csh\t\t\t\tcsh\napplication/x-debian-package\t\t\tdeb udeb\napplication/x-dgc-compressed\t\t\tdgc\napplication/x-director\t\t\tdir dcr dxr cst cct cxt w3d fgd swa\napplication/x-doom\t\t\t\twad\napplication/x-dtbncx+xml\t\t\tncx\napplication/x-dtbook+xml\t\t\tdtb\napplication/x-dtbresource+xml\t\t\tres\napplication/x-dvi\t\t\t\tdvi\napplication/x-envoy\t\t\t\tevy\napplication/x-eva\t\t\t\teva\napplication/x-font-bdf\t\t\t\tbdf\napplication/x-font-ghostscript\t\t\tgsf\napplication/x-font-linux-psf\t\t\tpsf\napplication/x-font-pcf\t\t\t\tpcf\napplication/x-font-snf\t\t\t\tsnf\napplication/x-font-type1\t\t\tpfa pfb pfm afm\napplication/x-freearc\t\t\t\tarc\napplication/x-futuresplash\t\t\tspl\napplication/x-gca-compressed\t\t\tgca\napplication/x-glulx\t\t\t\tulx\napplication/x-gnumeric\t\t\t\tgnumeric\napplication/x-gramps-xml\t\t\tgramps\napplication/x-gtar\t\t\t\tgtar\napplication/x-hdf\t\t\t\thdf\napplication/x-install-instructions\t\tinstall\napplication/x-iso9660-image\t\t\tiso\napplication/x-java-jnlp-file\t\t\tjnlp\napplication/x-latex\t\t\t\tlatex\napplication/x-lzh-compressed\t\t\tlzh lha\napplication/x-mie\t\t\t\tmie\napplication/x-mobipocket-ebook\t\t\tprc mobi\napplication/x-ms-application\t\t\tapplication\napplication/x-ms-shortcut\t\t\tlnk\napplication/x-ms-wmd\t\t\t\twmd\napplication/x-ms-wmz\t\t\t\twmz\napplication/x-ms-xbap\t\t\t\txbap\napplication/x-msaccess\t\t\t\tmdb\napplication/x-msbinder\t\t\t\tobd\napplication/x-mscardfile\t\t\tcrd\napplication/x-msclip\t\t\t\tclp\napplication/x-msdownload\t\t\texe dll com bat msi\napplication/x-msmediaview\t\t\tmvb m13 m14\napplication/x-msmetafile\t\t\twmf wmz emf emz\napplication/x-msmoney\t\t\t\tmny\napplication/x-mspublisher\t\t\tpub\napplication/x-msschedule\t\t\tscd\napplication/x-msterminal\t\t\ttrm\napplication/x-mswrite\t\t\t\twri\napplication/x-netcdf\t\t\t\tnc cdf\napplication/x-nzb\t\t\t\tnzb\napplication/x-pkcs12\t\t\t\tp12 pfx\napplication/x-pkcs7-certificates\t\tp7b spc\napplication/x-pkcs7-certreqresp\t\t\tp7r\napplication/x-rar-compressed\t\t\trar\napplication/x-research-info-systems\t\tris\napplication/x-sh\t\t\t\tsh\napplication/x-shar\t\t\t\tshar\napplication/x-shockwave-flash\t\t\tswf\napplication/x-silverlight-app\t\t\txap\napplication/x-sql\t\t\t\tsql\napplication/x-stuffit\t\t\t\tsit\napplication/x-stuffitx\t\t\t\tsitx\napplication/x-subrip\t\t\t\tsrt\napplication/x-sv4cpio\t\t\t\tsv4cpio\napplication/x-sv4crc\t\t\t\tsv4crc\napplication/x-t3vm-image\t\t\tt3\napplication/x-tads\t\t\t\tgam\napplication/x-tar\t\t\t\ttar\napplication/x-tcl\t\t\t\ttcl\napplication/x-tex\t\t\t\ttex\napplication/x-tex-tfm\t\t\t\ttfm\napplication/x-texinfo\t\t\t\ttexinfo texi\napplication/x-tgif\t\t\t\tobj\napplication/x-ustar\t\t\t\tustar\napplication/x-wais-source\t\t\tsrc\napplication/x-x509-ca-cert\t\t\tder crt\napplication/x-xfig\t\t\t\tfig\napplication/x-xliff+xml\t\t\t\txlf\napplication/x-xpinstall\t\t\t\txpi\napplication/x-xz\t\t\t\txz\napplication/x-zmachine\t\t\t\tz1 z2 z3 z4 z5 z6 z7 z8\napplication/xaml+xml\t\t\t\txaml\napplication/xcap-diff+xml\t\t\txdf\napplication/xenc+xml\t\t\t\txenc\napplication/xhtml+xml\t\t\t\txhtml xht\napplication/xml\t\t\t\t\txml xsl\napplication/xml-dtd\t\t\t\tdtd\napplication/xop+xml\t\t\t\txop\napplication/xproc+xml\t\t\t\txpl\napplication/xslt+xml\t\t\t\txslt\napplication/xspf+xml\t\t\t\txspf\napplication/xv+xml\t\t\t\tmxml xhvml xvml xvm\napplication/yang\t\t\t\tyang\napplication/yin+xml\t\t\t\tyin\napplication/zip\t\t\t\t\tzip\naudio/adpcm\t\t\t\t\tadp\naudio/basic\t\t\t\t\tau snd\naudio/midi\t\t\t\t\tmid midi kar rmi\naudio/mp4\t\t\t\t\tm4a mp4a\naudio/mpeg\t\t\t\t\tmpga mp2 mp2a mp3 m2a m3a\naudio/ogg\t\t\t\t\toga ogg spx\naudio/s3m\t\t\t\t\ts3m\naudio/silk\t\t\t\t\tsil\naudio/vnd.dece.audio\t\t\t\tuva uvva\naudio/vnd.digital-winds\t\t\t\teol\naudio/vnd.dra\t\t\t\t\tdra\naudio/vnd.dts\t\t\t\t\tdts\naudio/vnd.dts.hd\t\t\t\tdtshd\naudio/vnd.lucent.voice\t\t\t\tlvp\naudio/vnd.ms-playready.media.pya\t\tpya\naudio/vnd.nuera.ecelp4800\t\t\tecelp4800\naudio/vnd.nuera.ecelp7470\t\t\tecelp7470\naudio/vnd.nuera.ecelp9600\t\t\tecelp9600\naudio/vnd.rip\t\t\t\t\trip\naudio/webm\t\t\t\t\tweba\naudio/x-aac\t\t\t\t\taac\naudio/x-aiff\t\t\t\t\taif aiff aifc\naudio/x-caf\t\t\t\t\tcaf\naudio/x-flac\t\t\t\t\tflac\naudio/x-matroska\t\t\t\tmka\naudio/x-mpegurl\t\t\t\t\tm3u\naudio/x-ms-wax\t\t\t\t\twax\naudio/x-ms-wma\t\t\t\t\twma\naudio/x-pn-realaudio\t\t\t\tram ra\naudio/x-pn-realaudio-plugin\t\t\trmp\naudio/x-wav\t\t\t\t\twav\naudio/xm\t\t\t\t\txm\nchemical/x-cdx\t\t\t\t\tcdx\nchemical/x-cif\t\t\t\t\tcif\nchemical/x-cmdf\t\t\t\t\tcmdf\nchemical/x-cml\t\t\t\t\tcml\nchemical/x-csml\t\t\t\t\tcsml\nchemical/x-xyz\t\t\t\t\txyz\nfont/collection\t\t\t\t\tttc\nfont/otf\t\t\t\t\totf\nfont/ttf\t\t\t\t\tttf\nfont/woff\t\t\t\t\twoff\nfont/woff2\t\t\t\t\twoff2\nimage/bmp\t\t\t\t\tbmp\nimage/cgm\t\t\t\t\tcgm\nimage/g3fax\t\t\t\t\tg3\nimage/gif\t\t\t\t\tgif\nimage/ief\t\t\t\t\tief\nimage/jpeg\t\t\t\t\tjpeg jpg jpe\nimage/ktx\t\t\t\t\tktx\nimage/png\t\t\t\t\tpng\nimage/prs.btif\t\t\t\t\tbtif\nimage/sgi\t\t\t\t\tsgi\nimage/svg+xml\t\t\t\t\tsvg svgz\nimage/tiff\t\t\t\t\ttiff tif\nimage/vnd.adobe.photoshop\t\t\tpsd\nimage/vnd.dece.graphic\t\t\t\tuvi uvvi uvg uvvg\nimage/vnd.djvu\t\t\t\t\tdjvu djv\nimage/vnd.dvb.subtitle\t\t\t\tsub\nimage/vnd.dwg\t\t\t\t\tdwg\nimage/vnd.dxf\t\t\t\t\tdxf\nimage/vnd.fastbidsheet\t\t\t\tfbs\nimage/vnd.fpx\t\t\t\t\tfpx\nimage/vnd.fst\t\t\t\t\tfst\nimage/vnd.fujixerox.edmics-mmr\t\t\tmmr\nimage/vnd.fujixerox.edmics-rlc\t\t\trlc\nimage/vnd.ms-modi\t\t\t\tmdi\nimage/vnd.ms-photo\t\t\t\twdp\nimage/vnd.net-fpx\t\t\t\tnpx\nimage/vnd.wap.wbmp\t\t\t\twbmp\nimage/vnd.xiff\t\t\t\t\txif\nimage/webp\t\t\t\t\twebp\nimage/x-3ds\t\t\t\t\t3ds\nimage/x-cmu-raster\t\t\t\tras\nimage/x-cmx\t\t\t\t\tcmx\nimage/x-freehand\t\t\t\tfh fhc fh4 fh5 fh7\nimage/x-icon\t\t\t\t\tico\nimage/x-mrsid-image\t\t\t\tsid\nimage/x-pcx\t\t\t\t\tpcx\nimage/x-pict\t\t\t\t\tpic pct\nimage/x-portable-anymap\t\t\t\tpnm\nimage/x-portable-bitmap\t\t\t\tpbm\nimage/x-portable-graymap\t\t\tpgm\nimage/x-portable-pixmap\t\t\t\tppm\nimage/x-rgb\t\t\t\t\trgb\nimage/x-tga\t\t\t\t\ttga\nimage/x-xbitmap\t\t\t\t\txbm\nimage/x-xpixmap\t\t\t\t\txpm\nimage/x-xwindowdump\t\t\t\txwd\nmessage/rfc822\t\t\t\t\teml mime\nmodel/iges\t\t\t\t\tigs iges\nmodel/mesh\t\t\t\t\tmsh mesh silo\nmodel/vnd.collada+xml\t\t\t\tdae\nmodel/vnd.dwf\t\t\t\t\tdwf\nmodel/vnd.gdl\t\t\t\t\tgdl\nmodel/vnd.gtw\t\t\t\t\tgtw\nmodel/vnd.mts\t\t\t\t\tmts\nmodel/vnd.vtu\t\t\t\t\tvtu\nmodel/vrml\t\t\t\t\twrl vrml\nmodel/x3d+binary\t\t\t\tx3db x3dbz\nmodel/x3d+vrml\t\t\t\t\tx3dv x3dvz\nmodel/x3d+xml\t\t\t\t\tx3d x3dz\ntext/cache-manifest\t\t\t\tappcache\ntext/calendar\t\t\t\t\tics ifb\ntext/css\t\t\t\t\tcss\ntext/csv\t\t\t\t\tcsv\ntext/html\t\t\t\t\thtml htm\ntext/n3\t\t\t\t\t\tn3\ntext/plain\t\t\t\t\ttxt text conf def list log in\ntext/prs.lines.tag\t\t\t\tdsc\ntext/richtext\t\t\t\t\trtx\ntext/sgml\t\t\t\t\tsgml sgm\ntext/tab-separated-values\t\t\ttsv\ntext/troff\t\t\t\t\tt tr roff man me ms\ntext/turtle\t\t\t\t\tttl\ntext/uri-list\t\t\t\t\turi uris urls\ntext/vcard\t\t\t\t\tvcard\ntext/vnd.curl\t\t\t\t\tcurl\ntext/vnd.curl.dcurl\t\t\t\tdcurl\ntext/vnd.curl.mcurl\t\t\t\tmcurl\ntext/vnd.curl.scurl\t\t\t\tscurl\ntext/vnd.dvb.subtitle\t\t\t\tsub\ntext/vnd.fly\t\t\t\t\tfly\ntext/vnd.fmi.flexstor\t\t\t\tflx\ntext/vnd.graphviz\t\t\t\tgv\ntext/vnd.in3d.3dml\t\t\t\t3dml\ntext/vnd.in3d.spot\t\t\t\tspot\ntext/vnd.sun.j2me.app-descriptor\t\tjad\ntext/vnd.wap.wml\t\t\t\twml\ntext/vnd.wap.wmlscript\t\t\t\twmls\ntext/x-asm\t\t\t\t\ts asm\ntext/x-c\t\t\t\t\tc cc cxx cpp h hh dic\ntext/x-fortran\t\t\t\t\tf for f77 f90\ntext/x-java-source\t\t\t\tjava\ntext/x-nfo\t\t\t\t\tnfo\ntext/x-opml\t\t\t\t\topml\ntext/x-pascal\t\t\t\t\tp pas\ntext/x-setext\t\t\t\t\tetx\ntext/x-sfv\t\t\t\t\tsfv\ntext/x-uuencode\t\t\t\t\tuu\ntext/x-vcalendar\t\t\t\tvcs\ntext/x-vcard\t\t\t\t\tvcf\nvideo/3gpp\t\t\t\t\t3gp\nvideo/3gpp2\t\t\t\t\t3g2\nvideo/h261\t\t\t\t\th261\nvideo/h263\t\t\t\t\th263\nvideo/h264\t\t\t\t\th264\nvideo/jpeg\t\t\t\t\tjpgv\nvideo/jpm\t\t\t\t\tjpm jpgm\nvideo/mj2\t\t\t\t\tmj2 mjp2\nvideo/mp4\t\t\t\t\tmp4 mp4v mpg4\nvideo/mpeg\t\t\t\t\tmpeg mpg mpe m1v m2v\nvideo/ogg\t\t\t\t\togv\nvideo/quicktime\t\t\t\t\tqt mov\nvideo/vnd.dece.hd\t\t\t\tuvh uvvh\nvideo/vnd.dece.mobile\t\t\t\tuvm uvvm\nvideo/vnd.dece.pd\t\t\t\tuvp uvvp\nvideo/vnd.dece.sd\t\t\t\tuvs uvvs\nvideo/vnd.dece.video\t\t\t\tuvv uvvv\nvideo/vnd.dvb.file\t\t\t\tdvb\nvideo/vnd.fvt\t\t\t\t\tfvt\nvideo/vnd.mpegurl\t\t\t\tmxu m4u\nvideo/vnd.ms-playready.media.pyv\t\tpyv\nvideo/vnd.uvvu.mp4\t\t\t\tuvu uvvu\nvideo/vnd.vivo\t\t\t\t\tviv\nvideo/webm\t\t\t\t\twebm\nvideo/x-f4v\t\t\t\t\tf4v\nvideo/x-fli\t\t\t\t\tfli\nvideo/x-flv\t\t\t\t\tflv\nvideo/x-m4v\t\t\t\t\tm4v\nvideo/x-matroska\t\t\t\tmkv mk3d mks\nvideo/x-mng\t\t\t\t\tmng\nvideo/x-ms-asf\t\t\t\t\tasf asx\nvideo/x-ms-vob\t\t\t\t\tvob\nvideo/x-ms-wm\t\t\t\t\twm\nvideo/x-ms-wmv\t\t\t\t\twmv\nvideo/x-ms-wmx\t\t\t\t\twmx\nvideo/x-ms-wvx\t\t\t\t\twvx\nvideo/x-msvideo\t\t\t\t\tavi\nvideo/x-sgi-movie\t\t\t\tmovie\nvideo/x-smv\t\t\t\t\tsmv\nx-conference/x-cooltalk\t\t\t\tice\n";

const map = new Map();

mime_raw.split('\n').forEach((row) => {
	const match = /(.+?)\t+(.+)/.exec(row);
	if (!match) return;

	const type = match[1];
	const extensions = match[2].split(' ');

	extensions.forEach(ext => {
		map.set(ext, type);
	});
});

function lookup(file) {
	const match = /\.([^\.]+)$/.exec(file);
	return match && map.get(match[1]);
}

function middleware(opts


 = {}) {
	const { session, ignore } = opts;

	let emitted_basepath = false;

	return compose_handlers(ignore, [
		(req, res, next) => {
			if (req.baseUrl === undefined) {
				let { originalUrl } = req;
				if (req.url === '/' && originalUrl[originalUrl.length - 1] !== '/') {
					originalUrl += '/';
				}

				req.baseUrl = originalUrl
					? originalUrl.slice(0, -req.url.length)
					: '';
			}

			if (!emitted_basepath && process.send) {
				process.send({
					__sapper__: true,
					event: 'basepath',
					basepath: req.baseUrl
				});

				emitted_basepath = true;
			}

			if (req.path === undefined) {
				req.path = req.url.replace(/\?.*/, '');
			}

			next();
		},

		fs.existsSync(path.join(build_dir, 'service-worker.js')) && serve({
			pathname: '/service-worker.js',
			cache_control: 'no-cache, no-store, must-revalidate'
		}),

		fs.existsSync(path.join(build_dir, 'service-worker.js.map')) && serve({
			pathname: '/service-worker.js.map',
			cache_control: 'no-cache, no-store, must-revalidate'
		}),

		serve({
			prefix: '/client/',
			cache_control:  'max-age=31536000, immutable'
		}),

		get_server_route_handler(manifest.server_routes),

		get_page_handler(manifest, session || noop$1)
	].filter(Boolean));
}

function compose_handlers(ignore, handlers) {
	const total = handlers.length;

	function nth_handler(n, req, res, next) {
		if (n >= total) {
			return next();
		}

		handlers[n](req, res, () => nth_handler(n+1, req, res, next));
	}

	return !ignore
		? (req, res, next) => nth_handler(0, req, res, next)
		: (req, res, next) => {
			if (should_ignore(req.path, ignore)) {
				next();
			} else {
				nth_handler(0, req, res, next);
			}
		};
}

function should_ignore(uri, val) {
	if (Array.isArray(val)) return val.some(x => should_ignore(uri, x));
	if (val instanceof RegExp) return val.test(uri);
	if (typeof val === 'function') return val(uri);
	return uri.startsWith(val.charCodeAt(0) === 47 ? val : `/${val}`);
}

function serve({ prefix, pathname, cache_control }



) {
	const filter = pathname
		? (req) => req.path === pathname
		: (req) => req.path.startsWith(prefix);

	const cache = new Map();

	const read =  (file) => (cache.has(file) ? cache : cache.set(file, fs.readFileSync(path.resolve(build_dir, file)))).get(file);

	return (req, res, next) => {
		if (filter(req)) {
			const type = lookup(req.path);

			try {
				const file = decodeURIComponent(req.path.slice(1));
				const data = read(file);

				res.setHeader('Content-Type', type);
				res.setHeader('Cache-Control', cache_control);
				res.end(data);
			} catch (err) {
				res.statusCode = 404;
				res.end('not found');
			}
		} else {
			next();
		}
	};
}

function noop$1(){}

const FileStore = sessionFileStore(session);


const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

polka()
	.use(bodyParser.json())
	.use(session({
		secret: 'conduit',
		resave: false,
		saveUninitialized: true,
		cookie: {
			maxAge: 31536000
		},
		store: new FileStore({
			path: process.env.NOW ? `/tmp/sessions` : `.sessions`
		})
	}))
	.use(
		compression({ threshold: 0 }),
		sirv('static', { dev }),
		middleware({
			session: req => ({
				user: req.session && req.session.user
			})
		})
	)
	.listen(PORT, err => {
		if (err) console.log('error', err);
	});
