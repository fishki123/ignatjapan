import{S as r,i as e,s,e as t,g as o,h as a,j as n,l,o as c,c as f,b as h,k as u,f as i,p as g,D as m,F as p,G as d,n as k}from"./client.0b5a1f8a.js";function y(r,e,s){const t=Object.create(r);return t.key=e[s],t}function b(r){var e;let s=Object.keys(r.errors),f=[];for(let e=0;e<s.length;e+=1)f[e]=j(y(r,s,e));return{c(){e=t("ul");for(let r=0;r<f.length;r+=1)f[r].c();this.h()},l(r){e=o(r,"UL",{class:!0},!1);var s=a(e);for(let r=0;r<f.length;r+=1)f[r].l(s);s.forEach(n),this.h()},h(){l(e,"class","error-messages")},m(r,s){c(r,e,s);for(let r=0;r<f.length;r+=1)f[r].m(e,null)},p(r,t){if(r.errors){let o;for(s=Object.keys(t.errors),o=0;o<s.length;o+=1){const a=y(t,s,o);f[o]?f[o].p(r,a):(f[o]=j(a),f[o].c(),f[o].m(e,null))}for(;o<f.length;o+=1)f[o].d(1);f.length=s.length}},d(r){r&&n(e),p(f,r)}}}function j(r){var e,s,l,p,d=r.key+"",k=r.errors[r.key]+"";return{c(){e=t("li"),s=f(d),l=h(),p=f(k)},l(r){e=o(r,"LI",{},!1);var t=a(e);s=u(t,d),l=i(t),p=u(t,k),t.forEach(n)},m(r,t){c(r,e,t),g(e,s),g(e,l),g(e,p)},p(r,e){r.errors&&d!==(d=e.key+"")&&m(s,d),r.errors&&k!==(k=e.errors[e.key]+"")&&m(p,k)},d(r){r&&n(e)}}}function v(r){var e,s=r.errors&&b(r);return{c(){s&&s.c(),e=d()},l(r){s&&s.l(r),e=d()},m(r,t){s&&s.m(r,t),c(r,e,t)},p(r,t){t.errors?s?s.p(r,t):((s=b(t)).c(),s.m(e.parentNode,e)):s&&(s.d(1),s=null)},i:k,o:k,d(r){s&&s.d(r),r&&n(e)}}}function L(r,e,s){let{errors:t}=e;return r.$set=r=>{"errors"in r&&s("errors",t=r.errors)},{errors:t}}class O extends r{constructor(r){super(),e(this,r,L,v,s,["errors"])}}export{O as L};
