var Comic = Backbone.Model.extend({
  defaults: function () {
    return {
      title: "Missing title",
      issue: "N/A",
      author: "Missing author",
      artist: "Missing artist",
      description: "no description...",
      image: "xmen.jpg",
    };
  },

  initialize: function () {
    //Cleaner way of doing this? Doesn't look that great.
    if (!this.get("title")) {
      this.set({"title": this.defaults().title});
    }

    if (!this.get("issue")) {
      this.set({"issue": this.defaults().issue});
    }

    if (!this.get("author")) {
      this.set({"author": this.defaults().author });
    }

    if (!this.get("artist")) {
      this.set({"artist": this.defaults().artist});
    }

    if (!this.get("description")) {
      this.set({"description": this.defaults().description});
    }

    if (!this.get("image")) {
      this.set({"image": this.defaults().image});
    }
  },
});

var Cover = Backbone.Model.extend({
  defaults: {
    order: 0,
    title: 'Missing Title',
    image: 'xmen.jpg'
  },

  initialize: function () {
    if (!this.get('title')) {
      this.set({ 'title': this.defaults.title });
    }

    if (!this.get('image')) {
      this.set({ 'image': this.defaults.image });
    }

    if (!this.get('order')) {
      this.set({ 'order': this.defaults.order });
    }

    if (!this.get('comic')) {
      this.set({ 'comic': new Comic() });
    }
  }
});

var CoverList = Backbone.Collection.extend({

  model: Cover,

  localStorage: new Backbone.LocalStorage("covers-backbone"),

  sort: function () {
    _.each(this.models, function (m) {
      m.save();
    });
  },

  comparator: 'order'
});

var Covers = new CoverList;


var CoverView = Backbone.View.extend({
  tagName: 'li',

  template: _.template($('#cover-template').html()),

  render: function () {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  },

  events: {
   "dblclick .cover-image" : "showComic",
   "drop": "drop"
  },

  initialize: function () {
    this.listenTo(this.model, 'change', this.render);
  },

  showComic: function () {
    $('.overlay-background').show();
    var view = new ComicView({ model: this.model.attributes.comic}); 
    $('body .comic-view').remove()
    $('body').append(view.render().el);
  }
});

var CoverListView = Backbone.View.extend({

  tagName: 'ul',
  id: 'cover-list',
  
  itemView: CoverView,

  _listItems: null,
  _listIsSyncing: false,

  orderAttr: 'order',

  render: function () {
    this._listItems = {};
    this.listenTo(this.collection, 'sync reset', this.listSync );
    this.listenTo(this.collection, 'add', this.listAdd );
    this.listenTo(this.collection, 'remove', this.listRemove );

    this.listSync();

    return this;
  },

  events: {
    'sortupdate': 'handleSortComplete'
  },

  handleSortComplete: function () {
    var oatr = this.orderAttr;

    _.each(this._listItems, function (v) {
      v.model.set(oatr, v.$el.index());
    });

    this.collection.sort();
    this.listSetup();
    
  },

  listSetup: function () {
    var $ods = this.$('li');

    if ($ods.length == 1 ) {
      if (this.$el.data('ui-sortable')) {
        this.$el.sortable('destroy');
      }
    } else {
      this.$el.sortable({ containment: 'parent', tolerance: 'pointer' });
    }

  },

  listSync: function () {
    var list = this.collection.models;
    var sortedList = _.sortBy(list, function (model) { return model.attributes.order; });
    this._listIsSyncing = true;

    _.invoke(this._listItems, 'remove');
    this._listItems = {};

    _.each(sortedList, _.bind(function (m) {
      this.listAdd(m);
    }, this));

    this._listIsSyncing = false;

    this.listSetup();
  },

  listAdd: function (model) {
    var v;

    if (!this._listItems[model.cid]) {
      v = this._listItems[model.cid] = new this.itemView({ model: model });
      this.$el.append(v.render().$el);
    }

    if (!this._listIsSyncing) {
      this.listSetup();
    }
  },

  listRemove: function (model) {
    if (this._listItems[model.cid]) {
      this._listItems[model.cid].remove();
      delete this._listItems[model.cid];
    }

    if (!this._listIsSyncing) {
      this.listSetup();
    }
  },

  remove: function () {
    _.invoke(this._listItems, 'remove');
  }

});

var CoversView = new CoverListView({ collection: Covers });

var ComicView = Backbone.View.extend({
  tagName: "div",

  template: _.template($('#comic-template').html()),

  events: {
    'click': 'closeComic'
  },

  initialize: function () {
  },

  render: function () {
    this.$el.html(this.template(this.model));
    this.input = this.$('.edit');
    return this;
  },

  closeComic: function () {
    $('.comic-view').remove();
    $('.overlay-background').hide();
  },

  updateOnEnter: function(e) {
    if (e.keyCode == 13) this.close();
  },
});

var AppView = Backbone.View.extend({
  el: $("#comicapp"),

  events: {
    "keypress #new-title": "moveToIssue",
    "keypress #new-issue": "moveToAuthor",
    "keypress #new-author": "moveToArtist",
    "keypress #new-artist": "moveToImage",
    "keypress #new-image": "moveToDescription",

    "keypress #new-description": "createOnEnter"
  },

  initialize: function () {
    this.isbn = this.$("#new-isbn");
    this.title = this.$("#new-title");
    this.issue = this.$("#new-issue");
    this.artist = this.$("#new-artist");
    this.author = this.$("#new-author");
    this.image = this.$("#new-image");
    this.description = this.$("#new-description");

    this.main = $('.cover-container');

    Covers.fetch();

    $('#cover-container').append(CoversView.render().$el);
  },

  addOne: function (comic) {
    var view = new CoverView({model: comic});
    this.$("#cover-list").append(view.render().el);
  },

  addAll: function () {
    Covers.each(this.addOne, this);
  },

  moveToIssue: function (e) {
    if (e.keyCode != 13) return;
    $('#new-issue').focus();
  },
  moveToAuthor: function (e) {
    if (e.keyCode != 13) return;
    $('#new-author').focus();
  },
  moveToArtist: function (e) {
    if (e.keyCode != 13) return;
    $('#new-artist').focus();
  },
  moveToImage: function (e) {
    if (e.keyCode != 13) return;
    $('#new-image').focus();
  },
  moveToDescription: function (e) {
    if (e.keyCode != 13) return;
    $('#new-description').focus();
  },

  createOnEnter: function (e) {
    if (e.keyCode != 13) return;
    if (!this.title.val() && !this.description.val()) return;
    
    var title = this.title.val();
    var issue = this.issue.val();
    var author = this.author.val();
    var artist = this.artist.val();
    var image = this.image.val();
    var description = this.description.val();
    
    var comic = new Comic({
      title: this.title.val(),
      issue: this.issue.val(),
      author: this.author.val(),
      artist: this.artist.val(),
      image: this.image.val(),
      description: this.description.val()
    });

    Covers.create({
      title: this.title.val(),
      image: this.image.val(),
      comic: comic
    });

    this.title.val('');
    this.issue.val('');
    this.author.val('');
    this.artist.val('');
    this.image.val('');
    this.description.val('');
    $("#new-title").focus();
  },

});

var App = new AppView;
