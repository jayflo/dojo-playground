define([
	'exports',
	'sandbox/widgets/GWindow',
	'sandbox/widgets/NodeArray',

	'dojo/dom-construct',
	'dojo/_base/window'
], function (sandbox, GWindow, NodeHash, domConstruct, win) {
	sandbox.init = function () {
		//	summary:
		//		This function is executed automatically by the loader configuration.
		//		It will be executed after the page has loaded, the DOM is ready, and all
		//		dependencies of this module have been loaded. Use this function to initialize
		//		the application; for instance, creating	a page controller or running the
		//		Dojo parser.

		var w = new GWindow({
			attrs: {},
			isMinimized: true
		}, domConstruct.create('div', null, win.body(), 'first'));
		w.startup();

		var c = new NodeHash({
			initItems: [{
				key: 'one'
			}, {
				key: 'two'
			}]
		}, domConstruct.create('div', null, win.body(), 'first'));
		c.startup();
	};
});
