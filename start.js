/*jslint node: true */
'use strict';
const Koa = require('koa');
const app = new Koa();
const mount = require('koa-mount');
const serve = require('koa-static');
const render = require('koa-ejs');
const koaBody = require('koa-body');
const QRCode = require('qrcode');
const constants = require('byteballcore/constants.js');
const conf = require('byteballcore/conf');
const db = require('byteballcore/db');
const eventBus = require('byteballcore/event_bus');
const validationUtils = require('byteballcore/validation_utils');
const headlessWallet = require('headless-byteball');

app.use(koaBody());
render(app, {
	root: __dirname + '/view',
	layout: 'template',
	viewExt: 'html',
	cache: false,
	debug: false
});
app.use(serve(__dirname + '/public'));

let assocCodeToDeviceAddress = {};

async function index(ctx) {
	await ctx.render('index', {title: 'my blog'});
}

async function a1(ctx) {
	let assocCode = ctx.cookies.get('ac');
	let pairingCode;
	let paid = false;
	let code = 0;
	let step;
	if (!assocCode) {
		code = getCode();
		pairingCode = '' + code;
	} else {
		paid = await getIsPaid(assocCode);
	}
	let b = '';
	if (assocCode && paid) {
		step = 'final';
		b = '<br>secret body 1';
	} else if (code && !paid) {
		step = 'paid';
		let dataURL = await QRCode.toDataURL("article 1");
		b = '<br>Please pay for the article. <br>Address: ADDRESS<br>Amount: 1000<br><img src="' + dataURL + '">';
	} else {
		step = 'login';
		b = '<br>Please login using this pairing code: ' + pairingCode;
	}
	await ctx.render('article', {title: 'article 1 - my blog', b, code, step});
}

async function a2(ctx) {
	await ctx.render('article', {title: 'article 2 - my blog'});
}

function getCode() {
	let code = Date.now();
	assocCodeToDeviceAddress[code] = null;
	return code;
}

async function getIsPaid(code) {
	return false;
}

app.use(mount('/1', a1));
app.use(mount('/2', a2));
app.use(mount('/', index));
app.listen(3000);

console.log('listening on port 3000');

eventBus.once('headless_wallet_ready', () => {
	headlessWallet.setupChatEventHandlers();
	
	eventBus.on('paired', (from_address, pairing_secret) => {
	
	});
	
	eventBus.on('text', (from_address, text) => {
	
	});

});

eventBus.on('new_my_transactions', (arrUnits) => {

});

eventBus.on('my_transactions_became_stable', (arrUnits) => {

});



process.on('unhandledRejection', up => { throw up; });
