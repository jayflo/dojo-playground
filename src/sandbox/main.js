define([
	'exports',
	'sandbox/widgets/GWindowList',
	'sandbox/widgets/GWindow',

	'dojo/dom-construct',
	'dojo/_base/window'
], function (sandbox, GWindowList, GWindow, domConstruct, win) {
	sandbox.init = function () {
		//	summary:
		//		This function is executed automatically by the loader configuration.
		//		It will be executed after the page has loaded, the DOM is ready, and all
		//		dependencies of this module have been loaded. Use this function to initialize
		//		the application; for instance, creating	a page controller or running the
		//		Dojo parser.

		var gw = new GWindow({
			title: 'Test',
			content: domConstruct.create('div'),
			isMinimized: true
		}, domConstruct.create('div', null, win.body(), 'first'));
		gw.startup();

		var gwl = new GWindowList({
			initGWindows: [{
				title: 'Tools',
				content: domConstruct.create('div')
			}, {
				title: 'Basemap',
				content: domConstruct.create('div')
			}, {
				title: 'Layers',
				content: domConstruct.create('div')
			}]
		}, domConstruct.create('div', null, win.body(), 'first'));

		gwl.startup();
	};
});
