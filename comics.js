var Comic = Backbone.Model.extend({

  defaults: function () {
    return {
      title: "Missing title",
      issue: "N/A",
      author: "Missing author",
      artist: "Missing artist",
      description: "no description...",
      order: Comics.nextOrder(),
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
  },

  toggle: function () {
    this.save({done: !this.get("done")});
  }
});


var ComicList = Backbone.Collection.extend({

  model: Comic,

  localStorage: new Backbone.LocalStorage("comics-backbone"),

  nextOrder: function () {
    if (!this.length) return 1;
    return this.last().get('order') + 1;
  },

  comparator: function (comic) {
    return comic.get('order');
  }
});

var Comics = new ComicList;

var ComicView = Backbone.View.extend({
  tagName: "li",

  template: _.template($('#item-template').html()),

  events: {
    "dblclick .view" : "edit",
    "keypress .edit" : "updateOnEnter",
    "blur .edit" : "close"
  },


  initialize: function () {
    this.listenTo(this.model, 'change', this.render);
  },

  render: function () {
    this.$el.html(this.template(this.model.toJSON()));
    this.input = this.$('.edit');
    return this;
  },

  edit: function () {
    this.$el.addClass("editing");
    this.input.focus();
  },

  close: function() {
    var value = this.input.val();
    if (!value) {
      this.clear();
    } else {
      this.model.save({title: value});
      this.$el.removeClass("editing");
    }
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
    "keypress #new-artist": "moveToDescription",

    "keypress #new-description": "createOnEnter"
  },

  initialize: function () {
    this.title = this.$("#new-title");
    this.issue = this.$("#new-issue");
    this.artist = this.$("#new-artist");
    this.author = this.$("#new-author");
    this.description = this.$("#new-description");
    
    this.listenTo(Comics, 'add', this.addOne);

    this.footer = this.$('footer');
    this.main = $('#main');

    Comics.fetch();
  },

  addOne: function (comic) {
    var view = new ComicView({model: comic});
    this.$("#comic-list").append(view.render().el);
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
  moveToDescription: function (e) {
    if (e.keyCode != 13) return;
    $('#new-description').focus();
  },

  createOnEnter: function (e) {
    if (e.keyCode != 13) return;
    if (!this.title.val() && !this.description.val()) return;

    Comics.create({
      title: this.title.val(),
      issue: this.issue.val(),
      author: this.author.val(),
      artist: this.artist.val(),
      description: this.description.val()
    });

    this.title.val('');
    this.issue.val('');
    this.author.val('');
    this.artist.val('');
    this.description.val('');
    $("#new-comic").focus();
  },

});

var App = new AppView;
