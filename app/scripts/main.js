Backbone.View.extend({
  el: '#itemsList',
  initialize: function () {
    //this.$itemsList = this.$('div.content > ul.alerts-list');
    //this.collection = new (require('../collections/items'))();
    this.currSlide = null;
    this.canProceed = true;
    this.renderQueue = [];
  },
  show: function (fn) {
    var self = this;
    self.$el.removeClass('hiden');

    return self;
  },
  hide: function () {
    self.$el.addClass('hiden');
    return this;
  },
  renderSlide: function (model) {
    if (this.renderTout) {
      window.clearTimeout(this.renderTout);
    }

    this.renderQueue.push(this.tpls.item(model.toJSON()));

    this.renderTout = window.setTimeout(function () {
      this.$itemsList.find('li.loader').before(
        this.renderQueue
      );
      this.renderQueue = [];
    }.bind(this), 10);
  },
  getSlides: function () {
    this.canUpdate = true;
    this.updating = true;
    this.$('.no-items').hide();
    this.$('li.loader').show();
    this.curPage = 1;
    this.$itemsList.find('li:not(li.escape)').remove();
    this.collection.fetch({
      reset: true,
      silent: false,
      data: {
        limit: this.perPage,
        page: this.curPage,
        filters: JSON.stringify(this.filter.get('filters'))
      },
      success: function (collection, data) {
        this.updating = false;
        this.$('li.loader').hide();
        if (!data.reports.length) {
          this.canUpdate = false;
          this.$('.no-items').show();
        }
      }.bind(this)
    });
  },
  loadSlide: function () {
    this.curPage += 1;
    this.$('li.loader').show();
    window.setTimeout(function () {
      this.collection.fetch({
        data: {
          limit: this.perPage
          , page: this.curPage
          , filters: JSON.stringify(this.filter.get('filters'))
        },
        success: function (collection, data) {
          this.updating = false;
          this.$('li.loader').hide();
          this.$itemsList.width();
          if (!data.reports.length) {
            this.curPage--;
            this.canUpdate = false;
          }
        }.bind(this)
      });
    }.bind(this), 0);
  },
  events: {
    'tap a[href="#saveFilter"]' : 'preventSave',
    'tap i.fa-refresh': 'getItems'
  }
});

var App = Backbone.Router.extend({
  routes: {
    '': 'home'
  },
  initialize: function () {
    this.activeView = null;
  },
  start: function () {
    this.views = {
      itemView: new (require('./views/itemView'))({
        filter: filter
      })
    };

    Backbone.history.start();
  },
  _hidePrev: function () {
    if (this.activeView) {
      this.activeView.hide();
    }
  },
  home: function () {
    var _view = this.views.itemView;
    _view.show(function () {
      this._hidePrev();
      this.activeView = _view;
    }.bind(this));
  }
});

var app = new App();
app.start();
