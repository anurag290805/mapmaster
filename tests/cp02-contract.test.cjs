const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
test('game loads shared design system and preserves legacy theme wiring', () => {
 const html=fs.readFileSync('index.html','utf8');
 for (const path of ['css/tokens.css','css/components.css','assets/brand/icon.svg']) assert.ok(html.includes(path), path);
 for (const id of ['startScreen','gameScreen','themeToggleBtn','stateInput','indiaMap']) assert.ok(html.includes(`id="${id}"`), id);
 assert.match(fs.readFileSync('js/events.js','utf8'),/localStorage\.setItem\("mapmaster-theme"/);
});
test('showcase has native interactive controls and is separate from game state', () => {
 const html=fs.readFileSync('design-system.html','utf8');
 for (const item of ['<dialog','id="showcase-theme"','id="demo-toast"','js/showcase.js']) assert.ok(html.includes(item), item);
 assert.doesNotMatch(fs.readFileSync('js/showcase.js','utf8'),/localStorage/);
});
test('notification manager cancels old expiry and supports dismissal', () => {
 const vm = require('node:vm'); const tasks = new Map(); let id=0;
 const context = { setTimeout: f => { tasks.set(++id,f); return id; }, clearTimeout: n => tasks.delete(n) };
 vm.runInNewContext(fs.readFileSync('js/notifications.js','utf8'),context);
 const el={hidden:true}; const live={textContent:''};
 const notices=context.MapMasterNotifications.create(el,live);
 notices.show('First',100); assert.equal(el.hidden,false); assert.equal(live.textContent,'First');
 notices.show('Second',100); assert.equal(tasks.size,1); assert.equal(live.textContent,'Second');
 notices.dismiss(); assert.equal(el.hidden,true); assert.equal(tasks.size,0);
});
