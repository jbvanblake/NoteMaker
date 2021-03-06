define(["backbone",
    "underscore",
    "../models/note",
    "../views/noteView",
    "../collections/noteCollection",
    "text!../templates/noteGroupTemplate.html"],
    function (Backbone, _, Note, NoteView, NoteCollection, NoteGroupTemplate) {
        var NotesView = Backbone.View.extend({
            initialize: function () {
                var self= this;
                this.collection = new NoteCollection();
                this.render();
                this.listenTo( this.collection, 'add', this.render   );
                this.listenTo( this.collection, 'remove', this.render   );

            },
            events:{
                "click .delete-note": "deleteNote",
                "click .delete-group": "deleteView"
            },
            deleteNote:function(e){
                var self = this;
                var noteId = $(e.target).parents(".note-container").data("id");
                this.collection.each(function(note){
                    if(note !== undefined && note.cid === noteId){
                        self.collection.remove(note);
                        self.render();

                    }
                })
            },
            groupNameChange: function(newName){
                this.collection.name = newName;
                _.each(this.collection.models, function(note){
                    note.set("group", newName);
                });

            },
            deleteView : function(e){
                if(this.collection.length !=0){
                    this.$el.find(".note-group-error-container").text("Empty your group!");
                    this.$el.find(".note-group-error-container").toggle("slide");
                }
                else{
                    this.$el.toggle("slide");
                }
            },
            handleDrop:function(e){
                var draggedModelObject = JSON.parse(e.dataTransfer.getData("text/json"));

                this.trigger("noteMoved", draggedModelObject)
                var draggedNote = new Note({title:draggedModelObject.title,note:draggedModelObject.note, group:this.collection.name});

                draggedNote.cid = draggedModelObject.cid;
                this.collection.add(draggedNote);


            },
            handleDragOver :function(e) {
                if (e.preventDefault) {
                    e.preventDefault(); // Necessary. Allows us to drop.
                }

                e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

                return false;
            },

            render: function() {
                this.$el.empty();
                var html = _.template(NoteGroupTemplate)({name:this.collection.name, cid:this.collection.cid});
                this.$el.append($(html));
                this.collection.each(function( note ){
                    this.renderNote( note );
                }, this);
                var self = this;
                this.$el.find("[data-name='" + this.collection.name + "'] .note-group-name").get(0).addEventListener("input", function(e){
                    self.groupNameChange($(e.target).html());
                }, false);


                this.$el.find(".note-group[data-name='" + this.collection.name + "']").get(0).addEventListener("drop", self.handleDrop.bind(this), false);
                this.$el.find(".note-group[data-name='" + this.collection.name + "']").get(0).addEventListener("dragover", self.handleDragOver, false);
            },

            renderNote: function ( note ) {
                var noteView = new NoteView ({
                    el:this.$el.find(".note-group-container"),
                    model: note
                });
            }

        });
        return NotesView;
    });