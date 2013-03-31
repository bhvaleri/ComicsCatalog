var Comic = Backbone.Model.extend({
  defaults: function () {
    return {
      title: "Missing title",
      issue: "N/A",
      author: "Missing author",
      artist: "Missing artist",
      description: "no description...",
      image: "xmen.jpg",
      order: Covers.nextOrder(),
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

  toggle: function () {
    this.save({done: !this.get("done")});
  }
});

var Cover = Backbone.Model.extend({
  defaults: function () {

    var defaultTitle = "Missing title";
    var defaultImage = "xmen.jpg";


    return {
      title: defaultTitle,
      image: defaultImage, 
    };
  },
  
  //is this neccessary, I'm not sure if the defaults being there will do this
  //anyways...
  initialize: function () {
    if (!this.get("title")) {
      this.set({"title": this.defaults().title});
    }

    if (!this.get("image")) {
      this.set({"image": this.defaults().image});
    }

    if (!this.get("comic")) {
      this.set({"comic": this.defaults().comic});
    }
  }
});


var CoverList = Backbone.Collection.extend({

  model: Cover,

  localStorage: new Backbone.LocalStorage("covers-backbone"),

  nextOrder: function () {
    if (!this.length) return 1;
    return this.last().get('order') + 1;
  },

  comparator: function (comic) {
    return comic.get('order');
  }
});

var Covers = new CoverList;

var CoverView = Backbone.View.extend({
  tagName: "li",

  template: _.template($('#cover-template').html()),

  events: {
    "click .cover-image" : "showComic"
  },

  initialize: function () {
    this.listenTo(this.model, 'change', this.render);
  },

  render: function () {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  },

  showComic: function () {
    $('.overlay-background').show();
    var view = new ComicView({ model: this.model.attributes.comic}); 
    $('body .comic-view').remove()
    $('body').append(view.render().el);
  },
});

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
    
    this.listenTo(Covers, 'add', this.addOne);
    this.listenTo(Covers, 'reset', this.addAll);

    this.main = $('.cover-container');

    Covers.fetch();
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
    
   // $.ajax({
   //   type: 'GET',
   //   url:'/isbn',
   //   data: { "isbn": isbn.toString() },
   //   success: function (data) {
   //     Comics.create({
   //       title: data.title,
   //       issue: data.issue,
   //       author: data.author,
   //       artist: artist,
   //       description: description
   //     });
   //   },
   //   error: function (e) {
   //     console.log(e);
   //   }
   // });
    
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
