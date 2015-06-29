define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/fx',
  'dojo/dom-attr',
  'dojo/dom-construct',
  'dojo/dom-style',
  'dojo/aspect',
  'dojo/on',
  'dojo/Deferred',
  'dojo/promise/all',

  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',

  'dojo/text!./templates/GWindowTemplate.html'
], function (declare, lang, baseFx, domAttr, domConstruct, domStyle, aspect,
  on, Deferred, all, _WidgetBase, _TemplatedMixin, template) {
  'use strict';

  var GWindow = declare([_WidgetBase, _TemplatedMixin], {

    templateString: template,

    /* attach points */
    titleBar: null,
    titleDiv: null,
    windowShade: null,
    panelNode: null,

    constructor: function(kwargs) {
      lang.mixin(this, kwargs);

      this.attrs = this.attrs || {};
      this.title = this.title || 'Window' + GWindow.count++;
      this.content = this.content || null;
      this.isMinimized = this.isMinimized !== undefined ? this.isMinimized : false;
      this.noInitHide = this.noInitHide !== undefined ? this.noInitHide : false;
      this.autoMinimize = this.autoMinimize !== undefined ? this.autoMinimize : true;
    },

    postCreate: function() {
      var node = this.panelNode;

      domAttr.set(this.domNode, this.attrs);
      this.content && this.setContent(this.content);
      !this.noInitHide && this.isMinimized && this.initHide();
      this.showAnimation = (this.showAnimation || _showPanelAnimation)(node);
      this.hideAnimation = (this.hideAnimation || _hidePanelAnimation)(node);

      if(this.autoMinimize) { this.createListeners(); }
    },

    initHide: function() {
      var t = domStyle.get(this.panelNode, 'top'),
        h = domStyle.get(this.panelNode, 'height');

      domStyle.set(this.panelNode, 'top', (t - h) + 'px');
      domStyle.set(this.windowShade, 'height', 0);
    },

    _afterAnimFunc: function() {
      this.titleBarListener && this.titleBarListener.resume();
    },

    _beforeAnimFunc: function(anim, heightEnd) {
      this.titleBarListener && this.titleBarListener.pause();
      this.isMinimized = !this.isMinimized;
      anim.play();

      return _shadeAnimation(this.windowShade, heightEnd, 300);
    },

    createListeners: function() {
      this.titleBarListener = on.pausable(this.titleBar, 'click', this.toggle.bind(this));
      this.own(this.titleBarListener);

      aspect.after(this.showAnimation, 'onEnd', this._afterAnimFunc.bind(this));
      aspect.after(this.hideAnimation, 'onEnd', this._afterAnimFunc.bind(this));
    },

    toggle: function(/* e */) {
      return this.isMinimized ? this.show() : this.hide();
    },

    show: function() {
      return this._beforeAnimFunc(this.showAnimation, domStyle.get(this.panelNode, 'height'));
    },

    hide: function() {
      return this._beforeAnimFunc(this.hideAnimation, 0);
    },

    setTitle: function(title) {
      this.titleDiv.innerHTML = title;
      this.title = title;
    },

    setContent: function(node) {
      this.empty();
      domConstruct.place(node, this.containerNode);
    },

    addContent: function(nodes) {
      var that = this;
      nodes = lang.isArray(nodes) ? nodes : [nodes];

      nodes.forEach(function(node) {
        domConstruct.place(node, that.containerNode);
      });
    },

    empty: function() {
      domConstruct.empty(this.containerNode);
    },

    panelHeight: function() {
      return domStyle.get(this.panelNode, 'height');
    },

    contentHeight: function() {
      return domStyle.get(this.containerNode, 'height');
    }
  });

  GWindow.count = 0;

  function _slideDownFunc(n) {
    return { end: domStyle.get(n, 'top') + domStyle.get(n, 'height'), unit: 'px' };
  }

  function _slideUpFunc(n) {
    return { end: domStyle.get(n, 'top') - domStyle.get(n, 'height'), unit: 'px' };
  }

  function _showPanelAnimation(n) {
    return _baseAnimation(_slideDownFunc, 300)(n);
  }

  function _hidePanelAnimation(n) {
    return _baseAnimation(_slideUpFunc, 300)(n);
  }

  function _baseAnimation(moveFunc, duration, mixins) {
    return function(n) {
      return baseFx.animateProperty(lang.mixin({
        node: n,
        properties: {
          top: moveFunc
        },
        duration: duration
      }, mixins));
    };
  }

  function _shadeAnimation(shadeNode, heightEnd, duration) {
    var d = new Deferred();

    baseFx.anim(
      shadeNode, { height: { end: heightEnd } }, duration, null,
      function() { d.resolve(); }
    );

    return d.promise;
  }

  return GWindow;
});
