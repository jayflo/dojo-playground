define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/dom-attr',
  'dojo/dom-construct',
  'dojo/dom-style',
  'dojo/on',

  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',

  'dojo/text!./templates/NodeHashTemplate.html'
], function (declare, lang, domAttr, domConstruct, domStyle, on,
  _WidgetBase, _TemplatedMixin, template) {
  'use strict';

  var NodeHash = declare([_WidgetBase, _TemplatedMixin], {

    templateString: template,
    nodeHash: {},

    constructor: function(kwargs) {
      lang.mixin(this, kwargs);

      this.attrs = this.attrs || {};
      this.initItems = this.initItems || null;
      this.createNode = this.createNode || _createNode;

      this.dataAttr = 'data-nodehash' + NodeHash.count++ + '-key';
    },

    postCreate: function() {
      domAttr.set(this.domNode, this.attrs);

      !!this.initItems && this.add(this.initItems);
      this.initItems = null;
    },

    add: function(itemParams) {
      _makeArray(itemParams).forEach(function(param) {
        domConstruct.place(this._initNode(param), this.containerNode);
      }, this);
    },

    remove: function(keys) {
      var hash = this.hash;

      _makeArray(keys).forEach(function(key) {
        if(this.containsKey(key)) {
          hash[key].parent.removeChild(hash[key]);
          delete hash[key];
        }
      }, this);
    },

    containsKey: function(key) {
      return !!this.nodeHash[key];
    },

    get: function(key) {
      return this.containsKey(key) ? this.nodeHash[key] : null;
    },

    getIndex: function(key) {
      var i = 0, node = this.nodeHash[key];

      if(!node) { return -1; }

      while((node = node.previousSibling) != null) { i++; }

      return i;
    },

    getKey: function(node) {
      return domAttr.get(node, this.dataAttr);
    },

    isItem: function(node) {
      var key = this.getKey(node);

      return !!key && !!this.containsKey(key);
    },

    itemEventListener: function(event, callback, thisArg) {
      var that = this, slctr = '[' + this.dataAttr + ']';
      thisArg = thisArg || this;

      this.own(on(this.domNode, on.selector(slctr, event), function(e) {
        var key = that.getKey(e.target);

        callback.call(thisArg, that.nodeHash[key], key, e);
      }));
    },

    iterate: function(callback, thisArg) {
      var hash = this.nodeHash;
      thisArg = thisArg || this;

      for(var key in hash) {
        if(hash.hasOwnProperty(key)) {
          callback.call(thisArg, hash[key], key, hash);
        }
      }
    },

    _initNode: function(param) {
      var node = this.createNode(param);
      domAttr.set(node, this.dataAttr, param.key);
      this.nodeHash[param.key] = node;

      return node;
    }
  });

  NodeHash.count = 0;

  function _makeArray(value) {
    return lang.isArray(value) ? value : [value];
  }

  function _createNode(itemParam) {
    return domConstruct.create('div', {
      innerHTML: itemParam.key
    });
  }

  return NodeHash;
});
