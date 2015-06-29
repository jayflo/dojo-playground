define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/dom-attr',
  'dojo/dom-construct',
  'dojo/dom-style',
  'dojo/on',
  'dojo/aspect',
  'dojo/window',

  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',

  'sandbox/widgets/GWindow',
  'sandbox/widget/NodeArray',

  'dojo/text!./templates/GWindowListTemplate.html'
], function (declare, lang, domAttr, domConstruct, domStyle, on, aspect, win,
  _WidgetBase, _TemplatedMixin, GWindow, NodeArray, template) {
  'use strict';

  var _titleBarClass = '.gisw-window-titlebar';

  var GWindowList = declare([_WidgetBase, _TemplatedMixin], {

    templateString: template,
    nodeArr: null,
    gWindows: [],
    minimized: [],
    notMinimized: [],

    constructor: function(kwargs) {
      lang.mixin(this, kwargs);

      this.attrs = this.attrs || {};
      this.initGWindows = this.initGWindows || null;

      this.nodeArr = new NodeArray({
        createNode: function(node) { return node; }
      });

      this._top = -1;
      this._height = -1;
      this.windowHeight = win.getBox().h;
    },

    postCreate: function() {
      domAttr.set(this.domNode, this.attrs);

      this._top = domStyle.get(this.domNode, 'top');
      this._height = domStyle.get(this.domNode, 'height');

      this.initGWindows && this.add(this.initGWindows);
      this.initGWindows = null;
      this.createListeners();
    },

    createListeners: function() {
      this.titleBarListener = on.pausable(
        this.domNode,
        on.selector(_titleBarClass, 'click'),
        this.titleBarClick.bind(this)
      );

      this.own(this.titleBarListener);
    },

    titleBarClick: function(e) {
      this.titleBarListener.pause();

      var that = this,
        index = this._getGWindowIndex(e.target),
        gwin = this.gWindows[index];

      if(gwin.isMinimized) {
        this._reclaimHeight(gwin);
        
      } else {
        gwin.hide().then(function() {
          that._fixupMinimized(index, 'toMin');
          that._distributeHeight.call(that);
          that.titleBarListener.resume();
        });
      }
    },

    add: function(params) {
      var gwin;

      _makeArray(params).forEach(function(param) {
        gwin = new GWindow(lang.mixin(param, {
          isMinimized: true, autoMinimize: false
        }));
        this.nodeArr.push(gwin.domNode);
        this.minimized.push(this.gWindows.length);
        this.gWindows.push(gwin);
      }, this);
    },

    _distributeHeight: function() {
      var aH = this._availableHeight();
    },

    _fixupMinimized: function(index, toFromMin) {
      if(toFromMin === 'toMin') {
        _remove(this.notMinimized, index);
        this.minimized.push(index);
      } else {
        _remove(this.minimized, index);
        this.notMinimized.push(index);
      }
    },

    _availableHeight: function() {
      return this.windowHeight - this._height - (2 * this._top);
    },

    _getGWindowIndex: function(node) {
      var index;

      while((index = this.nodeArr.indexOf(node)) < 0) {
        node = node.parentNode;
      }

      return index;
    }
  });

  function _remove(arr, x) {
    arr.splice(arr.indexOf(x), 1);
  }

  function _makeArray(value) {
    return lang.isArray(value) ? value : [value];
  }

  return GWindowList;
});
