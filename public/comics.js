var Comic = Backbone.Model.extend({
  defaults: function () {
    return {
      title: "Missing title",
      issue: "N/A",
      author: "Missing author",
      artist: "Missing artist",
      description: "no description...",
      image: "public/xmen.jpg",
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
    issue: 'N/A',
    image: 'public/xmen.jpg'
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

    if (!this.get('issue')) {
      this.set({ 'issue': this.defaults.issue });
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

var collection = [
  {
    title: "X-Men",
    issue: "094",
    image: "http://images2.wikia.nocookie.net/__cb20070228032541/marveldatabase/images/5/58/X-Men_Vol_1_94.jpg",
    comic: new Comic({
      title: "X-Men",
      issue: "094",
      image: "http://images2.wikia.nocookie.net/__cb20070228032541/marveldatabase/images/5/58/X-Men_Vol_1_94.jpg",
      author: "Claremont",
      artist: "Cockrum",
      description: "Super COOL!"
    })
  },
  {
    title: "All New X-Men",
    issue: "001",
    image: "http://upload.wikimedia.org/wikipedia/en/2/2a/All-New_X-Men_1.jpg",
    comic: new Comic({
      title: "All New X-Men",
      issue: "001",
      image: "http://upload.wikimedia.org/wikipedia/en/2/2a/All-New_X-Men_1.jpg",
      author: "Bendis",
      artist: "Immonen",
      description: "Sweet idea, looking forward to seeing the Cyclops vs Cylcops confrontation."
    })
  },
  {
    title: "The Superior Spider-Man",
    issue: "001",
    image: "http://upload.wikimedia.org/wikipedia/en/7/74/Superior_spiderman_1.jpg",
    comic: new Comic({
      title: "The Superior Spider-Man",
      issue: "001",
      image: "http://upload.wikimedia.org/wikipedia/en/7/74/Superior_spiderman_1.jpg",
      author: "Slott",
      artist: "Stegman",
      description: "Really want to read the last chunk of Amazing Spiderman to see the lead up to this. Only a matter of time before Peter Parker is back!"
    })
  },
  {
    title: "Adventure Time",
    issue: "001",
    image: "http://images2.wikia.nocookie.net/__cb20120206200527/adventuretimewithfinnandjake/images/8/86/Tumblr_lv1cpbESgC1qzrbk9o1_1280.jpg",
    comic: new Comic({
      title: "Adventure Time",
      issue: "001",
      image: "http://images2.wikia.nocookie.net/__cb20120206200527/adventuretimewithfinnandjake/images/8/86/Tumblr_lv1cpbESgC1qzrbk9o1_1280.jpg",
      author: "North",
      artist: "Paroline & Lamb",
      description: "Awesome show and now an awesome comic. Really dig Ryan North's writing."
    })
  },
  {
    title: "Adventure Time",
    issue: "002",
    image: "http://images3.wikia.nocookie.net/__cb20120104175150/adventuretimewithfinnandjake/images/8/8a/002-a.jpeg",
    comic: new Comic({
      title: "Adventure Time",
      issue: "002",
      image: "http://images3.wikia.nocookie.net/__cb20120104175150/adventuretimewithfinnandjake/images/8/8a/002-a.jpeg",
      author: "North",
      artist: "Paroline & Lamb",
      description: "Watch out of the Lich!"
    })
  },
  {
    title: "Adventure Time",
    issue: "003",
    image: "http://images.wikia.com/adventuretimewithfinnandjake/images/b/b4/Tumblr_lyouzbPrm51r7wz6no1_1280.jpg",
    comic: new Comic({
      title: "Adventure Time",
      issue: "003",
      image: "http://images.wikia.com/adventuretimewithfinnandjake/images/b/b4/Tumblr_lyouzbPrm51r7wz6no1_1280.jpg",
      author: "North",
      artist: "Paroline & Lamb",
      description: "Sand and ice Finn and Jakes!"
    })
  },
];
var Covers = new CoverList(collection);


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

    //Covers.fetch();

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
      issue: this.issue.val(),
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
