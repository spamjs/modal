define({
  name: "spamjs.modal",
  extend: "spamjs.view",
  modules: ["jqtag","jQuery"]
}).as(function(modal, jqtag,jQuery) {

  /**
   *       this.add(modal.instance({
   *          id : "my_module",
   *          options : {
   *          title : "My Module",
   *          module : MyModule.instance()
   *        }
   *      }));
   *
   */
  return {
    events: {
      // "hidden.bs.modal #myModal" : "modalClosed",
      "click .modal-button" : "modal_button_clicked"
    },
    _init_: function() {
      var self = this;

      var dfd = $.Deferred();

      this.$$.loadTemplate(this.path("modal.html"), this.options).done(function() {
        self.model({
          buttons : self.options.buttons
        })
        if (is.String(self.options.module)) {
          module(self.options.module, function(embedModule) {
            self.add("#module-body", embedModule.instance(self.options.moduleOptions));
            dfd.resolve();
          });
        } else if (self.options.src !== "" && self.options.src !== undefined) {
          self.load({
            selector: ".modal-body",
            src: "../modules/" + self.options.src,
            data: (self.options.data !== undefined) ? self.options.data : {}
          }).done(function() {
            dfd.resolve();
          });
        } else {
          self.add("#module-body", self.options.module);
          dfd.resolve();
        }
        self.$modal = this.find("#myModal").modal();
        self.$modal.on('hidden.bs.modal', function(e) {
          console.error("----");
          jQuery(this).data('bs.modal', null);
          self.trigger("spamjs.model.closed");
        });
      });
      return dfd.promise();
    },
    modal_button_clicked : function(e, target,data){
      console.error("modal_button_clicked");
      if(this.model().buttons){
        this.trigger("spamjs.model.button.click",this.model().buttons[target.getAttribute('index')-0]);
      }
    },
    _remove_: function() {
      console.error("helo", this.$$.find("#myModal"), this.$modal);
      this.$modal.modal("hide");
      console.error("after");
    },
    modalClosed: function() {
      console.error("modal closed");
    },

    /**
     * confirm: Provides the javascript window.confirm functionality using bootstrap modal
     *
     * $this - view obj where you want to add
     * options: 
     * title - Title to be displayed
     * desc - Description
     * buttonLabel - Name of the button
     *
     * @output - Provides true if clicked on buttonLabel button else false
     */
    confirm: function($this, options) {
      var _options = {
        title: "",
        desc: "",
        buttonLabel: ""
      };
      options = $.extend(true, _options, options);
      var _dfd_ = $.Deferred();

      var modalInstance = this.instance({
        src: "../external/modal.confirm.html",
        data: options
      });

      $this.add("#myModal", modalInstance).done(function() {
        var self = this;
        var $modal = $('#myModal');
        $modal.on('hidden.bs.modal', function() {
          $(this).closest('view').remove();
        });
        self.$$.find('.css-delete-buttons span').on('click', function() {
          if ($(this).find('button').length > 0) {
            _dfd_.resolve(true, self.$$);
          } else {
            _dfd_.resolve(false, self.$$);
          }
          $modal.modal('hide');

          $(this).off('click');
        });
      });
      return _dfd_.promise();
    },
    _ready_ : function(){
      var self = this;
      jQuery("body").on("click","spamjs-modal,[spamjs-modal]", function(e){
        var moduleName = e.target.getAttribute("spamjs-modal") || e.target.getAttribute("module");
        var  parentModule = e.target.getAttribute("parent");
        var $view = (parentModule ? jQuery(parentModule) : jQuery(e.target).closest("[view-uuid]"));
        _module_(moduleName,function(MODULE){
          self.instance({
            id: e.target.getAttribute("module-id"),
            options: {
              modalClass : e.target.getAttribute("modal-class"),
              title: e.target.getAttribute("modal-title") || e.target.title,
              module: MODULE.instance({
                options: e.target.dataset
              })
            }
          }).addTo($view);
        });
      });
    }
  };
});
