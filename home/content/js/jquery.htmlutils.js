;(function($) {

  /**
   * Parse either the supplied query string, or the 
   * window.location query string into an object containing fields 
   * with values matching the name=value pairs in the supplied 
   * string. 
   *  
   * @param query The query string to be parsed, or not 
   * @param opts Optional options object 
   */
  $.parseQuery = function (query,opts) {
    var search = (typeof query === "string") ? query : window.location.search;
    opts = ((typeof query === "object") && (typeof opts === "undefined")) ? query : opts;
    var ext = $.extend({},{
      decode: function (val) {
                return unescape(val).replace(/\+/g," ");
              }
    },opts);
    var data = {};
    $.each(search.match(/^(?:.*\?)?(.*)$/)[1].split("&"),function(ndx,elem) {
      elem = elem.split("=");
      data[elem[0]] = ext.decode(elem[1]);
    });
    return data;
  } //$.parseQuery

  /** 
   * Extension of John Ressig's jQuery Form Deserilization Plugin 
   * v0.35 to allow supplying the parameter as a query string and 
   * the ability to specify a prefix string 
   *  
   * @see http://www.reach1to1.com/sandbox/jquery/testform.html 
   */ 
  $.fn.deserialize = function(d,config) {
    var data = d;
    me = this;
    if(d !== undefined) {
      config = $.extend({ isPHPnaming: false, overwrite: true, prefix: null },config);
        // check if data is an array, and convert to hash, converting multiple entries of 
        // same name to an array
      if(d.constructor == Array) {
        data = {};
        for(var i = 0;i < d.length;i++) {
          if(typeof data[d[i].name] != 'undefined') {
            if(data[d[i].name].constructor != Array) {
              data[d[i].name] = [data[d[i].name],d[i].value];
            } else {
              data[d[i].name].push(d[i].value);
            }
          } else {
            data[d[i].name] = d[i].value;
          }
        }
      } else if(typeof d == "string") {
        data = $.parseQuery(d);
      }
        // now data is a hash. insert each parameter into the form
      $("input,select,textarea",me).each(function() {
        var p = this.name;
        var v = [];
          // handle weird PHP names if required
        if(config.isPHPnaming) {
          p = p.replace(/\[\]$/,'');
        }
        if(p && (config.prefix !== null) && (p.substring(0,config.prefix.length) == config.prefix)) {
          p = p.substring(config.prefix.length);
        }
        if(p && (data[p] != undefined)) {
          v = (data[p].constructor == Array) ? data[p] : [data[p]];
        }
          // Additional parameter overwrite
        if((config.overwrite === true) || data[p]) {
          switch(this.type || this.tagName.toLowerCase()) {
            case "radio":
            case "checkbox":
              this.checked = false;
              for(var i = 0;i < v.length;i++) {
                this.checked|=(this.value!='' && v[i]==this.value);
              }
              break;
            case "select-multiple":
            case "select-one":
            case "select":
              for(i = 0;i < this.options.length;i++) {
                this.options[i].selected = false;
                for(var j = 0;j < v.length;j++) {
                  this.options[i].selected |= ((this.options[i].value != '') && (this.options[i].value == v[j]));
                }
              }
              break;
            case "button":
            case "submit":
              this.value = (v.length > 0) ? v.join(',') : this.value;
              break;
            default:
              this.value = v.join(',');
          }
        }
      });
    }
    return me;
  }; //$().deserialize

  /**
   * Assign focus to the first visible entry field in the selected 
   * form. 
   *
   * @this The form containing the field to receive focus
   */
  $.fn.focusFirst = function () {
    var elem = null;
    $(".focus",this).each(function () {
      elem = this;
      return false;
    });
    if(elem == null) {
      $(":input:visible",this).each(function () {
        if($(this).attr("autofocus") !== undefined) {
          elem = this;
          return false;
        } else {
          elem = ((elem == null) || (this.offsetTop < elem.offsetTop)) ? this : elem;
        }
      });
    }
    if(elem) {
      $(elem).focus();
    }
    return this;
  } //$().focusFirst

})(jQuery);

