window.contentfulExtension.init(function(api) {
  function tinymceForContentful(api) {
    function tweak(param) {
      var t = param.trim();
      if (t === "false") {
        return false;
      } else if (t === "") {
        return undefined;
      } else {
        return t;
      }
    }

    var p = tweak(api.parameters.instance.plugins);
    var tb = tweak(api.parameters.instance.toolbar);
    var mb = tweak(api.parameters.instance.menubar);  

    api.window.startAutoResizer();

    tinymce.init({
      selector: "#editor",
      plugins: p,
      toolbar: tb,
      menubar: mb,
      min_height: 450,
      max_height: 450,
      autoresize_bottom_margin: 15,
      resize: false,
      image_caption: true,
      preview_styles: true,
      style_formats_merge: false,
      importcss_append: true,
      style_formats: [
        {"title":"Subheading","block":"h5","classes":"subheading"},
        {"title":"Drop Cap","inline":"span","classes":"dropcap clearfix"}
      ],
      content_css: '/my-styles.css',
      content_style: '.dropcap { float: left; font-size: 4.6em; padding-right: 3px;  line-height: 95%; }',

      init_instance_callback : function(editor) {
        var listening = true;

        function getEditorContent() {
          return editor.getContent() || '';
        }

        function getApiContent() {
          return api.field.getValue() || '';
        }

        function setContent(x) {
          var apiContent = x || '';
          var editorContent = getEditorContent();
          if (apiContent !== editorContent) {
            //console.log('Setting editor content to: [' + apiContent + ']');
            editor.setContent(apiContent);
          }
        }

        setContent(api.field.getValue());

        api.field.onValueChanged(function(x) {
          if (listening) {
            setContent(x);
          }
        });

        function onEditorChange() {
          var editorContent = getEditorContent();
          var apiContent = getApiContent();

          if (editorContent !== apiContent) {
            //console.log('Setting content in api to: [' + editorContent + ']');
            listening = false;
            api.field.setValue(editorContent).then(function() {
              listening = true;
            }).catch(function(err) {
              console.log("Error setting content", err);
              listening = true;
            });
          }
        }

        var throttled = _.throttle(onEditorChange, 500, {leading: true});
        editor.on('change keyup setcontent blur', throttled);
      }
    });
  }

  function loadScript(src, onload) {
    var script = document.createElement('script');
    script.setAttribute('src', src);
    script.onload = onload;
    document.body.appendChild(script);
  }

  var sub = location.host == "contentful.staging.tiny.cloud" ? "cdn.staging" : "cdn";
  var apiKey = api.parameters.installation.apiKey;
  var channel = api.parameters.installation.channel;
  var tinymceUrl = "https://" + sub + ".tiny.cloud/1/" + apiKey + "/tinymce/" + channel + "/tinymce.min.js";

  loadScript(tinymceUrl, function() {
    tinymceForContentful(api);
  });
});
