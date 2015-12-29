var Explanation = Backbone.View.extend({
  el: '#explanation',
  initialize: function () {
    this.$textElement = this.$('.text-box');
    var model = Backbone.Model.extend({
      idAttribute: 'idx'
    });
    var col = Backbone.Collection.extend({
      url: '/scenary/act1.json',
      model: model,
      parse: function (result) {
        return result.data;
      }
    });
    this.collection = new col();
    this.currSlide = null;
    this.canProceed = true;
    this.tInterval = null;
    this.textToAnimate = null;
  },
  show: function () {
    var self = this;
    this.collection.fetch({
      success: function (collection) {
        self.$el.removeClass('hidden');
        console.log(collection.length);
      }
    });

    return self;
  },
  hide: function () {
    var self = this;
    self.$el.addClass('hidden');
    return this;
  },
  animateSlide: function () {
    this.$textElement.html('');
    var intervalIndex = 0;
    var maxInterval = this.textToAnimate.length - 1;

    this.tInterval = setInterval(function () {
      if (intervalIndex > maxInterval) {
        return this.clearInterval();
      }
      var currentHtml = this.$textElement.html();
      this.$textElement.html(currentHtml += this.textToAnimate[intervalIndex]);
      intervalIndex++
    }.bind(this), 30);
  },
  stopAnimation: function () {
    if (!this.tInterval) {
      return;
    }

    this.clearInterval();
    this.$textElement.html(this.textToAnimate);
  },
  clearInterval: function () {
    if (!this.tInterval) {
      return;
    }

    window.clearInterval(this.tInterval);
    this.tInterval = null;
  },
  renderSlide: function () {
    if (this.tInterval) {
      return this.stopAnimation();
    }

    var slideToRender = this.currSlide ? this.currSlide + 1 : 1;
    this.textToAnimate = this.collection.get(slideToRender).get('text');
    this.animateSlide();

    this.currSlide += 1;
  },
  loadSlide: function () {
    this.curPage += 1;
    this.$('li.loader').show();
    window.setTimeout(function () {
      this.collection.fetch({
        data: {
          limit: this.perPage,
          page: this.curPage,
          filters: JSON.stringify(this.filter.get('filters'))
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
  nextSlide: function () {
    console.log(this.currSlide);

    if (this.currSlide === this.collection.length) {
      console.log('stop it dude');
      return;
    }
    this.renderSlide();
  },
  events: {
    'click': 'nextSlide'
  }
});

var Menu = Backbone.View.extend({
  el: '#game-menu',
  initialize: function () {
  },
  show: function () {
    var self = this;
    self.$el.removeClass('hidden');

    return self;
  },
  hide: function () {
    var self = this;
    self.$el.addClass('hidden');
    return this;
  },
  newGame: function () {
    this.trigger('new-game');
  },
  events: {
    'click .new-game': 'newGame'
  }
});

var App = Backbone.Router.extend({
  routes: {
    '': 'menu',
    'intro': 'intro'
  },
  initialize: function () {
    this.activeView = null;
  },
  start: function () {
    this.views = {
      menu: new Menu(),
      explanation: new Explanation()
    };

    this.views.menu.on('new-game', function () {
      this.navigate('intro', {trigger: true})
    }.bind(this));

    Backbone.history.start();
  },
  _hidePrev: function () {
    if (this.activeView) {
      this.activeView.hide();
    }
  },
  menu: function () {
    var _view = this.views.menu;
    this._hidePrev();
    this.activeView = _view;
    _view.show();
  },
  intro: function () {
    var _view = this.views.explanation;
    this._hidePrev();
    this.activeView = _view;
    _view.show();
  }
});

var app = new App();
app.start();
