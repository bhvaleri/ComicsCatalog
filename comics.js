var Comic = Backbone.Model.extend({

  defaults: function () {
    return {
      title: "empty comic...",
      description: "no description...",
      order: Comics.nextOrder(),
    };
  },

  initialize: function () {
    if (!this.get("title")) {
      this.set({"title": this.defaults().title});
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
    "keypress #new-comic": "createOnEnter",
    "keypress #new-description": "createOnEnter"
  },

  initialize: function () {
    this.title = this.$("#new-comic");
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

  createOnEnter: function (e) {
    if (e.keyCode != 13) return;
    if (this.title.val() && !this.description.val()) {
      $('#new-description').focus();
    }
    else {
      Comics.create({title: this.title.val(), description: this.description.val()});
      this.title.val('');
      this.description.val('');
      $("#new-comic").focus();
    }
  },

});

var App = new AppView;
